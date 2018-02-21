'use strict'

const db = require('knex')
const _ = require('lodash')
const chalk = require('chalk')
const Cache = require('./src/cache')

class RowMapper {
  constructor(opts) {
    this.source = db(opts.source)
    this.sourceTbl = opts.source.table
    this.target = db(opts.target)
    this.targetTbl = opts.target.table

    this.chunkSize = opts.chunkSize || 2000
    this.mapperFn = opts.mapperFn
    this.suppressLogs = opts.suppressLogs || false

    this.cache = new Cache()
  }

  clearCache() {
    this.cache.clear()

    return this
  }

  async start() {
    const chunks = await this._getUnprocessedChunks()

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      const rows = await this._getFullRowsForChunk(chunk)

      try {
        await this.target.batchInsert(
          this.targetTbl.name,
          rows.map(this.mapperFn),
          this.chunkSize
        )

        this.cache.set(chunk[chunk.length - 1][this.sourceTbl.primaryKey])
        this.log({
          msg: `Processed chunk: ${i + 1} of ${chunks.length}...`,
          type: 'info'
        })

      } catch(err) {
        this.log({ msg: `An error occured at chunk ${i + 1}`, type: 'error' })
        throw err
      }
    }

    await this._restartPKSequence()

    this.log({ msg: 'All chunks have been processed!', type: 'success' })
  }

  async _getUnprocessedChunks() {
    const lastProcessedPrimaryKey = await this.cache.get()

    if (lastProcessedPrimaryKey) {
      this.log({
        msg: `Skipping primary keys < ${lastProcessedPrimaryKey}`,
        type: 'warn'
      })
    }

    this.log({ msg: 'Getting chunks. Please wait...', type: 'info' })

    return this._getPrimaryKeyChunks({
      skipRowsWithPKSmallerThan: lastProcessedPrimaryKey
    })
  }

  async _getPrimaryKeyChunks({ skipRowsWithPKSmallerThan }) {
    let idx = await this.source(this.sourceTbl.name)
      .select(this.sourceTbl.primaryKey)
      .orderBy(this.sourceTbl.primaryKey, 'ASC')

    idx = idx.filter(row => {
      return row[this.sourceTbl.primaryKey] > skipRowsWithPKSmallerThan
    })

    return _.chunk(idx, this.chunkSize)
  }

  async _getFullRowsForChunk(chunk) {
    return this.source(this.sourceTbl.name)
      .select('*')
      .whereIn(
        this.sourceTbl.primaryKey,
        chunk.map(row => row[this.sourceTbl.primaryKey])
      )
      .orderBy(this.sourceTbl.primaryKey, 'ASC')
  }

  async _restartPKSequence() {
    this.log({ msg: 'Restarting primary key sequences...', type: 'info' })

    const max = await this.target(this.targetTbl.name)
      .first(this.targetTbl.primaryKey)
      .orderBy(this.targetTbl.primaryKey, 'DESC')

    return this.target.raw(`
      ALTER SEQUENCE ${this.targetTbl.primaryKeySequence}
      RESTART WITH ${max.id_event + 1};
    `)
  }

  log({ msg, type }) {
    if (this.suppressLogs) return

    let color

    switch (type.trim()) {
      case 'error':
        color = chalk.bold.red
        break;
      case 'warn':
        color = chalk.bold.yellow
        break;

      case 'info':
        color = chalk.bold.blue
        break;

      case 'success':
        color = chalk.bold.green
        break;
      default:
        color = chalk.bold.blue
    }

    console.log(color(msg))
  }
}

module.exports = RowMapper
