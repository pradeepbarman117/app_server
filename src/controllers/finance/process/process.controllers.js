const db = require("@models/index");
const { v4: uuidv4 } = require("uuid");

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

        const updatedMaster = await db.master.increment("balance", {
          by: request.amount,
          where: { id: master.id },
          transaction: t,
        });
        const updatedAdmin = await db.admin.decrement("balance", {
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
            transactionId: `T-${UUID}`,
          },
          { transaction: t }
        );
      }

      await request.update({ status }, { transaction: t });
      await t.commit();

      return res.status(200).send({
        success: true,
        message: `Request ${status}`,
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
  },
};

module.exports = { processController };
