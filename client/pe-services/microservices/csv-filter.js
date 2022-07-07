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

const csvFile = "C:/Users/U760165/Programming/Uni/privacy-engineering/peng-prototype/pe-web/pe-services/microservices/testdaten.csv"
const modifiedCsvFile = "C:/Users/U760165/Programming/Uni/privacy-engineering/peng-prototype/pe-web/pe-services/microservices/testdaten_modified.csv"

const fs = require("fs");
const fastCsv = require("fast-csv");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const csv = require("csv-parser");

const csvWriter = createCsvWriter({
  path: modifiedCsvFile,
  header: [
    {id: "Nr.", title: "Nr."},
    {id: "Postleitzahl", title: "Postleitzahl"},
    {id: "Testzentrum", title: "Testzentrum"},
    {id: "Ergebnis", title: "Testergebnis"},
    // TODO: auslagern in config und von dort auslesen
  ],
  fieldDelimiter : ';'
});

const options = {
  objectMode: true,
  delimiter: ";",
  quote: null,
  headers: true,
  renameHeaders: false,
};

const data = [];
let modifiedCsvData = [];

// TODO: read in csv file from s3 Server
fs.createReadStream(csvFile)
  .pipe(fastCsv.parse(options))
  .on("error", (error) => {
    console.log(error);
  })
  .on("data", (row) => {
    data.push(row);
  })
  .on("end", (rowCount) => {
    console.log(rowCount);
    console.log(data);
    modifiedCsvData = data;
    console.log(modifiedCsvData);

    //write to file
    //  TODO: offer this file as a download to the user
    csvWriter.writeRecords(modifiedCsvData);
  });
