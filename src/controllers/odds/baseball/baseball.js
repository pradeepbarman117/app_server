const { mainOddsServices } = require("../../../services/odds/mainOddsServices");

const baseballControllers = {
    mlb: async(req,res)=>{
        try {
            const response = await mainOddsServices({
                sport: 'baseball_mlb',
                regions: 'us',
                markets: 'h2h',
                oddsFormat: 'decimal'
            });

            return res.status(200).send({
                success: true,
                message: 'Data fetched successfully',
                data: response,
            });

        } catch (err) {
            return res.status(500).send({
                message: 'Internal Error',
                status: 500,
                success: false,
            });
        }
    }
}


module.exports = { baseballControllers }