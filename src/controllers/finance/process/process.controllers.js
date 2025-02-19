const db = require('@models/index');
const { v4: uuidv4 } = require('uuid');


const processController = {
    masterRequest: async (req, res) => {
        const t = await db.sequelize.transaction();

        try {
            const { requestId, status } = req.body

            const request = await db.request.findByPk(requestId, { transaction: t });

            if (!request || request.status !== 'pending') {
                await t.rollback();
                return res.status(400).send({ success: false, message: 'Invalid or already processed request' });
            }


            const admin = await db.admin.findByPk(request.receiverId, { transaction: t });
            const master = await db.master.findByPk(request.requesterId, { transaction: t });

            if (!admin || !master) {
                await t.rollback();
                return res.status(404).send({ success: false, message: 'Admin or Master not found' });
            }


            if (status === 'approved'){
                const UUID = uuidv4();
                
                await db.master.update({ coin: master.coin + request.amount }, { where: { id: master.id }, transaction: t });
                await db.transaction.create({
                    senderId: admin.id, 
                    receiverId: master.id, 
                    amount: request.amount, 
                    status: 'completed',
                    transactionId:`T-${UUID}`, 
                }, { transaction: t });
            }else {
                const UUID = uuidv4();
                await db.transaction.create({
                    senderId: admin.id, 
                    receiverId: master.id, 
                    amount: request.amount, 
                    status: 'failed',
                    transactionId:`T-${UUID}`,  
                }, { transaction: t });
            }

            await request.update({ status }, { transaction: t });
            await t.commit();

            return res.status(200).send({ success: true, message: `Request ${status}` });

        } catch (error) {
            await t.rollback();
            return res.status(500).json({ success: false, message: error.message });
        }
    },
    userRequest: async (req, res) => {
        const t = await db.sequelize.transaction();
    },
}

module.exports = { processController }