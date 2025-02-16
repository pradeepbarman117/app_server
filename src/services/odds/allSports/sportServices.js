const { theOddsApi } = require("../../../config/oddsAPI/oddsAPI");

const getAllSports = async () => {
    try {
        const response = await theOddsApi.get('/sports');
        return response.data
    } catch (err) {
        console.log(err, 'error while fetch all sports');
    }
};

module.exports = { getAllSports }