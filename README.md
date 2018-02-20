# row-mapper

[![Build Status](https://travis-ci.org/TheProfs/row-mapper.svg?branch=master)](https://travis-ci.org/TheProfs/row-mapper)

Efficiently move/map rows between PostgreSQL database tables.

## Install

```bash
$ npm i row-mapper
```

## Use case

Assume you have a table named `event` and you want to move all it's rows
to another table named `new_event` - which could reside in another database.

While you move the data you might also need to convert each row's data to
another format.

Here's how you would do it:

```javascript
'use strict'

const RowMapper = require('row-mapper')

const mapper = new RowMapper({
  // The source database
  source: {
    // DB settings
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      user: 'foo',
      password: 'bar_pass',
      database: 'foo_db'
    },

    // The table to get data from.
    table: {
      name: 'event',
      primaryKey: 'id_event'
    }
  },

  /*
    The target database, where data would be moved to.
    - This can be the same as the source DB.
   */
  target: {
    // DB settings
    client: 'pg',
    connection: {
      host: '127.0.0.2',
      user: 'foo',
      password: 'foo_pass',
      database: 'bar_db'
    },

    // The table to insert data to.
    table: {
      name: 'new_event',
      primaryKey: 'new_id_event',
      /*
        Name of the sequence associated with the primary key.
        - Upon succesful completion, this sequence will be
          set to the max value of the primary key column of the target table.
       */
      primaryKeySequence: 'event_id_new_event_seq'
    }
  },

  // How many rows to process, per chunk. Defaults to 2000.
  chunkSize: 3000,

  /*
    This mapper function will run for *each* row of the source table.
    - You can convert each row here before you insert it to your target table.
   */
  mapperFn: (row, i) => {
    return {
      new_id_event: row.id_event,
      name: row.name === 'item-added' ? 'item-inserted' : row.name
    }
  }
})

// Then just run the mapper
mapper.start().then(result => {
  console.log('Success')
})
.catch(err => {
  console.error(err)
})
```

## Features

- You can convert huge tables. This module processes rows in *chunks*, so
  it avoids a lot of network roundtrips whilst keeping memory usage low since
  we it doesn't load the whole table in-memory.

- Successfully inserted/mapped rows are saved in a cache. When you start
  processing again, the module will skip processed rows and continue from the
  last known succesful row.

## Tests

```bash
$ npm test
```

**Important:** Tests are run against an in-memory SQLite database and do
not reset the table PK sequences after they are done.

## Authors

- [The Profs][the-profs-gh]

## License

MIT

[the-profs-gh]: https://github.com/TheProfs
