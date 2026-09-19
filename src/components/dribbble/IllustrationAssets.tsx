import React from 'react';

// 1. Hero Card: History of Physics studying student
export const PhysicsIllustration: React.FC<{ className?: string }> = ({ className = 'w-28 h-28' }) => (
  <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Background warm glowing circles & atoms */}
    <circle cx="80" cy="80" r="65" fill="#FFF4E5" />
    <circle cx="120" cy="40" r="18" fill="#FFE2C6" opacity="0.6" />
    
    {/* Atom orbits */}
    <ellipse cx="122" cy="40" rx="16" ry="6" stroke="#FFA726" strokeWidth="1.5" strokeDasharray="2 2" transform="rotate(-30 122 40)" />
    <ellipse cx="122" cy="40" rx="16" ry="6" stroke="#FFA726" strokeWidth="1.5" strokeDasharray="2 2" transform="rotate(30 122 40)" />
    <circle cx="122" cy="40" r="3" fill="#E65100" />
    
    {/* Desk Lamp */}
    <path d="M35 125 L35 75 C35 60 50 60 55 60" stroke="#7E57C2" strokeWidth="3" strokeLinecap="round" />
    <path d="M52 52 L68 64 L50 72 Z" fill="#FFCA28" />
    <ellipse cx="59" cy="62" rx="6" ry="10" fill="#FFE082" />
    {/* Light cone */}
    <path d="M60 62 L95 125 L50 125 Z" fill="#FFF9C4" opacity="0.5" />
    <rect x="28" y="123" width="16" height="4" rx="2" fill="#5E35B1" />

    {/* Desk surface */}
    <rect x="20" y="125" width="120" height="6" rx="3" fill="#8D6E63" />

    {/* Open Book on desk */}
    <path d="M70 125 L88 118 L106 125 L88 122 Z" fill="#FFFFFF" stroke="#B0BEC5" strokeWidth="1" />
    <path d="M70 125 C78 122 84 122 88 122" stroke="#78909C" strokeWidth="1" />
    <path d="M88 122 C92 122 98 122 106 125" stroke="#78909C" strokeWidth="1" />

    {/* Student Character */}
    {/* Torso in bright yellow shirt */}
    <path d="M76 125 L80 96 C82 92 88 88 95 88 C102 88 108 92 110 96 L114 125 Z" fill="#FFA000" />
    {/* Collar / Tie */}
    <path d="M92 88 L95 95 L98 88 Z" fill="#D32F2F" />
    
    {/* Arms resting on desk */}
    <path d="M80 98 L72 115 L86 120" stroke="#FFA000" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M110 98 L118 115 L104 120" stroke="#FFA000" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="86" cy="120" r="4" fill="#FFCC80" />
    <circle cx="104" cy="120" r="4" fill="#FFCC80" />

    {/* Head & Neck */}
    <rect x="91" y="80" width="8" height="10" rx="3" fill="#FFCC80" />
    <circle cx="95" cy="74" r="14" fill="#FFCC80" />
    {/* Hair - Stylish dark curly hair */}
    <path d="M81 72 C80 60 90 56 98 56 C108 56 112 62 111 72 C108 67 104 65 98 66 C93 67 87 68 81 72 Z" fill="#212121" />
    <circle cx="84" cy="66" r="4" fill="#212121" />
    <circle cx="92" cy="60" r="5" fill="#212121" />
    <circle cx="101" cy="61" r="5" fill="#212121" />
    
    {/* Face details: glasses and smile */}
    <circle cx="91" cy="74" r="3.5" stroke="#212121" strokeWidth="1.2" fill="white" fillOpacity="0.4" />
    <circle cx="99" cy="74" r="3.5" stroke="#212121" strokeWidth="1.2" fill="white" fillOpacity="0.4" />
    <line x1="94.5" y1="74" x2="95.5" y2="74" stroke="#212121" strokeWidth="1.2" />
    <path d="M93 81 C95 83 97 83 99 81" stroke="#D84315" strokeWidth="1.2" strokeLinecap="round" />

    {/* Floating physics symbols */}
    <text x="110" y="78" fill="#7E57C2" fontSize="9" fontWeight="bold" fontFamily="monospace">E=mc²</text>
    <text x="42" y="100" fill="#E65100" fontSize="8" fontWeight="bold">λ=h/p</text>
  </svg>
);

