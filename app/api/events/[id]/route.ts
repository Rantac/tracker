import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';
import { r2Client, R2_BUCKET, R2_PUBLIC_URL } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const event = await Event.findById(id);
        if (!event) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: event });
    } catch (error) {
        return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const contentType = req.headers.get('content-type') || '';
        const updateData: Record<string, unknown> = {};

        if (contentType.includes('multipart/form-data')) {
            const formData = await req.formData();
            const title = formData.get('title') as string;
            const description = formData.get('description') as string;
            const startTime = formData.get('startTime') as string;
            const location = formData.get('location') as string;
            const status = formData.get('status') as string | null;
            const file = formData.get('image') as File | null;

            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (location) updateData.location = location;
            if (startTime) updateData.startTime = new Date(startTime);
            if (status) updateData.status = status;
            const googleMapUrl = formData.get('googleMapUrl') as string | null;
            if (googleMapUrl !== null && googleMapUrl !== '') updateData.googleMapUrl = googleMapUrl;

            if (file && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const fileName = `events/${uuidv4()}-${file.name}`;
                await r2Client.send(new PutObjectCommand({
                    Bucket: R2_BUCKET,
                    Key: fileName,
                    Body: buffer,
                    ContentType: file.type,
                }));
                updateData.imageUrl = R2_PUBLIC_URL
                    ? `${R2_PUBLIC_URL}/${fileName}`
                    : `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${fileName}`;
            }
        } else {
            const body = await req.json();
            if (body.title !== undefined) updateData.title = body.title;
            if (body.description !== undefined) updateData.description = body.description;
            if (body.location !== undefined) updateData.location = body.location;
            if (body.startTime) updateData.startTime = new Date(body.startTime);
            if (body.status) updateData.status = body.status;
            if (body.googleMapUrl !== undefined && body.googleMapUrl !== '') updateData.googleMapUrl = body.googleMapUrl;
        }

        const updatedEvent = await Event.findByIdAndUpdate(id, { $set: updateData }, { new: true });

        if (!updatedEvent) {
            return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, data: updatedEvent });
    } catch (error) {
        console.error('PATCH /api/events/[id] error:', error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 400 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedEvent = await Event.findByIdAndDelete(id);

        if (!deletedEvent) {
            return NextResponse.json(
                { success: false, error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: deletedEvent });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to delete event' },
            { status: 400 }
        );
    }
}
