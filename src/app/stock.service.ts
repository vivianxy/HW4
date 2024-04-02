import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class StockService {
  constructor(private http: HttpClient) {}
  getStockInfo(symbol: string): Observable<any> {
    const url = `https://hw4-backend-mnhf62la4q-uc.a.run.app/search?symbol=${symbol}`;
    return this.http.get<any>(url);
  }
  starStock(data: { name: string; ticker: string }) {
    const url = "https://hw4-backend-mnhf62la4q-uc.a.run.app/watchlist";
    return this.http.post(url, data);
  }

  unstarStock(ticker: string) {
    const url = `https://hw4-backend-mnhf62la4q-uc.a.run.app/watchlist/${ticker}`;
    return this.http.delete(url);
  }

  getWatchList(): Observable<any> {
    const url = "https://hw4-backend-mnhf62la4q-uc.a.run.app/watchlist";
    return this.http.get<any>(url);
  }

  
}
