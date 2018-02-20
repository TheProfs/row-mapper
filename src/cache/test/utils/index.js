'use strict'

const bddStdin = require('bdd-stdin')

module.exports = {
  confirmDialog: bool => {
    bddStdin(bool ? 'y' : 'n', '\u001bOM', '\n')
  }
}
