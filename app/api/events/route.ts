import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
    await dbConnect();
    try {
        const events = await Event.find({}).sort({ startTime: 1 });
        return NextResponse.json({ success: true, data: events });
    } catch (error) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch events' }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const formData = await req.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const startTime = formData.get('startTime') as string;
        const location = formData.get('location') as string;
        const createdBy = formData.get('createdBy') as string;
        const status = (formData.get('status') as string) || 'planning';
        const file = formData.get('image') as File | null;

        let imageUrl = '';
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const fileName = `events/${uuidv4()}-${file.name}`;
            await r2Client.send(new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: fileName,
                Body: buffer,
                ContentType: file.type,
            }));
            imageUrl = R2_PUBLIC_URL ? `${R2_PUBLIC_URL}/${fileName}` : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${fileName}`;
        }

        const event = await Event.create({ title, description, startTime, location, createdBy, imageUrl, status });
        return NextResponse.json({ success: true, data: event }, { status: 201 });
    } catch (error) {
        console.error('Error creating event:', error);
        return NextResponse.json({ success: false, error: 'Failed to create event' }, { status: 400 });
    }
}
