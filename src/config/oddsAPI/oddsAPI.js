const axios = require('axios');
const apiKey = 'dadea6de5d1b6c1a379132b16111de5b' || process.env.THE_ODDS_API;

const theOddsApi = axios.create({
    baseURL: 'https://api.the-odds-api.com/v4',
    params:{
        apiKey
    }
});

module.exports = { theOddsApi }