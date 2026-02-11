'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Transaction {
    _id: string;
    type: 'income' | 'expense';
    amount: number;
    description: string;
    category: string;
    player?: {
        name: string;
        imageUrl: string;
    };
    date: string;
}

interface ActivityFeedProps {
    isAdmin: boolean;
    transactions: Transaction[];
    onDeleteTransaction?: (id: string) => void;
}

export default function ActivityFeed({
    isAdmin,
    transactions,
    onDeleteTransaction,
}: ActivityFeedProps) {
    const [activeTab, setActiveTab] = useState<'supporters' | 'spending'>(
        'supporters'
    );
    const [displayLimit, setDisplayLimit] = useState(5);

    const supportersAll = transactions.filter((t) => t.type === 'income');
    const spendingAll = transactions.filter((t) => t.type === 'expense');

    const supporters = isAdmin ? supportersAll : supportersAll.slice(0, displayLimit);
    const spending = isAdmin ? spendingAll : spendingAll.slice(0, displayLimit);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleSeeMore = () => {
        setDisplayLimit(20);
    };

    return (
        <section className="px-0">
            <div className="px-6 mb-4">
                <h3 className="text-lg font-bold text-white mb-4">Activity Feed</h3>
                {/* Tabs */}
                <div className="flex bg-surface-dark p-1 rounded-xl mb-6">
                    <button
                        onClick={() => setActiveTab('supporters')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'supporters'
                            ? 'bg-primary text-background-dark shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Supporters
                    </button>
                    <button
                        onClick={() => setActiveTab('spending')}
                        className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'spending'
                            ? 'bg-primary text-background-dark shadow-lg'
                            : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Spending
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="px-6 space-y-4 pb-4">
                {activeTab === 'supporters' && (
                    <>
                        {supporters.length === 0 && (
                            <p className="text-center text-gray-400 text-sm">No recent activity.</p>
                        )}
                        {supporters.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between p-4 bg-surface-dark rounded-2xl border border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    {item.player && item.player.imageUrl ? (
                                        <div className="w-10 h-10 rounded-full p-0.5 border border-primary/30">
                                            <img
                                                src={item.player.imageUrl}
                                                alt={item.player.name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                                            <div className="w-full h-full bg-surface-dark rounded-full flex items-center justify-center">
                                                <span className="material-icons-round text-white text-xs font-bold">{item.description.substring(0, 2).toUpperCase()}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {item.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary font-bold text-lg">
                                        +{formatCurrency(item.amount)}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                        {item.category}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => onDeleteTransaction && onDeleteTransaction(item._id)}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <span className="material-icons-round text-lg">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                        {!isAdmin && supportersAll.length > displayLimit && displayLimit < 20 && (
                            <button
                                onClick={handleSeeMore}
                                className="w-full py-3 text-sm text-gray-400 font-medium hover:text-white transition-colors"
                            >
                                See More
                            </button>
                        )}
                    </>
                )}

                {activeTab === 'spending' && (
                    <>
                        {spending.length === 0 && (
                            <p className="text-center text-gray-400 text-sm">No recent spending.</p>
                        )}
                        {spending.map((item) => (
                            <div
                                key={item._id}
                                className="flex items-center justify-between p-4 bg-surface-dark rounded-2xl border border-white/5"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                                        <span className="material-icons-round">shopping_bag</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">
                                            {item.description}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-red-400 font-bold text-lg">
                                        -{formatCurrency(item.amount)}
                                    </p>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                                        {item.category}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => onDeleteTransaction && onDeleteTransaction(item._id)}
                                        className="p-2 text-gray-400 hover:text-red-500"
                                    >
                                        <span className="material-icons-round text-lg">delete</span>
                                    </button>
                                )}
                            </div>
                        ))}
                        {!isAdmin && spendingAll.length > displayLimit && displayLimit < 20 && (
                            <button
                                onClick={handleSeeMore}
                                className="w-full py-3 text-sm text-gray-400 font-medium hover:text-white transition-colors"
                            >
                                See More
                            </button>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
