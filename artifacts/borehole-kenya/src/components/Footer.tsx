import { Link } from "wouter";
import { Phone, Mail, MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/utils";

export default function Footer() {
  return (
    <footer className="shrink-0 bg-slate-950 text-white/70 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1">
          <a href="tel:+254762211512" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <Phone className="h-3 w-3" /> +254 762 211 512
          </a>
          <a
            href={whatsappLink("Hello, I'd like to inquire about your borehole services.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <MessageCircle className="h-3 w-3" /> WhatsApp
          </a>
          <a href="mailto:sabwaterdrillingcompany@gmail.com" className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors">
            <Mail className="h-3 w-3" /> sabwaterdrillingcompany@gmail.com
          </a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/services" className="hover:text-white transition-colors">Services</Link>
          <Link href="/products" className="hover:text-white transition-colors">Products</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          <span className="text-white/40">© {new Date().getFullYear()} Kenya Water Solutions</span>
        </div>
      </div>
    </footer>
  );
}
