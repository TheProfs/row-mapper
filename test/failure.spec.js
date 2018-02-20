'use strict'

const chai = require('chai')
const expect = chai.expect
const utils = require('./utils')
const Mapper = require('../index.js')
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

chai.should()

let mapper
let ticker = 0

describe('#start() - Mid-processing failure', () => {
  before(() => {
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

      chunkSize: 5,
      suppressLogs: true,

      mapperFn: (row, i) => {
        if (++ticker === 7) throw 'Simulated error'

        return row
      }
    })

    return utils.setupDB({ sourceDB: mapper.source, targetDB: mapper.target })
  })

  it('rejects with the error', () => {
    return expect(mapper.clearCache().start())
      .to.be.rejectedWith('Simulated error')
  })

  it('transfers half of rows to target table', () => {
    return mapper.target.select('*').from('target').then(targetRows => {
      targetRows.should.have.length(5)
      targetRows.should.deep.equal([
        { id: 1, value: 'foo' },
        { id: 2, value: 'foo' },
        { id: 3, value: 'foo' },
        { id: 4, value: 'foo' },
        { id: 5, value: 'foo' }
      ])
    })
  })

  it('transfers the rest of rows after restart', done => {
    let restartedSequences = false

    mapper._restartPKSequence = () => {
      restartedSequences = true
      return Promise.resolve()
    }

    utils.answerConfirm(true)
    mapper.start().then(() => {
      mapper.target.select('*').from('target').then(targetRows => {
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
        done()
      })
    })
  })
})
