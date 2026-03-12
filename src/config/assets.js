/**
 * ============================================================
 *  MATERIAL WEAR LIMITED — ASSETS CONFIGURATION
 * ============================================================
 *  Replace all placeholder URLs with your actual Cloudinary URLs.
 *  Format: https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/v1/materialwear/FILENAME
 *
 *  Recommended Cloudinary upload settings:
 *    - Format: auto (WebP where supported)
 *    - Quality: auto:good
 *    - Width: 1920px max for hero, 800px for gallery
 * ============================================================
 */

export const ASSETS = {

  // ── BRAND IDENTITY ─────────────────────────────────────────
  logo: {
    /** Primary logo (dark green, used on light backgrounds) */
    main:    'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/logo-green.png',
    /** White logo (used on dark/image backgrounds) */
    white:   'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/logo-white.png',
    /** Square icon only (favicon, app icon) */
    icon:    'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/logo-icon.png',
  },

  // ── HERO / BANNER ──────────────────────────────────────────
  hero: {
    /** Slide 1 — Main hero background (1920×1080 recommended) */
    slide1:  'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/hero-1.jpg',
    /** Slide 2 — Secondary hero background */
    slide2:  'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/hero-2.jpg',
    /** Slide 3 — Third hero background */
    slide3:  'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/hero-3.jpg',
    /** Hero overlay texture (optional, semi-transparent) */
    texture: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/hero-texture.png',
  },

  // ── COLLECTIONS ────────────────────────────────────────────
  collections: {
    /** New Arrivals collection card (800×1000 recommended) */
    newArrivals: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/collection-new-arrivals.jpg',
    /** Essentials collection card */
    essentials:  'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/collection-essentials.jpg',
    /** Formal / Office Wear collection card */
    formal:      'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/collection-formal.jpg',
    /** Casual / Everyday collection card */
    casual:      'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/collection-casual.jpg',
  },

  // ── GALLERY (HOME PAGE) ────────────────────────────────────
  // 12 images for masonry grid. Mix portrait & landscape.
  gallery: [
    { id: 1,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1729164616/mj_11226_4_no8nuz.jpg', alt: 'Premium shirt in cream linen',       span: 'tall' },
    { id: 2,  src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-02.jpg', alt: 'Model wearing dark green jacket',      span: 'normal' },
    { id: 3,  src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-03.jpg', alt: 'Close-up fabric texture detail',       span: 'normal' },
    { id: 4,  src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-04.jpg', alt: 'Formal attire collection overview',    span: 'wide' },
    { id: 5,  src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-05.jpg', alt: 'Casual everyday wear lookbook',        span: 'normal' },
    { id: 6,  src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-06.jpg', alt: 'Gold-accented accessories on display', span: 'tall' },
    { id: 7,  src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-07.jpg', alt: 'New arrivals flat-lay photography',    span: 'normal' },
    { id: 8,  src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-08.jpg', alt: 'Street style editorial shoot',         span: 'normal' },
    { id: 9,  src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-09.jpg', alt: 'Tailored trousers detail shot',        span: 'normal' },
    { id: 10, src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-10.jpg', alt: 'Summer collection outdoor shoot',      span: 'wide' },
    { id: 11, src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-11.jpg', alt: 'Brand lifestyle editorial',            span: 'normal' },
    { id: 12, src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/gallery-12.jpg', alt: 'Studio portrait in premium wear',      span: 'normal' },
  ],

  // ── ABOUT PAGE ─────────────────────────────────────────────
  about: {
    /** Full-width hero for About page (1920×800) */
    hero:      'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/about-hero.jpg',
    /** Founder/CEO portrait (square, 600×600) */
    founder:   'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/founder.jpg',
    /** Brand story / workshop image */
    story:     'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/our-story.jpg',
    /** Craftsmanship / tailoring image */
    craft:     'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/craftsmanship.jpg',
    /** Team / showroom image */
    team:      'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/team.jpg',
    /** Fabric sourcing / sustainability image */
    fabric:    'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/fabric-sourcing.jpg',
    /** Team members array */
    teamMembers: [
      { name: 'Placeholder CEO',     role: 'Founder & CEO',       img: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/team-1.jpg' },
      { name: 'Placeholder Designer',role: 'Head of Design',       img: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/team-2.jpg' },
      { name: 'Placeholder Ops',     role: 'Operations Director',  img: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/team-3.jpg' },
      { name: 'Placeholder Creative',role: 'Creative Director',    img: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/team-4.jpg' },
    ],
  },

  // ── INSTAGRAM FEED PREVIEW ─────────────────────────────────
  instagram: [
    { src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/ig-01.jpg', link: 'https://instagram.com/p/PLACEHOLDER_1' },
    { src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/ig-02.jpg', link: 'https://instagram.com/p/PLACEHOLDER_2' },
    { src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/ig-03.jpg', link: 'https://instagram.com/p/PLACEHOLDER_3' },
    { src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/ig-04.jpg', link: 'https://instagram.com/p/PLACEHOLDER_4' },
    { src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/ig-05.jpg', link: 'https://instagram.com/p/PLACEHOLDER_5' },
    { src: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/ig-06.jpg', link: 'https://instagram.com/p/PLACEHOLDER_6' },
  ],

  // ── SOCIAL / SEO ───────────────────────────────────────────
  social: {
    /** OG image for link previews (1200×630) */
    og: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/og-image.jpg',
  },

  // ── BACKGROUNDS & TEXTURES ─────────────────────────────────
  textures: {
    /** Subtle fabric/grain texture for section backgrounds */
    fabric:  'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/texture-fabric.png',
    /** Pattern overlay for decorative sections */
    pattern: 'https://res.cloudinary.com/YOUR_CLOUD/image/upload/materialwear/texture-pattern.png',
  },

};

export default ASSETS;