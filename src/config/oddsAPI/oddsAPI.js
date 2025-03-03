const axios = require('axios');
const apiKey = '03d94a6f58f4f5e68652bc4458305c80' || process.env.THE_ODDS_API;

const theOddsApi = axios.create({
    baseURL: 'https://api.the-odds-api.com/v4',
    params:{
        apiKey
    }
});

module.exports = { theOddsApi }