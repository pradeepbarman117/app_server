const { theOddsApi } = require("../../config/oddsAPI/oddsAPI");

const mainOddsServices = async ({
    sport = 'americanfootball_ncaaf', // Default to ODI cricket
    regions = 'uk',        // Default region
    markets = 'h2h',      // Default market
    // apiKey = 'dadea6de5d1b6c1a379132b16111de5b', // Your API key
    dateFormat = 'iso',    // Default to ISO format
    oddsFormat = 'decimal', // Default to decimal odds
    eventIds = null,       // Optional event IDs
    bookmakers = null,     // Optional specific bookmakers
    commenceTimeFrom = null, // Optional start time filter
    commenceTimeTo = null,   // Optional end time filter
    includeLinks = 'false',  // Default to not include links
    includeSids = 'false',   // Default to not include source IDs
    includeBetLimits = 'false' // Default to not include bet limits
} = {}) => {
    try { 
        // Build the params object, only including defined values
        const params = {
            regions,
            markets,
            ...(dateFormat && { dateFormat }),
            ...(oddsFormat && { oddsFormat }),
            ...(eventIds && { eventIds }),
            ...(bookmakers && { bookmakers }),
            ...(commenceTimeFrom && { commenceTimeFrom }),
            ...(commenceTimeTo && { commenceTimeTo }),
            ...(includeLinks && { includeLinks }),
            ...(includeSids && { includeSids }),
            ...(includeBetLimits && { includeBetLimits })
        };

        const response = await theOddsApi.get(`sports/${sport}/odds/`, {
            params
        });

        // Return structured response
        return {
            success: true,
            data: response.data,
            request: {
                sport,
                regions,
                markets,
                timestamp: new Date().toISOString()
            }
        };
    } catch (err) {
        console.error(`Error fetching ${sport} odds:`, err);
        return {
            success: false,
            error: err.message,
            details: err.response?.data
        };
    }
};

module.exports = { mainOddsServices };