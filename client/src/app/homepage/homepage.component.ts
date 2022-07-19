import { FileHandlerService } from './../file-handler.service';
import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  title: string = 'Test page for prototype';
  selectedCsvPurpose: any;
  csvPurposes = [{
    "id": 1,
    "name": "Statistics",
    "description": "Returns a CSV file containing the following fields: Postleitzahl, Testzentrum, Ergebnis"
},
{
    "id": 2,
    "name": "MinistryOfHealth",
    "description": "Returns a CSV file containing the following fields: Nr., Anrede, Titel, Vorname, Nachname, Geburtsdatum, Strasse, Hausnummer, Postleitzahl, Stadt, Mobil, Email, Testzentrum, Ergebnis"
}
];
selectedPhotoPurpose: any;
photoPurposes = [{
  "id": 1,
  "name": "Statistics",
  "description": "tbd"
},
{
  "id": 2,
  "name": "MinistryOfHealth",
  "description": "tbd"
}
];

  constructor(private _fileHandlerService: FileHandlerService) { }

  downloadFile(): void {
    const filename = 'testdaten.csv'
    this._fileHandlerService.downloadOrdinaryCsvFile().subscribe(
        (response: any) =>{
            let dataType = response.type;
            let binaryData = [];
            binaryData.push(response);
            let downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
            if (filename)
                downloadLink.setAttribute('download', filename);
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }
    )
  }

  downloadFileThroughPurpose(purpose: string): void {
    const filename = 'testdaten.csv'
    this._fileHandlerService.downloadCsvFileWithPurpose(purpose).subscribe(
        (response: any) =>{
            let dataType = response.type;
            let binaryData = [];
            binaryData.push(response);
            let downloadLink = document.createElement('a');
            downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, {type: dataType}));
            if (filename)
                downloadLink.setAttribute('download', filename);
            document.body.appendChild(downloadLink);
            downloadLink.click();
        }
    )
  }

  ngOnInit(): void {
  }

}
