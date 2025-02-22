const db = require("@models/index");
const { hashPassword, comparePassword } = require("../../helpers/bcrypt");
const { where } = require("sequelize");
const generateToken = require("../../helpers/generateToken");

const createAdmin = async (req, res) => {
  try {
    const { name, email, password, passcode, designation } = req.body;

    const isExistUser = await db.admin.findOne({ where: { email } });

    if (isExistUser) {
      return res
        .status(400)
        .json({ message: "Admin already exists", success: false });
    }

    const [hashedPassword, hashedPassCode] = await Promise.all([
      hashPassword(password),
      hashPassword(passcode),
    ]);
    console.log(hashedPassword, hashedPassCode);
    const admin = await db.admin.create({
      name,
      email,
      password: hashedPassword,
      designation,
      passcode: hashedPassCode,
    });
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (err) {
    res.status(500).json({ message: err, success: false });
  }
};

// Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password, passcode } = req.body;
    const user = await db.admin.findOne({ where: { email } });

    if (
      !user ||
      !(await comparePassword(password, user.password)) ||
      !(await comparePassword(passcode, user.passcode))
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
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
        designation: "administrator",
        uuid: user.uuid,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ err });
  }
};

// Get Admins
const getAdmins = async (req, res) => {
  try {
    const admins = await db.admin.findAll({
      attributes: ["id", "name", "email"],
      include: [{ model: db.master, as: "masters" }],
    });
    res.status(200).json(admins);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update Balance

const updateAdminBalance = async (req, res) => {
    const { id, amount } = req.body; // 

    const transaction = await db.sequelize.transaction();

    try {
        const adminRecord = await db.admin.findOne({ where: { id }, transaction });

        if (!adminRecord) {
            await transaction.rollback(); 
            return res.status(404).json({ message: 'Admin not found.' });
        }

        const newBalance = parseFloat(adminRecord.balance) + parseFloat(amount);

        if (newBalance < 0) {
            await transaction.rollback(); 
            return res.status(400).json({ message: 'Balance cannot be negative.' });
        }

        await adminRecord.update({ balance: newBalance }, { transaction });

        await transaction.commit();

        return res.status(200).json({ message: 'Balance updated successfully.', newBalance });
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating admin balance:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = { createAdmin, getAdmins, loginAdmin, updateAdminBalance };
