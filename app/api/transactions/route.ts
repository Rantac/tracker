import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import '@/models/Player'; // Ensure Player model is registered

export async function GET() {
    await dbConnect();
    try {
        // Sort by date descending
        const transactions = await Transaction.find({}).populate('player', 'name imageUrl').sort({ date: -1 });
        return NextResponse.json({ success: true, data: transactions });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch transactions' }, { status: 400 });
    }
}

export async function POST(req: NextRequest) {
    await dbConnect();
    try {
        const body = await req.json();
        const transaction = await Transaction.create(body);
        return NextResponse.json({ success: true, data: transaction }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to create transaction' }, { status: 400 });
    }
}
