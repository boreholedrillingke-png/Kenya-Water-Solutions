import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ShoppingCart, Phone, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCart } from "@workspace/api-client-react";
import { getCartSessionId } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/products", label: "Products" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const sessionId = getCartSessionId();

  const { data: cart } = useGetCart(
    { sessionId },
    { query: { queryKey: ["cart", sessionId] } }
  );

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const cartCount = cart?.itemCount ?? 0;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md border-b border-border" : "bg-white/95 backdrop-blur-sm"
      }`}
    >
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 flex items-center justify-between">
        <span className="hidden sm:block font-medium">Kenya's Leading Borehole Drilling Company — Serving All 47 Counties</span>
        <span className="sm:hidden font-medium">Serving All 47 Counties</span>
        <a href="tel:+254762211512" className="flex items-center gap-1 hover:text-white/80 transition-colors">
          <Phone className="h-3 w-3" />
          <span>+254 762 211 512</span>
        </a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/90 transition-colors">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-bold text-foreground">Borehole Drilling</div>
              <div className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">Services Kenya</div>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === link.href
                    ? "text-primary bg-primary/8"
                    : "text-foreground/80 hover:text-primary hover:bg-primary/6"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative p-2 rounded-md hover:bg-muted transition-colors" data-testid="link-cart">
              <ShoppingCart className="h-5 w-5 text-foreground/70" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 text-[10px] font-bold bg-primary text-white rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="/contact">Get Free Quote</Link>
            </Button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
              onClick={() => setOpen(!open)}
              data-testid="button-menu-toggle"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border py-3 pb-4">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    location === link.href
                      ? "text-primary bg-primary/8"
                      : "text-foreground/80 hover:text-primary hover:bg-primary/6"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 px-4">
                <Button asChild className="w-full" size="sm">
                  <Link href="/contact" onClick={() => setOpen(false)}>Get Free Quote</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
