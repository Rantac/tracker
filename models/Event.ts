import mongoose, { Schema, Document, Model } from 'mongoose';

export type EventStatus = 'planning' | 'confirmed' | 'cancelled';

export interface IEvent extends Document {
    title: string;
    description: string;
    startTime: Date;
    location: string;
    createdBy: string;
    imageUrl?: string;
    status: EventStatus;
    googleMapUrl?: string;
}

const EventSchema: Schema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        startTime: { type: Date, required: true },
        location: { type: String, required: true },
        createdBy: { type: String, required: true },
        imageUrl: { type: String, default: '' },
        status: { type: String, enum: ['planning', 'confirmed', 'cancelled'], default: 'planning' },
        googleMapUrl: { type: String, default: '' },
    },
    { timestamps: true }
);

if (mongoose.models.Event) {
    delete (mongoose.models as Record<string, unknown>).Event;
}

const Event: Model<IEvent> = mongoose.model<IEvent>('Event', EventSchema);

export default Event;
