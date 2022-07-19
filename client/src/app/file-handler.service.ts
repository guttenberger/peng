import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor(private http: HttpClient ) { }

  downloadOrdinaryCsvFile(): Observable<any> {
    const baseUrl = 'https://okomjjq1tk.execute-api.eu-central-1.amazonaws.com/Test/csv-archive/testdaten.csv';
    return this.http.get(baseUrl, {responseType: 'text'});
  }

  downloadCsvFileWithPurpose(purpose: string = "Statistics"): Observable<any> {
    const baseUrl = 'https://nahqtqdnee.execute-api.eu-central-1.amazonaws.com/test/anonymize-object/testdaten.csv?purposeToken=';
    return this.http.get(baseUrl + purpose, {responseType: 'text'});
  }

  downloadOrdinaryPhoto(): Observable<any> {
    const baseUrl = 'https://okomjjq1tk.execute-api.eu-central-1.amazonaws.com/Test/csv-archive/testdaten.csv';
    return this.http.get(baseUrl, {responseType: 'text'});
  }

  downloadPhotoWithPurpose(purpose: string = "Statistics"): Observable<any> {
    const baseUrl = 'https://nahqtqdnee.execute-api.eu-central-1.amazonaws.com/test/anonymize-object/testdaten.csv?purposeToken=';
    return this.http.get(baseUrl + purpose, {responseType: 'text'});
  }

}
