'use strict'

'use strict'

const robot = require('robotjs')

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

  answerConfirm: bool => {
    setTimeout(() => {
      robot.typeString(bool ? 'y' : 'n')
      robot.keyTap('enter')
    }, 500)
  }
}