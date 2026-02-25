'use client';

import { useState, useEffect, useRef } from 'react';
import { format, isPast } from 'date-fns';
import Link from 'next/link';

interface Event {
    _id: string;
    title: string;
    description: string;
    startTime: string;
    location: string;
    createdBy: string;
    imageUrl?: string;
    status?: string;
    googleMapUrl?: string;
}

interface EventFeedProps {
    isAdmin: boolean;
    events: Event[];
    onDeleteEvent?: (id: string) => void;
    onEditEvent?: (event: Event) => void;
}

interface CountdownParts {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function useCountdown(targetDate: Date): CountdownParts | null {
    const calc = (): CountdownParts | null => {
        const diff = targetDate.getTime() - Date.now();
        if (diff <= 0) return null;
        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        };
    };

    const [parts, setParts] = useState<CountdownParts | null>(calc);

    useEffect(() => {
        const timer = setInterval(() => setParts(calc()), 1000);
        return () => clearInterval(timer);
    }, [targetDate.getTime()]);

    return parts;
}

function CountdownTile({ value, label }: { value: number; label: string }) {
    const pad = (n: number) => String(n).padStart(2, '0');
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="w-14 h-14 rounded-xl bg-background-dark border border-white/10 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-white tabular-nums">{pad(value)}</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
        </div>
    );
}

function Countdown({ targetDate }: { targetDate: Date }) {
    const parts = useCountdown(targetDate);

    if (!parts) {
        return (
            <div className="flex items-center justify-center py-2">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">
                    Event Started
                </span>
            </div>
        );
    }

    const units = parts.days > 0
        ? [
            { value: parts.days, label: 'Days' },
            { value: parts.hours, label: 'Hrs' },
            { value: parts.minutes, label: 'Min' },
        ]
        : [
            { value: parts.hours, label: 'Hrs' },
            { value: parts.minutes, label: 'Min' },
        ];

    return (
        <div className="flex items-end justify-center gap-2 py-1">
            {units.map((u, i) => (
                <div key={u.label} className="flex items-end gap-2">
                    <CountdownTile value={u.value} label={u.label} />
                    {i < units.length - 1 && (
                        <span className="text-primary font-black text-xl mb-6 leading-none select-none">:</span>
                    )}
                </div>
            ))}
        </div>
    );
}

