import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { APP, CONTACT, BRAND } from '../config/constants'

// ── SHARED LEGAL PAGE WRAPPER ────────────────────────────────
function LegalPage({ title, eyebrow, lastUpdated, children }) {
  return (
    <main className="page-transition">
      {/* Hero */}
      <section className="py-20" style={{ background: 'var(--c-primary)' }}>
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="section-eyebrow" style={{ color: 'var(--c-accent)' }}>✦ {eyebrow}</p>
          <h1 className="font-display font-light text-white mt-3" style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}>
            {title}
          </h1>
          <p className="text-white opacity-50 text-sm mt-4">
            Last updated: {lastUpdated}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16" style={{ background: 'var(--c-bg)' }}>
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="prose-legal">
            {children}
          </div>
        </div>
      </section>

      <style>{`
        .prose-legal h2 {
          font-family: var(--font-display);
          font-size: 1.6rem;
          color: var(--c-primary);
          margin: 2.5rem 0 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid var(--c-bg-warm);
        }
        .prose-legal h3 {
          font-family: var(--font-display);
          font-size: 1.2rem;
          color: var(--c-primary);
          margin: 1.5rem 0 0.5rem;
        }
        .prose-legal p { color: var(--c-text-muted); line-height: 1.8; margin-bottom: 1rem; }
        .prose-legal ul { margin: 1rem 0 1.5rem 1.5rem; }
        .prose-legal li { color: var(--c-text-muted); line-height: 1.8; margin-bottom: 0.4rem; list-style-type: disc; }
        .prose-legal a { color: var(--c-primary); text-decoration: underline; }
        .prose-legal strong { color: var(--c-text); }
        .prose-legal .info-box {
          background: var(--c-bg-warm);
          border-left: 4px solid var(--c-accent);
          padding: 1rem 1.25rem;
          margin: 1.5rem 0;
          border-radius: 0 4px 4px 0;
        }
      `}</style>
    </main>
  )
}

// ── PRIVACY POLICY ────────────────────────────────────────────
export function PrivacyPolicy() {
  const name = APP.name
  const email = CONTACT.email

  useEffect(() => { document.title = `Privacy Policy — ${name}` }, [])

  return (
    <LegalPage
      title="Privacy Policy"
      eyebrow="Legal"
      lastUpdated="January 1, 2025"
    >
      <div className="info-box">
        <p className="!mb-0"><strong>Summary:</strong> We collect minimal data, use it only to serve you better, and never sell it to third parties. Read on for the full details.</p>
      </div>

      <h2>1. Introduction</h2>
      <p>
        {name} ("we," "our," or "us") respects your privacy and is committed to protecting your personal data.
        This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you
        visit our website or make a purchase from us.
      </p>
      <p>
        By using our services, you consent to the practices described in this policy. If you do not agree,
        please discontinue use of our services.
      </p>

      <h2>2. Information We Collect</h2>
      <h3>2.1 Information You Provide</h3>
      <ul>
        <li><strong>Account information:</strong> Name, email address, password when you create an account</li>
        <li><strong>Purchase information:</strong> Billing address, shipping address, payment details (we do not store card numbers)</li>
        <li><strong>Communications:</strong> Messages you send via our contact form or email</li>
        <li><strong>Newsletter:</strong> Email address when you subscribe to our newsletter</li>
      </ul>

      <h3>2.2 Information Collected Automatically</h3>
      <ul>
        <li><strong>Usage data:</strong> Pages visited, time spent, clicks, and navigation patterns</li>
        <li><strong>Device information:</strong> Browser type, operating system, IP address</li>
        <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
      </ul>

      <h2>3. How We Use Your Information</h2>
      <p>We use your personal data to:</p>
      <ul>
        <li>Process and fulfil your orders</li>
        <li>Communicate with you about your orders and enquiries</li>
        <li>Send promotional emails and newsletters (only with your consent)</li>
        <li>Improve our website and services through analytics</li>
        <li>Comply with legal obligations</li>
        <li>Prevent fraud and protect our website</li>
        <li>Personalise your shopping experience</li>
      </ul>

      <h2>4. Cookies and Tracking Technologies</h2>
      <p>
        We use cookies and similar tracking technologies to enhance your experience. These include:
      </p>
      <ul>
        <li><strong>Essential cookies:</strong> Required for the website to function properly</li>
        <li><strong>Analytics cookies:</strong> Help us understand how visitors use our site (Google Analytics)</li>
        <li><strong>Advertising cookies:</strong> Used to display relevant advertisements (Google AdSense)</li>
        <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
      </ul>
      <p>
        You can control cookie settings through your browser or our cookie consent banner. Note that disabling
        certain cookies may affect website functionality.
      </p>

      <h2>5. Third-Party Services</h2>
      <p>We work with trusted third-party services including:</p>
      <ul>
        <li><strong>Google Analytics:</strong> Website analytics and visitor behaviour insights</li>
        <li><strong>Google AdSense:</strong> Advertising platform (their Privacy Policy applies)</li>
        <li><strong>Payment processors:</strong> Secure payment handling (Paystack, Flutterwave)</li>
        <li><strong>Email services:</strong> Newsletter delivery</li>
        <li><strong>Cloudinary:</strong> Image hosting and delivery</li>
      </ul>
      <p>
        These services have their own privacy policies governing their use of your information.
      </p>

      <h2>6. Data Sharing</h2>
      <p>
        We do <strong>not sell, trade, or rent</strong> your personal information to third parties.
        We may share your data only in the following circumstances:
      </p>
      <ul>
        <li>With service providers who assist in operating our business (under strict confidentiality agreements)</li>
        <li>When required by law, regulation, or legal proceedings</li>
        <li>To protect the rights, property, or safety of {name} or others</li>
        <li>With your explicit consent</li>
      </ul>

      <h2>7. Data Security</h2>
      <p>
        We implement industry-standard security measures including SSL encryption, secure servers,
        and regular security audits to protect your personal information. However, no method of
        internet transmission is 100% secure, and we cannot guarantee absolute security.
      </p>

      <h2>8. Data Retention</h2>
      <p>
        We retain your personal data only as long as necessary to fulfil the purposes outlined in this
        policy or as required by law. You may request deletion of your data at any time (subject to legal
        retention requirements).
      </p>

      <h2>9. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Opt out of marketing communications at any time</li>
        <li>Lodge a complaint with the relevant data protection authority</li>
      </ul>

      <h2>10. Children's Privacy</h2>
      <p>
        Our services are not directed to individuals under the age of 18. We do not knowingly collect
        personal information from children. If you believe we have inadvertently collected such information,
        please contact us immediately.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Changes will be posted on this page with
        an updated revision date. Your continued use of our services after changes constitutes acceptance
        of the updated policy.
      </p>

      <h2>12. Contact Us</h2>
      <p>
        For any questions or concerns about this Privacy Policy or your personal data, please contact us:
      </p>
      <ul>
        <li>Email: <a href={`mailto:${email}`}>{email}</a></li>
        <li>Address: {CONTACT.address}</li>
        <li>Or use our <Link to="/contact">Contact Form</Link></li>
      </ul>
    </LegalPage>
  )
}

