const db = require("@models/index");
const { redisClient } = require("../../../config/redis");
const { Op } = require("sequelize");

const balanceControllers = {
  getTotalAmount: async (req, res) => {
    try {
      const CACHE_KEY = "balance:request:total";
      const CACHE_EXPIRY = 300;

      const cachedTotalREQ = await redisClient.get(CACHE_KEY);

      if (cachedTotalREQ) {
        return res.status(200).send({
          success: true,
          data: JSON.parse(cachedTotalREQ),
          source: "cached",
        });
      }

      const totalAmount = await db.request.findAll({
        attributes: ["amount","status"],
        where: {
          masterId: { [Op.ne]: null },
          adminId: { [Op.ne]: null }
        },
      });

      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(totalAmount)
      );

      res.status(200).send({
        success: true,
        data: totalAmount,
      });
    } catch (err) {
      return res.status(500).send({ success: false, message: err.message });
    }
  },
};

module.exports = { balanceControllers };
