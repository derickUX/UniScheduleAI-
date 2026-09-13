import React from 'react';

interface AstranovaLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export const AstranovaLogo: React.FC<AstranovaLogoProps> = ({
  className = '',
  size = 36,
  showText = false,
  textColor = 'text-white',
}) => {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-md"
        aria-label="Astranova Interlocking Star Logo"
      >
        <defs>
          <linearGradient
            id="purpleStarGrad"
            x1="120"
            y1="80"
            x2="380"
            y2="420"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#A855F7" />
            <stop offset="35%" stopColor="#9333EA" />
            <stop offset="70%" stopColor="#7E22CE" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>

          <linearGradient
            id="whiteStarGrad"
            x1="160"
            y1="380"
            x2="400"
            y2="200"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="50%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          <filter id="knotShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.45" />
          </filter>
        </defs>

        <g transform="translate(0, 5)">
          {/* Layer 1: Base Purple 3-Lobed Star Loop (Top, Bottom-Right, Top-Left) */}
          <path
            d="M 256 96
               C 285 96 304 128 300 162
               C 294 212 308 245 338 274
               C 368 304 402 334 380 368
               C 360 400 324 402 292 376
               C 256 348 224 350 188 376
               C 156 402 120 400 100 368
               C 78 334 112 304 142 274
               C 172 245 186 212 180 162
               C 176 128 195 96 224 96
               Z"
            stroke="url(#purpleStarGrad)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Layer 2: White 2-Lobed Oblong Loop (Top-Right, Bottom-Left) with drop shadow */}
          <path
            d="M 408 214
               C 434 238 418 272 382 296
               C 334 328 284 354 220 376
               C 176 392 140 388 126 364
               C 112 338 128 306 164 282
               C 212 250 272 224 340 204
               C 378 192 396 200 408 214
               Z"
            stroke="url(#whiteStarGrad)"
            strokeWidth="36"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            filter="url(#knotShadow)"
          />

          {/* Layer 3: Interlocking Overlays - Purple over White at Top-Right */}
          <path
            d="M 288 140
               C 294 185 308 230 338 270"
            stroke="url(#purpleStarGrad)"
            strokeWidth="36"
            strokeLinecap="round"
            fill="none"
            filter="url(#knotShadow)"
          />

          {/* Layer 3b: Purple over White at Bottom-Left */}
          <path
            d="M 125 348
               C 142 368 170 382 205 372
               C 230 364 256 352 285 358"
            stroke="url(#purpleStarGrad)"
            strokeWidth="36"
            strokeLinecap="round"
            fill="none"
            filter="url(#knotShadow)"
          />

          {/* Layer 4: Interlocking Overlays - White over Purple at Mid-Left */}
          <path
            d="M 152 288
               C 188 264 234 244 285 230"
            stroke="url(#whiteStarGrad)"
            strokeWidth="36"
            strokeLinecap="round"
            fill="none"
            filter="url(#knotShadow)"
          />
        </g>
      </svg>

      {showText && (
        <div className="leading-none">
          <span className={`font-semibold tracking-tight text-xs block ${textColor}`}>
            Astranova <span className="font-light text-purple-400">Philippines</span>
          </span>
        </div>
      )}
    </div>
  );
};
