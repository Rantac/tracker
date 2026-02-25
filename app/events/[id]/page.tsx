'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

interface User {
    id: string;
    username: string;
    role: 'superuser' | 'admin';
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
        <div className="flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-2xl bg-background-dark border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/5" />
                <span className="text-2xl font-black text-white tabular-nums relative z-10">{pad(value)}</span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
        </div>
    );
}

function Countdown({ targetDate }: { targetDate: Date }) {
    const parts = useCountdown(targetDate);
    if (!parts) {
        return (
            <div className="flex items-center justify-center py-4">
                <span className="text-sm font-bold uppercase tracking-widest text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    Event has started
                </span>
            </div>
        );
    }
    const units = [
        { value: parts.days, label: 'Days' },
        { value: parts.hours, label: 'Hours' },
        { value: parts.minutes, label: 'Min' },
        { value: parts.seconds, label: 'Sec' },
    ];
    return (
        <div className="flex items-end justify-center gap-3 py-2">
            {units.map((u, i) => (
                <div key={u.label} className="flex items-end gap-3">
                    <CountdownTile value={u.value} label={u.label} />
                    {i < units.length - 1 && (
                        <span className="text-primary font-black text-xl mb-7 leading-none select-none opacity-50">:</span>
                    )}
                </div>
            ))}
        </div>
    );
}

