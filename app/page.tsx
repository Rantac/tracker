'use client';

import { useState, useEffect, useCallback } from 'react';
import FinancialHeader from '@/components/FinancialHeader';
import PlayerCarousel from '@/components/PlayerCarousel';
import ActivityFeed from '@/components/ActivityFeed';
import EventFeed from '@/components/EventFeed';
import { AddTransactionModal, PlayerModal, ConfirmationModal, SettingsModal, EventModal, EditEventModal } from '@/components/AdminModals';
import LoginModal from '@/components/LoginModal';

interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  date: string;
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

interface Event {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  location: string;
  createdBy: string;
  imageUrl?: string;
}

interface NewTransactionData {
  amount: number;
  description: string;
  category: string;
  player?: string; // Player ID
  type?: 'income' | 'expense';
}

interface User {
  id: string;
  username: string;
  role: 'superuser' | 'admin';
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const isAdmin = !!user;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [isAddFundOpen, setIsAddFundOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isFabOpen, setIsFabOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  // Auth Modal States
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [transRes, playersRes, eventsRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/players'),
        fetch('/api/events'),
      ]);
      const transData = await transRes.json();
      const playersData = await playersRes.json();
      const eventsData = await eventsRes.json();

      if (transData.success) setTransactions(transData.data);
      if (playersData.success) setPlayers(playersData.data);
      if (eventsData.success) setEvents(eventsData.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    fetchData();
  }, [fetchData]);

  const handleLoginSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsFabOpen(false); // Close FAB if open
  };

  const handleAddTransaction = async (data: NewTransactionData) => {
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add transaction', error);
    }
  };

  const handleAddPlayer = async (formData: FormData) => {
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to add player', error);
    }
  };

  const handleUpdatePlayer = async (formData: FormData) => {
    if (!editingPlayer) return;
    try {
      const res = await fetch(`/api/players/${editingPlayer._id}`, {
        method: 'PUT',
        body: formData,
      });
      if (res.ok) {
        fetchData();
        setEditingPlayer(null);
      }
    } catch (error) {
      console.error('Failed to update player', error);
    }
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactionToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeletePlayer = (player: Player) => {
    setPlayerToDelete(player);
    setIsDeleteConfirmOpen(true);
  }

  const handleAddEvent = async (formData: FormData) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to add event', error);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEventToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const handleEditEvent = async (id: string, formData: FormData) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PATCH',
        body: formData,
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error('Failed to update event', error);
    }
  };

  const confirmDelete = async () => {
    if (transactionToDelete) {
      try {
        const res = await fetch(`/api/transactions/${transactionToDelete}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchData();
          setTransactionToDelete(null);
        }
      } catch (error) {
        console.error('Failed to delete transaction', error);
      }
    } else if (playerToDelete) {
      try {
        const res = await fetch(`/api/players/${playerToDelete._id}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchData();
          setPlayerToDelete(null);
        }
      } catch (error) {
        console.error('Failed to delete player', error);
      }
    } else if (eventToDelete) {
      try {
        const res = await fetch(`/api/events/${eventToDelete}`, {
          method: 'DELETE',
        });
        if (res.ok) {
          fetchData();
          setEventToDelete(null);
        }
      } catch (error) {
        console.error('Failed to delete event', error);
      }
    }
  };

  // Calculations
  const totalFund = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalSpent = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = totalFund - totalSpent;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-primary">
        <span className="material-icons-round animate-spin text-4xl">refresh</span>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background-dark shadow-neon">
            <span className="material-icons-round text-2xl">sports_soccer</span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">FC Thunder</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              {isAdmin ? 'Admin Dashboard' : 'Public Dashboard'}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <button
            onClick={() => setIsLoginOpen(true)}
            className="flex items-center gap-2 bg-surface-dark hover:bg-surface-dark/80 text-gray-400 hover:text-white px-4 py-2 rounded-full transition-all"
          >
            <span className="material-icons-round text-sm">lock</span>
            <span className="text-xs font-bold">Admin Login</span>
          </button>
        )}
        {isAdmin && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-surface-dark hover:bg-red-500/10 text-gray-400 hover:text-red-500 px-4 py-2 rounded-full transition-all"
          >
            <span className="material-icons-round text-sm">logout</span>
            <span className="text-xs font-bold">Logout</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <FinancialHeader
          isAdmin={isAdmin}
          totalFund={totalFund}
          totalSpent={totalSpent}
          remaining={remaining}
          onAddFund={() => setIsAddFundOpen(true)}
          onAddExpense={() => setIsAddExpenseOpen(true)}
        />

        <EventFeed
          isAdmin={isAdmin}
          events={events}
          onDeleteEvent={handleDeleteEvent}
          onEditEvent={(event) => setEditingEvent(event)}
        />

        <PlayerCarousel
          isAdmin={isAdmin}
          players={players}
          onAddPlayer={() => setIsAddPlayerOpen(true)}
          onEditPlayer={(player) => setEditingPlayer(player)}
          onDeletePlayer={handleDeletePlayer}
        />

        <ActivityFeed
          isAdmin={isAdmin}
          transactions={transactions}
          onDeleteTransaction={handleDeleteTransaction}
        />


      </main>



      {/* Admin Footer Navigation */}
      {isAdmin && (
        <nav className="fixed bottom-0 w-full bg-background-light dark:bg-background-dark/95 backdrop-blur-lg border-t border-gray-200 dark:border-primary/10 pb-6 pt-3 px-6 z-50 max-w-md">
          <div className="flex justify-between items-end mx-auto">
            <button className="flex flex-col items-center gap-1 text-primary w-14">
              <span className="material-icons-round text-2xl">dashboard</span>
              <span className="text-[10px] font-medium">Dashboard</span>
            </button>



            {/* Quick Add FAB in Footer */}
            <div className="relative -top-5 flex flex-col items-center">
              {/* Expanded Options */}
              {isFabOpen && (
                <div className="absolute bottom-16 flex flex-row gap-4 items-center mb-2 animate-in slide-in-from-bottom-5 fade-in duration-200">
                  {/* Add Fund (Green) */}
                  <button
                    onClick={() => {
                      setIsAddFundOpen(true);
                      setIsFabOpen(false);
                    }}
                    className="w-28 flex items-center justify-center gap-2 bg-surface-dark border border-primary text-primary px-4 py-2 rounded-full shadow-lg hover:bg-primary/10 transition-colors whitespace-nowrap"
                  >
                    <span className="material-icons-round text-lg">add_circle</span>
                    <span className="text-xs font-bold">Fund</span>
                  </button>

                  {/* Add Expense (Red) */}
                  <button
                    onClick={() => {
                      setIsAddExpenseOpen(true);
                      setIsFabOpen(false);
                    }}
                    className="w-28 flex items-center justify-center gap-2 bg-surface-dark border border-red-500 text-red-500 px-4 py-2 rounded-full shadow-lg hover:bg-red-500/10 transition-colors whitespace-nowrap"
                  >
                    <span className="material-icons-round text-lg">remove_circle</span>
                    <span className="text-xs font-bold">Spend</span>
                  </button>

                  {/* Add Event (Blue) */}
                  <button
                    onClick={() => {
                      setIsAddEventOpen(true);
                      setIsFabOpen(false);
                    }}
                    className="w-28 flex items-center justify-center gap-2 bg-surface-dark border border-blue-400 text-blue-400 px-4 py-2 rounded-full shadow-lg hover:bg-blue-400/10 transition-colors whitespace-nowrap"
                  >
                    <span className="material-icons-round text-lg">event</span>
                    <span className="text-xs font-bold">Event</span>
                  </button>
                </div>
              )}

              {/* Main FAB */}
              <button
                onClick={() => setIsFabOpen(!isFabOpen)}
                className={`w-14 h-14 bg-surface-dark border border-primary rounded-full flex items-center justify-center text-primary shadow-lg shadow-primary/20 hover:scale-105 transition-all duration-300 ${isFabOpen ? 'rotate-45 bg-primary text-background-dark' : ''
                  }`}
              >
                <span className="material-icons-round text-3xl">add</span>
              </button>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="flex flex-col items-center gap-1 text-gray-400 hover:text-white transition-colors w-14"
            >
              <span className="material-icons-round text-2xl">settings</span>
              <span className="text-[10px] font-medium">Settings</span>
            </button>


          </div>
        </nav>
      )}

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddFundOpen}
        closeModal={() => setIsAddFundOpen(false)}
        type="income"
        onSave={handleAddTransaction}
        players={players}
      />
      <AddTransactionModal
        isOpen={isAddExpenseOpen}
        closeModal={() => setIsAddExpenseOpen(false)}
        type="expense"
        onSave={handleAddTransaction}
      />
      <PlayerModal
        isOpen={isAddPlayerOpen || !!editingPlayer}
        closeModal={() => {
          setIsAddPlayerOpen(false);
          setEditingPlayer(null);
        }}
        onSave={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
        player={editingPlayer}
      />
      <ConfirmationModal
        isOpen={isDeleteConfirmOpen}
        closeModal={() => {
          setIsDeleteConfirmOpen(false);
          setTransactionToDelete(null);
          setPlayerToDelete(null);
          setEventToDelete(null);
        }}
        onConfirm={confirmDelete}
        title={transactionToDelete ? "Delete Transaction" : playerToDelete ? "Delete Player" : "Delete Event"}
        message={transactionToDelete
          ? "Are you sure you want to delete this record? This action cannot be undone."
          : playerToDelete
          ? `Are you sure you want to delete ${playerToDelete?.name}? This action cannot be undone.`
          : "Are you sure you want to delete this event? This action cannot be undone."
        }
      />
      <LoginModal
        isOpen={isLoginOpen}
        closeModal={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        closeModal={() => setIsSettingsOpen(false)}
        currentUser={user}
        token={token}
      />
      <EventModal
        isOpen={isAddEventOpen}
        closeModal={() => setIsAddEventOpen(false)}
        onSave={handleAddEvent}
        createdBy={user?.username ?? ''}
      />
      <EditEventModal
        isOpen={!!editingEvent}
        closeModal={() => setEditingEvent(null)}
        onSave={handleEditEvent}
        event={editingEvent}
      />
    </>
  );
}
