var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import axios from 'axios';
import mongoose from "mongoose";
import cors from 'cors';
import authRouter from "./authRouter.js";
const PORT = 4000;
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRouter);
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose.connect(`mongodb+srv://qwerty:12345@cluster0.k3dtkf1.mongodb.net/auth_roles?retryWrites=true&w=majority`);
        app.listen(PORT, () => console.log(`Server Started at PORT ${PORT}`));
    }
    catch (e) {
        console.log(e);
    }
});
app.get('/getCoinData/:coin_id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coin_id } = req.params;
    try {
        const response = yield axios.get(`https://api.coingecko.com/api/v3/coins/${coin_id}?tickers=true&market_data=true`);
        const coinData = response.data;
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data for coin' });
    }
}));
app.get('/getCoinsList/:limit_per_page/:num_of_page', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { limit_per_page, num_of_page } = req.params;
    try {
        const response = yield axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit_per_page}&page=${num_of_page}&sparkline=false&locale=en`);
        console.log(response);
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
        }));
        res.json(filteredDataForCoinsList);
    }
    catch (error) {
        if (((_a = error.response) === null || _a === void 0 ? void 0 : _a.error_code) === 429) {
            res.status(429).json({ error: `${error.response.error_message}` });
        }
        else {
            res.status(500).json({ error: `Failed to fetch data for coins list: ${(_b = error.response) === null || _b === void 0 ? void 0 : _b.statusText}` });
        }
    }
}));
app.get('/getChartForCoin/:coin_id/:days', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { coin_id, days } = req.params;
    try {
        const response = yield axios.get(`https://api.coingecko.com/api/v3/coins/${coin_id}/market_chart?vs_currency=usd&days=${days}`);
        const dataForChart = response.data;
        res.json(dataForChart);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data for chart' });
    }
}));
start();
//# sourceMappingURL=index.js.map