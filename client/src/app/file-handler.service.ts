import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor(private http: HttpClient ) { }

  downloadFile(): Observable<any> {
    const baseUrl = 'https://dmug9oijsb.execute-api.eu-central-1.amazonaws.com/Test/csv-archive/testdaten.csv';
    return this.http.get(baseUrl, {responseType: 'text'});
  }

  downloadFileWithPurpose(purpose: string = "Statistics"): Observable<any> {
    const baseUrl = 'https://6jt0zl69s3.execute-api.eu-central-1.amazonaws.com/test/objects/testdaten.csv?purposeToken=';
    return this.http.get(baseUrl + purpose, {responseType: 'text'});
  }
}
