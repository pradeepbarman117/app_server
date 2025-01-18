const db = require('@models/index');
const roles = require('../../config/roles');
const { hashPassword } = require('@helpers/bcrypt');

const createUser = async (req, res) => {
    try {
        const { user_id, password, passcode } = req.body;
        const request_id = req.user.id;
        // Set only one of the foreign keys
        const masterId = req.user.designation === roles.MASTER ? request_id : null;
        const adminId = req.user.designation !== roles.MASTER ? request_id : null;
        
        const [hashedPassword, hashedPasscode] = await Promise.all([hashPassword(password), hashPassword(passcode)]);
        const user = await db.user.create({
            userId: user_id,
            password: hashedPassword,
            passcode: hashedPasscode,
            masterId,
            adminId,
        });

        res.status(201).send({
            message: 'User created successfully',
            user,
            success: true
        });
    } catch (err) {
        // console.error(err);
        res.status(500).send({ message: err.message });
    }
};

const getUser = async (req, res) => {
    try {
            
        const users = await db.user.findAll({
            attributes:['id','uuid','coin','status','createdAt'],
            include:[
                {
                    model:db.admin,
                    as: 'admin',
                    attributes:['id','uuid','name']
                },
                {
                    model:db.master,
                    as: 'master',
                    attributes:['id','uuid','name']
                }
            ]
        });
        return res.status(200).send({
            message: 'Users retrieved successfully',
            users
        });
    } catch (err) {
        return res.status(500).send({ message: err.message });
    }
};


// const getCreatorUser = async (req, res) => {
//     try {

//         const request_id = req.user.id;
//         // Set only one of the foreign keys
//         const masterId = req.user.designation === roles.MASTER ? request_id : null;
//         const adminId = req.user.designation !== roles.MASTER ? request_id : null;
        
//         // Create the object based on which ID is available
//         const id = masterId ? { masterId } : { adminId };

//         console.log(id,'userIdObjectuserIdObject');

//         const users = await db.user.findAll({
//             attributes: ['id', 'uuid', 'coin', 'status', 'createdAt'],
//             include: [
//                 {
//                     model: db.master,
//                     as: 'master',
//                     attributes: ['id', 'uuid', 'name'],
//                     where: { id }
//                 }
//             ]
//         });
//         return res.status(200).send({
//             message: 'Users created by master retrieved successfully',
//             users
//         });
//     } catch (err) {
//         return res.status(500).send({ message: err.message });
//     }
// };

const getMasterUser = async(req,res)=>{
    try{
        const masterId = req.user.id;
        const users = await db.user.findAll({
            attributes: ['id', 'uuid', 'coin', 'status', 'createdAt'],
            include: [
                {
                    model: db.master,
                    as: 'master',
                    attributes: ['id', 'uuid', 'name'],
                    where: { id: masterId },
                },
            ]
        });
        return res.status(200).send({
            message: 'Users created by master retrieved successfully',
            users
        });
    }catch(err){
        return res.status(500).send({ message: err.message });
    }
}
const getAdminUser = async(req,res)=>{
    try{
        const adminId = req.user.id;
        const users = await db.user.findAll({
            attributes: ['id', 'uuid', 'coin', 'status', 'createdAt'],
            include: [
                {
                    model: db.admin,
                    as: 'admin',
                    attributes: ['id', 'uuid', 'name'],
                    where: { id: adminId },
                },
            ]
        });
        return res.status(200).send({
            message: 'Users created by admin retrieved successfully',
            users
        });
    }catch(err){
        return res.status(500).send({ message: err.message });
    }
}

module.exports = { getUser, createUser, getMasterUser, getAdminUser}; 