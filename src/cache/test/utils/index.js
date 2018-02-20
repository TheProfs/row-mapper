'use strict'

const robot = require('robotjs')

module.exports = {
  answerConfirm: bool => {
    setTimeout(() => {
      robot.typeString(bool ? 'y' : 'n')
      robot.keyTap('enter')
    }, 500)
  }
}
