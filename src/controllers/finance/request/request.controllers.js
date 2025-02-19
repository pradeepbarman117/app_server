const db = require('@models/index');
const { v4: uuidv4 } = require('uuid');

const requestController = {
    masterRequestCoins: async (req, res) => {
        const t = await db.sequelize.transaction();

        const masterId = req.user?.id
        const { amount } = req.body

        try {
            const master = await db.master.findByPk(masterId, {
                attributes: [],
                transaction: t,
                include: [
                    {
                        model: db.admin,
                        as: 'admin',
                        attributes: ['id'],
                    }
                ]
            });

            const adminId = master.admin?.id

            if (!master) throw new Error('Master not found');

            const UUID = uuidv4()

            await db.request.create({
                requesterId: masterId,
                receiverId: adminId,
                requestId: `REQ-${UUID}`,
                amount: amount,
                status: 'pending',
            }, { transaction: t });

            await t.commit();
            return res.status(200).send({ master, success: true, message: 'Request sent to admin' });
        } catch (error) {
            await t.rollback();
            return res.status(500).send({ success: false, message: error.message });
        }
    },
    userRequestCoins: async (req, res) => {
        const t = await db.sequelize.transaction();

        const userId = req.user?.id
        const { amount } = req.body

        try {
            const user = await db.user.findByPk(userId, { 
                transaction: t,
                include:[
                    {
                        model: db.master,
                        as: 'master',
                        attributes: ['id'],
                    }
                ]
            });
            if (!user) throw new Error('User not found');

            const masterId = user.master?.id
            const UUID = uuidv4()

            await db.request.create({
                requesterId: userId,
                receiverId: masterId,
                requestId: `REQ-${UUID}`,
                amount,
                status: 'pending'
            }, { transaction: t });

            await t.commit();
            return res.status(200).send({success: true, message: 'Request sent to master' });
        } catch (error) {
            await t.rollback();
            return res.status(500).send({ success: false, message: error.message });
        }
    },
    getMasterRequest: async (req, res) => {
        try {
            const requests = await Request.findAll({
                where: {
                    receiverId: masterId
                },
            })
        } catch (err) {
            return res.status(500).send({ success: false, message: err.message });
        }
    }
}

module.exports = { requestController }