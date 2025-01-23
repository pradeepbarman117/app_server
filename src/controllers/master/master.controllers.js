const db = require('@models/index');
const { hashPassword, comparePassword } = require('@helpers/bcrypt');
const generateToken = require('../../helpers/generateToken');
const { emitMasterAdded } = require('../../services/socket/master/masterSocket');

// Helper for uniform error response
const handleError = (res, error, statusCode = 500) => {
    const message = error.message || 'An error occurred';
    res.status(statusCode).json({ message, success: false });
};

const createMaster = async (req, res) => {
    try {
        const { name, email, password, passcode, percent } = req.body;
        const adminId = req.user.id;

        if (!adminId) return res.status(401).json({ message: 'Unauthorized', success: false });

        const existingMaster = await db.master.findOne({ where: { email } });
        if (existingMaster) return res.status(400).json({ message: 'Master already exists', success: false });

        // Hash password and passcode in parallel
        const [hashedPassword, hashedPasscode] = await Promise.all([
            hashPassword(password),
            hashPassword(passcode),
        ]);

        const master = await db.master.create({
            name,
            email,
            password: hashedPassword,
            passcode: hashedPasscode,
            adminId,
            percent,
        });

        // Fetch created master with admin details
        const masterWithAdmin = await db.master.findOne({
            where: { id: master.id },
            include: [
                { model: db.admin, as: 'admin', attributes: ['id', 'name', 'email'] },
            ],
            attributes: ['name', 'percent', 'email', 'adminId', 'createdAt', 'id'],
        });

        emitMasterAdded(masterWithAdmin); // Real-time notification

        res.status(201).json({
            message: 'Master created successfully',
            data: masterWithAdmin,
            success: true,
        });
    } catch (err) {
        if (err.name === 'SequelizeForeignKeyConstraintError') {
            return handleError(res, new Error('Invalid adminId. Admin does not exist.'), 400);
        }
        handleError(res, err);
    }
};

const getMasters = async (req, res) => {
    try {
        const masters = await db.master.findAll({
            include: [
                { model: db.admin, as: 'admin', attributes: ['id', 'name', 'email'] },
            ],
            attributes: ['name', 'percent', 'email', 'adminId', 'createdAt', 'id'],
        });
        console.log('masters called')

        if (!masters.length) return res.status(404).json({ message: 'No masters found', success: false });

        res.status(200).json({
            message: 'Masters retrieved successfully',
            data: masters,
            success: true,
        });
    } catch (err) {
        handleError(res, err);
    }
};

const masterLogin = async (req, res) => {
    try {
        const { email, password, passcode } = req.body;

        if (!email || !password || !passcode) {
            return res.status(400).json({ message: 'All fields are required', success: false });
        }

        const user = await db.master.findOne({ where: { email } });
        if (!user) return res.status(401).json({ message: 'Invalid credentials', success: false });

        const isPasswordValid = await comparePassword(password, user.password);
        const isPasscodeValid = await comparePassword(passcode, user.passcode);

        if (!isPasswordValid || !isPasscodeValid) {
            return res.status(401).json({ message: 'Invalid credentials', success: false });
        }

        const token = await generateToken({
            userId: user.id,
            uuid: user.uuid,
            designation: user.designation,
        });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                designation: 'master',
                uuid: user.uuid,
            },
            success: true,
        });
    } catch (err) {
        handleError(res, err);
    }
};

module.exports = { createMaster, getMasters, masterLogin };
