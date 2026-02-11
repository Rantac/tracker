'use client';

import { useRef, useEffect, useState } from 'react';

interface FinancialHeaderProps {
    isAdmin: boolean;
    totalFund: number;
    totalSpent: number;
    remaining: number;
    onAddFund: () => void;
    onAddExpense: () => void;
}

export default function FinancialHeader({
    isAdmin,
    totalFund,
    totalSpent,
    remaining,
    onAddFund,
    onAddExpense,
}: FinancialHeaderProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'MMK',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const middleCardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current && middleCardRef.current) {
            const container = scrollContainerRef.current;
            const card = middleCardRef.current;

            // Calculate position to center the card
            const scrollLeft = card.offsetLeft - (container.clientWidth / 2) + (card.clientWidth / 2);

            container.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });
        }
    }, []);

    const [activeIndex, setActiveIndex] = useState(1); // Default to middle card (index 1)

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollPosition = container.scrollLeft;
            const cardWidth = container.offsetWidth * 0.85; // Approximate card width
            // Simple calculation to find closest index
            const index = Math.round(scrollPosition / cardWidth);
            setActiveIndex(Math.min(Math.max(index, 0), 2)); // Clamp between 0 and 2
        }
    };

    return (
        <section className="px-6 mb-8 mt-6">
            <div
                ref={scrollContainerRef}
                className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4"
                onScroll={handleScroll}
            >
                {/* Card 1: Total Fund */}
                <div className="snap-center shrink-0 w-[85%] bg-surface-dark p-6 rounded-3xl border border-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-white/5 rounded-lg">
                            <span className="material-icons-round text-primary">
                                account_balance_wallet
                            </span>
                        </div>
                        {!isAdmin ? (
                            <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-full">
                                Live
                            </span>
                        ) : (
                            <button
                                onClick={onAddFund}
                                className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded transition flex items-center gap-1"
                            >
                                <span className="material-icons-round text-sm">add_circle</span>{' '}
                                Add
                            </button>
                        )}
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium mb-1">Total Fund</p>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight">
                            {formatCurrency(totalFund)}
                        </h2>
                    </div>
                </div>

                {/* Card 2: Remaining (Middle - Default View) */}
                <div
                    ref={middleCardRef}
                    className="snap-center shrink-0 w-[85%] bg-primary p-6 rounded-3xl relative overflow-hidden shadow-neon"
                >
                    <div className="absolute bottom-0 right-0 opacity-20 transform translate-y-4 translate-x-4">
                        <span className="material-icons-round text-9xl text-black">
                            savings
                        </span>
                    </div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-black/10 rounded-lg">
                            <span className="material-icons-round text-background-dark">
                                pie_chart
                            </span>
                        </div>
                    </div>
                    <div className="relative z-10 text-background-dark">
                        <p className="text-background-dark/70 text-sm font-bold mb-1 uppercase tracking-wide">
                            Remaining Budget
                        </p>
                        <h2 className="text-4xl font-extrabold tracking-tight">
                            {formatCurrency(remaining)}
                        </h2>
                    </div>
                </div>

                {/* Card 3: Spent */}
                <div className="snap-center shrink-0 w-[85%] bg-surface-dark p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                    <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="p-2 bg-white/5 rounded-lg">
                            <span className="material-icons-round text-gray-400">
                                receipt_long
                            </span>
                        </div>
                        {isAdmin && (
                            <button
                                onClick={onAddExpense}
                                className="text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-2 py-1 rounded transition flex items-center gap-1"
                            >
                                <span className="material-icons-round text-sm">add_circle</span>{' '}
                                Add
                            </button>
                        )}
                    </div>
                    <div className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium mb-1">
                            Total Spent
                        </p>
                        <h2 className="text-4xl font-extrabold text-white tracking-tight">
                            {formatCurrency(totalSpent)}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-2 mt-1">
                {[0, 1, 2].map((index) => (
                    <div
                        key={index}
                        className={`rounded-full transition-all duration-300 ${activeIndex === index
                            ? 'w-6 h-2 bg-primary'
                            : 'w-2 h-2 bg-primary/20'
                            }`}
                    ></div>
                ))}
            </div>
        </section>
    );
}