// 2. Bento Card 1: My Scheduled (student at desk with laptop)
export const ScheduledIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft apricot background */}
    <rect width="120" height="120" rx="24" fill="#FFE9C9" opacity="0.4" />
    
    {/* Desk */}
    <rect x="15" y="85" width="90" height="5" rx="2.5" fill="#D7CCC8" />
    <rect x="25" y="90" width="4" height="20" rx="2" fill="#BCAAA4" />
    <rect x="91" y="90" width="4" height="20" rx="2" fill="#BCAAA4" />

    {/* Laptop */}
    <rect x="42" y="65" width="36" height="20" rx="2" fill="#42A5F5" />
    <rect x="44" y="67" width="32" height="16" rx="1" fill="#E3F2FD" />
    {/* Screen code/content */}
    <line x1="48" y1="72" x2="60" y2="72" stroke="#1E88E5" strokeWidth="2" strokeLinecap="round" />
    <line x1="48" y1="76" x2="68" y2="76" stroke="#90CAF9" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="48" y1="80" x2="56" y2="80" stroke="#90CAF9" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M38 85 L82 85 L80 88 L40 88 Z" fill="#90A4AE" />

    {/* Character behind laptop */}
    <circle cx="60" cy="42" r="10" fill="#FFB74D" />
    {/* Hair */}
    <path d="M50 40 C50 32 58 28 64 28 C72 28 72 34 71 40 C68 36 63 35 58 36 Z" fill="#3E2723" />
    {/* Shirt */}
    <path d="M48 65 L52 54 C54 52 58 50 62 50 C66 50 70 52 72 54 L76 65 Z" fill="#FF7043" />

    {/* Potted plant on desk */}
    <rect x="85" y="77" width="10" height="8" rx="2" fill="#FF8A65" />
    <path d="M90 77 C90 70 85 68 85 68 C85 68 88 74 90 77 Z" fill="#66BB6A" />
    <path d="M90 77 C90 69 95 67 95 67 C95 67 92 73 90 77 Z" fill="#4CAF50" />

    {/* Clock on wall */}
    <circle cx="28" cy="35" r="9" fill="#FFF" stroke="#FFA726" strokeWidth="2" />
    <polyline points="28,30 28,35 32,35" stroke="#E65100" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 3. Bento Card 2: My Calender (student with calendar checklist)
export const CalendarIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft rose background */}
    <rect width="120" height="120" rx="24" fill="#FFE2E6" opacity="0.4" />

    {/* Big Calendar Page */}
    <rect x="35" y="24" width="55" height="65" rx="8" fill="#FFFFFF" stroke="#FF8DA1" strokeWidth="2" />
    {/* Calendar Header */}
    <path d="M35 32 C35 28 38 24 43 24 L82 24 C87 24 90 28 90 32 L90 40 L35 40 Z" fill="#FF5274" />
    {/* Spiral binders */}
    <rect x="44" y="20" width="4" height="8" rx="2" fill="#D81B60" />
    <rect x="61" y="20" width="4" height="8" rx="2" fill="#D81B60" />
    <rect x="77" y="20" width="4" height="8" rx="2" fill="#D81B60" />

    {/* Calendar grid checkmarks and dots */}
    <circle cx="48" cy="50" r="3" fill="#4CAF50" />
    <circle cx="63" cy="50" r="3" fill="#FF5274" />
    <circle cx="78" cy="50" r="3" fill="#4CAF50" />
    <circle cx="48" cy="62" r="3" fill="#4CAF50" />
    <circle cx="63" cy="62" r="4" fill="#FF5274" />
    {/* Active star on day 13 */}
    <polygon points="78,58 80,63 85,63 81,66 82,71 78,68 74,71 75,66 71,63 76,63" fill="#FFA000" />
    <circle cx="48" cy="74" r="3" fill="#B0BEC5" />
    <circle cx="63" cy="74" r="3" fill="#B0BEC5" />
    <circle cx="78" cy="74" r="3" fill="#4CAF50" />

    {/* Student pointing with giant pencil */}
    <circle cx="24" cy="52" r="8" fill="#FFCC80" />
    {/* Hair */}
    <path d="M16 50 C16 42 22 38 27 38 C32 38 33 42 32 48 C30 44 26 44 22 45 Z" fill="#424242" />
    {/* Body */}
    <path d="M16 75 L18 64 C20 61 24 60 27 60 C30 60 34 61 36 64 L38 75 Z" fill="#7E57C2" />

    {/* Pencil */}
    <g transform="rotate(35 30 70)">
      <polygon points="26,45 30,35 34,45" fill="#FFA000" />
      <polygon points="29,37 30,35 31,37" fill="#212121" />
      <rect x="26" y="45" width="8" height="24" fill="#FFD54F" />
      <rect x="26" y="69" width="8" height="6" fill="#FF5252" />
    </g>
  </svg>
);

