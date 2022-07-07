import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor(private http: HttpClient ) { }

  downloadFile(): any {
    //return this.http.get('http://localhost:8080/employees/download', {responseType: 'blob'});
    return "C:/Users/U760165/Programming/Uni/pe-project/peng/client/pe-services/microservices/testdaten_modified.csv";
  }
}
