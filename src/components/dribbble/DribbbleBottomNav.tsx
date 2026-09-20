import React from 'react';
import { Home, MessageSquare, Settings, CalendarDays } from 'lucide-react';

export type DribbbleScreen = 'home' | 'scheduled' | 'calendar' | 'report' | 'classes' | 'chat' | 'diary' | 'attendance';

interface DribbbleBottomNavProps {
  currentScreen: DribbbleScreen;
  onSelect: (screen: DribbbleScreen) => void;
  unreadCount?: number;
}

export const DribbbleBottomNav: React.FC<DribbbleBottomNavProps> = ({
  currentScreen,
  onSelect,
  unreadCount = 3,
}) => {
  const base = 'relative p-3 rounded-full transition-all duration-200 active:scale-95';
  const active =
    'bg-[#8B0000] text-[#EDE7C7] border border-[#D4AF37] shadow-md shadow-[#8B0000]/40 scale-105';
  const idle = 'text-[#EDE7C7]/60 hover:text-[#EDE7C7] hover:bg-[#2D1605]';

  return (
    // On phones this dock floats just ABOVE the fixed app tab bar (see .above-bottom-nav in index.css);
    // from md up it sits at the bottom edge as before.
    <div className="fixed left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm sm:max-w-md above-bottom-nav">
      <div className="bg-[#200E01]/95 backdrop-blur-md rounded-[32px] px-6 py-2 shadow-[0_12px_40px_rgba(32,14,1,0.35)] border border-[#D4AF37]/30 flex items-center justify-between">
        {/* 1. Home */}
        <button
          id="dock-home-btn"
          onClick={() => onSelect('home')}
          className={`${base} ${currentScreen === 'home' ? active : idle}`}
          title="Campus Dashboard"
          aria-label="Campus Dashboard"
        >
          <Home className="w-5 h-5" />
        </button>

        {/* 2. Messages / Chat */}
        <button
          id="dock-chat-btn"
          onClick={() => onSelect('chat')}
          className={`${base} ${currentScreen === 'chat' ? active : idle}`}
          title="Parent-Teacher Chats"
          aria-label="Parent-Teacher Chats"
        >
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && currentScreen !== 'chat' && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#D4AF37] rounded-full ring-2 ring-[#200E01] animate-pulse" />
          )}
        </button>

        {/* 3. Calendar / Scheduled */}
        <button
          id="dock-calendar-btn"
          onClick={() => onSelect('calendar')}
          className={`${base} ${
            currentScreen === 'calendar' || currentScreen === 'scheduled' ? active : idle
          }`}
          title="Calender & Events"
          aria-label="Calender & Events"
        >
          <CalendarDays className="w-5 h-5" />
        </button>

        {/* 4. Settings / Classes */}
        <button
          id="dock-settings-btn"
          onClick={() => onSelect('classes')}
          className={`${base} ${currentScreen === 'classes' ? active : idle}`}
          title="My Classes & Roster"
          aria-label="My Classes & Roster"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
