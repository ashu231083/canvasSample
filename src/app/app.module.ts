import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CanvasComponent } from './canvas/canvas.component';
import { HttpService } from './services/http.service';
import { AppConstant } from './services/app.constant';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { RouterModule } from '@angular/router';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpInterceptService } from './services/http-intercept.service';

@NgModule({
  declarations: [AppComponent, CanvasComponent],
  imports: [BrowserModule, AppRoutingModule, FormsModule, HttpClientModule, NgbModule,RouterModule],
  providers: [
    HttpService,
     AppConstant,
     { provide: LocationStrategy, useClass: HashLocationStrategy },
    // {provide: HTTP_INTERCEPTORS,useClass: HttpInterceptService,multi: true}
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
