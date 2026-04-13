'use client';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Handshake, CalendarDays, MessageCircle, Send,
  Check, X, Clock, ChevronRight, Users, Bell,
  Heart, PartyPopper, UserCheck, Search, Filter
} from 'lucide-react';
import { 
  collection, query, where, getDocs, doc, getDoc,
  onSnapshot
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '@/lib/firebase';


const TABS = [
  { key: 'connections', label: 'Connections', icon: Handshake, color: 'text-brand-purple' },
  { key: 'events', label: 'Events', icon: PartyPopper, color: 'text-orange-500' },
  { key: 'messages', label: 'Messages', icon: MessageCircle, color: 'text-blue-500' },
  { key: 'sent', label: 'Sent', icon: Send, color: 'text-green-500' },
];

// ──────────────── Helpers ────────────────
function timeAgo(t) { return t; }

function typeLabel(item) {
  if (item.type === 'liked') return 'Wants to connect with you 💫';
  if (item.type === 'message') return 'Sent you a message';
  if (item.type === 'join_request') return `Wants to join your event`;
  if (item.type === 'invite') return 'Invited you to an event';
  if (item.type === 'dm') return 'Direct message';
  if (item.type === 'group') return `Group · ${item.members} members`;
  if (item.type === 'connection') return 'Connection request';
  if (item.type === 'event_join') return 'Event join request';
  return '';
}

function statusBadge(status) {
  if (status === 'pending') return (
    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
      <Clock size={11} /> Pending
    </span>
  );
  if (status === 'accepted') return (
    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
      <Check size={11} /> Accepted
    </span>
  );
  if (status === 'declined') return (
    <span className="flex items-center gap-1 text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
      <X size={11} /> Declined
    </span>
  );
}

// ──────────────── RequestCard ────────────────
function RequestCard({ item, onAccept, onDecline, showActions = true, showStatus = false, index }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.10)' }}
      className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm transition-all"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative shrink-0">
          <Image unoptimized width={100} height={100}  src={item.img} alt={item.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"  />
          {item.unread && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-purple rounded-full border-2 border-white" />
          )}
          {item.type === 'group' && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              <Users size={10} />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <h3 className="font-bold text-brand-dark text-base leading-tight">{item.name}</h3>
              <p className="text-xs text-brand-gray font-medium mt-0.5">{typeLabel(item)}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <span className="text-[11px] text-brand-gray">{item.time}</span>
              {showStatus && item.status && statusBadge(item.status)}
            </div>
          </div>

          {/* Event title badge */}
          {item.eventTitle && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-gray font-semibold bg-gray-50 rounded-xl px-3 py-1.5 w-fit border border-gray-100">
              <CalendarDays size={12} className="text-brand-purple" />
              {item.eventTitle}
            </div>
          )}

          {/* Message preview */}
          <p className="text-sm text-brand-gray mt-2 line-clamp-1 italic">"{item.preview}"</p>

          {/* Action buttons */}
          {showActions && item.status === 'pending' && (
            <div className="flex gap-2 mt-3">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => onAccept(item.id)}
                className="flex-1 py-2.5 bg-brand-dark text-white text-sm font-bold rounded-2xl flex items-center justify-center gap-1.5 shadow-sm hover:opacity-90">
                <UserCheck size={15} /> Accept
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => { onDecline(item.id); setDismissed(true); }}
                className="flex-1 py-2.5 border border-gray-200 text-brand-gray text-sm font-semibold rounded-2xl hover:bg-gray-50 hover:text-red-500 hover:border-red-200 transition-colors flex items-center justify-center gap-1.5">
                <X size={15} /> Decline
              </motion.button>
            </div>
          )}

          {/* Accepted state */}
          {showActions && item.status === 'accepted' && (
            <div className="flex gap-2 mt-3 items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
                <Check size={13} /> Connected
              </div>
              <Link href={`/messages/${item.chatId || item.id}`}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-dark border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
                <MessageCircle size={13} /> Start Chat <ChevronRight size={12} />
              </Link>
            </div>
          )}

          {/* Messages — just a "Reply" shortcut */}
          {!showActions && item.type !== undefined && (
            <div className="flex gap-2 mt-3">
              <Link href={`/messages/${item.chatId || item.id}`}
                className="flex items-center gap-1.5 text-xs font-bold text-brand-dark border border-gray-200 px-3 py-1.5 rounded-full hover:bg-gray-50 transition-colors">
                <MessageCircle size={13} /> Open Chat <ChevronRight size={12} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ──────────────── Message Card ────────────────
function MessageCard({ item, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2, boxShadow: '0 12px 32px -8px rgba(0,0,0,0.10)' }}
    >
      <Link href={`/messages/${item.chatId || item.id}`}
        className="flex items-center gap-4 bg-white rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all block">
        <div className="relative shrink-0">
          <Image unoptimized width={100} height={100}  src={item.img} alt={item.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"  />
          {item.unread && (
            <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-brand-purple rounded-full border-2 border-white" />
          )}
          {item.type === 'group' && (
            <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
              <Users size={10} />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h3 className={`font-bold text-brand-dark text-base ${item.unread ? 'font-extrabold' : ''}`}>{item.name}</h3>
            <span className="text-[11px] text-brand-gray shrink-0 ml-2">{item.time}</span>
          </div>
          <p className="text-xs text-brand-gray font-medium">{typeLabel(item)}</p>
          <p className={`text-sm mt-0.5 line-clamp-1 ${item.unread ? 'text-brand-dark font-semibold' : 'text-brand-gray'}`}>
            {item.preview}
          </p>
        </div>
        {item.unread && (
          <div className="w-2.5 h-2.5 bg-brand-purple rounded-full shrink-0" />
        )}
      </Link>
    </motion.div>
  );
}

// ──────────────── Empty State ────────────────
function EmptyState({ tab }) {
  const EMPTY = {
    connections: { emoji: '👀', title: 'No connection requests yet', sub: 'Start exploring and connect with people!' },
    events: { emoji: '🎉', title: 'No event requests yet', sub: 'Create an event or join one to get started!' },
    messages: { emoji: '💬', title: 'No messages yet', sub: 'Accept a connection request to start chatting!' },
    sent: { emoji: '📩', title: 'No sent requests yet', sub: 'Go to Explore and send someone a connection!' },
  };
  const e = EMPTY[tab] || EMPTY.connections;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="text-center py-20 flex flex-col items-center">
      <div className="text-6xl mb-4">{e.emoji}</div>
      <h3 className="text-xl font-bold text-brand-dark mb-2">{e.title}</h3>
      <p className="text-brand-gray text-sm max-w-xs">{e.sub}</p>
      <Link href="/explore"
        className="mt-6 px-6 py-3 bg-brand-dark text-white rounded-2xl font-bold text-sm shadow-lg hover:opacity-90">
        Explore People →
      </Link>
    </motion.div>
  );
}

// ──────────────── Main Page ────────────────
function RequestsPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('connections');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Auto-switch tab from query param (e.g. ?tab=messages when coming back from chat)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['connections', 'events', 'messages', 'sent'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [connections, setConnections] = useState([]);
  const [events, setEvents] = useState([]);
  const [sent] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);

  // Fetch real chats for the current user
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const chatsRef = collection(db, "chats");
        const q = query(chatsRef, where("participants", "array-contains", user.uid));
        
        const unsubscribeChats = onSnapshot(q, async (snapshot) => {
          const chatList = [];
          for (const chatDoc of snapshot.docs) {
            const chatData = chatDoc.data();
            const otherUid = chatData.participants?.find(p => p !== user.uid);
            
            let otherInfo = { 
              name: `ID: ${chatDoc.id.slice(0, 8)}`, 
              img: `https://ui-avatars.com/api/?name=${chatDoc.id.slice(0, 1)}&background=random` 
            };

            if (otherUid) {
              try {
                const uSnap = await getDoc(doc(db, 'users', otherUid));
                if (uSnap.exists()) {
                  const uData = uSnap.data();
                  otherInfo.name = uData.name || otherInfo.name;
                  otherInfo.img = uData.profilePic || uData.avatar || uData.photos?.[0] || otherInfo.img;
                }
              } catch (err) {
                console.error("Error fetching participant info:", err);
              }
            }

            chatList.push({
              id: chatDoc.id,
              chatId: chatDoc.id,
              name: otherInfo.name,
              img: otherInfo.img,
              preview: chatData.lastMessage || "No messages yet",
              time: chatData.updatedAt?.toDate ? chatData.updatedAt.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Now',
              unread: false, // can be implemented later with unread counts
              type: 'dm'
            });
          }
          setMessages(chatList);
          setMessagesLoading(false);
        }, (error) => {
          console.error("Error in chats sub:", error);
          setMessagesLoading(false);
        });

        return () => unsubscribeChats();
      } else {
        setMessages([]);
        setMessagesLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Badge counts
  const badges = {
    connections: connections.filter(c => c.status === 'pending' && c.unread).length,
    events: events.filter(e => e.status === 'pending' && e.unread).length,
    messages: messages.filter(m => m.unread).length,
    sent: 0,
  };

  const totalBadge = Object.values(badges).reduce((a, b) => a + b, 0);

  const accept = (list, setList, id) => setList(prev =>
    prev.map(item => item.id === id ? { ...item, status: 'accepted', unread: false } : item)
  );
  const decline = (list, setList, id) => setList(prev =>
    prev.map(item => item.id === id ? { ...item, status: 'declined' } : item)
  );

  const filterItems = (items) => {
    let result = items;
    if (filter === 'unread') result = result.filter(i => i.unread);
    if (search) result = result.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));
    return result;
  };

  const currentList = {
    connections: filterItems(connections),
    events: filterItems(events),
    messages: filterItems(messages),
    sent: filterItems(sent),
  }[activeTab];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-28 md:pb-10">
      <div className="max-w-2xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-brand-dark leading-tight">Requests</h1>
            <p className="text-brand-gray text-sm mt-1 font-medium">
              {totalBadge > 0 ? `${totalBadge} new activity` : 'You\'re all caught up 🎉'}
            </p>
          </div>
          {totalBadge > 0 && (
            <div className="w-10 h-10 bg-brand-purple rounded-full flex items-center justify-center shadow-lg">
              <Bell size={18} className="text-white" />
            </div>
          )}
        </div>

        {/* Search + Filter row */}
        <div className="flex gap-3 mb-5">
          <div className="flex-1 flex items-center bg-white border border-gray-200 rounded-2xl px-4 py-2.5 gap-2">
            <Search size={15} className="text-brand-gray shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name…"
              className="flex-1 outline-none text-sm text-brand-dark bg-transparent"
            />
          </div>
          <div className="flex gap-1 bg-white border border-gray-200 rounded-2xl p-1">
            {['all', 'unread'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${filter === f ? 'bg-brand-dark text-white' : 'text-brand-gray hover:text-brand-dark'}`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1.5 mb-6 shadow-sm overflow-x-auto scrollbar-hide">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <motion.button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all flex-1 justify-center ${
                  isActive ? 'bg-brand-dark text-white shadow-sm' : 'text-brand-gray hover:text-brand-dark'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-white' : tab.color} />
                {tab.label}
                {badges[tab.key] > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                      isActive ? 'bg-white text-brand-dark' : 'bg-brand-purple text-white'
                    }`}
                  >
                    {badges[tab.key]}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {currentList.length === 0 ? (
              <EmptyState tab={search || filter === 'unread' ? 'connections' : activeTab} />
            ) : activeTab === 'messages' ? (
              messagesLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-10 h-10 border-4 border-brand-purple border-t-transparent rounded-full animate-spin" />
                  <p className="text-brand-gray text-sm font-medium">Fetching messages...</p>
                </div>
              ) : (
                currentList.map((item, i) => <MessageCard key={item.id} item={item} index={i} />)
              )
            ) : activeTab === 'sent' ? (
              currentList.map((item, i) => (
                <RequestCard key={item.id} item={item} index={i}
                  showActions={false} showStatus={true}
                  onAccept={() => {}} onDecline={() => {}}
                />
              ))
            ) : (
              <AnimatePresence>
                {currentList.map((item, i) => (
                  <RequestCard
                    key={item.id} item={item} index={i}
                    showActions={true} showStatus={false}
                    onAccept={(id) => {
                      if (activeTab === 'connections') accept(connections, setConnections, id);
                      if (activeTab === 'events') accept(events, setEvents, id);
                    }}
                    onDecline={(id) => {
                      if (activeTab === 'connections') decline(connections, setConnections, id);
                      if (activeTab === 'events') decline(events, setEvents, id);
                    }}
                  />
                ))}
              </AnimatePresence>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams (Next.js App Router requirement)
import { Suspense } from 'react';
function RequestsPageWrapper() {
  return (
    <Suspense fallback={null}>
      <RequestsPage />
    </Suspense>
  );
}
export default RequestsPageWrapper;
