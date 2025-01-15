const db = require('@models/index');
const generateToken = require('../../helpers/generateToken');

const login = async (email, password) => {
    const user = await db.User.findOne({ where: { email } });
    if (!user) {
        throw new Error('Invalid email or password');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken();
    return token;
};