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
  fileHandlerService!: FileHandlerService;

  constructor(private _fileHandlerService: FileHandlerService) { }

  downloadFile(): void {
    const filename = 'testdaten.csv'
    this._fileHandlerService.downloadFile().subscribe(
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
  title = 'Test page for prototype';

}
