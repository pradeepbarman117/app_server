const { mainOddsServices } = require("../../../../services/odds/mainOddsServices")

const iplController = {
    iplGet : async (req, res)=>{
        try {
            const response = await mainOddsServices({
                sport: 'cricket_ipl',
                regions: 'uk',
                markets: 'h2h',
                oddsFormat: 'decimal'
            });
            
            return res.status(200).send({
                success: true,
                message: 'Data fetched successfully',
                data: response,
            });
        } catch (error) {
            return res.status(500).send({
                message:"internal Error",
                status:500,
                success:false
            })
        }
    }
}

module.exports = {iplController}