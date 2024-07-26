import { Injectable } from '@angular/core';
import { AppConstant } from './app.constant';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  url: string = AppConstant.App_Constant.URL;
  _token: string = '';
  constructor(private http: HttpClient) {}
  //"OAuth " + access_token
  httpCall(fd: any) {
    const headers = new HttpHeaders();
    // .set("cache-control", "no-cache")
    // .set("content", "text/html")
    // .set("charset", "UTF-8")
    // .set("Content-Type", "application/x-www-form-urlencoded")
    return this.http.post<any>(this.url, fd, { headers }).pipe(
      map((data) => data),
      catchError(this.handleError)
    );
  }
  private handleError(error: HttpErrorResponse) {
    let message =
      'Internet connection is not available. Please try again later.';
    if (error.error instanceof ErrorEvent) {
      message = 'Internet connection is not available. Please try again.';
    } else {
      message = 'Something bad happened. Please try again later.';
    }
    return throwError(() => new Error(message));
  }
}
