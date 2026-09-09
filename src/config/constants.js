/**
 * ============================================================
 *  MATERIAL WEAR LIMITED — APP CONSTANTS
 * ============================================================
 *  All values sourced from .env (VITE_ prefix required for
 *  Vite to expose them to the client bundle).
 * ============================================================
 */

// Mirrors the backend's `if DEBUG: ... else: ...` pattern, but keyed off
// Vite's own dev/prod flag — the frontend can't read the backend's DEBUG
// setting directly (it needs an API URL before it can ask the backend
// anything), so its own dev/prod state is the closest equivalent signal.
//
// Dev (`npm run dev`) with no override: talk to the Django dev server
// directly on localhost. No tunnel needed unless you're specifically testing
// something that requires external reachability (Paystack webhooks, a
// second device on the network) — see .env for how to override for that.
//
// Production builds get NO guessed fallback: VITE_API_BASE_URL must be set
// explicitly (via .env.production or the hosting platform's env vars).
// Silently defaulting a production build to localhost would fail in a
// confusing way; failing loudly here is easier to diagnose.
const rawApiBase = import.meta.env.VITE_API_BASE_URL
  || (import.meta.env.DEV ? 'http://localhost:8000/api' : '');

if (!rawApiBase && import.meta.env.PROD) {
  console.error(
    'VITE_API_BASE_URL is not set for this production build — API requests will fail. ' +
    'Set it in your hosting platform\'s environment variables.'
  );
}

const API_BASE_URL = rawApiBase.trim().replace(/\/+$/, '');

export const APP = {
  name:           import.meta.env.VITE_APP_NAME || 'Material Wear Limited',
  apiBase:        API_BASE_URL,
  // Backend host with no /api suffix — for links to Django admin, docs, etc.
  // Derived from apiBase so there's one place to change the backend URL.
  backendOrigin:  API_BASE_URL.replace(/\/api$/, ''),
  // Shows the navbar light/dark toggle — see src/hooks/useTheme.js
  enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  // Left empty when unset so src/utils/adsense.js skips loading the script
  // rather than requesting it with a placeholder client ID.
  adsenseId:      import.meta.env.VITE_ADSENSE_ID || '',
  isDev:          import.meta.env.DEV,
  isProd:         import.meta.env.PROD,
};

export const CONTACT = {
  email:     import.meta.env.VITE_CONTACT_EMAIL   || 'hello@materialwearlimited.com',
  phone:     import.meta.env.VITE_CONTACT_PHONE   || '+234 000 000 0000',
  whatsapp:  import.meta.env.VITE_WHATSAPP_NUMBER || '+234 000 000 0000',
  address:   import.meta.env.VITE_ADDRESS         || 'YOUR STREET ADDRESS, YOUR CITY, Nigeria',
  hours:     'Monday – Friday: 9am – 6pm WAT',
};

export const SOCIAL = {
  instagram: import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/materialwearlimited',
  facebook:  import.meta.env.VITE_FACEBOOK_URL  || 'https://facebook.com/materialwearlimited',
  // Internal key/env var name kept as "twitter" — only the visible label/icon
  // are rebranded to X, to avoid churning the env var name for a cosmetic change.
  twitter:   import.meta.env.VITE_TWITTER_URL   || 'https://x.com/materialwearlimited',
  tiktok:    import.meta.env.VITE_TIKTOK_URL    || 'https://tiktok.com/@materialwearlimited',
  // No guessable default — the real channel URL is a channel ID, not a handle.
  youtube:   import.meta.env.VITE_YOUTUBE_URL   || '',
};

export const BRAND = {
  founded:  import.meta.env.VITE_FOUNDED_YEAR || '2020',
  rcNumber: import.meta.env.VITE_RC_NUMBER    || '',
};

export const NAVIGATION = [
  { label: 'Home',        path: '/' },
  { label: 'About',       path: '/about' },
  { label: 'Collections', path: '/collections' },
  { label: 'Feed',        path: '/feed' },
  { label: 'Referrals',   path: '/referrals' },
  { label: 'Contact',     path: '/contact' },
];

export const FOOTER_LINKS = {
  company: [
    { label: 'About Us',            path: '/about' },
    { label: 'Our Story',           path: '/about#story' },
    { label: 'Referral Programme',  path: '/referrals' },
    { label: 'Group / Bulk Orders', path: '/my-orders' },
    { label: 'Careers',             path: '/careers' },
    { label: 'Press',               path: '/press' },
  ],
  shop: [
    { label: 'New Arrivals',  path: '/collections' },
    { label: 'Men\'s Wear',   path: '/collections/mens' },
    { label: 'Women\'s Wear', path: '/collections/womens' },
    { label: 'Accessories',   path: '/collections/accessories' },
  ],
  support: [
    { label: 'Contact Us',        path: '/contact' },
    { label: 'FAQs',              path: '/faq' },
    { label: 'Size Guide',        path: '/size-guide' },
    { label: 'Shipping Policy',   path: '/shipping' },
    { label: 'Customer Reviews',  path: '/testimonials' },
  ],
  legal: [
    { label: 'Privacy Policy',     path: '/privacy-policy' },
    { label: 'Terms & Conditions', path: '/terms' },
    { label: 'Cookie Policy',      path: '/cookie-policy' },
    { label: 'Returns Policy',     path: '/returns' },
  ],
  account: [
    { label: 'Sign In',              path: '/login' },
    { label: 'Create Account',       path: '/register' },
    { label: 'My Profile',           path: '/profile' },
    { label: 'My Orders',            path: '/orders' },
    { label: 'Payment History',      path: '/payment-history' },
    { label: 'Bulk Orders',          path: '/my-orders' },
    { label: 'My Image Orders',      path: '/image-my-orders' },
    { label: 'Organiser Dashboard',  path: '/organiser' },
    { label: 'Image Organiser',      path: '/image-organiser' },
    { label: 'My Excel Orders',      path: '/excel-my-orders' },
    { label: 'New Excel Order',      path: '/excel-bulk-order/new' },
    { label: 'Live Form Organiser',  path: '/live-form-organiser' },
    { label: 'My Measurements',      path: '/measurements' },
    { label: 'Academic Directory',   path: '/academic-directory/submit' },
    { label: 'Forgot Password',      path: '/forgot-password' },
  ],
};
