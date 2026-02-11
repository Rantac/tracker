
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, verifyToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Authorization Check
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded: any = verifyToken(token);

        if (!decoded || decoded.role !== 'superuser') {
            return NextResponse.json({ success: false, error: 'Forbidden: Superuser access required' }, { status: 403 });
        }

        const { username, password } = await req.json();

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'Username already exists' },
                { status: 400 }
            );
        }

        // Create new admin
        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            username,
            password: hashedPassword,
            role: 'admin', // Only creates regular admins
        });

        return NextResponse.json({
            success: true,
            data: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Registration failed' },
            { status: 500 }
        );
    }
}
