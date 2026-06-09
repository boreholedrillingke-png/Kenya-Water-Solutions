import { Link } from "wouter";
import { Droplets, Phone, Mail, MapPin, Facebook } from "lucide-react";

const services = [
  "Borehole Drilling", "Hydrogeological Surveys", "Pump Installation",
  "Solar Pump Systems", "Water Treatment", "Emergency Repairs",
];

const products = [
  "Solar Pumps", "Submersible Pumps", "Solar Panels",
  "Solar Batteries", "Inverters", "Water Treatment",
];

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.73a4.85 4.85 0 0 1-1.01-.04z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="bg-foreground text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Droplets className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold">Borehole Drilling</div>
                <div className="text-[10px] text-white/50 tracking-wide uppercase">Services Kenya</div>
              </div>
            </div>
            <p className="text-sm text-white/65 leading-relaxed mb-5">
              Kenya's leading borehole drilling and water solutions company. Serving all 47 counties with over 15 years of experience and 2,400+ successful projects.
            </p>
            <div className="flex flex-col gap-2.5 text-sm text-white/70 mb-5">
              <a href="tel:+254762211512" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                +254 762 211 512
              </a>
              <a href="mailto:sabwaterdrillingcompany@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                sabwaterdrillingcompany@gmail.com
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>Nairobi, Kenya</span>
              </div>
            </div>
            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/perfect.borehole.drillers"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#1877F2] transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://vm.tiktok.com/ZS92K4DJbHEsd-KI0CU/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-black transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
              <a
                href={`https://wa.me/254762211512?text=${encodeURIComponent("Hello, I'd like to inquire about your borehole services.")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#25D366] transition-colors"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/90">Our Services</h3>
            <ul className="flex flex-col gap-2">
              {services.map((s) => (
                <li key={s}>
                  <Link href="/services" className="text-sm text-white/60 hover:text-white transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/services" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                  View all services →
                </Link>
              </li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/90">Products</h3>
            <ul className="flex flex-col gap-2">
              {products.map((p) => (
                <li key={p}>
                  <Link href="/products" className="text-sm text-white/60 hover:text-white transition-colors">
                    {p}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/products" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                  Browse all products →
                </Link>
              </li>
            </ul>
          </div>

          {/* Coverage */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/90">Coverage Areas</h3>
            <p className="text-sm text-white/60 mb-3">We operate in all 47 counties of Kenya including:</p>
            <ul className="flex flex-col gap-1.5 text-sm text-white/60">
              {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Kisii", "Kakamega", "Nyeri", "Meru"].map(c => (
                <li key={c}>{c}</li>
              ))}
              <li className="text-white/40 italic">...and all other counties</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Water Drilling Company - Borehole services Kenya. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Licensed by Water Services Regulatory Board (WASREB)
          </p>
        </div>
      </div>
    </footer>
  );
}