function extractGoogleMapEmbed(url: string): string | null {
    if (!url) return null;
    // Already an embed URL — use as-is
    if (url.includes('/embed')) return url;
    // Extract a search query from common Google Maps URL formats
    const placeMatch = url.match(/place\/([^/@?]+)/);
    const qMatch = url.match(/[?&]q=([^&]+)/);
    const query = placeMatch?.[1] || qMatch?.[1] || '';
    if (query) {
        return `https://maps.google.com/maps?q=${query}&output=embed&hl=en`;
    }
    // Fallback: embed the whole URL as a query (no API key needed)
    if (url.includes('google.com/maps')) {
        return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&output=embed&hl=en`;
    }
    return null;
}

function MapIframe({ googleMapUrl }: { googleMapUrl: string }) {
    const embedUrl = extractGoogleMapEmbed(googleMapUrl);
    const [useEmbed, setUseEmbed] = useState(true);

    if (!embedUrl || !useEmbed) {
        return (
            <a
                href={googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-48 bg-surface-dark rounded-2xl border border-white/10 text-primary hover:bg-primary/5 transition-colors group"
            >
                <span className="material-icons-round text-2xl">map</span>
                <span className="text-sm font-bold">Open in Google Maps</span>
                <span className="material-icons-round text-sm opacity-50 group-hover:opacity-100 transition-opacity">open_in_new</span>
            </a>
        );
    }

    return (
        <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onError={() => setUseEmbed(false)}
                title="Event Location"
            />
            <a
                href={googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-background-dark/90 backdrop-blur-sm border border-white/10 text-xs font-bold text-primary px-3 py-1.5 rounded-full shadow hover:bg-primary/10 transition-colors"
            >
                <span className="material-icons-round text-sm">open_in_new</span>
                Open Maps
            </a>
        </div>
    );
}

function AdminMapEditor({ eventId, currentUrl, onSaved }: { eventId: string; currentUrl: string; onSaved: (url: string) => void }) {
    const [editing, setEditing] = useState(false);
    const [value, setValue] = useState(currentUrl);
    const [saving, setSaving] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setValue(currentUrl);
    }, [currentUrl]);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/events/${eventId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ googleMapUrl: value }),
            });
            if (res.ok) {
                onSaved(value);
                setEditing(false);
            }
        } finally {
            setSaving(false);
        }
    };

    if (!editing) {
        return (
            <button
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors group"
            >
                <span className="material-icons-round text-sm group-hover:text-primary transition-colors">
                    {currentUrl ? 'edit' : 'add_location_alt'}
                </span>
                {currentUrl ? 'Edit map link' : 'Add Google Map link'}
            </button>
        );
    }

    return (
        <div className="flex flex-col gap-2 p-3 bg-background-dark rounded-xl border border-primary/20">
            <label className="text-xs font-bold text-primary uppercase tracking-widest">Google Map URL</label>
            <input
                ref={inputRef}
                type="url"
                placeholder="https://maps.google.com/..."
                className="w-full bg-surface-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setEditing(false); }}
            />
            <p className="text-[10px] text-gray-600">Paste any Google Maps URL or share link</p>
            <div className="flex gap-2 justify-end">
                <button
                    onClick={() => { setEditing(false); setValue(currentUrl); }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-1.5 text-xs font-bold bg-primary text-background-dark rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                    {saving ? 'Saving...' : 'Save'}
                </button>
            </div>
        </div>
    );
}

export default function EventDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [copied, setCopied] = useState(false);

    const isAdmin = !!user;

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        async function fetchEvent() {
            try {
                const res = await fetch(`/api/events/${id}`);
                const data = await res.json();
                if (data.success) {
                    setEvent(data.data);
                } else {
                    setNotFound(true);
                }
            } catch {
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        }
        fetchEvent();
    }, [id]);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-primary">
                <span className="material-icons-round animate-spin text-4xl">refresh</span>
            </div>
        );
    }

    if (notFound || !event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-dark border border-white/10 flex items-center justify-center">
                    <span className="material-icons-round text-3xl text-gray-500">event_busy</span>
                </div>
                <p className="text-white font-bold text-lg">Event not found</p>
                <p className="text-gray-500 text-sm">This event may have been removed or doesn't exist.</p>
                <Link href="/" className="flex items-center gap-2 bg-primary text-background-dark font-bold px-5 py-2.5 rounded-full text-sm hover:bg-primary/90 transition-colors">
                    <span className="material-icons-round text-sm">arrow_back</span>
                    Back to Home
                </Link>
            </div>
        );
    }

    const eventDate = new Date(event.startTime);
    const past = isPast(eventDate);
    const status = event.status || 'planning';
    const statusConfig = {
        confirmed: { label: 'Confirmed', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
        cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
        planning: { label: 'Planning', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    }[status] ?? { label: status, color: 'bg-white/10 text-gray-400 border-white/10' };

    return (
        <div className="flex flex-col min-h-screen">

            {/* Hero Section */}
            <div className="relative">
                {event.imageUrl ? (
                    <div className="w-full h-64 relative overflow-hidden">
                        <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background-dark" />
                    </div>
                ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-primary/10 via-surface-dark to-background-dark flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 30% 50%, #13ec5b 0%, transparent 60%), radial-gradient(circle at 80% 20%, #13ec5b 0%, transparent 50%)'
                        }} />
                        <span className="material-icons-round text-7xl text-primary/20">event</span>
                    </div>
                )}

                {/* Back button */}
                <button
                    onClick={() => router.push('/')}
                    className="absolute top-12 left-4 w-9 h-9 rounded-full bg-background-dark/80 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white hover:bg-background-dark transition-colors shadow-lg"
                >
                    <span className="material-icons-round text-base">arrow_back</span>
                </button>

                {/* Share button */}
                <button
                    onClick={handleCopyLink}
                    className="absolute top-12 right-4 flex items-center gap-1.5 h-9 px-3 rounded-full bg-background-dark/80 backdrop-blur-sm border border-white/10 text-white hover:bg-background-dark transition-colors shadow-lg"
                >
                    <span className="material-icons-round text-sm">{copied ? 'check' : 'ios_share'}</span>
                    <span className="text-xs font-bold">{copied ? 'Copied!' : 'Share'}</span>
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-5 pb-10 -mt-4 relative z-10">

                {/* Status + Title */}
                <div className="mb-5">
                    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border mb-3 ${statusConfig.color}`}>
                        {statusConfig.label}
                        {past && status !== 'cancelled' && (
                            <span className="ml-1.5 opacity-60">· Past</span>
                        )}
                    </span>
                    <h1 className="text-2xl font-black text-white leading-tight">{event.title}</h1>
                </div>

                {/* Date/Time Card */}
                <div className="bg-surface-dark rounded-2xl border border-white/8 p-4 mb-4">
                    <div className="flex items-center gap-4">
                        {/* Big date badge */}
                        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-primary/10 border border-primary/25 flex flex-col items-center justify-center shadow-inner">
                            <span className="text-[10px] font-bold uppercase text-primary leading-none tracking-wider">{format(eventDate, 'MMM')}</span>
                            <span className="text-3xl font-black text-white leading-none mt-0.5">{format(eventDate, 'd')}</span>
                            <span className="text-[9px] font-semibold text-gray-400 leading-none mt-0.5">{format(eventDate, 'yyyy')}</span>
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-gray-200">{format(eventDate, 'EEEE')}</p>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="material-icons-round text-sm text-primary">schedule</span>
                                <span className="text-base font-black text-primary">{format(eventDate, 'h:mm a')}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">{format(eventDate, 'MMMM d, yyyy')}</p>
                        </div>
                    </div>
                </div>

                {/* Countdown (only for upcoming) */}
                {!past && (
                    <div className="bg-surface-dark rounded-2xl border border-white/8 p-4 mb-4">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 text-center mb-3">Countdown</p>
                        <Countdown targetDate={eventDate} />
                    </div>
                )}

                {/* Description */}
                {event.description && (
                    <div className="bg-surface-dark rounded-2xl border border-white/8 p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="material-icons-round text-sm text-primary">description</span>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">About</p>
                        </div>
                        <p className="text-sm text-gray-300 leading-relaxed">{event.description}</p>
                    </div>
                )}

                {/* Location */}
                <div className="bg-surface-dark rounded-2xl border border-white/8 p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="material-icons-round text-sm text-primary">location_on</span>
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Location</p>
                        </div>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] font-bold text-primary/70 hover:text-primary transition-colors"
                        >
                            <span className="material-icons-round text-xs">open_in_new</span>
                            Search Maps
                        </a>
                    </div>
                    <p className="text-sm font-bold text-white mb-3">{event.location}</p>

                    {/* Map embed or admin editor */}
                    {event.googleMapUrl ? (
                        <div className="space-y-3">
                            <MapIframe googleMapUrl={event.googleMapUrl} />
                            {isAdmin && (
                                <AdminMapEditor
                                    eventId={event._id}
                                    currentUrl={event.googleMapUrl}
                                    onSaved={(url) => setEvent({ ...event, googleMapUrl: url })}
                                />
                            )}
                        </div>
                    ) : (
                        <div>
                            {isAdmin ? (
                                <AdminMapEditor
                                    eventId={event._id}
                                    currentUrl=""
                                    onSaved={(url) => setEvent({ ...event, googleMapUrl: url })}
                                />
                            ) : (
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-background-dark rounded-xl border border-dashed border-white/10 text-gray-500 hover:text-primary hover:border-primary/30 transition-colors group text-sm font-medium"
                                >
                                    <span className="material-icons-round text-base group-hover:text-primary transition-colors">map</span>
                                    Search on Google Maps
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* Created by */}
                <div className="flex items-center gap-2 px-1">
                    <span className="material-icons-round text-xs text-gray-600">person</span>
                    <p className="text-xs text-gray-600">Created by <span className="text-gray-400 font-semibold">{event.createdBy}</span></p>
                </div>

            </div>
        </div>
    );
}
