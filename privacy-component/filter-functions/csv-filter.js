/**
 * This file handles the filtering of csv files by applying functions to csv data.
 */

const fastCsv = require("fast-csv");
const createCsvStringifier = require("csv-writer").createObjectCsvStringifier;

const fieldOperations = {
  "hide-last-two-characters": field => field.slice(0, -2) + 'xx',
  "year-only": field => field.slice(-4),// slice() because JS Date does not work with dates before 1970
};

/**
 * Anonymizes rows in a csv file through given operations
 * @param {*} row a row that is to be anonymized
 * @param {*} operations an operation that is to be applied to a row
 * @returns the anonymized row
 */
function anonymize(row, operations) {
  for (const [field, operation] of Object.entries(operations)) {
    const hasEmptyValue = !row[field];
    if (hasEmptyValue) continue;

    row[field] = fieldOperations[operation](row[field]);
  }

  return row;
}

/**
 * Filter a given csv file by only keeping rows that are not input into the function
 * @param {*} csvFile a given csvFile that needs to be filtered
 * @param {*} fields an array of rows that are to be kept in the csv file
 * @returns a string buffer containing the filtered csv
 */
function filter(csvFile, { fields = [] }) {
  const csvString = csvFile.toString('utf-8');
  const headers = [];
  const operations = {};

  // check for data anonymization operations
  for (const field of fields) {
    typeof field === "string"
      ? headers.push(field)
      : headers.push(Object.keys(field)[0]) && Object.assign(operations, field)
  }

  const csvWriter = createCsvStringifier({
    header: headers.map(head => ({
      id: head, title: head
    })),
    fieldDelimiter: ';'
  });

  const options = {
    objectMode: true,
    delimiter: ";",
    quote: null,
    headers: true,
    renameHeaders: false,
  };

  return new Promise((resolve, reject) => {
    const data = [];

    fastCsv.parseString(csvString, options)
      .on("error", reject)
      .on("data", row => {
        if (!operations) {
          data.push(row);
          return;
        }

        const resultRow = anonymize(row, operations);
        data.push(resultRow);
      })
      .on("end", _ => {
        const headerRow = csvWriter.getHeaderString();
        const dataRow = csvWriter.stringifyRecords(data);
        const resultCsv = headerRow.concat(dataRow);

        if (resultCsv) resolve(Buffer.from(resultCsv, 'utf-8'));
      });
  });
}

module.exports = { filter };