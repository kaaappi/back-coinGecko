import express, {Request, Response} from 'express';
import axios from 'axios';
import mongoose from "mongoose"
import cors from 'cors';
import authRouter from "./authRouter.js";
import cache from "memory-cache"
const PORT = 4000;
const app = express();


app.use(cors());
app.use(express.json())
app.use("/auth", authRouter)


const start = async () => {
  try {
    await mongoose.connect(`mongodb+srv://qwerty:12345@cluster0.k3dtkf1.mongodb.net/auth_roles?retryWrites=true&w=majority`)
    app.listen(PORT, () => console.log(`Server Started at PORT ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

export interface PriceState {
  usd: number;
  eur: number;
  uah: number;
  btc: number;
  eth: number;
}

export interface ChangeInCurrency {
  btc: number;
  eth: number;
}

export interface Repos {
  github: string[];
}

export interface SingleCoin {
  small: string;
  usd: bigint;
  current_price: PriceState;
  price_change_percentage_24h: number;
  market_cap_change_percentage_24h_in_currency: ChangeInCurrency;
  market_cap: PriceState;
  total_volume: PriceState;
  fully_diluted_valuation: PriceState;
  total_supply: number;
  circulating_supply: number;
  max_supply: number;
  homepage: string[];
  blockchain_site: string[];
  subreddit_url: string;
  repos_url: Repos;
}

export interface SingleCoinState {
  id: string;
  name: string;
  symbol: string;
  image: SingleCoin;
  market_cap_rank: number;
  market_data: SingleCoin;
  links: SingleCoin;
  categories: string[];
}

interface CoinListData {
  id: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  ath_change_percentage: number;
  onClick: (coin: string) => void;
  name: string;
  symbol: string;
  nums_of_coins: number;
  total_volume: number;
}

const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    let key = '__express__' + req.originalUrl || req.url;
    let cachedBody = cache.get(key);
    if (cachedBody) {
      res.send(JSON.parse(cachedBody));
      return;
    } else {
      res.sendResponse = res.send;
      res.send = (body) => {
        cache.put(key, body, duration * 1000);
        res.sendResponse(body);
      };
      next();
    }
  };
};


app.get('/getCoinData/:coin_id', cacheMiddleware(30),async (req: Request, res: Response) => {
  const {coin_id} = req.params;
  try {
    const response = await axios.get<SingleCoinState>(`https://api.coingecko.com/api/v3/coins/${coin_id}?tickers=true&market_data=true`);
    const coinData = response.data;
    console.log(response.data)
    const filteredDataForSingleCoin = {
      id: coinData.id,
      name: coinData.name,
      symbol: coinData.symbol,
      image: coinData.image.small,
      market_cap_rank: coinData.market_cap_rank,
      price_in_usd: coinData.market_data.current_price.usd,
      price_in_btc: coinData.market_data.current_price.btc,
      links_homepage: coinData.links.homepage,
      categories: coinData.categories,
      price_change_percentage_24h: coinData.market_data.price_change_percentage_24h,
      market_cap_change_percentage_24h_in_btc: coinData.market_data.market_cap_change_percentage_24h_in_currency.btc,
      market_cap_change_percentage_24h_in_eth: coinData.market_data.market_cap_change_percentage_24h_in_currency.eth,
      market_cap_in_usd: coinData.market_data.market_cap.usd,
      total_volume_in_usd: coinData.market_data.total_volume.usd,
      fully_diluted_valuation_in_usd: coinData.market_data.fully_diluted_valuation.usd,
      total_supply: coinData.market_data.total_supply,
      circulating_supply: coinData.market_data.circulating_supply,
      max_supply: coinData.market_data.max_supply,
      blockchain_site: coinData.links.blockchain_site,
      subreddit_url: coinData.links.subreddit_url,
      repos_url_github: coinData.links.repos_url.github
    };
    res.json(filteredDataForSingleCoin);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to fetch data for coin'});
  }
});

app.get('/getCoinsList/:limit_per_page/:num_of_page',  cacheMiddleware(30),async (req: Request, res: Response) => {
  const {limit_per_page, num_of_page} = req.params;
  try {
    const response = await axios.get<CoinListData[]>(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit_per_page}&page=${num_of_page}&sparkline=false&locale=en`
    );

    const coinsList = response.data;
    const filteredDataForCoinsList = coinsList.map((coin) => ({
      id: coin.id,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      ath_change_percentage: coin.ath_change_percentage,
      name: coin.name,
      symbol: coin.symbol,
      total_volume: coin.total_volume,
    }))
    res.json(filteredDataForCoinsList);
  } catch (error) {
    if (error.response?.error_code === 429) {
      res.status(429).json({error: `${error.response.error_message}`});
    }
    else {

      res.status(500).json({error: `Failed to fetch data for coins list: ${error.response?.statusText}`});
    }

  }
});

app.get('/getChartForCoin/:coin_id/:days', cacheMiddleware(30), async (req: Request, res: Response) => {
  const {coin_id, days} = req.params;
  try {
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin_id}/market_chart?vs_currency=usd&days=${days}`);
    const dataForChart = response.data;
    res.json(dataForChart);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: 'Failed to fetch data for chart'});
  }
});

start();