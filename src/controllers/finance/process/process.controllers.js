const db = require("@models/index");
const { v4: uuidv4 } = require("uuid");
const { redisClient } = require("../../../config/redis");
const { emitMasterRequestUpdated } = require("../../../services/socket/finance/request/masterRequestSocket");
const { emitAdminBalanceUpdate } = require("../../../services/socket/admin/adminSocket");

const processController = {
  masterRequest: async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
      const { requestId, status, comments } = req.body;

      const request = await db.request.findByPk(requestId, { transaction: t });

      if (!request || request.status !== "pending") {
        await t.rollback();
        return res.status(400).send({
          success: false,
          message: "Invalid or already processed request",
        });
      }

      const admin = await db.admin.findByPk(request.receiverId, {
        transaction: t,
      });
      const master = await db.master.findByPk(request.requesterId, {
        transaction: t,
      });

      if (!admin || !master) {
        await t.rollback();
        return res
          .status(404)
          .send({ success: false, message: "Admin or Master not found" });
      }

      if (status === "approved") {
        if (admin.balance <= request.amount) {
          await t.rollback();
          return res
            .status(400)
            .send({ success: false, message: "Insufficient balance" });
        }

        const UUID = uuidv4();

        await db.master.increment("balance", {
          by: request.amount,
          where: { id: master.id },
          transaction: t,
        });
        await db.admin.decrement("balance", {
          by: request.amount,
          where: { id: admin.id },
          transaction: t,
        });

        await db.transaction.create(
          {
            senderId: admin.id,
            receiverId: master.id,
            amount: request.amount,
            status: "completed",
            comments,
            requestId: request.id,
            masterId: master.id,
            adminId: admin.id,
            transactionId: `T-${UUID}`,
          },
          { transaction: t }
        );
      } else {
        const UUID = uuidv4();
        await db.transaction.create(
          {
            senderId: admin.id,
            receiverId: master.id,
            amount: request.amount,
            status: "failed",
            comments,
            requestId: request.id,
            masterId: master.id,
            adminId: admin.id,
            transactionId: `T-${UUID}`,
          },
          { transaction: t }
        );
      }


      const adminUpdatedBalance = admin.balance - request.amount

      const updatedRequest = await request.update({ status }, { transaction: t });
      await t.commit();

      
      await redisClient.del('master:request:list');
      await redisClient.del(`auth:master:request:list:${master.userId}`);
      await redisClient.del(`admin:${admin.id}`);
      await redisClient.del('balance:request:total');
      emitMasterRequestUpdated(master.userId,updatedRequest);
      emitAdminBalanceUpdate(admin.id,adminUpdatedBalance);

      return res.status(200).send({
        success: true,
        message: `Request ${status}`,
        value: status
      });
    } catch (error) {
      await t.rollback();
      return res.status(500).json({ success: false, message: error.message });
    }
  },
  updateMasterRequest: async (req, res) => {
    const t = await db.sequelize.transaction();

    try {
      const { requestId, status, comments } = req.body;

      const request = await db.request.findByPk(requestId, { transaction: t });

      if (!request || request.status !== "approved") {
        await t.rollback();
        return res.status(400).send({ success: false, message: "Invalid" });
      }

      const admin = await db.admin.findByPk(request.receiverId, {
        transaction: t,
      });
      const master = await db.master.findByPk(request.requesterId, {
        transaction: t,
      });

      if (!admin || !master) {
        await t.rollback();
        return res
          .status(404)
          .send({ success: false, message: "Admin or Master not found" });
      }

      if (status === "approved") {
        await db.master.update(
          { balance: master.balance - request.amount },
          { where: { id: master.id }, transaction: t }
        );
      }
    } catch (err) {
      await t.rollback();
      return res.status(500).json({ success: false, message: err.message });
    }
  },
  userRequest: async (req, res) => {
    const t = await db.sequelize.transaction();
    try {
      const { requestId, status, comments } = req.body;

      const request = await db.request.findByPk(requestId, { transaction: t });

      if (!request || request.status !== "pending") {
        await t.rollback();
        return res.status(400).send({
          success: false,
          message: "Invalid or already processed request",
        });
      }

      const master = await db.master.findByPk(request.receiverId, {
        transaction: t,
      });
      const user = await db.master.findByPk(request.userId, {
        transaction: t,
      });

      if (!master || !user) {
        await t.rollback();
        return res
          .status(404)
          .send({ success: false, message: "Master not found Or User" });
      }


      if (status === "approved") {

        const UUID = uuidv4();

        if (master.balance <= request.amount) {
          await t.rollback();
          return res.status(400).send({
            success: false,
            message: "Insufficient balance",
          });
        }

        await db.master.decrement('balance', {
          by: request.amount,
          where: { id: master.id },
          transaction: t
        })

        await db.user.increment('balance', {
          by: request.amount,
          where: { id: user.id },
          transaction: t
        })

        await db.transaction.create({
          senderId: master.id,
          receiverId: user.id,
          amount: request.amount,
          status: "completed",
          comments,
          requestId: request.id,
          userId: user.id,
          masterId: master.id,
          transactionId: `T-${UUID}`,
        }, { transaction: t });

      } else {

        const UUID = uuidv4();

        await db.transaction.create({
          senderId: master.id,
          receiverId: user.id,
          amount: request.amount,
          status: "failed",
          comments,
          requestId: request.id,
          masterId: master.id,
          userId: user.id,
          transactionId: `T-${UUID}`,
        }, { transaction: t });
      }

      await request.update({ status }, { transaction: t });
      await t.commit();

      return res.status(200).send({
        success: true,
        message: `Request ${status}`,
      });

    } catch (err) {
      console.log(err, 'err');
      await t.rollback();
      return res.status(500).json({ success: false, message: err.message });
    }
  },
};

module.exports = { processController };
