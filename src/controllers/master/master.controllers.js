const db = require('@models/index');
const { hashPassword } = require('@helpers/bcrypt');
const roles = require('../../config/roles');
const { emitMasterAdded } = require('../../services/socket/master/masterSocket');
const { comparePassword } = require('../../helpers/bcrypt');
const generateToken = require('../../helpers/generateToken');

const createMaster = async (req, res) => {
    try {
        const { name, email, password, passcode, percent } = req.body;
        const adminId = req.user.id
        if (!adminId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
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
        const masters = await db.master.findAll({
            include: [
                {
                    model: db.admin,
                    as: 'admin',
                    attributes: ['id', 'name', 'email']
                }
            ],
            attributes: ['name', 'percent', 'email', 'adminId', 'createdAt', 'id']
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


// Login
const masterLogin = async (req, res) => {
    try {
        const { email, password, passcode } = req.body;
        console.log(req.body, 'req.body')
        const user = await db.master.findOne({ where: { email } });

        if (!user || !(await comparePassword(password, user.password)) || !(await comparePassword(passcode, user.passcode))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = await generateToken({
            userId: user.id,
            uuid: user.uuid,
            designation: user.designation,
        });
        res.status(200).json({
            token,
            user: {
                id: user.id,
                name: user.name,
                designation: 'master',
                uuid: user.uuid,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err });
    }
};



module.exports = { createMaster, getMasters, masterLogin }