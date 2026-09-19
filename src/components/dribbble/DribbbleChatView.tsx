import React, { useState } from 'react';
import {
  ArrowLeft,
  Search,
  Send,
  Paperclip,
  CheckCheck,
  Phone,
  MoreVertical,
  Building2,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface DribbbleChatViewProps {
  onBack: () => void;
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  time: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  messages: Message[];
}

export const DribbbleChatView: React.FC<DribbbleChatViewProps> = ({ onBack }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [inputMessage, setInputMessage] = useState('');

  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'contact-1',
      name: 'Prof. Tariq Mahmood',
      role: 'Head of Physics & Senior Housemaster',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      lastMessage: 'Hamza has performed exceptionally well in today’s electromagnetic induction practical.',
      time: '11:30 AM',
      unreadCount: 2,
      messages: [
        {
          id: 'm1',
          sender: 'other',
          text: 'Assalam-o-Alaikum! Please ensure Hamza submits the Cambridge Physics journal report for Chapter 4 before Friday.',
          time: '09:30 AM',
        },
        {
          id: 'm2',
          sender: 'me',
          text: 'Walaikum Assalam Sir Tariq. He completed the observation tables and graph plotting yesterday evening.',
          time: '09:35 AM',
        },
        {
          id: 'm3',
          sender: 'other',
          text: 'Excellent. His lab precision is top tier. The Mid-Term syllabus revision schedule has also been published on the school datesheet.',
          time: '09:38 AM',
        },
      ],
    },
    {
      id: 'contact-2',
      name: 'Mrs. Shagufta Naz',
      role: 'Cambridge English & Urdu Literature Incharge',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
      lastMessage: 'Essays on Allama Iqbal’s poetry have been marked and distributed.',
      time: '10:15 AM',
      messages: [
        {
          id: 'm1',
          sender: 'other',
          text: 'Homework for Urdu Nazm tashreeh is uploaded in the Digital Blackboard Diary.',
          time: '10:00 AM',
        },
      ],
    },
    {
      id: 'contact-3',
      name: 'Dr. Imran Qureshi',
      role: 'Dean of Academics & Cambridge Registrar',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      lastMessage: 'Cambridge O-Level terminal examination statement of entry is ready for collection.',
      time: 'Yesterday',
      messages: [
        {
          id: 'm1',
          sender: 'other',
          text: 'Parents are cordially invited to the Academic House Council meeting this Saturday at 11:00 AM in the Grand Library Hall.',
          time: 'Yesterday',
        },
      ],
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !selectedContact) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setContacts((prev) =>
      prev.map((c) =>
        c.id === selectedContact.id
          ? {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: newMsg.text,
            }
          : c
      )
    );

    setSelectedContact((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMsg],
            lastMessage: newMsg.text,
          }
        : null
    );

    setInputMessage('');
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-[85vh] pb-24 bg-[#FAF8F2] text-[#200E01]">
      {/* If no contact is selected: show Contacts List */}
      {!selectedContact ? (
        <>
          {/* 1. Curved Golden Luxe Imperial Header */}
          <div className="bg-gradient-to-br from-[#8B0000] via-[#700000] to-[#5B0202] text-[#EDE7C7] rounded-b-[44px] px-5 sm:px-8 pt-5 pb-8 shadow-[0_12px_40px_rgba(139,0,0,0.3)] border-b-2 border-[#D4AF37]/50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <button
                onClick={onBack}
                className="p-2 -ml-2 rounded-xl bg-black/20 hover:bg-black/30 border border-[#D4AF37]/30 transition active:scale-95 text-[#EDE7C7]"
                title="Back to Home"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center">
                <span className="font-['Cinzel',serif] text-[10px] uppercase tracking-widest text-[#D4AF37] block">
                  Official Communication Desk
                </span>
                <h2 className="text-lg font-bold tracking-tight text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic">
                  Parent-Teacher Faculty Desk
                </h2>
              </div>

              <div className="w-10 h-10 rounded-full ring-2 ring-[#D4AF37] overflow-hidden shadow-sm bg-[#200E01]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative z-10 mt-5">
              <Search className="w-4 h-4 text-[#5B0202]/60 absolute left-4 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search faculty teacher, dean, or house counselor..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-[#200E01] text-xs font-semibold placeholder:text-[#200E01]/40 focus:outline-hidden shadow-md border border-[#EDE7C7]"
              />
            </div>
          </div>

          {/* 2. School Faculty Image Banner & Directory */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-6 space-y-4">
            
            {/* Faculty Hall Image Showcase */}
            <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#EDE7C7] bg-[#200E01] h-32 sm:h-40">
              <img
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&auto=format&fit=crop&q=80"
                alt="Library Faculty Consultation"
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#200E01] via-[#200E01]/75 to-transparent p-5 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-bold font-['Cinzel',serif]">
                  <Building2 className="w-4 h-4" />
                  <span>Senior Faculty Quadrangle • Academic Office Hours</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#EDE7C7] font-['Cormorant_Garamond',serif] italic mt-0.5">
                  Direct Line with Academic House Mentors
                </h3>
                <p className="text-xs text-[#EDE7C7]/80 mt-1 max-w-lg">
                  Scheduled consultation hours: Monday through Friday, 08:30 AM to 03:30 PM. Official inquiries and academic advice.
                </p>
              </div>
            </div>

            {/* Contacts Cards */}
            <div className="space-y-3">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className="bg-white rounded-[26px] p-4 sm:p-5 border border-[#EDE7C7] shadow-sm hover:shadow-md transition cursor-pointer flex items-center gap-4 group"
                >
                  <div className="relative">
                    <div className="w-13 h-13 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#D4AF37] shadow-sm">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#01411C] rounded-full ring-2 ring-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm sm:text-base text-[#200E01] truncate font-['Outfit',sans-serif] group-hover:text-[#8B0000] transition">
                        {contact.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-[#5B0202]/70 font-mono">
                        {contact.time}
                      </span>
                    </div>

                    <p className="text-xs text-[#8B0000] font-semibold mt-0.5">
                      {contact.role}
                    </p>

                    <p className="text-xs text-[#200E01]/75 truncate mt-1 font-medium">
                      {contact.lastMessage}
                    </p>
                  </div>

                  {contact.unreadCount ? (
                    <div className="w-6 h-6 rounded-full bg-[#8B0000] text-[#EDE7C7] font-black text-[11px] flex items-center justify-center shadow-xs border border-[#D4AF37]">
                      {contact.unreadCount}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        /* Conversation View with Golden Luxe theme */
        <div className="flex flex-col h-[85vh]">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8B0000] to-[#5B0202] text-[#EDE7C7] px-4 py-3.5 flex items-center justify-between rounded-b-3xl shadow-md border-b border-[#D4AF37]/40">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="p-2 rounded-xl bg-black/20 hover:bg-black/30 border border-[#D4AF37]/30 transition text-[#EDE7C7]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-[#D4AF37]">
                <img
                  src={selectedContact.avatar}
                  alt={selectedContact.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#EDE7C7] font-['Outfit',sans-serif]">
                  {selectedContact.name}
                </h3>
                <p className="text-[10px] text-[#EDE7C7]/80 font-medium">
                  {selectedContact.role}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="hidden sm:inline-block px-2.5 py-1 rounded-full bg-[#01411C] text-[#EDE7C7] text-[10px] font-bold border border-emerald-500/40">
                Official Campus Portal
              </span>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-w-2xl mx-auto w-full">
            {selectedContact.messages.map((m) => {
              const isMe = m.sender === 'me';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-[22px] text-xs font-medium leading-relaxed shadow-sm ${
                      isMe
                        ? 'bg-[#8B0000] text-[#EDE7C7] rounded-br-xs border border-[#D4AF37]/40'
                        : 'bg-white border border-[#EDE7C7] text-[#200E01] rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-[#5B0202]/70 font-semibold mt-1 px-1">
                    {m.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white border-t border-[#EDE7C7] max-w-2xl mx-auto w-full rounded-2xl shadow-sm mb-2">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <button
                type="button"
                className="p-2 rounded-xl text-[#5B0202] hover:bg-[#FAF8F2] transition"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your official message or academic query..."
                className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F2] text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#8B0000] border border-[#EDE7C7] text-[#200E01]"
              />

              <button
                type="submit"
                className="p-2.5 rounded-2xl bg-[#8B0000] text-[#EDE7C7] hover:bg-[#700000] shadow-md transition border border-[#D4AF37]/50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
