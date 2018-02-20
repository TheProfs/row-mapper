'use strict'

const chai = require('chai')
const expect = chai.expect
const utils = require('./utils')
const Mapper = require('../index.js')

chai.should()

let mapper

beforeEach(() => {
  mapper = new Mapper({
    source: {
      client: 'sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
      table: {
        name: 'source',
        primaryKey: 'id'
      }
    },

    target: {
      client: 'sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
      table: {
        name: 'target',
        primaryKey: 'id'
      }
    },

    chunkSize: 10,
    suppressLogs: true,

    mapperFn: row => {
      return row
    }
  })

  return utils.setupDB({ sourceDB: mapper.source, targetDB: mapper.target })
})

after(() => {
  utils.clearCache()
})

describe('#start() - No failures during processing', () => {
  it('transfers all rows to the target table', () => {
    let restartedSequences = false

    mapper._restartPKSequence = () => {
      restartedSequences = true
      return Promise.resolve()
    }

    return mapper.clearCache().start().then(() => {
      return mapper.target.select('*').from('target')
    }).then(targetRows => {
      targetRows.should.have.length(10)
      targetRows.should.deep.equal([
        { id: 1, value: 'foo' },
        { id: 2, value: 'foo' },
        { id: 3, value: 'foo' },
        { id: 4, value: 'foo' },
        { id: 5, value: 'foo' },
        { id: 6, value: 'foo' },
        { id: 7, value: 'foo' },
        { id: 8, value: 'foo' },
        { id: 9, value: 'foo' },
        { id: 10, value: 'foo' }
      ])

      restartedSequences.should.be.ok
    })
  })

  it('clears cache, allowing another run without prompting for cache', () => {
    let restartedSequences = false

    mapper._restartPKSequence = () => {
      restartedSequences = true
      return Promise.resolve()
    }

    return mapper.start().then(() => {
      return mapper.target.select('*').from('target')
    }).then(targetRows => {
      targetRows.should.have.length(10)
      targetRows.should.deep.equal([
        { id: 1, value: 'foo' },
        { id: 2, value: 'foo' },
        { id: 3, value: 'foo' },
        { id: 4, value: 'foo' },
        { id: 5, value: 'foo' },
        { id: 6, value: 'foo' },
        { id: 7, value: 'foo' },
        { id: 8, value: 'foo' },
        { id: 9, value: 'foo' },
        { id: 10, value: 'foo' }
      ])

      restartedSequences.should.be.ok
    })
  })
})
