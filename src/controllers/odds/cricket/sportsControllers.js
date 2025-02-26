const { redisClient } = require('../../../config/redis');
const { getAllSports } = require('../../../services/odds/allSports/sportServices');


const sportControllers = async (req, res) => {
    try {

        const CACHE_KEY = 'sports:list';
        const CACHE_EXPIRY = 60 * 60 * 24 * 1


        const cachedSports = await redisClient.get(CACHE_KEY);

        if (cachedSports) {
            return res.json({
                sports: JSON.parse(cachedSports),
                source: "cache",
            });
        }

        const sports = await getAllSports();


        await redisClient.setEx(
            CACHE_KEY,
            CACHE_EXPIRY,
            JSON.stringify(sports)
        )

        return res.status(200).send({
            message: 'Sports retrieved successfully',
            sports,
            source: 'databse',
        });

    } catch (err) {
        console.log(err, 'err while fetch sports in controllers');
    }
}

module.exports = { sportControllers }