import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import EventDetailClient, { EventData } from './EventDetailClient';
import dbConnect from '@/lib/mongodb';
import Event from '@/models/Event';

async function getEvent(id: string): Promise<EventData | null> {
    try {
        await dbConnect();
        const event = await Event.findById(id).lean();
        if (!event) return null;
        return JSON.parse(JSON.stringify(event));
    } catch {
        return null;
    }
}

export async function generateMetadata(
    { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        return {
            title: 'Event Not Found · FC Hub',
            description: 'This event could not be found.',
        };
    }

    const eventDate = new Date(event.startTime);
    const formattedDate = format(eventDate, 'EEEE, MMMM d yyyy · h:mm a');
    const description = [
        event.description,
        `📍 ${event.location}`,
        `🗓 ${formattedDate}`,
    ].filter(Boolean).join('  ·  ');

    const url = `${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/events/${id}`;

    return {
        title: `${event.title} · FC Hub`,
        description,
        openGraph: {
            title: event.title,
            description,
            url,
            siteName: 'FC Hub',
            type: 'website',
            ...(event.imageUrl ? { images: [{ url: event.imageUrl, width: 1200, height: 630, alt: event.title }] } : {}),
        },
        twitter: {
            card: event.imageUrl ? 'summary_large_image' : 'summary',
            title: event.title,
            description,
            ...(event.imageUrl ? { images: [event.imageUrl] } : {}),
        },
    };
}

export default async function EventDetailPage(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) notFound();

    return <EventDetailClient initialEvent={event} />;
}
