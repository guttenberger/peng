import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

/**
 * Angular Service for handling HTTP requests for downloading files from AWS
 */
@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor(private http: HttpClient ) { }

  /**
   * Download a csv file from AWS without any interception
   * @returns a csv file through a http GET request
   */
  downloadOrdinaryCsvFile(): Observable<any> {
    const baseUrl = 'https://t965jemm92.execute-api.eu-central-1.amazonaws.com/Test/csv-archive/testdaten.csv';
    return this.http.get(baseUrl, {responseType: 'text'});
  }

  /**
   * Download a csv file from AWS with purpose interception
   * @param purpose a valid purpose that is defined in the purpose based data access model, default: Statistics
   * @returns a csv file through a http GET request modified as defined in the purpose
   */
  downloadCsvFileWithPurpose(purpose: string = "Statistics"): Observable<any> {
    const baseUrl = 'https://vw3yhhcttg.execute-api.eu-central-1.amazonaws.com/test/anonymize-object/testdaten.csv?purposeToken=';
    return this.http.get(baseUrl + purpose, {responseType: 'text'});
  }

  /**
   * Download a jpg from AWS without any interception
   * @returns a jpg through a http GET request
   */
  downloadOrdinaryPhoto(): Observable<any> {
    const baseUrl = 'https://t965jemm92.execute-api.eu-central-1.amazonaws.com/Test/jpg-archive/test.jpg';
    return this.http.get(baseUrl, {responseType: 'blob'});
  }

    /**
   * Download a jpg from AWS with purpose interception
   * @param purpose a valid purpose that is defined in the purpose based data access model, default: General
   * @returns a jpg through a http GET request modified as defined in the purpose
   */
  downloadPhotoWithPurpose(purpose: string = "General"): Observable<any> {
    const baseUrl = 'https://ky0zbem3qe.execute-api.eu-central-1.amazonaws.com/test/anonymize-object/test.jpg?purposeToken=';
    return this.http.get(baseUrl + purpose, {responseType: 'blob'});
  }

}
