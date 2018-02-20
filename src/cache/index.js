'use strict'

const path = require('path')
const fs = require('fs')
const assert = require('assert')
const inquirer = require('inquirer')

class Cache {
  constructor() {
    this._path = path.resolve(__dirname, 'cache')
  }

  async get() {
    this._createFileIfNotExists()

    let contents = fs.readFileSync(this._path, 'utf8')
    contents = contents ? +contents : 0

    if (!contents)
      return contents

    const shouldUseCache = await this._askForCachePermission()

    if (shouldUseCache) {
      return contents
    }

    this.clear()

    return 0
  }

  set(val) {
    if (typeof val === 'number') {
      fs.writeFileSync(this._path, val, 'utf8')
      return
    }

    throw new Error('Passed value is not a Number')
  }

  clear() {
    fs.writeFileSync(this._path, '', 'utf8')
  }

  _createFileIfNotExists() {
    if (!fs.existsSync(this._path))
      fs.closeSync(fs.openSync(this._path, 'w'))
  }

  _askForCachePermission() {
    return new Promise((resolve, reject) => {
      inquirer.prompt([
        {
          type: 'confirm',
          name: 'cache',
          message: 'Last processed row found in cache! Continue from cache?'
        }
      ]).then(answers => {
        resolve(answers.cache)
      }).catch(err => reject(err))
    })
  }
}

module.exports = Cache
