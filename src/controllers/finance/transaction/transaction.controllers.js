const db = require("@models/index");
const { Op } = require("sequelize");
const { redisClient } = require("../../../config/redis");

const transactionControllers = {
  //////////////////////////// ADMIN CONTROLLERS //////////////////////////////
  getTransactionForAdmin: async (req, res) => {
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

      const CACHE_KEY = `transactions:list:page:${page}:limit:${limit}:transactionId:${
        transactionId || "all"
      }`;
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
      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(responseData)
      );

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
  getTransactionForMasterByAdmin: async (req, res) => {
    try {
      const { masterId } = req.query; // Get masterId from URL params (e.g., /transactions/master/:masterId)
      
      if(!masterId){
        return res.status(400).send({
          success: false,
          message: "Invalid masterId",
        });
      }
      

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Additional query parameters for filtering
      const { transactionId, status } = req.query;

      // Build where clause
      const whereClause = {
        masterId: masterId, // Filter by specific master ID
        adminId: { [Op.ne]: null }, // Only transactions created by admin
      };

      if (transactionId) {
        whereClause.transactionId = { [Op.like]: `%${transactionId}%` };
      }
      if (status) {
        whereClause.status = status;
      }

      const CACHE_KEY = `admin:master:${masterId}:transactions:page:${page}:limit:${limit}:tid:${
        transactionId || "all"
      }:status:${status || "all"}`;
      const CACHE_EXPIRY = 30;

      // Check Redis cache
      const cachedTransactions = await redisClient.get(CACHE_KEY);
      if (cachedTransactions) {
        const cachedData = JSON.parse(cachedTransactions);
        return res.status(200).send({
          success: true,
          message: `Retrieved Transactions for Master ${masterId} from cache`,
          data: cachedData.data,
          pagination: cachedData.pagination,
          source: "cache",
        });
      }

      // Verify master exists (optional, assuming you have a masters table)
      const masterExists = await db.master.findByPk(masterId);
      if (!masterExists) {
        return res.status(404).send({
          success: false,
          message: "Master not found",
        });
      }

      // Get total count
      const totalItems = await db.transaction.count({
        where: whereClause,
      });

      // Fetch transactions
      const transactions = await db.transaction.findAll({
        where: whereClause,
        limit: limit,
        offset: offset,
        attributes: { exclude: ["updatedAt","userId"] }, // Exclude masterId from response
        // include: [
        //   {
        //     model: db.user,
        //     attributes: ["id", "username", "email"],
        //     as: "user", // Assuming user association exists
        //   },
        //   {
        //     model: db.master,
        //     attributes: ["id", "name"], // Assuming master association exists
        //     as: "master",
        //   },
        // ],
        order: [["createdAt", "DESC"]],
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
      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(responseData)
      );

      return res.status(200).send({
        success: true,
        message: `Retrieved Transactions for Master ${masterId}`,
        ...responseData,
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
  //////////////////////////// MASTER CONTROLLERS //////////////////////////////
  getTransactionForMasterByMaster: async (req, res) => {
    try {
      const masterId  = req.user.id; // Get masterId from URL params (e.g., /transactions/master/:masterId)
      
      if(!masterId){
        return res.status(400).send({
          success: false,
          message: "Invalid masterId",
        });
      }
      

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Additional query parameters for filtering
      const { transactionId, status } = req.query;

      // Build where clause
      const whereClause = {
        masterId: masterId, // Filter by specific master ID
        adminId: { [Op.ne]: null }, // Only transactions created by admin
      };

      if (transactionId) {
        whereClause.transactionId = { [Op.like]: `%${transactionId}%` };
      }
      if (status) {
        whereClause.status = status;
      }

      const CACHE_KEY = `master:${masterId}:transactions:page:${page}:limit:${limit}:tid:${
        transactionId || "all"
      }:status:${status || "all"}`;
      const CACHE_EXPIRY = 30;

      // Check Redis cache
      const cachedTransactions = await redisClient.get(CACHE_KEY);
      if (cachedTransactions) {
        const cachedData = JSON.parse(cachedTransactions);
        return res.status(200).send({
          success: true,
          data: cachedData.data,
          pagination: cachedData.pagination,
          source: "cache",
        });
      }

      // Verify master exists (optional, assuming you have a masters table)
      const masterExists = await db.master.findByPk(masterId);
      if (!masterExists) {
        return res.status(404).send({
          success: false,
          message: "Master not found",
        });
      }

      // Get total count
      const totalItems = await db.transaction.count({
        where: whereClause,
      });

      // Fetch transactions
      const transactions = await db.transaction.findAll({
        where: whereClause,
        limit: limit,
        offset: offset,
        attributes: { exclude: ["updatedAt","userId"] }, // Exclude masterId from response
        order: [["createdAt", "DESC"]],
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
      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(responseData)
      );

      return res.status(200).send({
        success: true,
        message: `Retrieved Transactions for Master ${masterId}`,
        ...responseData,
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
  //////////////////////////// USER CONTROLLERS //////////////////////////////
};

module.exports = { transactionControllers };
