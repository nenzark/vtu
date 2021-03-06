const _ = require('lodash')
const normalizeData = require.main.require('./lib/internal/normalizeData')

/**
 * Takes an object of structure and converts it into csv
 * {
 *  headColumns: [ 'string', 'translation' ],
 *  'email@address.com': 'email@address.com',
 *  Password: 'Password',
 *  ...
 *  }
 *
 * @param {{}} object
 * @return {string}
 */
function csvFormat (object) {
  const head = object.headColumns
  const delimiter = ','
  let csvData = []
  const filter = (value) => value === null ? '' : JSON.stringify(value)
  _.map(object, (value, key) => {
      if (key === 'headColumns') {
        csvData.push(head.join(delimiter))
        return false
      }
      csvData.push([filter(key), filter(value)].join(delimiter))
    }
  )
  return csvData.join('\r\n')
}

/**
 * Converts an array of strings into csv format
 *
 * @param {[]} extractedStrings
 */
function toCsv (extractedStrings) {
  let csv = {
    headColumns: [
      'string',
      'translation'
    ]
  }
  normalizeData(extractedStrings, csv)

  return csvFormat(csv)
}

module.exports = toCsv
