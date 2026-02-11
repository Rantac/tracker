
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Check if ANY users exist
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return NextResponse.json(
                { success: false, error: 'Setup already completed' },
                { status: 403 }
            );
        }

        const { username, password } = await req.json();

        // Create First Superuser
        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            username,
            password: hashedPassword,
            role: 'superuser',
        });

        return NextResponse.json({
            success: true,
            message: 'Superuser created successfully',
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Setup failed' },
            { status: 500 }
        );
    }
}