export default function EventFeed({ isAdmin, events, onDeleteEvent, onEditEvent }: EventFeedProps) {
    const upcoming = events.filter((e) => !isPast(new Date(e.startTime)));
    const past = events.filter((e) => isPast(new Date(e.startTime)));
    const [activeIndex, setActiveIndex] = useState(0);
    const touchStartX = useRef<number | null>(null);

    const getMapUrl = (location: string) =>
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

    const UpcomingCard = ({ event }: { event: Event }) => {
        const eventDate = new Date(event.startTime);

        return (
            <div className="bg-surface-dark rounded-2xl border border-white/8 overflow-hidden">

                {/* ── Banner image ── */}
                {event.imageUrl && (
                    <div className="w-full h-40 overflow-hidden">
                        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="p-4">

                {/* ── Header: edit + delete (admin only) ── */}
                {isAdmin && (
                    <div className="flex justify-end gap-1">
                        <button
                            onClick={() => onEditEvent && onEditEvent(event)}
                            className="p-1 text-gray-600 hover:text-primary transition-colors"
                        >
                            <span className="material-icons-round text-base">edit</span>
                        </button>
                        <button
                            onClick={() => onDeleteEvent && onDeleteEvent(event._id)}
                            className="p-1 text-gray-600 hover:text-red-500 transition-colors"
                        >
                            <span className="material-icons-round text-base">delete</span>
                        </button>
                    </div>
                )}

                {/* ── Date/Time hero block ── */}
                <div className="pb-3 flex items-start gap-4">
                    {/* Big date badge */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold uppercase text-primary leading-none tracking-wider">{format(eventDate, 'MMM')}</span>
                        <span className="text-3xl font-black text-white leading-none mt-0.5">{format(eventDate, 'd')}</span>
                        <span className="text-[9px] font-semibold text-gray-400 leading-none mt-0.5">{format(eventDate, 'yyyy')}</span>
                    </div>
                    {/* Title + day + time */}
                    <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-start gap-2">
                            <p className="text-base font-black text-white leading-tight truncate flex-1">{event.title}</p>
                            {(() => {
                                const s = event.status || 'planning';
                                return (
                                    <span className={`flex-shrink-0 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                                        s === 'confirmed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                        s === 'cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                        'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                    }`}>{s}</span>
                                );
                            })()}
                        </div>
                        <p className="text-sm font-semibold text-gray-300 mt-1">{format(eventDate, 'EEEE')}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="material-icons-round text-sm text-primary">schedule</span>
                            <span className="text-sm font-bold text-primary">{format(eventDate, 'h:mm a')}</span>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/5" />

                {/* ── Countdown ── */}
                <div className="py-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center mb-2">Time remaining</p>
                    <Countdown targetDate={eventDate} />
                </div>

                <div className="border-t border-white/5" />

                {/* ── Description + location ── */}
                <div className="pt-3 space-y-2">
                    {event.description && (
                        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{event.description}</p>
                    )}
                    <a
                        href={getMapUrl(event.location)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary transition-colors group"
                    >
                        <span className="material-icons-round text-sm group-hover:text-primary">location_on</span>
                        <span className="underline underline-offset-2 decoration-dotted truncate">{event.location}</span>
                        <span className="material-icons-round text-xs opacity-50">open_in_new</span>
                    </a>
                </div>

                {/* ── View Details link ── */}
                <div className="pt-3 border-t border-white/5 mt-3">
                    <Link
                        href={`/events/${event._id}`}
                        className="flex items-center justify-center gap-1.5 w-full py-2 rounded-xl bg-primary/8 border border-primary/15 text-xs font-bold text-primary hover:bg-primary/15 transition-colors"
                    >
                        <span className="material-icons-round text-sm">open_in_full</span>
                        View Details & Share
                    </Link>
                </div>

                </div>{/* end p-4 */}
            </div>
        );
    };

    const PastCard = ({ event }: { event: Event }) => {
        const eventDate = new Date(event.startTime);

        return (
            <div className="flex items-center gap-3 p-3 bg-surface-dark rounded-xl border border-white/5 opacity-50">
                <div className="w-9 h-9 rounded-lg bg-white/5 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[8px] font-bold uppercase text-gray-500 leading-none">{format(eventDate, 'MMM')}</span>
                    <span className="text-sm font-black text-gray-400 leading-none">{format(eventDate, 'd')}</span>
                </div>
                <Link href={`/events/${event._id}`} className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 truncate hover:text-gray-300 transition-colors">{event.title}</p>
                    <p className="text-[10px] text-gray-600 flex items-center gap-1 mt-0.5">
                        <span className="material-icons-round text-xs">location_on</span>
                        <span className="truncate">{event.location}</span>
                    </p>
                </Link>
                <span className="text-[10px] text-gray-600 flex-shrink-0">{format(eventDate, 'h:mm a')}</span>
                {isAdmin && (
                    <button
                        onClick={() => onDeleteEvent && onDeleteEvent(event._id)}
                        className="text-gray-600 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                        <span className="material-icons-round text-base">delete</span>
                    </button>
                )}
            </div>
        );
    };

    return (
        <section className="px-6 mb-10">
            <h3 className="text-lg font-bold text-white mb-4">Events</h3>

            {events.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <span className="material-icons-round text-4xl text-gray-600 mb-2">event</span>
                    <p className="text-gray-500 text-sm">No events scheduled yet.</p>
                </div>
            )}

            {upcoming.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold uppercase tracking-widest text-primary">Upcoming</p>
                        {upcoming.length > 1 && (
                            <span className="text-xs text-gray-500">{activeIndex + 1} / {upcoming.length}</span>
                        )}
                    </div>

                    {/* Carousel track */}
                    <div
                        className="overflow-hidden"
                        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
                        onTouchEnd={(e) => {
                            if (touchStartX.current === null) return;
                            const diff = touchStartX.current - e.changedTouches[0].clientX;
                            if (diff > 40 && activeIndex < upcoming.length - 1) setActiveIndex(i => i + 1);
                            if (diff < -40 && activeIndex > 0) setActiveIndex(i => i - 1);
                            touchStartX.current = null;
                        }}
                    >
                        <div
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                        >
                            {upcoming.map((event) => (
                                <div key={event._id} className="w-full flex-shrink-0">
                                    <UpcomingCard event={event} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Dot indicators */}
                    {upcoming.length > 1 && (
                        <div className="flex justify-center gap-1.5 mt-3">
                            {upcoming.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`rounded-full transition-all duration-200 ${
                                        i === activeIndex
                                            ? 'w-4 h-1.5 bg-primary'
                                            : 'w-1.5 h-1.5 bg-white/20'
                                    }`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {past.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Past</p>
                    {past.map((event) => (
                        <PastCard key={event._id} event={event} />
                    ))}
                </div>
            )}
        </section>
    );
}