// ── TERMS & CONDITIONS ────────────────────────────────────────
export function TermsConditions() {
  const name = APP.name
  const email = CONTACT.email

  useEffect(() => { document.title = `Terms & Conditions — ${name}` }, [])

  return (
    <LegalPage
      title="Terms & Conditions"
      eyebrow="Legal"
      lastUpdated="August 15, 2026"
    >
      <div className="info-box">
        <p className="!mb-0">
          <strong>Please read these terms carefully.</strong> By accessing or using our services, you agree to be bound by these Terms and Conditions.
        </p>
      </div>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing and using the {name} website and services, you accept and agree to be bound by
        these Terms and Conditions and our Privacy Policy. If you do not agree to these terms, please
        do not use our services.
      </p>

      <h2>2. Company Information</h2>
      <p>
        {name} is a registered clothing business operating in Nigeria{BRAND.rcNumber ? ` (RC ${BRAND.rcNumber})` : ''}.
        Our registered address is {CONTACT.address}. You can contact us at <a href={`mailto:${email}`}>{email}</a>.
      </p>

      <h2>3. Products and Services</h2>
      <h3>3.1 Product Descriptions</h3>
      <p>
        We make every effort to display our products accurately. However, colours may vary slightly
        due to monitor settings. All products are subject to availability and we reserve the right to
        discontinue any item.
      </p>
      <h3>3.2 Pricing</h3>
      <p>
        All prices are displayed in Nigerian Naira (₦) and include applicable taxes unless otherwise
        stated. We reserve the right to change prices at any time. Prices shown at checkout are final.
      </p>
      <h3>3.3 Stock Availability</h3>
      <p>
        Product availability is not guaranteed. In the event an ordered item is out of stock, we will
        notify you promptly and offer an alternative, credit, or full refund.
      </p>

      <h2>4. Orders and Payments</h2>
      <ul>
        <li>Orders are subject to acceptance and availability</li>
        <li>We reserve the right to refuse or cancel any order</li>
        <li>Payment must be received in full before dispatch</li>
        <li>Accepted payment methods: Bank transfer, card payments, and mobile money</li>
        <li>Order confirmation will be sent to your registered email address</li>
      </ul>

      <h2>5. Shipping and Delivery</h2>
      <p>
        We deliver nationwide. We are not responsible for delays caused by third-party logistics
        providers or circumstances beyond our control.
      </p>
      <p>
        Bringing or placing your work early helps us deliver on time. Where work is brought or ordered
        late, we will do our very best to deliver within your timeline, but we cannot be held liable if
        we are unable to do so.
      </p>

      <h2>6. Intellectual Property</h2>
      <p>
        All content on this website — including but not limited to text, images, logos, graphics, and
        design — is the exclusive property of {name} and is protected by applicable intellectual property
        laws. Unauthorised use, reproduction, or distribution is strictly prohibited.
      </p>

      <h2>7. User Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use our website for any unlawful purpose</li>
        <li>Attempt to gain unauthorised access to our systems</li>
        <li>Transmit harmful, offensive, or disruptive content</li>
        <li>Impersonate any person or entity</li>
        <li>Scrape, copy, or redistribute our content without permission</li>
      </ul>

      <h2>8. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, {name} shall not be liable for any indirect, incidental,
        special, or consequential damages arising from your use of our services or products. Our total
        liability shall not exceed the amount paid for the specific product or service in question.
      </p>

      <h2>9. Governing Law</h2>
      <p>
        These Terms and Conditions are governed by and construed in accordance with the laws of the
        Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the
        exclusive jurisdiction of the Nigerian courts.
      </p>

      <h2>10. Amendments</h2>
      <p>
        We reserve the right to modify these Terms at any time. Updated terms will be posted on this
        page with a revised date. Continued use of our services constitutes acceptance of any changes.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these Terms? Contact us at <a href={`mailto:${email}`}>{email}</a> or visit
        our <Link to="/contact">Contact page</Link>.
      </p>
    </LegalPage>
  )
}

