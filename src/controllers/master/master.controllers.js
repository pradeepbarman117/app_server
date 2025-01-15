const db = require('@models/index');
const { hashPassword } = require('@helpers/bcrypt');
const roles = require('../../config/roles');
const { emitMasterAdded } = require('../../services/socket/master/masterSocket');

const createMaster = async (req, res) => {
    try {
        const { name, email, password, passcode, adminId, percent } = req.body;


        const isExist = await db.master.findOne({ where: { email } })

        if (isExist) {
            throw new Error('Master Already Exist');
        }

        const [hashedPassword, hashedPasscode] = await Promise.all([hashPassword(password), hashPassword(passcode)]);

        const master = await db.master.create({
            name,
            email,
            password: hashedPassword,
            passcode: hashedPasscode,
            adminId,
            percent
        });

        emitMasterAdded(master); // Emit real-time event for new master

        return res.status(201).json({ message: 'Master created successfully', success: true });
    } catch (err) {
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ message: 'Invalid adminId. Admin does not exist.' });
        }
        if (err.message === 'Master Already Exist') {
            return res.status(400).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
}

const getMasters = async (req, res) => {
    try {
        const adminId = req.user.id;
        const masters = await db.master.findAll({
            include: [
                {
                    model: db.admin,
                    as: 'creator',
                    attributes: ['id', 'name', 'email']
                }
            ],
            attributes:['name','percent','email','adminId','createdAt','id']
        });

        if (!masters.length) {
            throw new Error('No masters found for this admin');
        }

        return res.status(200).json({ message: 'Masters retrieved successfully', data: masters, success: true });
    } catch (err) {
        if (err.message === 'No masters found for this admin') {
            return res.status(404).json({ message: err.message });
        }
        res.status(500).json({ message: err.message });
    }
}




module.exports = { createMaster, getMasters }