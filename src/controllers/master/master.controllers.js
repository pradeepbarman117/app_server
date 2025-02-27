const db = require("@models/index");
const { hashPassword, comparePassword } = require("@helpers/bcrypt");
const generateToken = require("../../helpers/generateToken");
const {
  emitMasterAdded,
  emitMasterUpdated,
} = require("../../services/socket/master/masterSocket");
const { redisClient } = require("../../config/redis");

// Helper for uniform error response
const handleError = (res, error, statusCode = 500) => {
  console.log(error)
  const message = error.message || "An error occurred";
  res.status(statusCode).json({ message, success: false });
};

const createMaster = async (req, res) => {
  try {
    const { name, email, password, passcode, percent, userId } = req.body;
    const adminId = req.user.id;

    if (!adminId)
      return res.status(401).json({ message: "Unauthorized", success: false });

    const existingMaster = await db.master.findOne({ where: { userId } });
    if (existingMaster)
      return res
        .status(400)
        .json({ message: "Master already exists", success: false });

    // Hash password and passcode in parallel
    const [hashedPassword, hashedPasscode] = await Promise.all([
      hashPassword(password),
      hashPassword(passcode),
    ]);

    const master = await db.master.create({
      name,
      email,
      userId,
      password: hashedPassword,
      passcode: hashedPasscode,
      adminId,
      percent,
    });

    // Fetch created master with admin details
    const masterWithAdmin = await db.master.findOne({
      where: { id: master.id },
      include: [
        { model: db.admin, as: "admin", attributes: ["id", "name", "email"] },
      ],
      attributes: ["name", "percent", "email", "adminId", "createdAt", "id", "userId"],
    });

    // Clear master list cache
    await redisClient.del('masters:list');
    emitMasterAdded(masterWithAdmin); // Real-time notification

    res.status(201).json({
      message: "Master created successfully",
      data: masterWithAdmin,
      success: true,
    });
  } catch (err) {
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return handleError(
        res,
        new Error("Invalid adminId. Admin does not exist."),
        400
      );
    }
    handleError(res, err);
  }
};

const updateMaster = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const master = await db.master.findByPk(id);

    if (!master) {
      return handleError(res, new Error("Master not found"), 404);
    }

    const updatedMaster = await master.update(updateData);

    await redisClient.del(`master:${id}`);
    await redisClient.del(`masters:list`);
    emitMasterUpdated(updatedMaster);
    emitMasterAdded(updatedMaster);

    res.status(200).send({
      message: "Master updated successfully",
      data: updatedMaster,
      success: true,
    });

  } catch (err) {
    return handleError(res, err);
  }
}

const getMasters = async (req, res) => {
  try {

    const CACHE_KEY = 'masters:list';
    const CACHE_EXPIRY = 300; // 5 minutes

    // Check Redis cache
    const cachedMasters = await redisClient.get(CACHE_KEY);

    if (cachedMasters) {
      return res.json({
        data: JSON.parse(cachedMasters),
        source: "cache",
      });
    }

    // If no cache, fetch from database
    const masters = await db.master.findAll({
      attributes: ['name', 'percent', 'email', 'adminId', 'createdAt', 'id', 'userId'],
      include: [
        {
          model: db.admin, as: 'admin', attributes: ['id', 'name', 'email',]
        }
      ]
    });

    // Cache entire list with expiration
    await redisClient.setEx(
      CACHE_KEY,
      CACHE_EXPIRY,
      JSON.stringify(masters)
    );

    return res.json({
      data: masters,
      source: "database",
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getMasterById = async (req, res) => {
  try {
    const { id } = req.params; // Extract master ID from request parameters
    if (!id) {
      return res.status(400).json({
        message: 'Master ID is required',
        success: false,
      });
    };

    const CACHE_KEY = `master:${id}`; // Cache key for Redis
    const CACHE_EXPIRY = 300; // Cache expiry time in seconds (5 minutes)

    // Check Redis cache for the master
    const cachedMaster = await redisClient.get(CACHE_KEY);

    if (cachedMaster) {
      return res.json({
        data: JSON.parse(cachedMaster),
        source: "cache",
      });
    }

    // If no cache, fetch from the database
    const master = await db.master.findOne({
      where: { id },
      include: [
        { model: db.admin, as: "admin", attributes: ["id", "name", "email"] },
      ],
      attributes: ["name", "percent", "email", "adminId", "createdAt", "id", "blacklist"],
    });

    if (!master) {
      return res.status(404).json({
        message: "Master not found",
        success: false,
      });
    }

    // Cache the master data in Redis
    await redisClient.setEx(CACHE_KEY, CACHE_EXPIRY, JSON.stringify(master));

    return res.json({
      data: master,
      source: "database",
    });
  } catch (error) {
    handleError(res, error);
  }
};

const getAuthMaster = async (req, res) => {
  try {
    const masterId = req.user.id;

    const CACHE_KEY = `get:auth:master:${masterId}`
    const CACHE_EXPIRY = 60

    const cachedMaster = await redisClient.get(CACHE_KEY);

    if(cachedMaster){
      return res.status(200).send({
        success: true,
        data: JSON.parse(cachedMaster),
        source:'cached',
      });
    }

    const master = await db.master.findOne({
      where: { id: masterId },
      attributes: ["id", "userId", "balance"],
    });

    await redisClient.setEx(
      CACHE_KEY,
      CACHE_EXPIRY,
      JSON.stringify(master)
    )

    res.status(200).send({
      success:true,
      data: master,
      message: 'Retrived Master Successfully'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const masterLogin = async (req, res) => {
  try {
    const { userId, password, passcode } = req.body;

    if (!userId || !password || !passcode) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const user = await db.master.findOne({ where: { userId } });
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false });

    const isPasswordValid = await comparePassword(password, user.password);
    const isPasscodeValid = await comparePassword(passcode, user.passcode);

    if (!isPasswordValid || !isPasscodeValid) {
      return res
        .status(401)
        .json({ message: "Invalid credentials", success: false });
    }


    // Get the login information
    const lastLogin = new Date();
    const lastIp = req.ip || ''; // Get the user's IP address
    const lastDevice = req.get('user-agent') || ''; // Get the user's device details (browser info)
    const lastLocation = ''; // You can integrate geolocation service if needed
    const lastBrowser = req.get('user-agent') || ''; // Get the browser details from user-agent
    const lastOs = ''; // You can use a library like `os` to get more detailed info if needed


    // Update login history fields
    await user.update({
      login_history: {
        last_login: lastLogin,
        last_ip: lastIp,
        last_device: lastDevice,
        last_location: lastLocation,
        last_browser: lastBrowser,
        last_os: lastOs,
      }
    }, { returning: true });

    const token = await generateToken({
      userId: user.id,
      uuid: user.uuid,
      designation: user.designation,
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        designation: "master",
        uuid: user.uuid,
        userId: user.userId,
      },
      success: true,
    });
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = { createMaster, getMasters, masterLogin, getMasterById, updateMaster, getAuthMaster };