// ── COOKIE POLICY ──────────────────────────────────────────────
export function CookiePolicy() {
  const name = APP.name
  const email = CONTACT.email

  useEffect(() => { document.title = `Cookie Policy — ${name}` }, [])

  return (
    <LegalPage
      title="Cookie Policy"
      eyebrow="Legal"
      lastUpdated="August 16, 2026"
    >
      <div className="info-box">
        <p className="!mb-0">
          <strong>Summary:</strong> We use a small number of cookies to keep you signed in and to serve
          relevant ads. We don't use analytics or advertising-tracking cookies beyond what Google AdSense sets.
        </p>
      </div>

      <h2>1. What Are Cookies</h2>
      <p>
        Cookies are small text files placed on your device when you visit a website. We also use similar
        browser-storage technologies (such as local storage) for some of the same purposes. This policy covers
        both, alongside our <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>

      <h2>2. Strictly Necessary Cookies</h2>
      <p>These are required for the site to function and can't be switched off in our systems:</p>
      <ul>
        <li><strong>Session cookie:</strong> keeps you signed in during a Google or GitHub sign-in and links your browser to your account session</li>
        <li><strong>CSRF cookie:</strong> protects form submissions on our site from cross-site request forgery</li>
      </ul>

      <h2>3. Local Storage</h2>
      <p>
        We use your browser's local storage (not a cookie, but a similar on-device technology) for:
      </p>
      <ul>
        <li><strong>Staying signed in:</strong> an authentication token so you don't have to log in on every visit</li>
        <li><strong>Light/dark mode:</strong> remembering your display preference</li>
      </ul>
      <p>
        Your cart is tied to your account or session and stored on our servers, not in a cookie on your device.
      </p>

      <h2>4. Advertising Cookies</h2>
      <p>
        We use Google AdSense to display ads. Google may set cookies to show ads based on your visits to this
        and other sites, and to measure ad performance. Google's use of advertising cookies is governed by{' '}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">Google's own policy</a>.
        You can opt out of personalised advertising through{' '}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ad Settings</a>.
      </p>

      <h2>5. Third-Party Cookies</h2>
      <p>
        When you check out, our payment processor (Paystack) may set its own cookies on its own domain to
        process your payment securely. We don't control these — see their privacy policy for details.
      </p>
      <p>
        We do <strong>not</strong> currently use Google Analytics, Google Tag Manager, or any social media
        pixel/tracking cookies.
      </p>

      <h2>6. Managing Cookies</h2>
      <p>
        Most browsers let you block or delete cookies through their settings. Blocking strictly necessary
        cookies will prevent you from staying signed in via Google or GitHub. Clearing your browser's local
        storage will sign you out and reset your display preference.
      </p>

      <h2>7. Changes to This Policy</h2>
      <p>
        We may update this Cookie Policy from time to time. Changes will be posted on this page with an
        updated revision date.
      </p>

      <h2>8. Contact Us</h2>
      <p>
        Questions about this Cookie Policy? Contact us at <a href={`mailto:${email}`}>{email}</a> or visit
        our <Link to="/contact">Contact page</Link>.
      </p>
    </LegalPage>
  )
}

// ── 404 NOT FOUND ────────────────────────────────────────────
export function NotFound() {
  useEffect(() => { document.title = `Page Not Found — ${APP.name}` }, [])
  return (
    <main className="page-transition min-h-screen flex items-center justify-center py-24" style={{ background: 'var(--c-bg)' }}>
      <div className="text-center px-4">
        <p
          className="font-display font-light"
          style={{ fontSize: 'clamp(6rem, 15vw, 12rem)', color: 'var(--c-bg-warm)', lineHeight: 1 }}
        >
          404
        </p>
        <h1 className="font-display text-3xl -mt-8 mb-4" style={{ color: 'var(--c-primary)' }}>
          Page Not Found
        </h1>
        <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--c-text-muted)' }}>
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/" className="btn-primary"><span>Go Home</span></Link>
          <Link to="/contact" className="btn-gold"><span>Contact Us</span></Link>
        </div>
      </div>
    </main>
  )
}