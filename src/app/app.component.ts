import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'hw4';

  errorMessage: boolean = false;

  errorChange(value: boolean) {
    console.log(8888)
    this.errorMessage = value;
  }

  data: any

  successChange(value: any) {
    console.log(8888)
    this.data = value;
  }
}
