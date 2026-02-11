
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/Transaction';
import '@/models/Player'; // Ensure Player model is registered

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const deletedTransaction = await Transaction.findByIdAndDelete(id);

        if (!deletedTransaction) {
            return NextResponse.json(
                { success: false, error: 'Transaction not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: deletedTransaction });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to delete transaction' },
            { status: 400 }
        );
    }
}
