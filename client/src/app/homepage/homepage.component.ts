import { FileHandlerService } from './../file-handler.service';
import { Component, OnInit } from '@angular/core';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {
  fileHandlerService!: FileHandlerService;

  constructor() { }

  download() {
    this.fileHandlerService.downloadFile().subscribe((response: any) => {
      let blob: any = new Blob([response.blob()], { type: 'text/csv; charset=utf-8'});
      //show file content in browser
      const url = window.URL.createObjectURL(blob);
      //window.open(url);

      saveAs(blob, 'test-csv.json');
    }), (error: any) => console.log('Error downloading file'),
    () => console.info('File download successful');
  }

  ngOnInit(): void {
  }
  title = 'Test page for prototype';

}
