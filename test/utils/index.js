'use strict'

const path = require('path')
const fs = require('fs')
const bddStdin = require('bdd-stdin')

module.exports = {
  setupDB: ({ sourceDB, targetDB }) => {
    return sourceDB.schema.createTable('source', t => {
      t.increments('id').primary()
      t.string('value').notNull()
    }).then(() => {
      return targetDB.schema.createTable('target', t => {
        t.increments('id').primary()
        t.string('value').notNull()
      })
    }).then(() => {
      return sourceDB('source').insert([
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
    })
  },

  confirmDialog: bool => {
    bddStdin(bool ? 'y' : 'n', '\u001bOM', '\n')
  },

  clearCache: () => {
    fs.writeFileSync(path.resolve(__dirname, '../../src/cache/cache'), '', 'utf8')
  }
}
