'use client';

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';

interface ModalProps {
    isOpen: boolean;
    closeModal: () => void;
    title: string;
    children: React.ReactNode;
}

function BaseModal({ isOpen, closeModal, title, children }: ModalProps) {
    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-surface-dark p-6 text-left align-middle shadow-xl transition-all border border-white/10">
                                <Dialog.Title
                                    as="h3"
                                    className="text-lg font-bold leading-6 text-white mb-4"
                                >
                                    {title}
                                </Dialog.Title>
                                {children}
                            </Dialog.Panel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

interface TransactionData {
    amount: number;
    description: string;
    category: string;
    player?: string; // Player ID
    type?: 'income' | 'expense';
}

interface AddTransactionModalProps {
    isOpen: boolean;
    closeModal: () => void;
    type: 'income' | 'expense';
    onSave: (data: TransactionData) => Promise<void>;
    players?: Player[]; // Pass players for selection
}

export function AddTransactionModal({ isOpen, closeModal, type, onSave, players = [] }: AddTransactionModalProps) {
    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        category: '',
        player: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data: TransactionData = {
            amount: Number(formData.amount),
            description: formData.description,
            category: formData.category,
            type,
        };
        if (formData.player) {
            data.player = formData.player;
        }
        await onSave(data);
        setFormData({ amount: '', description: '', category: '', player: '' });
        closeModal();
    };

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} title={`Add ${type === 'income' ? 'Fund' : 'Expense'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Amount</label>
                    <input
                        type="number"
                        required
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    />
                </div>

                {/* For Income (Add Fund), show Player Select if available */}
                {type === 'income' && players && players.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Supporter (Player)</label>
                        <select
                            className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary appearance-none"
                            value={formData.player}
                            onChange={(e) => {
                                const selectedPlayerId = e.target.value;
                                const selectedPlayer = players.find(p => p._id === selectedPlayerId);
                                setFormData({
                                    ...formData,
                                    player: selectedPlayerId,
                                    // Auto-fill description with player name if empty
                                    description: formData.description || (selectedPlayer ? selectedPlayer.name : '')
                                });
                            }}
                        >
                            <option value="">Select a Player</option>
                            {players.map((p) => (
                                <option key={p._id} value={p._id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-400">Description</label>
                    <input
                        type="text"
                        required
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                </div>

                {/* Only show Category for Expenses */}
                {type === 'expense' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-400">Category</label>
                        <input
                            type="text"
                            placeholder='e.g. Equipment, Travel'
                            className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    </div>
                )}

                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-bold bg-primary text-background-dark rounded-lg hover:bg-primary/90">Save</button>
                </div>
            </form>
        </BaseModal>
    );
}

interface Player {
    _id: string;
    name: string;
    position: string;
    number: number;
    imageUrl: string;
    goals: number;
    assists: number;
}

interface PlayerModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSave: (data: FormData) => Promise<void>;
    player?: Player | null;
}

export function PlayerModal({ isOpen, closeModal, onSave, player }: PlayerModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        position: '',
        number: '',
        goals: '0',
        assists: '0',
        image: null as File | null,
    });

    // Reset form when modal opens or player changes
    useState(() => {
        if (player) {
            setFormData({
                name: player.name,
                position: player.position,
                number: player.number.toString(),
                goals: player.goals.toString(),
                assists: player.assists.toString(),
                image: null,
            });
        } else {
            setFormData({
                name: '',
                position: '',
                number: '',
                goals: '0',
                assists: '0',
                image: null,
            });
        }
    });

    // Effect to update form data when player prop changes
    const [prevPlayer, setPrevPlayer] = useState<Player | null | undefined>(null);
    if (player !== prevPlayer) {
        setPrevPlayer(player);
        if (player) {
            setFormData({
                name: player.name,
                position: player.position,
                number: player.number.toString(),
                goals: player.goals.toString(),
                assists: player.assists.toString(),
                image: null,
            });
        } else {
            setFormData({
                name: '',
                position: '',
                number: '',
                goals: '0',
                assists: '0',
                image: null,
            });
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', formData.name);
        data.append('position', formData.position);
        data.append('number', formData.number);
        data.append('goals', formData.goals);
        data.append('assists', formData.assists);
        if (formData.image) {
            data.append('image', formData.image);
        }
        await onSave(data);
        closeModal();
    };

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} title={player ? "Edit Player" : "Add New Player"}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Name</label>
                    <input type="text" required className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-400">Position</label>
                        <input type="text" required className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                    </div>
                    <div className="w-1/3">
                        <label className="block text-sm font-medium text-gray-400">Number</label>
                        <input type="number" required className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white" value={formData.number} onChange={(e) => setFormData({ ...formData, number: e.target.value })} />
                    </div>
                </div>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-400">Goals</label>
                        <input type="number" className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white" value={formData.goals} onChange={(e) => setFormData({ ...formData, goals: e.target.value })} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-400">Assists</label>
                        <input type="number" className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white" value={formData.assists} onChange={(e) => setFormData({ ...formData, assists: e.target.value })} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Player Image {player && '(Optional)'}</label>
                    <input type="file" accept="image/*" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} />
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-bold bg-primary text-background-dark rounded-lg hover:bg-primary/90">Save</button>
                </div>
            </form>
        </BaseModal>
    );
}

interface ConfirmationModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onConfirm: () => Promise<void>;
    title: string;
    message: string;
}

export function ConfirmationModal({ isOpen, closeModal, onConfirm, title, message }: ConfirmationModalProps) {
    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} title={title}>
            <div className="space-y-4">
                <p className="text-gray-300 text-sm">{message}</p>
                <div className="flex justify-end gap-2 mt-6">
                    <button
                        type="button"
                        onClick={closeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            closeModal();
                        }}
                        className="px-4 py-2 text-sm font-bold bg-red-500/10 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all shadow-lg shadow-red-500/20"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </BaseModal>
    );
}


interface EventData {
    title: string;
    description: string;
    startTime: string;
    location: string;
    createdBy: string;
}

interface EventModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSave: (formData: FormData) => Promise<void>;
    createdBy: string;
}

export function EventModal({ isOpen, closeModal, onSave, createdBy }: EventModalProps) {
    const [fields, setFields] = useState({ title: '', description: '', startTime: '', location: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        setPreview(file ? URL.createObjectURL(file) : null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const fd = new FormData();
        fd.append('title', fields.title);
        fd.append('description', fields.description);
        fd.append('startTime', fields.startTime);
        fd.append('location', fields.location);
        fd.append('createdBy', createdBy);
        if (imageFile) fd.append('image', imageFile);
        await onSave(fd);
        setFields({ title: '', description: '', startTime: '', location: '' });
        setImageFile(null);
        setPreview(null);
        closeModal();
    };

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} title="Create Event">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Title</label>
                    <input type="text" required placeholder="e.g. Match vs City FC"
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Description</label>
                    <textarea required rows={3} placeholder="Event details..."
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary resize-none"
                        value={fields.description} onChange={(e) => setFields({ ...fields, description: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Date & Time</label>
                    <input type="datetime-local" required
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        value={fields.startTime} onChange={(e) => setFields({ ...fields, startTime: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Location</label>
                    <input type="text" required placeholder="e.g. Thunder Stadium, Main St"
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        value={fields.location} onChange={(e) => setFields({ ...fields, location: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Image (optional)</label>
                    {preview && <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg mb-2" />}
                    <label className="flex items-center gap-2 cursor-pointer w-full bg-background-dark border border-dashed border-gray-600 hover:border-primary rounded-lg px-3 py-2 text-gray-400 hover:text-primary transition-colors">
                        <span className="material-icons-round text-base">upload</span>
                        <span className="text-sm">{imageFile ? imageFile.name : 'Choose image...'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </label>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-bold bg-primary text-background-dark rounded-lg hover:bg-primary/90">Create Event</button>
                </div>
            </form>
        </BaseModal>
    );
}

interface EditEventModalProps {
    isOpen: boolean;
    closeModal: () => void;
    onSave: (id: string, formData: FormData) => Promise<void>;
    event: { _id: string; title: string; description: string; startTime: string; location: string; imageUrl?: string } | null;
}

export function EditEventModal({ isOpen, closeModal, onSave, event }: EditEventModalProps) {
    const [fields, setFields] = useState({ title: '', description: '', startTime: '', location: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (event) {
            setFields({
                title: event.title,
                description: event.description,
                startTime: event.startTime.slice(0, 16),
                location: event.location,
            });
            setPreview(event.imageUrl || null);
            setImageFile(null);
        }
    }, [event]);

    const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        setPreview(file ? URL.createObjectURL(file) : (event?.imageUrl || null));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!event) return;
        const fd = new FormData();
        fd.append('title', fields.title);
        fd.append('description', fields.description);
        fd.append('startTime', fields.startTime);
        fd.append('location', fields.location);
        if (imageFile) fd.append('image', imageFile);
        await onSave(event._id, fd);
        closeModal();
    };

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} title="Edit Event">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400">Title</label>
                    <input type="text" required
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        value={fields.title} onChange={(e) => setFields({ ...fields, title: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Description</label>
                    <textarea rows={3}
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary resize-none"
                        value={fields.description} onChange={(e) => setFields({ ...fields, description: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Date & Time</label>
                    <input type="datetime-local" required
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        value={fields.startTime} onChange={(e) => setFields({ ...fields, startTime: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400">Location</label>
                    <input type="text" required
                        className="w-full bg-background-dark border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
                        value={fields.location} onChange={(e) => setFields({ ...fields, location: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Image</label>
                    {preview && <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg mb-2" />}
                    <label className="flex items-center gap-2 cursor-pointer w-full bg-background-dark border border-dashed border-gray-600 hover:border-primary rounded-lg px-3 py-2 text-gray-400 hover:text-primary transition-colors">
                        <span className="material-icons-round text-base">upload</span>
                        <span className="text-sm">{imageFile ? imageFile.name : 'Replace image...'}</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImage} />
                    </label>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={closeModal} className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-bold bg-primary text-background-dark rounded-lg hover:bg-primary/90">Save Changes</button>
                </div>
            </form>
        </BaseModal>
    );
}

interface SettingsModalProps {
    isOpen: boolean;
    closeModal: () => void;
    currentUser: {
        username: string;
        role: string;
    } | null;
    token: string | null;
}

export function SettingsModal({ isOpen, closeModal, currentUser, token }: SettingsModalProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'admins'>('profile');
    const [newAdminUsername, setNewAdminUsername] = useState('');
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [adminSuccess, setAdminSuccess] = useState('');
    const [adminError, setAdminError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setAdminError('');
        setAdminSuccess('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username: newAdminUsername, password: newAdminPassword }),
            });
            const data = await res.json();
            if (res.ok) {
                setAdminSuccess(`Admin "${data.data.username}" created successfully!`);
                setNewAdminUsername('');
                setNewAdminPassword('');
            } else {
                setAdminError(data.error || 'Failed to create admin');
            }
        } catch (err) {
            setAdminError('An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <BaseModal isOpen={isOpen} closeModal={closeModal} title="Settings">
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'profile' ? 'text-primary' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Profile
                    {activeTab === 'profile' && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary -mb-2.5 rounded-full"></div>
                    )}
                </button>
                {currentUser?.role === 'superuser' && (
                    <button
                        onClick={() => setActiveTab('admins')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'admins' ? 'text-primary' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Manage Admins
                        {activeTab === 'admins' && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary -mb-2.5 rounded-full"></div>
                        )}
                    </button>
                )}
            </div>

            {activeTab === 'profile' && (
                <div className="space-y-4">
                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                        <p className="text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Current User</p>
                        <p className="text-white font-bold text-lg flex items-center gap-2">
                            {currentUser?.username}
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase">
                                {currentUser?.role}
                            </span>
                        </p>
                    </div>
                </div>
            )}

            {activeTab === 'admins' && currentUser?.role === 'superuser' && (
                <div className="space-y-6">
                    <div>
                        <h4 className="text-white font-bold mb-4">Add New Admin</h4>
                        <form onSubmit={handleCreateAdmin} className="space-y-4">
                            {adminSuccess && (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-500 text-sm font-medium">
                                    {adminSuccess}
                                </div>
                            )}
                            {adminError && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm font-medium">
                                    {adminError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                                <input
                                    type="text"
                                    className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    value={newAdminUsername}
                                    onChange={(e) => setNewAdminUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    value={newAdminPassword}
                                    onChange={(e) => setNewAdminPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-background-dark font-bold py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Creating...' : 'Create Admin Account'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </BaseModal>
    );
}
