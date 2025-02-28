const db = require("@models/accounts/request/");

const balanceControllers = {
  getMasterRequest: async (req, res) => {
    try {
      const CACHE_KEY = "balance:request:total";
      const CACHE_EXPIRY = 10;

      const cachedTotalREQ = await redisClient.get(CACHE_KEY);

      if (cachedTotalREQ) {
        return res.status(200).send({
          success: true,
          data: JSON.parse(cachedTotalREQ),
          source: "cached",
        });
      }

      const totalAmount = await db.request.findAll({
        attributes: ["amount"],
      });

      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(totalAmount)
      );

      res.status(200).send({
        success: true,
        data: requestList,
      });
    } catch (err) {
      return res.status(500).send({ success: false, message: err.message });
    }
  },
};

module.exports = { balanceControllers };
