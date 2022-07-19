import { FileHandlerService } from './../file-handler.service';
import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';
import { HttpClient, HttpHeaders } from '@angular/common/http';

/**
 * Angular Component Homepage, being displayed by default when accessing the webpage. Offers multiple download buttons.
 *
 */
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
    "name": "General",
    "description": "Returns a photo that has no metadata attached."
  },
  {
    "id": 2,
    "name": "Research",
    "description": "Returns a photo that still has all metadata attached, where the location has been noised with a random number between 2km and 5km."
  }
  ];

  constructor(private _fileHandlerService: FileHandlerService) { }

  /**
   * Calls the service that handles downloading files from the backend and creates a download link for this file
   * -> downloads a csv file without modifications from purposes
   */
  downloadCsvFile(): void {
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

  /**
   * Calls the service that handles downloading files from the backend and creates a download link for this file
   * -> downloads a csv file with modifications from purposes
   * @param purpose the purpose that was input by the user on the website
   */
  downloadCsvFileThroughPurpose(purpose: string): void {
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

  /**
   * Calls the service that handles downloading files from the backend and creates a download link for this file
   * -> downloads a jpg file without modifications from purposes
   */
  downloadPhoto(): void {
    const filename = 'testphoto.jpg'
    this._fileHandlerService.downloadOrdinaryPhoto().subscribe(
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

  /**
   * Calls the service that handles downloading files from the backend and creates a download link for this file
   * -> downloads a jpg file with modifications from purposes
   * @param purpose the purpose that was input by the user on the website
   */
  downloadPhotoThroughPurpose(purpose: string): void {
    const filename = 'testphoto.jpg'
    this._fileHandlerService.downloadPhotoWithPurpose(purpose).subscribe(
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
