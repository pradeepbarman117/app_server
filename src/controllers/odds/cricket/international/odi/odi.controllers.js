const { cricketOdiServices } = require("../../../../../services/odds/cricket/international/odi/cricketOdiService");

const odiControllers = {
    champ_trophy: async(req,res)=>{
        try {
            const response = await cricketOdiServices({
                sport: 'cricket_icc_trophy',
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


module.exports = { odiControllers }