const db = require("@models/index");
const { hashPassword, comparePassword } = require("@helpers/bcrypt");
const generateToken = require("../../helpers/generateToken");
const {
  emitMasterAdded,
} = require("../../services/socket/master/masterSocket");
const { redisClient } = require("../../config/redis");

// Helper for uniform error response
const handleError = (res, error, statusCode = 500) => {
  const message = error.message || "An error occurred";
  res.status(statusCode).json({ message, success: false });
};



const createMaster = async (req, res) => {
  try {
    const { name, email, password, passcode, percent } = req.body;
    const adminId = req.user.id;

    if (!adminId)
      return res.status(401).json({ message: "Unauthorized", success: false });

    const existingMaster = await db.master.findOne({ where: { email } });
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
      attributes: ["name", "percent", "email", "adminId", "createdAt", "id"],
    });

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
    attributes: ['name', 'percent', 'email', 'adminId', 'createdAt', 'id'],
      include:[
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
    if(!id){
      return res.status(400).json({
        message: 'Master ID is required',
        success:false,
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
      attributes: ["name", "percent", "email", "adminId", "createdAt", "id"],
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

const masterLogin = async (req, res) => {
  try {
    const { email, password, passcode } = req.body;

    if (!email || !password || !passcode) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }

    const user = await db.master.findOne({ where: { email } });
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
      },
      success: true,
    });
  } catch (err) {
    handleError(res, err);
  }
};



// const updateMaster = async (req, res) => {
//     try {
//       // Existing update logic
//       const updatedMaster = await db.master.update(
//         req.body, 
//         { where: { id: req.params.id } }
//       );
  
//       // Invalidate masters cache
//       await redisClient.del('masters:list');
  
//       res.json({
//         message: "Master updated successfully",
//         data: updatedMaster
//       });
//     } catch (error) {
//       handleError(res, error);
//     }
//   };

module.exports = { createMaster, getMasters, masterLogin, getMasterById };
