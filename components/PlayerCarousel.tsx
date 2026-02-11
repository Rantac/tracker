'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Player {
    _id: string;
    name: string;
    position: string;
    number: number;
    imageUrl: string;
    goals: number;
    assists: number;
}

interface PlayerCarouselProps {
    isAdmin: boolean;
    players: Player[];
    onAddPlayer: () => void;
    onEditPlayer: (player: Player) => void;
    onDeletePlayer?: (player: Player) => void;
}

export default function PlayerCarousel({
    isAdmin,
    players,
    onAddPlayer,
    onEditPlayer,
    onDeletePlayer,
}: PlayerCarouselProps) {
    if (players.length === 0) {
        return (
            <section className="px-6 mb-10 text-center">
                <div className="flex justify-between items-end mb-4">
                    <h3 className="text-lg font-bold text-white">
                        {isAdmin ? 'Squad Roster' : 'Player Spotlight'}
                    </h3>
                </div>
                <div className="bg-surface-dark p-8 rounded-3xl border border-white/5">
                    <p className="text-gray-400 mb-4">No players added yet.</p>
                    {isAdmin && (
                        <button onClick={onAddPlayer} className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl mx-auto">
                            <span className="material-icons-round">person_add</span> Add First Player
                        </button>
                    )}
                </div>
            </section>
        );
    }

    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-switch player every 3 seconds
    useEffect(() => {
        if (players.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % players.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [players.length]);

    const nextPlayer = () => {
        setCurrentIndex((prev) => (prev + 1) % players.length);
    };

    const spotlightPlayer = players[currentIndex];

    // Reset index if players array changes (e.g. new player added) to show the new one
    // But since new players are added to the start, 0 is usually correct for "showing the new one"
    // However, if we were viewing index 5 and a new player is added, index 5 becomes a different player.
    // For simplicity, let's just keep the index valid.
    if (currentIndex >= players.length && players.length > 0) {
        setCurrentIndex(0);
    }

    return (
        <section className="px-6 mb-10">
            <div className="flex justify-between items-end mb-4">
                <h3 className="text-lg font-bold text-white">
                    {isAdmin ? 'Squad Roster' : 'Player Spotlight'}
                </h3>
            </div>

            <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden bg-surface-dark group">
                {isAdmin && (
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                        <button
                            onClick={() => onEditPlayer(spotlightPlayer)}
                            className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-black transition-all"
                        >
                            <span className="material-icons-round">edit</span>
                        </button>
                        {onDeletePlayer && (
                            <button
                                onClick={() => onDeletePlayer(spotlightPlayer)}
                                className="w-10 h-10 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            >
                                <span className="material-icons-round">delete</span>
                            </button>
                        )}
                    </div>
                )}

                <AnimatePresence>
                    <motion.div
                        key={spotlightPlayer._id}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full"
                    >
                        {/* Image */}
                        <img
                            src={spotlightPlayer.imageUrl || 'https://placehold.co/400x500?text=No+Image'}
                            alt={spotlightPlayer.name}
                            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/40 to-transparent"></div>
                        {/* Content */}
                        <div className="absolute bottom-0 left-0 w-full p-6">
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-primary text-background-dark text-xs font-bold rounded uppercase">
                                            {spotlightPlayer.position}
                                        </span>
                                        <span className="text-gray-300 text-xs font-semibold tracking-wider">
                                            #{spotlightPlayer.number}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-extrabold text-white leading-tight mb-1">
                                        {spotlightPlayer.name.split(' ')[0]} <br />
                                        <span className="text-primary">
                                            {spotlightPlayer.name.split(' ').slice(1).join(' ')}
                                        </span>
                                    </h2>
                                    <p className="text-sm text-gray-400">
                                        Goals: {spotlightPlayer.goals} • Assists: {spotlightPlayer.assists}
                                    </p>
                                </div>
                                <button
                                    onClick={nextPlayer}
                                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-background-dark hover:border-primary transition-all duration-300 z-10 relative"
                                >
                                    <span className="material-icons-round">arrow_forward</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {isAdmin && (
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={onAddPlayer}
                        className="flex items-center gap-2 text-sm font-bold text-primary bg-primary/10 px-4 py-2 rounded-xl"
                    >
                        <span className="material-icons-round">person_add</span> Add Player
                    </button>
                </div>
            )}
        </section>
    );
}
