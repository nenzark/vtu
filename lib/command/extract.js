const _ = require('lodash')

const FileSearch = require.main.require ('./lib/extract/fileSearch')
const ContentMatches = require.main.require ('./lib/extract/contentMatches')
const saveToFile = require.main.require ('./lib/output/saveToFile')
const getFileContents = require.main.require ('./lib/internal/getFileContents')
const isFile = require.main.require ('./lib/internal/isFile')
const toJson = require.main.require ('./lib/output/toJson')

const normalizeData = require.main.require('./lib/internal/normalizeData')

const csvToObject = require.main.require ('./lib/output/adapter/csvToObject')
const jsonToObject = require.main.require ('./lib/output/adapter/jsonToObject')
const objectToCsv = require.main.require ('./lib/output/adapter/objectToCsv')
const objectToJson = require.main.require ('./lib/output/adapter/objectToJson')

/**
 * Extract strings and merge them with existing translations
 *
 * @param {function} typeToObject input function to object
 * @param {function} objectToType output function from object to type
 * @param {string} filePath output full file path
 * @param {{}} extractedData
 *
 * @return {string}
 */
function extractToType(typeToObject, objectToType, filePath, extractedData) {
  let finalExtractedData = extractedData
  if (isFile(filePath)) {
    const contents = getFileContents(filePath)
    const existingTranslationData = typeToObject(contents)
    finalExtractedData = _.merge(extractedData, existingTranslationData)
  }

  return objectToType(finalExtractedData)
}

/**
 * Execute function for extracted strings
 *
 * @param extractedStrings
 * @param outputType
 * @param fileLocation
 */
function execute (extractedStrings, outputType, fileLocation) {

  console.log(extractedStrings.length + ' strings found', fileLocation)
  if (fileLocation === '') {
    console.log(extractedStrings)
    console.log('add a file location to save the extracted strings; eg. ./locale/en_US')
  }

  const filePath = fileLocation + '.' + outputType
  const extractedData = normalizeData(extractedStrings)

  switch (outputType) {
    case 'json':
      saveToFile(fileLocation, outputType, extractToType(jsonToObject, objectToJson, filePath, extractedData))
      break
    case 'csv':
      saveToFile(fileLocation, outputType, extractToType(csvToObject, objectToCsv, filePath, extractedData))
      break
  }
}

/**
 * Extract strings based on a source directory
 *
 * @param dir
 * @param outputType
 * @param fileLocation
 * @return {Array}
 */
function extract (dir, outputType, fileLocation) {
  const excluded = [
    'node_modules',
    '\\.nuxt',
    'dist',
    'vue-translate-extract'
  ]
  const fileSearch = new FileSearch()
  const contentMatches = new ContentMatches()
  const files = fileSearch
  .setStartingDir(dir)
  .setExcludedDirs(excluded)
  .setSearchPattern('.?(js|vue)$')
  .getResults()

  let allMatches = {}
  _.forEach(files, (filePath) => {
    const fileMatches = contentMatches.setFullPath(filePath).getMatches()
    if (_.size(fileMatches) > 0) {
      allMatches = _.concat(allMatches, fileMatches)
    }
  })

  allMatches = _.uniq(_.filter(allMatches, (value) => {
    return typeof value === 'string'
  }))

  execute (allMatches, outputType, fileLocation)

  return allMatches
}

module.exports = extract
