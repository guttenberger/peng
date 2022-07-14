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

function filter(csvFile, fields = []) {
  const csvString = csvFile.toString('utf-8');
  const operations = [];

  const headers = fields.map(
    field => typeof fields === "string"
      ? field
      : Object.keys(field)[0]
  );

  const csvWriter = createCsvStringifier({
    header: fields.map(head => ({
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
      .on("data", (row) => {
        data.push(row);
      })
      .on("end", _ => {
        const result = csvWriter.stringifyRecords(data);
        console.log(result);
        resolve(Buffer.from(result, 'utf-8'));
      });
  });
}

module.exports = { filter };