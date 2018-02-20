'use strict'

const path = require('path')
const fs = require('fs')
const bddStdin = require('bdd-stdin')

module.exports = {
  confirmDialog: bool => {
    bddStdin(bool ? 'y' : 'n', '\u001bOM', '\n')
  },

  clearCache: () => {
    fs.writeFileSync(path.resolve(__dirname, '../../cache'), '', 'utf8')
  }
}
