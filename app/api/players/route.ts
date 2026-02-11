import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Player from '@/models/Player';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    await dbConnect();
    try {
        const players = await Player.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: players });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to fetch players' }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const position = formData.get('position') as string;
        const number = formData.get('number') as string;
        const goals = formData.get('goals') as string;
        const assists = formData.get('assists') as string;
        const file = formData.get('image') as File;

        let imageUrl = '';

        if (file) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `${uuidv4()}-${file.name}`;

            const uploadParams = {
                Bucket: R2_BUCKET,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
            };

            await r2Client.send(new PutObjectCommand(uploadParams));

            // If R2_PUBLIC_URL is set, use it. Otherwise construct from bucket/account (might need adjustment based on specific R2 setup)
            imageUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${fileName}` : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${fileName}`;
        }

        const player = await Player.create({
            name,
            position,
            number: Number(number),
            goals: Number(goals),
            assists: Number(assists),
            imageUrl,
        });

        return NextResponse.json({ success: true, data: player }, { status: 201 });
    } catch (error) {
        console.error('Error creating player:', error);
        return NextResponse.json({ success: false, error: 'Failed to create player' }, { status: 400 });
    }
}
