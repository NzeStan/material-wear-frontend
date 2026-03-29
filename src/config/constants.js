/**
 * ============================================================
 *  MATERIAL WEAR LIMITED — APP CONSTANTS
 * ============================================================
 *  All values sourced from .env (VITE_ prefix required for
 *  Vite to expose them to the client bundle).
 * ============================================================
 */

export const APP = {
  name:            import.meta.env.VITE_APP_NAME        || 'Material Wear Limited',
  tagline:         import.meta.env.VITE_APP_TAGLINE      || 'Crafted for the Distinguished',
  apiBase:         import.meta.env.VITE_API_BASE_URL     || 'http://localhost:8000/api',
  env:             import.meta.env.VITE_APP_ENV          || 'development',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDarkMode:  import.meta.env.VITE_ENABLE_DARK_MODE === 'true',
  adsenseId:       import.meta.env.VITE_ADSENSE_ID       || 'ca-pub-XXXXXXXXXXXXXXXX',
  gtmId:           import.meta.env.VITE_GTM_ID           || 'GTM-XXXXXXX',
  isDev:           import.meta.env.DEV,
  isProd:          import.meta.env.PROD,
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
  twitter:   import.meta.env.VITE_TWITTER_URL   || 'https://twitter.com/materialwearlimited',
  tiktok:    import.meta.env.VITE_TIKTOK_URL    || 'https://tiktok.com/@materialwearlimited',
  pinterest: import.meta.env.VITE_PINTEREST_URL || 'https://pinterest.com/materialwearlimited',
};

export const BRAND = {
  colors: {
    primary:    '#064E3B',
    background: '#FFFBEB',
    accent:     '#F59E0B',
    text:       '#1F2937',
  },
  founded:     import.meta.env.VITE_FOUNDED_YEAR || '2020',
  currency:    import.meta.env.VITE_CURRENCY     || 'NGN',
  currencySymbol: '₦',
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