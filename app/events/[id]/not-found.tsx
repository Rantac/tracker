import Link from 'next/link';

export default function EventNotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-6 text-center bg-background-dark">
            <div className="w-16 h-16 rounded-2xl bg-surface-dark border border-white/10 flex items-center justify-center">
                <span className="material-icons-round text-3xl text-gray-500">event_busy</span>
            </div>
            <p className="text-white font-bold text-lg">Event not found</p>
            <p className="text-gray-500 text-sm">This event may have been removed or doesn&apos;t exist.</p>
            <Link
                href="/"
                className="flex items-center gap-2 bg-primary text-background-dark font-bold px-5 py-2.5 rounded-full text-sm hover:bg-primary/90 transition-colors"
            >
                <span className="material-icons-round text-sm">arrow_back</span>
                Back to Home
            </Link>
        </div>
    );
}
