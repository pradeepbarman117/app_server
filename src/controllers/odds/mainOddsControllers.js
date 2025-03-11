const { mainOddsServices } = require('../../services/odds/mainOddsServices');
const { redisClient } = require('../../config/redis');
const { getAllSports } = require('../../services/odds/allSports/sportServices');

const mainOddsControllers = {
    // Fetch odds for a specific sport
    getOddsForSport: async (req, res) => {
        const { sport } = req.params; // Get sport from URL parameter

        if (!sport) {
            return res.status(400).send({
                success: false,
                message: 'Sport parameter is required',
            });
        }

        try {
            const CACHE_KEY = `odds:${sport}`;
            const CACHE_EXPIRY = 60 * 60; // Cache for 1 hour

            // Check if odds are cached
            const cachedOdds = await redisClient.get(CACHE_KEY);
            if (cachedOdds) {
                return res.status(200).send({
                    success: true,
                    message: `Odds for ${sport} retrieved successfully from cache`,
                    data: JSON.parse(cachedOdds),
                    source: 'cache',
                });
            }

            // Fetch odds using mainOddsServices
            const response = await mainOddsServices({
                sport,
                regions: 'uk',
                markets: 'h2h',
                oddsFormat: 'decimal',
            });

            if (!response.success) {
                return res.status(500).send({
                    success: false,
                    message: `Failed to fetch odds for ${sport}`,
                    error: response.error,
                });
            }

            // Cache the odds data
            await redisClient.setEx(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(response));

            return res.status(200).send({
                success: true,
                message: `Odds for ${sport} retrieved successfully`,
                data: response,
                source: 'api',
            });
        } catch (error) {
            console.error(`Error fetching odds for ${sport}:`, error);
            return res.status(500).send({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    },

    // Fetch odds for all sports dynamically
    getOddsForAllSports: async (req, res) => {
        try {
            // Fetch the list of sports
            const sportsList = await getAllSports();

            if (!sportsList || sportsList.length === 0) {
                return res.status(404).send({
                    success: false,
                    message: 'No sports found',
                });
            }

            const CACHE_KEY_ALL_ODDS = 'odds:all';
            const CACHE_EXPIRY = 30; // Cache for 1 hour

            // Check if odds for all sports are cached
            const cachedAllOdds = await redisClient.get(CACHE_KEY_ALL_ODDS);
            if (cachedAllOdds) {
                return res.status(200).send({
                    success: true,
                    message: 'Odds for all sports retrieved successfully from cache',
                    data: JSON.parse(cachedAllOdds),
                    source: 'cache',
                });
            }

            // Fetch odds for each sport dynamically
            const oddsPromises = sportsList.map(async (sport) => {
                const sportKey = sport.key; // Assuming the sport object has a 'key' field
                const CACHE_KEY = `odds:${sportKey}`;

                // Check if odds for this sport are cached
                const cachedOdds = await redisClient.get(CACHE_KEY);
                if (cachedOdds) {
                    return { sport: sportKey, data: JSON.parse(cachedOdds), source: 'cache' };
                }

                // Fetch odds for this sport
                const response = await mainOddsServices({
                    sport: sportKey,
                    regions: 'uk',
                    markets: 'h2h',
                    oddsFormat: 'decimal',
                });

                if (response.success) {
                    // Cache the odds for this sport
                    await redisClient.setEx(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(response));
                    return { sport: sportKey, data: response, source: 'api' };
                } else {
                    return { sport: sportKey, error: response.error, success: false };
                }
            });

            // Wait for all odds to be fetched
            const oddsResults = await Promise.all(oddsPromises);

            // Cache the entire response
            await redisClient.setEx(CACHE_KEY_ALL_ODDS, CACHE_EXPIRY, JSON.stringify(oddsResults));

            return res.status(200).send({
                success: true,
                message: 'Odds for all sports retrieved successfully',
                data: oddsResults,
                source: 'api',
            });
        } catch (error) {
            console.error('Error fetching odds for all sports:', error);
            return res.status(500).send({
                success: false,
                message: 'Internal server error',
                error: error.message,
            });
        }
    },
};

module.exports = { mainOddsControllers };