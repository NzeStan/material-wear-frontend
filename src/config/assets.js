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
  // Real 500x500 logo — same file the backend uses for emails/receipts
  // (see Material_Wear/material/settings.py -> COMPANY_LOGO_URL). Keep these
  // in sync with that setting so emails and the site show the same mark.
  logo: {
    /** Primary logo (used on light backgrounds) */
    main:    'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786786523/hood_pics/material_logo_dl7qrk.png',
    /** White logo (used on dark/image backgrounds).
     *  TODO: no white/inverted variant exists yet — currently the same file.
     *  Upload a white version and point this at it. */
    white:   'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786786523/hood_pics/material_logo_dl7qrk.png',
    /** Square icon only (favicon, app icon) — Cloudinary crops/resizes to 180x180 */
    icon:    'https://res.cloudinary.com/dhhaiy58r/image/upload/c_fill,w_180,h_180/v1786786523/hood_pics/material_logo_dl7qrk.png',
  },

  // ── HERO / BANNER ──────────────────────────────────────────
  hero: {
    /** Slide 1 — Main hero background (1920×1080 recommended) */
    slide1:  'https://res.cloudinary.com/dhhaiy58r/image/upload/c_fill,w_1920,h_1080/v1721772155/media/clothing_images/2f56758115a4498fbff755bf66acea0f_slexc3_ixmxyd.jpg?utm_source=chatgpt.com',
    /** Slide 2 — Secondary hero background */
    slide2:  'https://res.cloudinary.com/dhhaiy58r/image/upload/c_fill,w_1920,h_1080/v1690401956/image/nysc_qihilh.jpg?utm_source=chatgpt.com',
    /** Slide 3 — Third hero background */
    slide3:  'https://res.cloudinary.com/dhhaiy58r/image/upload/c_fill,w_1920,h_1080/v1721770040/media/clothing_images/cdb321d3e1ba4797995c50c30148d529_yblfkm_lx7mrc.jpg?utm_source=chatgpt.com',
    /** Hero overlay texture (optional, semi-transparent) */
    texture: 'https://res.cloudinary.com/dhhaiy58r/image/upload/c_fill,w_1920,h_1080/v1721770055/media/clothing_images/ca5474cfa3b6484ba55d42ec8ba9b8d1_akegkb_l6jcjn.jpg?utm_source=chatgpt.com',
  },

  // ── COLLECTIONS ────────────────────────────────────────────
  collections: {
    /** New Arrivals collection card (800×1000 recommended) */
    newArrivals: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685718016/inspo/16_n1zjsn.jpg',
    /** Essentials collection card */
    essentials:  'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685718016/inspo/10_hkf5fz.jpg',
    /** Formal / Office Wear collection card */
    formal:      'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685718016/inspo/1_gsydko.jpg',
    /** Casual / Everyday collection card */
    casual:      'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685718017/inspo/22_jiv8ei.jpg',
  },

  // ── HOME PAGE ───────────────────────────────────────────────
  home: {
    /** Brand-story split section (image beside "More Than a Brand" copy).
     *  Own key rather than reusing about.story — they're on different pages
     *  and were previously silently sharing one image, so changing one
     *  changed the other. */
    story: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786785488/jume_others/AdobeStock_254529536_f5annz.jpg',
  },

  // ── GALLERY (HOME PAGE) ────────────────────────────────────
  // 12 images for masonry grid. Mix portrait & landscape.
  gallery: [
    { id: 1,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686408009/inspo/51_xhnfia.jpg', alt: '',       span: 'tall' },
    { id: 2,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686076264/jume_others/34_y0pz4b.jpg', alt: '',      span: 'normal' },
    { id: 3,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686407057/jume_others/46_uhpdya.jpg', alt: '',       span: 'normal' },
    { id: 4,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685717649/hood_pics/1_sl94fi.jpg', alt: '',    span: 'wide' },
    { id: 5,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1687358527/hood_pics/61_dhxj6f.jpg', alt: '',        span: 'normal' },
    { id: 6,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686076261/jume_others/17_bvhfhu.jpg', alt: '', span: 'tall' },
    { id: 7,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686076266/jume_others/6_jsjfm6.jpg', alt: '',    span: 'normal' },
    { id: 8,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685717653/hood_pics/4_zbku1t.jpg', alt: '',         span: 'normal' },
    { id: 9,  src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686407057/jume_others/48_trby2c.jpg', alt: '',        span: 'normal' },
    { id: 10, src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786781938/jume_others/9DBC36B3-13B5-41DF-A311-0E709F384ED3_tc1mne.jpg', alt: '',      span: 'wide' },
    { id: 11, src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685717650/hood_pics/2_ietm1x.jpg', alt: '',            span: 'normal' },
    { id: 12, src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686076261/jume_others/11_ghtnop.jpg', alt: '',      span: 'normal' },
  ],

  // ── ABOUT PAGE ─────────────────────────────────────────────
  about: {
    /** Full-width hero for About page (1920×800) */
    hero:      'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786801434/jume_others/material_3_htc7hg.jpg',
    /** Founder/CEO portrait (square, 600×600) */
    founder:   'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786801431/jume_others/material_4_brc8ns.jpg',
    /** Brand story / workshop image */
    story:     'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786785488/jume_others/AdobeStock_254529536_f5annz.jpg',
    /** Craftsmanship / tailoring image */
    craft:     'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786801437/jume_others/material_2_kzhfjh.jpg',
    /** Team / showroom image */
    team:      'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786801434/jume_others/material_3_htc7hg.jpg',
    /** Fabric sourcing / sustainability image */
    fabric:    'https://res.cloudinary.com/dhhaiy58r/image/upload/v1786801441/jume_others/material_1_amq6iu.jpg',
    /** Team members array */
    teamMembers: [
      { name: 'Placeholder CEO',     role: 'Founder & CEO',       img: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1729164616/mj_11226_4_no8nuz.jpg' },
      { name: 'Placeholder Designer',role: 'Head of Design',       img: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1729164616/mj_11226_4_no8nuz.jpg' },
      { name: 'Placeholder Ops',     role: 'Operations Director',  img: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1729164616/mj_11226_4_no8nuz.jpg' },
      { name: 'Placeholder Creative',role: 'Creative Director',    img: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1729164616/mj_11226_4_no8nuz.jpg' },
    ],
  },

  // ── INSTAGRAM FEED PREVIEW ─────────────────────────────────
  instagram: [
    { src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686076265/jume_others/40_igqxla.jpg', link: 'https://www.instagram.com/materialwearlimited' },
    { src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686076264/jume_others/36_cr1lhc.jpg', link: 'https://www.instagram.com/materialwearlimited' },
    { src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686076260/jume_others/10_itj2pm.jpg', link: 'https://www.instagram.com/materialwearlimited' },
    { src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685717649/hood_pics/10_frvbd9.jpg', link: 'https://www.instagram.com/materialwearlimited' },
    { src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685717651/hood_pics/30_jabxl9.jpg', link: 'https://www.instagram.com/materialwearlimited' },
    { src: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1686076261/jume_others/15_b0mtk9.jpg', link: 'https://www.instagram.com/materialwearlimited' },
  ],

  // ── SOCIAL / SEO ───────────────────────────────────────────
  social: {
    /** OG image for link previews (1200×630).
     *  Was pointing at a non-existent 'YOUR_CLOUD' cloud name, so every
     *  WhatsApp/Facebook/Twitter share of a link showed no preview image.
     *  Now uses a real asset, resized+cropped to OG's 1200x630 by Cloudinary.
     *  NOTE: this is a product photo standing in for a proper branded OG
     *  card — worth replacing with a designed 1200x630 image. If you change
     *  it, also update the og:image/twitter:image tags in index.html, which
     *  must be static HTML for crawlers (they don't run JS). */
    og: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685717654/hood_pics/5_jpt974.jpg',
  },

  // ── BACKGROUNDS & TEXTURES ─────────────────────────────────
  textures: {
    /** Subtle fabric/grain texture for section backgrounds */
    fabric:  'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685717654/hood_pics/6_shqhxj.jpg',
    /** Pattern overlay for decorative sections */
    pattern: 'https://res.cloudinary.com/dhhaiy58r/image/upload/v1685717654/hood_pics/5_jpt974.jpg',
  },

};

export default ASSETS;