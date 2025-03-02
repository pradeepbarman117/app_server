const db = require("@models/index");
const { Op, where } = require("sequelize");
const { v4: uuidv4 } = require("uuid");
const {
  emitMasterRequestAdded,
} = require("../../../services/socket/finance/request/masterRequestSocket");
const { redisClient } = require("../../../config/redis");

const requestController = {
  // Master Requesting Balance to Admin
  masterRequestBalance: async (req, res) => {
    const t = await db.sequelize.transaction();

    const masterId = req.user?.id;
    const { amount } = req.body;

    try {
      const master = await db.master.findByPk(masterId, {
        attributes: [],
        transaction: t,
        include: [
          {
            model: db.admin,
            as: "admin",
            attributes: ["id"],
          },
        ],
      });

      const adminId = master.admin?.id;

      if (!master) throw new Error("Master not found");

      const UUID = uuidv4();

      const request = await db.request.create(
        {
          requesterId: masterId,
          receiverId: adminId,
          requestId: `REQ-${UUID}`,
          amount: amount,
          status: "pending",
          masterId: masterId,
          adminId: adminId,
        },
        { transaction: t }
      );

      const requestListWithMaster = await db.request.findOne({
        attributes: ["id", "requestId", "status", "amount", "createdAt"],
        where: {
          id: request.id,
          masterId: { [Op.ne]: null },
          adminId: { [Op.ne]: null },
        },
        include: [
          {
            model: db.master,
            as: "masterList",
            attributes: ["id", "userId", "balance"],
          },
        ],
        transaction: t,
      });

      await redisClient.del("master:request:list");
      await redisClient.del("balance:request:total");
      // await redisClient.del(`auth:master:request:list:${master.id}`);
      emitMasterRequestAdded(requestListWithMaster);

      await t.commit();

      return res
        .status(200)
        .send({ master, success: true, message: "Request sent to admin" });
    } catch (error) {
      await t.rollback();
      return res.status(500).send({ success: false, message: error.message });
    }
  },
  // User Requesting Balance to Admin
  userRequestBalance: async (req, res) => {
    const t = await db.sequelize.transaction();

    const userId = req.user?.id;
    const { amount } = req.body;

    try {
      const user = await db.user.findByPk(userId, {
        transaction: t,
        include: [
          {
            model: db.master,
            as: "master",
            attributes: ["id"],
          },
        ],
      });
      if (!user) throw new Error("User not found");

      const masterId = user.master?.id;
      const UUID = uuidv4();

      await db.request.create(
        {
          requesterId: userId,
          receiverId: masterId,
          requestId: `REQ-${UUID}`,
          userId: userId,
          masterId: masterId,
          amount,
          status: "pending",
        },
        { transaction: t }
      );

      await t.commit();
      return res
        .status(200)
        .send({ success: true, message: "Request sent to master" });
    } catch (error) {
      await t.rollback();
      return res.status(500).send({ success: false, message: error.message });
    }
  },
  // Getting Master Request Details with Pagination
  getMasterRequest: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1; // Default to page 1
      const limit = parseInt(req.query.limit) || 10; // Default to 10 items per page
      const offset = (page - 1) * limit;

      const CACHE_KEY = `master:request:list:page:${page}:limit:${limit}`;
      const CACHE_EXPIRY = 30;

      const cachedMasterREQ = await redisClient.get(CACHE_KEY);

      if (cachedMasterREQ) {
        const cachedData = JSON.parse(cachedMasterREQ);
        const flattenedData = cachedData.data ? cachedData.data : cachedData;
        
        return res.status(200).send({
          success: true,
          data: flattenedData, // Ensuring data is in correct format
          pagination: cachedData.pagination,
          source: "cached",
        });
      }

      // Get total count for pagination
      const totalItems = await db.request.count({
        where: {
          masterId: { [Op.ne]: null },
          adminId: { [Op.ne]: null },
        },
      });

      const requestList = await db.request.findAll({
        attributes: ["id", "requestId", "status", "amount", "createdAt"],
        where: {
          masterId: { [Op.ne]: null },
          adminId: { [Op.ne]: null },
        },
        include: [
          {
            model: db.master,
            as: "masterList",
            attributes: ["id", "userId", "balance"],
          },
        ],
        limit: limit,
        offset: offset,
        order: [["createdAt", "DESC"]], // Optional: sort by creation date
      });

      const totalPages = Math.ceil(totalItems / limit);

      let requestListForRedis = {
        data: requestList,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
        },
      };

      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(requestListForRedis)
      );

      res.status(200).send({
        success: true,
        data: requestList,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
        },
      });
    } catch (err) {
      return res.status(500).send({
        success: false,
        message: err.message,
      });
    }
  },
  getMasterREQById: async (req, res) => {
    try {
      const { id } = req.params;

      const CACHE_KEY = `master:request:list:${id}`;
      const CACHE_EXPIRY = 30;

      const cachedMasterREQ = await redisClient.get(CACHE_KEY);

      if (cachedMasterREQ) {
        return res.status(200).send({
          success: true,
          data: JSON.parse(cachedMasterREQ),
          source: "cached",
        });
      }

      const requestList = await db.request.findAll({
        where: {
          masterId: id,
          adminId: { [Op.ne]: null },
        },
        include: [
          {
            model: db.master, // Admin details
            as: "masterList",
            attributes: ["id", "userId", "balance"],
          },
        ],
      });

      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(requestList)
      );

      return res.status(200).send({
        success: true,
        data: requestList,
      });
    } catch (err) {
      return res.status(500).send({ success: false, message: err.message });
    }
  },
  getAuthMasterREQ: async (req, res) => {
    try {
      const masterId = req.user?.id;

      const CACHE_KEY = `auth:master:request:list:${masterId}`;
      const CACHE_EXPIRY = 30;

      const cachedMasterREQ = await redisClient.get(CACHE_KEY);

      if (cachedMasterREQ) {
        return res.status(200).send({
          success: true,
          data: JSON.parse(cachedMasterREQ),
          source: "cached",
        });
      }

      const requestList = await db.request.findAll({
        where: {
          masterId,
          adminId: { [Op.ne]: null },
        },
        include: [
          {
            model: db.master, // Admin details
            as: "masterList",
            attributes: ["id", "userId", "balance"],
          },
        ],
      });

      await redisClient.setEx(
        CACHE_KEY,
        CACHE_EXPIRY,
        JSON.stringify(requestList)
      );

      return res.status(200).send({
        success: true,
        data: requestList,
      });
    } catch (err) {
      return res.status(500).send({ success: false, message: err.message });
    }
  },
  // Getting User Request Details
};

module.exports = { requestController };
