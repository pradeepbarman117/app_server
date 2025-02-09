const db = require("@models/index");
const roles = require("../../config/roles");
const { hashPassword } = require("@helpers/bcrypt");
const { redisClient } = require("../../config/redis");
const { emitUserAdded } = require("../../services/socket/user/userSocket");

const createUser = async (req, res) => {
  try {
    const { userId, password, passcode } = req.body;
    const request_id = req.user.id;
    // Set only one of the foreign keys
    const masterId = req.user.designation === roles.MASTER ? request_id : null;
    const adminId = req.user.designation !== roles.MASTER ? request_id : null;

    const [hashedPassword, hashedPasscode] = await Promise.all([
      hashPassword(password),
      hashPassword(passcode),
    ]);

    const user = await db.user.create({
      userId: userId,
      password: hashedPassword,
      passcode: hashedPasscode,
      masterId,
      adminId,
    });

    // Fetch created master with admin details
    const userWithMaster = await db.user.findOne({
      where: { id: user.id },
      include: [
        { model: db.master, as: "master", attributes: ["id", "name","uuid"] },
      ],
      attributes: ["name", "percent", "status", "coin", "adminId", "createdAt", "id","userId"],
    });

    // emitUserAdded(userWithMaster);

    res.status(201).send({
      message: "User created successfully",
      user:userWithMaster,
      success: true,
    });
  } catch (err) {
    // console.error(err);
    res.status(500).send({ message: err.message });
  }
};

const getUser = async (req, res) => {
  try {


    const CACHE_KEY = 'users:list';
    const CACHE_EXPIRY = 300;

    // Check Redis cache
    const cachedUsers = await redisClient.get(CACHE_KEY);

    if (cachedUsers) {
      return res.json({
        data: JSON.parse(cachedUsers),
        source: "cache",
      });
    }

    // If no cache, fetch from database
    const users = await db.user.findAll({
      attributes: ["id", "uuid", "coin", "status", "createdAt"],
      include: [
        {
          model: db.admin,
          as: "admin",
          attributes: ["id", "uuid", "name"],
        },
        {
          model: db.master,
          as: "master",
          attributes: ["id", "uuid", "name"],
        },
      ],
    });

    await redisClient.setEx(
      CACHE_KEY,
      CACHE_EXPIRY,
      JSON.stringify(users)
    )

    return res.status(200).send({
      message: "Users retrieved successfully",
      users,
      source:'database'
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const getMasterUser = async (req, res) => {
  try {
    
    const { id } = req.params;
    // Check if the ID is provided
    if (!id) {
      return res.status(400).send({ message: "ID is required" });
    }

    const CACHE_KEY = `master:user:${id}`;
    const CACHE_EXPIRY = 300;

    const cachedUsers = await redisClient.get(CACHE_KEY);
    if (cachedUsers) {
      return res.json({
        data: JSON.parse(cachedUsers),
        source: "cache",
      });
    }

    // If no cache, fetch from database
    const users = await db.user.findAll({
      where: { masterId: id },
      attributes: ["id", "uuid", "coin", "status", "createdAt","userId"],
      include: [
        {
          model: db.master,
          as: "master",
          attributes: ["id", "uuid", "name"],
        },
      ],
    });

    // Cache the result for 5 minutes
    await redisClient.setEx(
      CACHE_KEY,
      CACHE_EXPIRY,
      JSON.stringify(users)
    )

    return res.status(200).send({
      message: "Users created by master retrieved successfully",
      data:users,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const getAllMasterUser = async (req, res) => {
  try {
    
    const id = req.user.id;
    // Check if the ID is provided
    if (!id) {
      return res.status(400).send({ message: "ID is required" });
    }

    const CACHE_KEY = `master:allUser:${id}`;
    const CACHE_EXPIRY = 300;

    const cachedUsers = await redisClient.get(CACHE_KEY);
    if (cachedUsers) {
      return res.json({
        data: JSON.parse(cachedUsers),
        source: "cache",
      });
    }

    // If no cache, fetch from database
    const users = await db.user.findAll({
      attributes: ["id", "uuid", "coin", "status", "createdAt","userId"],
      include: [
        {
          model: db.master,
          as: "master",
          attributes: ["id", "uuid", "name"],
          where: { id: id },
        },
      ],
    });

    // Cache the result for 5 minutes
    await redisClient.setEx(
      CACHE_KEY,
      CACHE_EXPIRY,
      JSON.stringify(users)
    )

    return res.status(200).send({
      message: "Users created by master retrieved successfully",
      data:users,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

const getAdminUser = async (req, res) => {
  try {
    const adminId = req.user.id;
    const users = await db.user.findAll({
      attributes: ["id", "uuid", "coin", "status", "createdAt"],
      include: [
        {
          model: db.admin,
          as: "admin",
          attributes: ["id", "uuid", "name"],
          where: { id: adminId },
        },
      ],
    });
    return res.status(200).send({
      message: "Users created by admin retrieved successfully",
      users,
    });
  } catch (err) {
    return res.status(500).send({ message: err.message });
  }
};

module.exports = { getUser, createUser, getMasterUser, getAdminUser, getAllMasterUser };