// 4. Bento Card 3: My Attendance (students in classroom)
export const AttendanceIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft mint cyan background */}
    <rect width="120" height="120" rx="24" fill="#D7F9F5" opacity="0.4" />

    {/* Classroom chalkboard in background */}
    <rect x="22" y="16" width="76" height="42" rx="6" fill="#1B5E20" stroke="#8D6E63" strokeWidth="3" />
    <text x="32" y="32" fill="#E8F5E9" fontSize="7" fontWeight="bold" fontFamily="sans-serif">TODAY: 100%</text>
    <polyline points="32,44 40,40 48,46 58,36 68,42" stroke="#81C784" strokeWidth="2" strokeLinecap="round" />

    {/* Desk row */}
    <rect x="15" y="78" width="90" height="6" rx="3" fill="#A1887F" />

    {/* Student 1 (Left, raising hand with smile) */}
    <circle cx="42" cy="62" r="9" fill="#FFE082" />
    <path d="M33 60 C33 52 39 48 45 48 C51 48 53 52 52 58 C49 54 44 54 40 55 Z" fill="#4E342E" />
    <path d="M34 82 L36 73 C38 71 42 70 46 70 C50 70 54 71 56 73 L58 82 Z" fill="#00897B" />
    {/* Hand raised high */}
    <path d="M54 73 L62 52 L67 53 L58 75 Z" fill="#00897B" />
    <circle cx="65" cy="50" r="4" fill="#FFE082" />

    {/* Student 2 (Right, listening attentively) */}
    <circle cx="80" cy="63" r="9" fill="#FFCC80" />
    <path d="M72 61 C72 53 77 49 83 49 C89 49 90 53 89 59 C87 55 82 55 78 56 Z" fill="#212121" />
    <path d="M72 82 L74 74 C76 72 80 71 84 71 C88 71 92 72 94 74 L96 82 Z" fill="#3949AB" />

    {/* Checkmark badge in corner */}
    <circle cx="95" cy="25" r="11" fill="#00C853" />
    <polyline points="90,25 94,29 101,21" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 5. Bento Card 4: Progress Report (student holding exam report card)
export const ReportIllustration: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Soft lavender background */}
    <rect width="120" height="120" rx="24" fill="#EDE4FF" opacity="0.4" />

    {/* Big report card document */}
    <rect x="42" y="24" width="56" height="74" rx="8" fill="#FFFFFF" stroke="#B39DDB" strokeWidth="2" />
    <rect x="48" y="32" width="32" height="6" rx="2" fill="#7E57C2" />
    
    {/* Bar chart graphics on report card */}
    <rect x="48" y="58" width="6" height="24" rx="2" fill="#B39DDB" />
    <rect x="58" y="48" width="6" height="34" rx="2" fill="#7E57C2" />
    <rect x="68" y="42" width="6" height="40" rx="2" fill="#5E35B1" />
    <rect x="78" y="52" width="6" height="30" rx="2" fill="#9575CD" />
    <line x1="46" y1="84" x2="88" y2="84" stroke="#D1C4E9" strokeWidth="1.5" />

    {/* A+ seal badge */}
    <circle cx="86" cy="35" r="10" fill="#FFD54F" stroke="#FFA000" strokeWidth="1.5" />
    <text x="81" y="39" fill="#D84315" fontSize="9" fontWeight="900" fontFamily="sans-serif">A+</text>

    {/* Happy Student celebrating */}
    <circle cx="28" cy="50" r="10" fill="#FFCC80" />
    <path d="M19 46 C19 37 27 34 33 34 C39 34 41 38 40 45 C37 41 32 41 28 42 Z" fill="#311B92" />
    <path d="M20 78 L22 66 C24 63 28 62 32 62 C36 62 40 63 42 66 L44 78 Z" fill="#673AB7" />
    {/* Cheering hand */}
    <path d="M22 66 L14 52 L19 50 L26 64 Z" fill="#673AB7" />
    <circle cx="15" cy="48" r="4" fill="#FFCC80" />
  </svg>
);

