
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Sign JWT (expires in 30 days)
export const signToken = (payload: object) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
};

// Verify JWT
export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Hash Password
export const hashPassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

// Compare Password
export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash);
};
