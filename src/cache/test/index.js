'use strict'

const path = require('path')
const fs = require('fs')
const chai = require('chai')
const utils = require('./utils')
const Cache = require('../index.js')
const expect = chai.expect
chai.should()

let cache
let cachePath

beforeEach(() => {
  cachePath = path.resolve(__dirname, '../cache')
  if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath)
  cache = new Cache()
})

describe('#get - empty cache', () => {
  it(`creates a cache file if it doesn't exist`, () => {
    return cache.get().then(result => {
      fs.existsSync(cachePath).should.be.ok
    })
  })

  it(`returns 0 if no cache is found`, () => {
    return cache.get().then(result => {
      result.should.be.a('Number')
      result.should.equal(0)
    })
  })

  describe('#get - filled cache', function() {
    this.timeout(5000)

    describe('#get - filled cache - permission given', function() {
      it('returns the cache', () => {
        fs.writeFileSync(cachePath, 10, 'utf8')
        utils.confirmDialog(true)

        return cache.get().then(result => {
          result.should.be.a('Number')
          result.should.equal(10)
        })
      })
    })

    describe('#get - filled cache - permission not given', function() {
      it('returns null', () => {
        fs.writeFileSync(cachePath, 10, 'utf8')
        utils.confirmDialog(false)

        return cache.get().then(result => {
          result.should.be.a('Number')
          result.should.equal(0)
        })
      })

      it('clears the cache and does not ask for permission again', () => {
        return cache.get().then(result => {
          result.should.be.a('Number')
          result.should.equal(0)
        })
      })
    })
  })
})


describe('#set', () => {
  it('sets the cache', () => {
    cache.set(40)
    utils.confirmDialog(true)

    return cache.get().then(result => {
      result.should.be.a('Number')
      result.should.equal(40)
    })
  })

  it('throws if passed value is not a Number', () => {
    expect(() => cache.set('z')).to.throw('Passed value is not a Number')

    return cache.get().then(result => {
      result.should.be.a('Number')
      result.should.equal(0)
    })
  })
})

after(() => {
  fs.writeFileSync(cachePath, '', 'utf8')
})
