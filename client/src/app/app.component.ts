import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
}

//Anfrage für Token, wird im Client gespeichert, mit diesem Token geht die Anfrage in den S3 Bucket
//Button für "Patientenbild anfordern", zB
