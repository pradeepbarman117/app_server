const { footballServices } = require("../../../services/odds/football/footballServices");

const footballControllers = {
    nacaaf: async(req,res)=>{
        try {
            const response = await footballServices({
                sport: 'americanfootball_ncaaf',
                regions: 'uk',
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


module.exports = { footballControllers }