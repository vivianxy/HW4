import { HttpClient } from "@angular/common/http";
// import * as Highcharts from 'highcharts';
import * as Highcharts from 'highcharts/highstock';
import HC_exporting from 'highcharts/modules/exporting';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from "@angular/core";
import { StockService } from "../stock.service";

@Component({
  selector: "app-search-result",
  templateUrl: "./search-result.component.html",
  styleUrl: "./search-result.component.css",
})
export class SearchResultComponent implements OnInit {
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  chartOptions2: Highcharts.Options = {};
  chartOptions3: Highcharts.Options = {};

  searchTerm: string = "";
  autocompleteResults: any[] = [];
  API_TOKEN = "cnbfuvpr01qks5ivmqj0cnbfuvpr01qks5ivmqjg";
  constructor(private http: HttpClient, private stockService: StockService) {}
  marketStatus: string = '';
  currentDate: string = '';
  // currentDateTime: string='';
  isMarketOpen: boolean = false;

  error_message: string = "";
  isLoading: boolean = false;
  search(): void {
    // use StockService to search
    this.isLoading = true;
    this.stockService.getStockInfo(this.searchTerm).subscribe((res) => {
      console.log(res);
      if (res.Error) {
        this.error_message = "No Data found, please enter a valid ticker";
        this.isLoading = false;
      } else {
        this.error_message = "";

        if (res && res.profile) {
          this.profile = { ...res.profile };
          console.log(this.profile, "this.profile");
        }

        if (res && res.quote) {
          this.quote = { ...res.quote };
        }

        if (res && res.stock_pr) {
          this.stockPr = res.stock_pr as string[];
        }

        if (res && Array.isArray(res.news)) {
          this.news = res.news.map(
            (newsItem: any): NewsItem => ({
              category: newsItem.category || "",
              datetime: newsItem.datetime || 0,
              headline: newsItem.headline || "",
              id: newsItem.id || 0,
              image: newsItem.image || "",
              related: newsItem.related || "",
              source: newsItem.source || "",
              summary: newsItem.summary || "",
              url: newsItem.url || "",
            })
          );
          console.log(this.news, 'this.news');
        }

        if (res && res.time_series) {
          this.timeSeries = res.time_series;
          console.log(this.timeSeries, 'this.timeSeries');
          this.loadChartData()
        }

        if (res && res.time_series2) {
          this.timeSeries2 = res.time_series2;
          console.log(this.timeSeries2, 'this.timeSeries2');
          this.loadChartData()
        }

        if (res && res.in_sentiment) {
          this.inSentiment = {...res.in_sentiment};
          console.log(this.inSentiment, 'this.inSentiment');
        }

        if (res && res.stock_earn) {
          this.stockEarn = res.stock_earn as StockEarnings[];
          console.log(this.stockEarn, 'this.stockEarn');
          this.anotherChart();
        }

        if (res && res.recomd) {
          this.recomdInfo = res.recomd as RecomdInfo[];
          console.log(this.recomdInfo, 'this.recomdInfo');
          this.initChart();
        }
        this.isLoading = false;
        this.checkStockStarred();
      }
    });
  }

  


  calculateTotalMspr(): number {
    return this.inSentiment.data.reduce((total, currentItem) => total + currentItem.mspr, 0);
  }

  calculateTotalNegativeMspr(): number {
    return this.inSentiment.data.reduce((total, currentItem) => {
      if (currentItem.mspr < 0) {
        return total + currentItem.mspr;
      }
      return total;
    }, 0);
  }

  calculateTotalPositiveMspr(): number {
    return this.inSentiment.data.reduce((total, currentItem) => {
      if (currentItem.mspr > 0) {
        return total + currentItem.mspr;
      }
      return total;
    }, 0);
  }

  calculateTotalChange(): number {
    return this.inSentiment.data.reduce((total, currentItem) => total + currentItem.change, 0);
  }

  calculateTotalPositiveChange(): number {
    return this.inSentiment.data.reduce((total, currentItem) => {
      if (currentItem.change > 0) {
        return total + currentItem.change;
      }
      return total;
    }, 0);
  }

  calculateTotalNegativeChange(): number {
    return this.inSentiment.data.reduce((total, currentItem) => {
      if (currentItem.change < 0) {
        return total + currentItem.change;
      }
      return total;
    }, 0);
  }
  


