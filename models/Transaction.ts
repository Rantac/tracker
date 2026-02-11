import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: string; // e.g., Donation, Purchase, Sponsorship
    player?: string | any; // Populated player object or ID
    date: Date;
}

const TransactionSchema: Schema = new Schema(
    {
        type: { type: String, enum: ['income', 'expense'], required: true },
        amount: { type: Number, required: true },
        description: { type: String, required: true },
        category: { type: String, required: false },
        player: { type: Schema.Types.ObjectId, ref: 'Player', required: false },
        date: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const Transaction: Model<ITransaction> =
    mongoose.models.Transaction ||
    mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
