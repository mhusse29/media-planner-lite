import { useId } from 'react';
import type { Platform } from '../lib/assumptions';

const SIZE = 24;

export function PlatformGlyph({ platform }: { platform: Platform }) {
  const id = useId();

  switch (platform) {
    case 'FACEBOOK':
      return (
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="8" fill="#1877F2" />
          <path
            fill="#fff"
            d="M13.4 6.5h2.1V4h-2.6c-2.4 0-4.1 1.7-4.1 4.4v2.1H6.7V13h2.1v7h3.2v-7h2.6l.4-2.5h-3V8.7c0-.9.4-1.4 1.4-1.4Z"
          />
        </svg>
      );
    case 'INSTAGRAM': {
      const gradientId = `${id}-ig`;
      return (
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="4" x2="20" y1="20" y2="4" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F58529" />
              <stop offset="0.35" stopColor="#DD2A7B" />
              <stop offset="0.68" stopColor="#8134AF" />
              <stop offset="1" stopColor="#515BD4" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="8" fill={`url(#${gradientId})`} />
          <rect
            x="6.8"
            y="6.8"
            width="10.4"
            height="10.4"
            rx="5.2"
            stroke="#fff"
            strokeWidth="1.7"
            fill="none"
          />
          <circle cx="12" cy="12" r="2.7" fill="#fff" />
          <circle cx="16.2" cy="7.9" r="1" fill="#fff" />
        </svg>
      );
    }
    case 'GOOGLE_SEARCH':
      return (
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="8" fill="#fff" />
          <path
            fill="#4285F4"
            d="M21.4 11.2h-8.9v2.8h5.1c-.2 1.5-1.7 4-5.1 4-3.1 0-5.7-2.5-5.7-5.6S9.4 6.8 12.5 6.8c1.6 0 2.9.7 3.6 1.3l2.4-2.3C17.3 4 15 3 12.3 3 7.2 3 3 7 3 12s4.2 9 9.3 9c5.4 0 9.1-3.7 9.1-9 0-.6-.1-1.2-.1-1.8Z"
          />
          <path
            fill="#34A853"
            d="M12.3 21c-4.1 0-7.7-2.6-8.9-6.4l3.3-2.6c.6 2 2.5 3.5 4.9 3.5 1.2 0 2.3-.4 3.1-1.1l3.2 2.5C16.8 19.9 14.8 21 12.3 21Z"
          />
          <path fill="#FBBC05" d="M21 13.7c-.1 1.9-.8 3.7-2 5.1l-3.3-2.6c.9-.6 1.5-1.6 1.7-2.5Z" />
          <path fill="#EA4335" d="M21 10.3c-.3-1.7-1-3.1-2-4.4L15.9 8.5c.4.6.6 1.2.7 1.8Z" />
        </svg>
      );
    case 'GOOGLE_DISPLAY':
      return (
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="8" fill="#F9CC45" />
          <rect x="5.5" y="6.5" width="13" height="11" rx="2.5" fill="#1F2937" opacity="0.9" />
          <rect x="7.5" y="8.5" width="6.8" height="6.8" rx="1.4" fill="#fff" />
          <rect x="15.2" y="8.5" width="2.3" height="6.8" rx="1.1" fill="#FF6B6B" />
        </svg>
      );
    case 'YOUTUBE':
      return (
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="8" fill="#FF0033" />
          <path
            fill="#fff"
            d="M10 8.2 15.6 12 10 15.8Z"
          />
          <rect
            x="6.3"
            y="7.3"
            width="11.4"
            height="9.4"
            rx="2.8"
            stroke="#fff"
            strokeWidth="1.4"
            fill="none"
          />
        </svg>
      );
    case 'TIKTOK':
      return (
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="8" fill="#05070B" />
          <path
            d="M15.8 7.6c-.7-.4-1.3-1-1.5-1.8h-2.4v8c0 1-.8 1.7-1.8 1.7-1 0-1.8-.7-1.8-1.7 0-.9.7-1.6 1.5-1.7v-2.8c-2.5.1-4.3 1.9-4.3 4.5 0 2.6 2.1 4.5 4.6 4.5 2.6 0 4.6-1.9 4.6-4.5v-4.1c.5.6 1.3 1 2.1 1.1V8.2c-.8-.1-1.6-.3-2.4-.6Z"
            fill="#00F5D4"
            opacity="0.75"
          />
          <path
            d="M16 7.2c-.6-.3-1.1-.8-1.3-1.3h-1.3v7.5c0 1.7-1.4 3.1-3.2 3.1-1.1 0-2.1-.5-2.6-1.3.5 1.6 2 2.8 3.7 2.8 2.3 0 4.1-1.7 4.1-4.1V9.3c.6.5 1.3.8 2.1.9V8c-.8-.1-1.1-.3-1.7-.8Z"
            fill="#FF0050"
          />
        </svg>
      );
    case 'LINKEDIN':
      return (
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="8" fill="#0A66C2" />
          <rect x="6.5" y="9.8" width="2.6" height="7.3" fill="#fff" />
          <rect x="6.5" y="6.7" width="2.6" height="2.3" fill="#fff" rx="1.1" />
          <path
            fill="#fff"
            d="M16.4 9.5c-1.2 0-2.1.5-2.6 1.3V9.8h-2.6v7.3h2.6v-3.7c0-.9.6-1.5 1.4-1.5.8 0 1.3.6 1.3 1.5v3.7h2.6v-3.9c0-2.1-1.3-3.7-3.3-3.7Z"
          />
        </svg>
      );
    default:
      return (
        <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true">
          <rect width="24" height="24" rx="8" fill="#1F2937" />
        </svg>
      );
  }
}

export default PlatformGlyph;