  checkMarketOpen(): void {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formattedDate = now.getFullYear() + '-' + 
                          ('0' + (now.getMonth() + 1)).slice(-2) + '-' + 
                          ('0' + now.getDate()).slice(-2);
    const formattedTime = ('0' + hours).slice(-2) + ':' + 
                          ('0' + minutes).slice(-2) + ':' + 
                          ('0' + seconds).slice(-2);
  
    if (dayOfWeek >= 1 && dayOfWeek <= 5 && (hours > 9 || (hours === 9 && minutes >= 30)) && (hours < 16)) {
      this.marketStatus = 'Market is open on '+ formattedDate + ' ' + formattedTime;
      this.isMarketOpen = true;
    } else {
      this.marketStatus = 'Market is closed on '+ formattedDate + ' ' + formattedTime;
      this.isMarketOpen = false;
    }

    // this.currentDateTime = now.toLocaleString('default', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }


  selectResult(selectedResult: any): void {
    console.log("Selected:", selectedResult);
    this.searchTerm = selectedResult.symbol;
    this.autocompleteResults = [];
  }
  onSearchTermChange(): void {
    if (!this.searchTerm.trim()) {
      this.autocompleteResults = [];
      return;
    }
    const url = `https://finnhub.io/api/v1/search?q=${this.searchTerm}&token=${this.API_TOKEN}`;
    this.http.get<any>(url).subscribe((data) => {
      console.log(data, "data");
      const filteredResults = data.result.filter(
        (item: any) =>
          item.type === "Common Stock" && !item.symbol.includes(".")
      );
      this.autocompleteResults = filteredResults;
    });
  }
//save
  isStar = false;
  starHandler(): void {
    this.isStar = !this.isStar;
    const data = {
      name: this.profile.name,
      ticker: this.profile.ticker,
      c:this.quote.c,
      dp:this.quote.dp,
      d:this.quote.d,
    };
    //
    if (this.isStar) {
      this.stockService.starStock(data).subscribe((res) => {
        console.log(res, "save");
      });
    } else {
      this.stockService.unstarStock(data.ticker).subscribe((res) => {
        console.log(res, "unstarred");
      });
    }
  }
  checkStockStarred(): void {
    this.stockService.getWatchList().subscribe(
      (watchList) => {
        // assume this.profile already have
        this.isStar = watchList.some(
          (item: { ticker: string }) => item.ticker === this.profile.ticker
        );
      },
      (error) => {
        console.error(error);
      }
    );
  }
  

  clearSearch(): void {
    this.searchTerm = "";
    this.autocompleteResults = [];
  }
  // ok
  stockPr: string[] = [];

  news: NewsItem[] = [];
  inSentiment: InSentiment = { data: [], symbol: "" };
  timeSeries2: TimeSeriesData2 = {
    detailedData: [],
    maxVolume: 0,
  };

  timeSeries: TimeSeries = {
    c: [],
    v: [],
    max_y: 0,
  };
  stockEarn: StockEarnings[] = [];
  recomdInfo: RecomdInfo[] = [];


  profile: CompanyInfo = {
    country: "",
    currency: "",
    estimateCurrency: "",
    exchange: "",
    finnhubIndustry: "",
    ipo: "",
    logo: "",
    marketCapitalization: 0,
    name: "",
    phone: "",
    shareOutstanding: 0,
    ticker: "",
    weburl: "",
  };

  quote: CompanyQuote = {
    c: 0,
    d: 0,
    dp: 0,
    h: 0,
    l: 0,
    o: 0,
    pc: 0,
    t: 0,
  };
  

  ngOnInit(): void {
    this.checkStockStarred();
    this.checkMarketOpen();
    this.currentDate = new Date().toLocaleDateString();
    // this.initChart();
    console.log(this.data, "sucess");
  }
  

  //recomd-Highcharts
  initChart(): void {
    this.chartOptions = {
      chart: {
        type: "column",
      },
      title: {
        text: "Analyst Recommendations Over Time",
      },
      xAxis: {
        categories: this.recomdInfo.map((info) => info.period),
        labels: {
          style: {
            fontSize: "12px",
          },
        },
      },
      // !!
      yAxis: {
        min: 0,
        title: {
          text: "Recommendations Count",
        },
        stackLabels: {
          enabled: true,
        },
        labels: {
          style: {
            fonsSize: "12px",
          },
        },
      },
      // !!
      legend: {
        shadow: false,
        align: "center",
        verticalAlign: "bottom",
        layout: "horizontal",
      },
      tooltip: {
        headerFormat: "<b>{point.x}</b><br/>",
        pointFormat: "{series.name}: {point.y}<br/>Total: {point.stackTotal}",
      },
      plotOptions: {
        column: {
          stacking: "normal",
          dataLabels: {
            enabled: true,
          },
        },
      },
      series: [
        {
          name: "Buy",
          type: "column",
          data: this.recomdInfo.map((info) => info.buy),
        },
        {
          name: "Hold",
          type: "column",
          data: this.recomdInfo.map((info) => info.hold),
        },
        {
          name: "Sell",
          type: "column",
          data: this.recomdInfo.map((info) => info.sell),
        },
        {
          name: "Strong Buy",
          type: "column",
          data: this.recomdInfo.map((info) => info.strongBuy),
        },
        {
          name: "Strong Sell",
          type: "column",
          data: this.recomdInfo.map((info) => info.strongSell),
        },
      ],
    };
  }

  anotherChart():void{
    this.chartOptions3 = {
      chart: {
        type: 'line'
    },
    title: {
        text: 'Historical EPS Surprises'
    },
    xAxis: {
        categories: this.stockEarn.map((info) => info.surprise.toString()),
    },
    yAxis: {
        title: {
            text: 'Quarterly ESP'
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [
      {
        name: "Actual",
        type: "line",
        data: this.stockEarn.map((info) => info.actual),
      },
      {
        name: "Estimate",
        type: "line",
        data: this.stockEarn.map((info) => info.estimate),
      }
    ]
    }
  }


  loadChartData(): void {
    this.chartOptions2 = {
        rangeSelector: {
            selected: 2
        },
        title: {
            text: 'Stock Price'
        },
        yAxis: [{
            labels: {
                align: 'right'
            },
            title: {
                text: 'OHLC'
            },
            height: '60%',
            resize: {
                enabled: true
            }
        }, {
            labels: {
                align: 'right'
            },
            title: {
                text: 'Volume'
            },
            top: '65%',
            height: '35%',
            offset: 0,
            lineWidth: 2
        }],
        series: [{
            type: 'candlestick',
            data: this.timeSeries2.detailedData.map(entry => [entry.timestamp, entry.open, entry.high, entry.low, entry.close]),
            tooltip: {
                valueDecimals: 2
            },
        }, {
            type: 'column',
            name: 'Volume',
            data: this.timeSeries2.detailedData.map(entry => [entry.timestamp, entry.volume]),
            yAxis: 1,
        }],
        navigator: {
            enabled: true,
            series: {
                data: this.timeSeries2.detailedData.map(entry => [entry.timestamp, entry.close])
            }
        }
    };
}


  


  
  



  currentView: string = "showsummary";
  showdata(view: string): void {
    console.log(view, "showdata");
    this.currentView = view;
  }

  @Input() data: any;
}
interface CompanyInfo {
  country: string;
  currency: string;
  estimateCurrency: string;
  exchange: string;
  finnhubIndustry: string;
  ipo: string;
  logo: string;
  marketCapitalization: number;
  name: string;
  phone: string;
  shareOutstanding: number;
  ticker: string;
  weburl: string;
}

interface CompanyQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
}

interface NewsItem {
  category: string;
  datetime: number;
  headline: string;
  id: number;
  image: string;
  related: string;
  source: string;
  summary: string;
  url: string;
}

interface InSentimentData {
  symbol: string;
  year: number;
  month: number;
  change: number;
  mspr: number;
}

interface InSentiment {
  data: InSentimentData[];
  symbol: string;
}
export interface WatchItem {
  name: string;
  ticker: string;
}

interface TimeSeriesEntry {
  [0]: number;
  [1]: number;
}

interface TimeSeries {
  c: TimeSeriesEntry[];
  v: TimeSeriesEntry[];
  max_y: number;
}

interface StockEarnings {
  actual: number;
  estimate: number;
  period: string;
  quarter: number;
  surprise: number;
  surprisePercent: number;
  symbol: string;
  year: number;
}
interface RecomdInfo {
  buy: number;
  hold: number;
  sell: number;
  strongBuy: number;
  strongSell: number;
  period: string;
  symbol: string;
}


interface TimeSeriesDetail {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TimeSeriesData2 {
  detailedData: TimeSeriesDetail[];
  maxVolume: number;
}
