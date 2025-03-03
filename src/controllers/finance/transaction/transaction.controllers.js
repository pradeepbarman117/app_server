const db = require('@models/index');
const { Op } = require("sequelize");
const { redisClient } = require('../../../config/redis');

const transactionControllers = {
  getTransaction: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
      const offset = (page - 1) * limit;

      // Extract search parameter (assuming transactionId for search)
      const { transactionId } = req.query;

      // Build where clause
      const whereClause = {};
      if (transactionId) {
        whereClause.transactionId = { [Op.like]: `%${transactionId}%` }; // Partial match for transactionId
      }

      const CACHE_KEY = `transactions:list:page:${page}:limit:${limit}:transactionId:${transactionId || "all"}`;
      const CACHE_EXPIRY = 30;

      // Check Redis cache
      const cachedTransactions = await redisClient.get(CACHE_KEY);

      if (cachedTransactions) {
        const cachedData = JSON.parse(cachedTransactions);
        const flattenedData = cachedData.data ? cachedData.data : cachedData;

        return res.status(200).send({
          success: true,
          message: "Retrieved All Transactions from cache",
          data: flattenedData,
          pagination: cachedData.pagination,
          source: "cache",
        });
      }

      // Get total count for pagination
      const totalItems = await db.transaction.count({
        where: whereClause,
      });

      // Fetch transactions with pagination and search
      const transactions = await db.transaction.findAll({
        where: whereClause,
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]], // Sort by creation date (adjust field if needed)
      });

      const totalPages = Math.ceil(totalItems / limit);

      const responseData = {
        data: transactions,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
        },
      };

      // Cache the result
      await redisClient.setEx(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(responseData));

      return res.status(200).send({
        success: true,
        message: "Retrieved All Transactions",
        data: transactions,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
        },
        source: "database",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).send({
        success: false,
        message: "Internal Server Error",
      });
    }
  },
};

module.exports = { transactionControllers };