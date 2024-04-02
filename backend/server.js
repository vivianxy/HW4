const express = require("express");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 8080;
const moment = require("moment");

const API_KEY_FIN = "cnbfuvpr01qks5ivmqj0cnbfuvpr01qks5ivmqjg";
const API_KEY_POLYGON = "i59PWkXzWq6PnPVxp6mfUP0pjsDia4ff";

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://xinyison:5RF3KcH7AvvPHJaJ@cluster0.dx9lbsv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

app.use(express.json());

const cors = require("cors");
app.use(cors({ origin: "http://localhost:4200" }));

async function getRecommendationTrends(symbol) {
  const url = `https://finnhub.io/api/v1/stock/recommendation?symbol=${symbol}&token=${API_KEY_FIN}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data || {};
  } catch (error) {
    return null;
  }
}

async function getCompanyProfile(symbol) {
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${API_KEY_FIN}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    if (!data || !data.name) {
      return {};
    } else {
      return data;
    }
  } catch (error) {
    return null;
  }
}

async function getStockQuote(symbol) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${API_KEY_FIN}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    if (data && "c" in data) {
      return data;
    } else {
      return {};
    }
  } catch (error) {
    return null;
  }
}

async function getCompanyNews(symbol, fromDate, toDate) {
  const url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${API_KEY_FIN}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    return data || {};
  } catch (error) {
    return null;
  }
}

async function getStockTimeSeriesData(symbol) {
  const fromDate = moment()
    .subtract(6, "months")
    .subtract(1, "days")
    .format("YYYY-MM-DD");
  const toDate = moment().format("YYYY-MM-DD");
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/2/day/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${API_KEY_POLYGON}`;
  try {
    const response = await axios.get(url);
    const data = response.data.results || [];
    let chartData = [];
    let volumeData = [];
    let maxVolume = 0;
    for (let i of data) {
      let timestamp = i.t;
      let price = Math.round(i.c * 100) / 100;
      let volume = i.v;
      chartData.push([timestamp, price]);
      volumeData.push([timestamp, volume]);
      if (volume > maxVolume) {
        maxVolume = volume;
      }
    }
    return { c: chartData, v: volumeData, max_y: maxVolume };
  } catch (error) {
    return null;
  }
}

async function getStockTimeSeriesData2(symbol) {
  const fromDate = moment()
    .subtract(6, "months")
    .subtract(1, "days")
    .format("YYYY-MM-DD");
  const toDate = moment().format("YYYY-MM-DD");
  const url = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/2/day/${fromDate}/${toDate}?adjusted=true&sort=asc&apiKey=${API_KEY_POLYGON}`;
  try {
    const response = await axios.get(url);
    const data = response.data.results || [];
    let detailedData = [];
    // let volumeData = [];
    let maxVolume = 0;
    for (let i of data) {
      let timestamp = i.t;
      let open = i.o;
      let high = i.h;
      let low = i.l;
      let close = i.c;
      let volume = i.v;

      detailedData.push({
        timestamp: timestamp,
        open: Math.round(open * 100) / 100, // 保持与价格的处理一致
        high: Math.round(high * 100) / 100,
        low: Math.round(low * 100) / 100,
        close: Math.round(close * 100) / 100,
        volume: volume
      });
      if (volume > maxVolume) {
        maxVolume = volume;
      }
    }
    return { detailedData: detailedData, maxVolume: maxVolume };;
  } catch (error) {
    return null;
  }
}



async function getInsiderSentiment(symbol) {
  const fromDate = "2022-01-01";
  const url = `https://finnhub.io/api/v1/stock/insider-sentiment?symbol=${symbol}&from=${fromDate}&token=${API_KEY_FIN}`;
  try {
    const response = await axios.get(url);
    return response.data || {};
  } catch (error) {
    return null;
  }
}

async function getStockPeers(symbol) {
  const url = `https://finnhub.io/api/v1/stock/peers?symbol=${symbol}&token=${API_KEY_FIN}`;
  try {
    const response = await axios.get(url);
    return response.data || [];
  } catch (error) {
    return null;
  }
}

async function getStockEarnings(symbol) {
  const url = `https://finnhub.io/api/v1/stock/earnings?symbol=${symbol}&token=${API_KEY_FIN}`;
  try {
    const response = await axios.get(url);
    return response.data || [];
  } catch (error) {
    return null;
  }
}

app.get("/search", async (req, res) => {
  const symbol = (req.query.symbol || "").toUpperCase();
  console.log(symbol, "symbol");

  if (!symbol) {
    return res.status(400).json({ Error: "No symbol provided" });
  }

  const companyData = {
    profile: await getCompanyProfile(symbol),
    quote: await getStockQuote(symbol),
    news: await getCompanyNews(
      symbol,
      moment().subtract(7, "days").format("YYYY-MM-DD"),
      moment().format("YYYY-MM-DD")
    ),
    time_series: await getStockTimeSeriesData(symbol),
    in_sentiment: await getInsiderSentiment(symbol),
    stock_pr: await getStockPeers(symbol),
    stock_earn: await getStockEarnings(symbol),
    recomd: await getRecommendationTrends(symbol),
    time_series2: await getStockTimeSeriesData2(symbol)
  };

  let allEmptyExceptInSentiment = false;
  if (!companyData.profile || companyData.profile.length === 0) {
    allEmptyExceptInSentiment = true;
  }
  // if (!companyData.news || companyData.profile.news === 0) {
  //   allEmptyExceptInSentiment = true;
  // }
  if (!companyData.stock_earn || companyData.stock_earn.length === 0) {
    allEmptyExceptInSentiment = true;
  }
  if (!companyData.stock_pr || companyData.stock_pr.length === 0) {
    allEmptyExceptInSentiment = true;
  }
  if (!companyData.in_sentiment || companyData.in_sentiment.data.length === 0) {
    allEmptyExceptInSentiment = true;
  }
  // if (
  //   !companyData.time_series ||
  //   companyData.time_series.c.length === 0 ||
  //   companyData.time_series.v.length === 0
  // ) {
  //   allEmptyExceptInSentiment = true;
  // }
  if (
    !companyData.quote ||
    companyData.quote.d === null ||
    companyData.quote.dp === null
  ) {
    allEmptyExceptInSentiment = true;
  }

  if (allEmptyExceptInSentiment) {
    res.json({ Error: "No data found for the provided symbol" });
  } else {
    res.json(companyData);
  }
});

app.post("/watchlist", async (req, res, next) => {
  try {
    await client.connect();
    const db = client.db("HW4");
    const coll = db.collection("Watchlist");
    const { name, ticker , c, dp , d} = req.body;

    const existingStock = await coll.findOne({ ticker: ticker });
    if (existingStock) {
      // if alredy has
      res.status(400).send({ message: "Stock already in watchlist." });
      return;
    }
    const stock = { name, ticker , c, dp, d};
    const result = await coll.insertOne(stock);
    res.send(result);
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await client.close();
  }
});

app.get("/watchlist", async (req, res, next) => {
  try {
    await client.connect();
    const db = client.db("HW4");
    const coll = db.collection("Watchlist");
    const result = await coll.find().toArray();
    res.json(result);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.delete("/watchlist/:ticker", async (req, res) => {
  try {
    await client.connect();
    const db = client.db("HW4");
    const coll = db.collection("Watchlist");
    const { ticker } = req.params;
    const result = await coll.deleteOne({ ticker: ticker });
    if (result.deletedCount === 0) {
      return res.status(404).send({ message: "Stock not found in watchlist." });
    }
    res.send({ message: "Stock removed from watchlist." });
  } catch (error) {
    res.status(500).send(error);
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

