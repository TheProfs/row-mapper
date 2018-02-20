'use strict'

describe('Cache', () => {
  require('../src/cache/test/index.js')
})

describe('Run Scenarios', () => {
  require('./non-failure.spec.js')
  require('./failure.spec.js')
})
