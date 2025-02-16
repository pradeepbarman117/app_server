const axios = require('axios');
const apiKey = process.env.THE_ODDS_API;

const theOddsApi = axios.create({
    baseURL: 'https://api.the-odds-api.com/v4',
    params:{
        apiKey
    }
});

module.exports = { theOddsApi }