// 6. Upcoming Event 1: Pakistan Independence Day Illustration (14th August - Youm-e-Azadi)
export const PakistanIndependenceIllustration: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="80" height="80" rx="16" fill="#F0F7F2" />
    
    {/* Flagpole */}
    <rect x="15" y="12" width="3.5" height="56" rx="1.5" fill="#4E342E" />
    {/* Golden finial top ball */}
    <circle cx="16.75" cy="12" r="3" fill="#D4AF37" />

    {/* Pakistan National Flag: White vertical bar (1/4) on hoist, Deep dark green field (3/4) */}
    <g filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))">
      {/* White hoist field (1/4 width) */}
      <path d="M18.5 16 H29 V44 H18.5 Z" fill="#FFFFFF" />
      {/* Dark green fly field (3/4 width) #01411C official Pakistan green */}
      <path d="M29 16 H62 C63 16 63.5 16.5 63.5 17.5 V42.5 C63.5 43.5 63 44 62 44 H29 Z" fill="#01411C" />

      {/* White Crescent tilted towards top right */}
      <circle cx="45" cy="30" r="8" fill="#FFFFFF" />
      <circle cx="47.5" cy="28.5" r="7.2" fill="#01411C" />

      {/* 5-Pointed White Star positioned at the tip */}
      <polygon
        points="48,24 49.3,27 52.5,27.3 50,29.5 50.8,32.6 48,31 45.2,32.6 46,29.5 43.5,27.3 46.7,27"
        fill="#FFFFFF"
      />
    </g>

    {/* Student in School Uniform with green sash / crescent badge celebrating */}
    <circle cx="50" cy="58" r="6" fill="#FFCC80" />
    {/* Cap / Hair */}
    <path d="M44 56 C44 51 47 48 51 48 C55 48 57 51 56 55 C54 53 50 53 46 54 Z" fill="#212121" />
    {/* Uniform blazer in school deep crimson #8B0000 */}
    <path d="M43 72 L45 64 C47 62 50 61 53 61 C56 61 59 62 61 64 L63 72 Z" fill="#8B0000" />
    {/* School Tie in white and gold */}
    <path d="M52 61 L53 66 L54 61 Z" fill="#D4AF37" />
  </svg>
);

// Backward compatibility alias
export const IndependenceDayIllustration = PakistanIndependenceIllustration;

// 7. Upcoming Event 2: Pakistan Day / Iqbal Day / Science & Sports Olympiad
export const PakistanDayIllustration: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect width="80" height="80" rx="16" fill="#FAF5E8" />
    
    {/* Minar-e-Pakistan / Arch Monument Silhouette */}
    <path d="M38 18 L42 18 L43 54 L37 54 Z" fill="#01411C" />
    <path d="M36 54 L44 54 L46 62 L34 62 Z" fill="#2E7D32" />
    <path d="M32 62 L48 62 L51 68 L29 68 Z" fill="#388E3C" />
    {/* Dome apex */}
    <circle cx="40" cy="17" r="2.5" fill="#D4AF37" />
    
    {/* Laurel wreath in gold #D4AF37 */}
    <path d="M24 38 C22 46 25 56 34 62" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M56 38 C58 46 55 56 46 62" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" />
    
    {/* Golden Star at top */}
    <polygon points="40,24 41,26.5 43.5,26.8 41.5,28.5 42.1,31 40,29.8 37.9,31 38.5,28.5 36.5,26.8 39,26.5" fill="#D4AF37" />
  </svg>
);

// Backward compatibility alias
export const YogaIllustration = PakistanDayIllustration;
