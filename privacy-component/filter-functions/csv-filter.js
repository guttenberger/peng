// example
// https://c2fo.github.io/fast-csv/docs/parsing/getting-started

/*
  - RKI bekommt zB Anzahl positiver Tests im Verhältnis zu Gesamttests
  - 2. Use-case Daten aus csv rauswerfen
*/

/*
const params = {
  Bucket: srcBucket,
  Key: srcKey,
};
*/
//const csvFile = s3.getObject(params).createReadStream();
//s3 object lambda access point ansprechen

const fastCsv = require("fast-csv");
const createCsvStringifier = require("csv-writer").createObjectCsvStringifier;

const fieldOperations = {
  "hide-last-two-characters": field => field.slice(0, -2) + 'xx',
  // slice() instead of data class because JS Date does not work with dates before 1970
  "year-only": field => field.slice(-4),
};

function anonymize(row, operations) {
  for (const [field, operation] of Object.entries(operations)) {
    const hasEmptyValue = !row[field];
    if (hasEmptyValue) continue;

    row[field] = fieldOperations[operation](row[field]);
  }

  return row;
}

function filter(csvFile, fields = []) {
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
        const header = csvWriter.getHeaderString();
        const resultCsv = header?.concat(csvWriter.stringifyRecords(data));

        if (resultCsv) resolve(Buffer.from(resultCsv, 'utf-8'));
      });
  });
}

module.exports = { filter };