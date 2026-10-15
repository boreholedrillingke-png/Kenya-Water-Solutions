import { Link } from "wouter";
import { Phone, Mail, MessageCircle, MapPin, Clock, Droplets } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products" },
  { label: "Projects", href: "/projects" },
  { label: "Successful Boreholes", href: "/feed" },
  { label: "Earn with us", href: "/join" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
];

const services = ["Borehole Drilling", "Hydrogeological Surveys", "Test Pumping", "Pump Installation", "Borehole Inspection", "Water Purification"];

const link = "hover:text-white transition-colors whitespace-nowrap";

export default function Footer() {
  return (
    <footer className="shrink-0 bg-slate-950 text-white/70 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
        <div className="grid grid-cols-2 md:grid-cols-[1.1fr_1fr_1.3fr_1.7fr] gap-x-6 gap-y-3">
          {/* Brand */}
          <div className="hidden md:block">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <Droplets className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-bold text-white">SAB Borehole Drilling</span>
            </div>
            <p className="leading-relaxed text-white/60 max-w-[15rem]">
              Borehole drilling, pumps, solar and water purification across Kenya.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <div className="text-white font-semibold uppercase tracking-wider text-[11px] mb-1.5 text-center">Quick Links</div>
            <ul className="grid grid-flow-col grid-rows-3 gap-x-5 gap-y-1">
              {quickLinks.map((l) => (
                <li key={l.label}><Link href={l.href} className={link}>{l.label}</Link></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="hidden sm:block">
            <div className="text-white font-semibold uppercase tracking-wider text-[11px] mb-1.5 text-center">Services</div>
            <ul className="grid grid-flow-col grid-rows-3 gap-x-5 gap-y-1">
              {services.map((s) => (
                <li key={s}><Link href={s === "Water Purification" ? "/purification" : "/services"} className={link}>{s}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <div className="text-white font-semibold uppercase tracking-wider text-[11px] mb-1.5 text-center">Contact</div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-1.5">
              <li>
                <a href="tel:+254762211512" className={`flex items-center gap-1.5 ${link}`}>
                  <Phone className="h-3.5 w-3.5 shrink-0" /> Call Us Now
                </a>
              </li>
              <li>
                <a
                  href={whatsappLink("Hello, I'd like to inquire about your borehole services.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 ${link}`}
                >
                  <MessageCircle className="h-3.5 w-3.5 shrink-0" /> Chat on WhatsApp
                </a>
              </li>
              <li>
                <a href="mailto:sabwaterdrillingcompany@gmail.com" className={`flex items-center gap-1.5 ${link}`}>
                  <Mail className="h-3.5 w-3.5 shrink-0" /> Email Us
                </a>
              </li>
              <li className="flex items-center gap-1.5"><MapPin className="h-3 w-3 shrink-0" /> Nairobi, Kenya</li>
              <li className="hidden md:flex items-center gap-1.5"><Clock className="h-3 w-3 shrink-0" /> Mon–Sat 7am–6pm</li>
            </ul>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 items-center gap-1 text-center text-white/45">
          <span className="hidden sm:block" />
          <span>© {new Date().getFullYear()} SAB Borehole Drilling. All rights reserved.</span>
          <a
            href="https://www.facebook.com/perfect.borehole.drillers"
            target="_blank"
            rel="noopener noreferrer"
            className={`sm:text-right ${link}`}
          >
            Facebook
          </a>
        </div>
      </div>
    </footer>
  );
}
