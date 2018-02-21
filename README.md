# row-mapper

[![Build Status](https://travis-ci.org/TheProfs/row-mapper.svg?branch=master)](https://travis-ci.org/TheProfs/row-mapper)

Efficiently move/map/migrate rows between PostgreSQL database tables.

## Install

```bash
$ npm i row-mapper
```

## Use cases

### Perform minimal downtime data migrations/conversions

Successfully inserted/mapped rows are saved in a *cache*. When you start
processing again, the module will skip processed rows and continue from the
last known succesful row.

The cache allows restarting the process from the last-succesful-point after a
run.

In a production system where minimal downtime is mandated you would:

   1. Migrate/convert a sources table's rows to a target table.
   2. Stop read/writes to the source table temporarily - i.e put app in
      "maintenance mode".
   3. Re-run the row-mapper to transfer the new rows that were inserted by
      users while Step 1 was running.
      The cache ensures that only new rows
      are transferred from the source table.
   4. Drop source table & rename target table as source table.
   5. Re-enable read/writes to source table - i.e put app out of
      "maintenance mode".


The cache also ensures the conversion is fault-tolerant. If your system
crashes while processing, you can simply restart the conversion from the last
known succesful point.

### Convert big tables

You can convert huge tables. This module processes rows in *chunks*, so it
avoids a lot of network roundtrips whilst keeping memory usage low since it
doesn't load the whole table in-memory.

## Usage

Assume you have a table named `users` and you want to move all it's rows
to another table named `archived_users` - which could reside in another
database.

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
      name: 'users',
      primaryKey: 'id_user'
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
      name: 'archived_users',
      primaryKey: 'id_user',
      /*
        Name of the sequence associated with the primary key.
        - Upon succesful completion, this sequence will be
          set to the max value of the primary key column of the target table.
       */
      primaryKeySequence: 'user_id_user_seq'
    }
  },

  // How many rows to process, per chunk. Defaults to 2000.
  chunkSize: 3000,

  /*
    This mapper function will run for *each* row of the source table.
    - You can convert each row here before you insert it to your target table.
   */
  mapperFn: (row, i) => {
    return Object.assign(row, {
      archived_date: new Date(),
      archiver: 'John Doe'
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
