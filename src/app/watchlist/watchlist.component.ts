import { Component, OnInit } from "@angular/core";
import { StockService } from "../stock.service";

interface watchItem {
  name: string;
  ticker: string;
  c: number;
  dp:number;
  d:number;
}

@Component({
  selector: "app-watchlist",
  templateUrl: "./watchlist.component.html",
  styleUrl: "./watchlist.component.css",
})
export class WatchlistComponent implements OnInit {
  public watchList: watchItem[] = [];

  constructor(private stockService: StockService) {}

  ngOnInit() {
    this.stockService.getWatchList().subscribe(
      (data) => {
        this.watchList = data;
        console.log(data, "getWatchList");
      },
      (error) => {
        console.log(error);
      }
    );
  }
}
