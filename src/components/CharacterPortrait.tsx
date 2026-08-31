import React from 'react';
import { CharacterId } from '../types';

interface CharacterPortraitProps {
  characterId: CharacterId;
  size?: number;
  className?: string;
  showBadge?: boolean;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  size = 72,
  className = '',
  showBadge = false,
}) => {
  const renderAvatarSvg = () => {
    switch (characterId) {
      case 'maman_bozorg':
        // 👵 مامان بزرگ: چادر گل‌گلی، عینک گرد طلایی، لبخند مهربان
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="grandma-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f472b6" />
                <stop offset="100%" stopColor="#db2777" />
              </linearGradient>
              <pattern id="chador-pattern" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="6" cy="6" r="2.5" fill="#f43f5e" />
                <circle cx="6" cy="6" r="1" fill="#fef08a" />
                <circle cx="2" cy="2" r="1" fill="#a7f3d0" />
                <circle cx="10" cy="10" r="1" fill="#a7f3d0" />
              </pattern>
            </defs>
            {/* Background Circle */}
            <circle cx="50" cy="50" r="48" fill="url(#grandma-bg)" />

            {/* Chador Outer Drape */}
            <path
              d="M 20 85 C 15 45, 25 15, 50 15 C 75 15, 85 45, 80 85 Z"
              fill="#fffbeb"
              stroke="#fcd34d"
              strokeWidth="1.5"
            />
            <path
              d="M 20 85 C 15 45, 25 15, 50 15 C 75 15, 85 45, 80 85 Z"
              fill="url(#chador-pattern)"
              opacity="0.85"
            />

            {/* Inner Scarf Trim */}
            <path
              d="M 28 50 C 28 30, 40 24, 50 24 C 60 24, 72 30, 72 50 C 72 70, 60 76, 50 76 C 40 76, 28 70, 28 50 Z"
              fill="#fef3c7"
            />

            {/* Face Shape */}
            <ellipse cx="50" cy="50" rx="18" ry="20" fill="#fed7aa" />

            {/* Hair peeking */}
            <path d="M 36 40 Q 50 34 64 40" stroke="#94a3b8" strokeWidth="3" fill="none" />

            {/* Eyes & Warm Wrinkles */}
            <ellipse cx="43" cy="48" rx="2.5" ry="2" fill="#334155" />
            <ellipse cx="57" cy="48" rx="2.5" ry="2" fill="#334155" />
            <path d="M 37 47 Q 40 45 42 47" stroke="#ca8a04" strokeWidth="1" fill="none" />
            <path d="M 58 47 Q 60 45 63 47" stroke="#ca8a04" strokeWidth="1" fill="none" />

            {/* Eyeglasses (Round Gold) */}
            <circle cx="43" cy="48" r="6.5" fill="rgba(255,255,255,0.4)" stroke="#eab308" strokeWidth="1.5" />
            <circle cx="57" cy="48" r="6.5" fill="rgba(255,255,255,0.4)" stroke="#eab308" strokeWidth="1.5" />
            <line x1="49.5" y1="48" x2="50.5" y2="48" stroke="#eab308" strokeWidth="1.5" />

            {/* Cheeks & Smile */}
            <circle cx="38" cy="55" r="4" fill="#fda4af" opacity="0.6" />
            <circle cx="62" cy="55" r="4" fill="#fda4af" opacity="0.6" />
            <path d="M 44 58 Q 50 64 56 58" stroke="#b91c1c" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Chador Neck Pin */}
            <circle cx="50" cy="74" r="3" fill="#10b981" stroke="#fef08a" strokeWidth="1" />
          </svg>
        );

      case 'khaleh_zahra':
        // 🧕 خاله زهرا: روسری شاد و عینک آفتابی، سکه جمع‌کن حرفه‌ای
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="zahra-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="zahra-scarf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#zahra-bg)" />

            {/* Stylish Persian Scarf */}
            <path
              d="M 22 85 C 16 46, 26 16, 50 16 C 74 16, 84 46, 78 85 Z"
              fill="url(#zahra-scarf)"
            />
            {/* Scarf Gold Fringe Detail */}
            <path d="M 24 60 Q 50 48 76 60" stroke="#facc15" strokeWidth="2.5" fill="none" />

            {/* Face */}
            <ellipse cx="50" cy="50" rx="19" ry="21" fill="#fed7aa" />

            {/* Trendy Modern Hair Strand */}
            <path d="M 34 38 Q 42 32 48 38" stroke="#451a03" strokeWidth="3.5" fill="none" strokeLinecap="round" />

            {/* Trendy Gold Sunglasses */}
            <path
              d="M 34 44 L 46 44 L 44 52 L 36 52 Z"
              fill="#0f172a"
              stroke="#eab308"
              strokeWidth="1.5"
            />
            <path
              d="M 54 44 L 66 44 L 64 52 L 56 52 Z"
              fill="#0f172a"
              stroke="#eab308"
              strokeWidth="1.5"
            />
            <line x1="46" y1="46" x2="54" y2="46" stroke="#eab308" strokeWidth="1.5" />
            <path d="M 37 46 L 41 50" stroke="#38bdf8" strokeWidth="1" opacity="0.8" />
            <path d="M 57 46 L 61 50" stroke="#38bdf8" strokeWidth="1" opacity="0.8" />

            {/* Golden Hoop Earrings */}
            <circle cx="29" cy="56" r="3.5" fill="none" stroke="#facc15" strokeWidth="1.5" />
            <circle cx="71" cy="56" r="3.5" fill="none" stroke="#facc15" strokeWidth="1.5" />

            {/* Smile with Red Lipstick */}
            <path d="M 43 60 Q 50 67 57 60" stroke="#e11d48" strokeWidth="2.5" fill="#ffe4e6" strokeLinecap="round" />

            {/* Floating Gold Coin Badge */}
            <circle cx="78" cy="24" r="9" fill="#eab308" stroke="#fef08a" strokeWidth="1.5" />
            <text x="78" y="27" fontSize="10" fontWeight="bold" fill="#78350f" textAnchor="middle">2x</text>
          </svg>
        );

      case 'khaleh_maryam':
        // 👩‍💼 خاله مریم: عینک مهندسی، فرمان تیز و دقیق
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="maryam-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="maryam-scarf" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4c1d95" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#maryam-bg)" />

            {/* Scarf */}
            <path
              d="M 23 85 C 18 45, 27 16, 50 16 C 73 16, 82 45, 77 85 Z"
              fill="url(#maryam-scarf)"
            />

            {/* Face */}
            <ellipse cx="50" cy="49" rx="18" ry="20" fill="#fde68a" />

            {/* Hair */}
            <path d="M 33 36 Q 50 30 67 36" stroke="#172554" strokeWidth="3" fill="none" />

            {/* Precision Rectangular Glasses */}
            <rect x="33" y="43" width="13" height="9" rx="2" fill="rgba(255,255,255,0.4)" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="54" y="43" width="13" height="9" rx="2" fill="rgba(255,255,255,0.4)" stroke="#0284c7" strokeWidth="1.5" />
            <line x1="46" y1="47" x2="54" y2="47" stroke="#0284c7" strokeWidth="1.5" />
            <circle cx="39.5" cy="47.5" r="2" fill="#1e293b" />
            <circle cx="60.5" cy="47.5" r="2" fill="#1e293b" />

            {/* Focused Smirk */}
            <path d="M 44 60 Q 51 63 56 59" stroke="#991b1b" strokeWidth="2" fill="none" strokeLinecap="round" />

            {/* Steering Wheel Pin Badge */}
            <circle cx="50" cy="74" r="6" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
            <path d="M 47 74 L 53 74 M 50 71 L 50 77" stroke="#ffffff" strokeWidth="1" />
          </svg>
        );

      case 'amir_mahdi':
        // 🏎️ امیر مهدی: کلاه برعکس، لایی‌کش و دریفت‌باز
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="amir-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#amir-bg)" />

            {/* Hoodie Collar */}
            <path d="M 20 90 L 32 68 L 68 68 L 80 90 Z" fill="#dc2626" />
            <path d="M 42 68 L 50 82 L 58 68" stroke="#ffffff" strokeWidth="2" fill="none" />

            {/* Neck & Face */}
            <rect x="42" y="60" width="16" height="12" fill="#fed7aa" />
            <ellipse cx="50" cy="48" rx="20" ry="21" fill="#fed7aa" />

            {/* Backwards Snapback Cap */}
            <path d="M 28 38 C 28 20, 72 20, 72 38 Z" fill="#1e293b" />
            {/* Cap Brim Turned Backward */}
            <path d="M 38 18 Q 50 10 62 18" stroke="#dc2626" strokeWidth="4" fill="none" strokeLinecap="round" />
            {/* Street Cap Logo */}
            <circle cx="50" cy="28" r="4" fill="#ef4444" />
            <text x="50" y="31" fontSize="5" fontWeight="bold" fill="#ffffff" textAnchor="middle">AM</text>

            {/* Messy Hair strands */}
            <path d="M 30 40 L 26 48 L 33 46" stroke="#451a03" strokeWidth="2.5" fill="#451a03" />
            <path d="M 70 40 L 74 48 L 67 46" stroke="#451a03" strokeWidth="2.5" fill="#451a03" />

            {/* Cool Confident Eyes & Eyebrows */}
            <path d="M 36 42 L 44 44" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
            <path d="M 56 44 L 64 42" stroke="#451a03" strokeWidth="2" strokeLinecap="round" />
            <ellipse cx="40" cy="48" rx="3" ry="2.5" fill="#1e293b" />
            <ellipse cx="60" cy="48" rx="3" ry="2.5" fill="#1e293b" />

            {/* Cheek Band-Aid (Skater/Racer Vibe) */}
            <rect x="61" y="53" width="7" height="3.5" rx="1" fill="#fbbf24" transform="rotate(-15 64 54)" />

            {/* Cool Grin */}
            <path d="M 42 58 Q 50 66 58 58" stroke="#1e293b" strokeWidth="2.5" fill="#ffffff" strokeLinecap="round" />
          </svg>
        );

      case 'zandayi':
        // 💃 زندایی: عینک آفتابی لوکس، روسری براق، چراغ‌های رنگین‌کمانی RGB
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="zandayi-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6d28d9" />
              </linearGradient>
              <linearGradient id="rgb-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#zandayi-bg)" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="url(#rgb-ring)" strokeWidth="2.5" strokeDasharray="6 3" />

            {/* Glamorous Purple Scarf */}
            <path
              d="M 22 85 C 16 44, 25 15, 50 15 C 75 15, 84 44, 78 85 Z"
              fill="#581c87"
            />
            <path d="M 24 55 Q 50 42 76 55" stroke="#ec4899" strokeWidth="2" fill="none" />

            {/* Face */}
            <ellipse cx="50" cy="50" rx="18" ry="20" fill="#fde68a" />

            {/* Glamorous Big Gradient Sunglasses */}
            <path
              d="M 32 42 Q 46 41 46 51 Q 38 56 32 50 Z"
              fill="#1e1b4b"
              stroke="#f472b6"
              strokeWidth="1.5"
            />
            <path
              d="M 68 42 Q 54 41 54 51 Q 62 56 68 50 Z"
              fill="#1e1b4b"
              stroke="#f472b6"
              strokeWidth="1.5"
            />
            <line x1="46" y1="45" x2="54" y2="45" stroke="#f472b6" strokeWidth="1.5" />
            <path d="M 35 44 L 43 50" stroke="#a855f7" strokeWidth="1" opacity="0.8" />
            <path d="M 57 44 L 65 50" stroke="#a855f7" strokeWidth="1" opacity="0.8" />

            {/* Diamond Earring */}
            <polygon points="27,56 29,60 27,64 25,60" fill="#67e8f9" stroke="#ffffff" strokeWidth="0.5" />
            <polygon points="73,56 75,60 73,64 71,60" fill="#67e8f9" stroke="#ffffff" strokeWidth="0.5" />

            {/* Pink Lips */}
            <path d="M 43 61 Q 50 67 57 61" stroke="#db2777" strokeWidth="2.5" fill="#f43f5e" strokeLinecap="round" />
          </svg>
        );

      case 'ali':
        // 🧔 علی: اسطوره رانندگی، سبیل و ته ریش، کت چرم و عینک خلبانی
        return (
          <svg viewBox="0 0 100 100" width={size} height={size} className="overflow-visible">
            <defs>
              <linearGradient id="ali-bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#ali-bg)" />

            {/* Leather Jacket Collar */}
            <path d="M 18 90 L 32 64 L 68 64 L 82 90 Z" fill="#292524" />
            <path d="M 32 64 L 42 78 L 50 64" fill="#44403c" />
            <path d="M 68 64 L 58 78 L 50 64" fill="#44403c" />

            {/* Face & Head */}
            <ellipse cx="50" cy="46" rx="20" ry="22" fill="#fed7aa" />

            {/* Hair */}
            <path d="M 28 38 C 28 20, 72 20, 72 38 C 65 30, 35 30, 28 38 Z" fill="#1c1917" />

            {/* Pilot Aviator Sunglasses */}
            <path
              d="M 33 41 Q 45 40 45 52 Q 37 56 33 49 Z"
              fill="#09090b"
              stroke="#eab308"
              strokeWidth="1.5"
            />
            <path
              d="M 67 41 Q 55 40 55 52 Q 63 56 67 49 Z"
              fill="#09090b"
              stroke="#eab308"
              strokeWidth="1.5"
            />
            <line x1="45" y1="43" x2="55" y2="43" stroke="#eab308" strokeWidth="1.5" />
            <line x1="45" y1="46" x2="55" y2="46" stroke="#eab308" strokeWidth="1" />
            <path d="M 36 43 L 42 51" stroke="#64748b" strokeWidth="1" opacity="0.8" />
            <path d="M 58 43 L 64 51" stroke="#64748b" strokeWidth="1" opacity="0.8" />

            {/* Persian Mustache & Stubble */}
            <path
              d="M 38 58 Q 50 54 50 60 Q 50 54 62 58 Q 50 65 38 58 Z"
              fill="#1c1917"
            />
            <path d="M 44 65 Q 50 69 56 65" stroke="#1c1917" strokeWidth="1.5" fill="none" />

            {/* Stubble Jawline */}
            <path d="M 36 56 Q 50 72 64 56" stroke="#78716c" strokeWidth="2" strokeDasharray="1 2" fill="none" />

            {/* Legendary Driver Star Badge */}
            <polygon points="78,20 80,25 85,25 81,28 83,33 78,30 73,33 75,28 71,25 76,25" fill="#facc15" stroke="#ca8a04" strokeWidth="0.5" />
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <div
      id={`character-avatar-container-${characterId}`}
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl overflow-hidden shadow-md ${className}`}
      style={{ width: size, height: size }}
    >
      {renderAvatarSvg()}
    </div>
  );
};
