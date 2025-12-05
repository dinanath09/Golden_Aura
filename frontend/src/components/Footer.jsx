// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  const BRAND = "Golden Aura"; // Change if needed
  const EMAIL = "goldenaura211@gmail.com";
  const PHONE = "+91 9423490559";
  const PHONE_E164 = "919423490559"; // For tel:/WhatsApp link

  const ADDRESS_LINE1 = "Golden Aura";
  const ADDRESS_LINE2 =
    "H.no 2683, near Fatak shala road, Kambli Wada, Revtale, Malvan, Maharashtra 416606H.No. 2683, Near Fatak Shala Road, Revtale, Malvan, Sindhudurg, Maharashtra 416606";

  // map embed (kept same)
  const MAP_EMBED =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3834.0687820970575!2d73.46907051086075!3d16.061920139569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc003b12bebc0bd%3A0x9e6dd88b75412722!2sMarveelAuraa!5e0!3m2!1sen!2sin!4v1762667914599!5m2!1sen!2sin";

  // shared link classes: visible ring only for keyboard users (tailwind)
  const linkClass = "hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-1";

  return (
    <footer className="mt-16 border-t bg-white" aria-labelledby="footer-heading">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
        {/* Brand / about */}
        <div>
          <h2 id="footer-heading" className="sr-only">Footer</h2>

          <div className="text-2xl font-bold">
            <span className="text-black">Golden</span>{" "}
            <span className="text-amber-600">Aura</span>
          </div>

          <p className="mt-3 text-sm text-zinc-600 leading-relaxed">
            Modern, long-lasting perfumes with a luxury finish. Curated collections for
            Men, Women and Unisex.
          </p>

          {/* Social Links */}
          <div className="mt-4 flex gap-3 text-sm">
            <a
              href="https://instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-lg border hover:bg-zinc-50 ${linkClass}`}
            >
              Instagram
            </a>
            <a
              href={`https://wa.me/${PHONE_E164}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`px-3 py-1.5 rounded-lg border hover:bg-zinc-50 ${linkClass}`}
            >
              WhatsApp
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href={`mailto:${EMAIL}`} className={linkClass}>
                📧 {EMAIL}
              </a>
            </li>
            <li>
              <a href={`tel:${PHONE_E164}`} className={linkClass}>
                📞 {PHONE}
              </a>
            </li>
            <li className="text-zinc-700 select-text">
              📍 {ADDRESS_LINE1}
              <br />
              {ADDRESS_LINE2}
            </li>
          </ul>

          {/* Quick Links */}
          <nav className="mt-4 flex flex-wrap gap-3 text-sm" aria-label="Quick links">
            <Link to="/products" className={linkClass}>Collection</Link>
            <Link to="/gifts" className={linkClass}>Gifts</Link>
            <Link to="/about" className={linkClass}>About</Link>
            <Link to="/login" className={linkClass}>Login</Link>
          </nav>
        </div>

        {/* Map */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-semibold">Find us</h3>
          <div className="mt-3 rounded-xl overflow-hidden border bg-zinc-50">
            <div className="relative w-full" style={{ paddingTop: "62%" }}>
              {/* Make iframe non-focusable so it won't steal focus/tap highlight */}
              <iframe
                title="Location Map"
                src={MAP_EMBED}
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                tabIndex={-1}         /* <-- prevent iframe focus */
                aria-hidden="true"    /* decorative for screen readers (address provided in text) */
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-xs text-zinc-500 flex flex-col sm:flex-row gap-2 sm:gap-6 justify-between">
          <p>© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/terms" className={linkClass}>Terms</Link>
            <Link to="/privacy" className={linkClass}>Privacy</Link>
            <Link to="/returns" className={linkClass}>Returns</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
