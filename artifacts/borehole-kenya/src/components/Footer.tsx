import { Link } from "wouter";
import { Droplets, Phone, Mail, MapPin } from "lucide-react";

const services = [
  "Borehole Drilling", "Hydrogeological Surveys", "Pump Installation",
  "Solar Pump Systems", "Water Treatment", "Emergency Repairs",
];

const products = [
  "Submersible Pumps", "Solar Pumps", "Water Tanks",
  "Solar Panels", "HDPE Pipes", "Control Boxes",
];

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
            <div className="flex flex-col gap-2.5 text-sm text-white/70">
              <a href="tel:+254103400209" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-3.5 w-3.5 flex-shrink-0" />
                +254 103 400 209
              </a>
              <a href="mailto:info@boreholedrilling.co.ke" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                info@boreholedrilling.co.ke
              </a>
              <div className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>Westlands Business Park, Nairobi, Kenya</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4 text-white/90">Our Services</h3>
            <ul className="flex flex-col gap-2">
              {services.map((s) => (
                <li key={s}>
                  <Link
                    href="/services"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
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
                  <Link
                    href="/products"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
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

          {/* Counties */}
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
            &copy; {new Date().getFullYear()} Borehole Drilling Services Kenya. All rights reserved.
          </p>
          <p className="text-xs text-white/40">
            Licensed by Water Services Regulatory Board (WASREB)
          </p>
        </div>
      </div>
    </footer>
  );
}
