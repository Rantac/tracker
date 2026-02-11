
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Player from '@/models/Player';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2 = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
});

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const formData = await req.formData();

        const name = formData.get('name') as string;
        const position = formData.get('position') as string;
        const number = Number(formData.get('number'));
        const goals = Number(formData.get('goals'));
        const assists = Number(formData.get('assists'));
        const image = formData.get('image') as File | null;

        const player = await Player.findById(id);
        if (!player) {
            return NextResponse.json({ success: false, error: 'Player not found' }, { status: 404 });
        }

        let imageUrl = player.imageUrl;
        if (image) {
            const buffer = Buffer.from(await image.arrayBuffer());
            const fileName = `${Date.now()}-${image.name}`;

            await R2.send(new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileName,
                Body: buffer,
                ContentType: image.type,
            }));

            imageUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;
        }

        player.name = name;
        player.position = position;
        player.number = number;
        player.goals = goals;
        player.assists = assists;
        if (imageUrl) player.imageUrl = imageUrl;

        await player.save();

        return NextResponse.json({ success: true, data: player });
    } catch (error) {
        console.error('Error updating player:', error);
        return NextResponse.json({ success: false, error: 'Failed to update player' }, { status: 400 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedPlayer = await Player.findByIdAndDelete(id);

        if (!deletedPlayer) {
            return NextResponse.json(
                { success: false, error: 'Player not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: deletedPlayer });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to delete player' },
            { status: 400 }
        );
    }
}
