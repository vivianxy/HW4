import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class StockService {
  constructor(private http: HttpClient) {}
  getStockInfo(symbol: string): Observable<any> {
    const url = `http://localhost:8080/search?symbol=${symbol}`;
    return this.http.get<any>(url);
  }
  starStock(data: { name: string; ticker: string }) {
    const url = "http://localhost:8080/watchlist";
    return this.http.post(url, data);
  }

  unstarStock(ticker: string) {
    const url = `http://localhost:8080/watchlist/${ticker}`;
    return this.http.delete(url);
  }

  getWatchList(): Observable<any> {
    const url = "http://localhost:8080/watchlist";
    return this.http.get<any>(url);
  }

  
}
