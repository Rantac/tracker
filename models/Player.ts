import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlayer extends Document {
    name: string;
    position: string;
    number: number;
    imageUrl: string;
    goals: number;
    assists: number;
    highlighted?: boolean;
}

const PlayerSchema: Schema = new Schema(
    {
        name: { type: String, required: true },
        position: { type: String, required: true },
        number: { type: Number, required: true },
        imageUrl: { type: String, required: false },
        goals: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        highlighted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

// Prevent overwriting the model if it's already compiled
const Player: Model<IPlayer> =
    mongoose.models.Player || mongoose.model<IPlayer>('Player', PlayerSchema);

export default Player;
