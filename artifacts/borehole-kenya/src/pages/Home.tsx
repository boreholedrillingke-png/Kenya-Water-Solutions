import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Phone, Star, Zap, Shield, Users, Award, MessageCircle, MapPin, ClipboardCheck, Drill, Droplets, Wrench } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCatalogSummary,
  useListServices,
  useListFeaturedProducts,
  useListServiceCategories,
} from "@workspace/api-client-react";
import { formatKES, whatsappLink, KENYA_COUNTIES } from "@/lib/utils";

const testimonials = [
  { name: "James Mwangi", location: "Nakuru County", text: "Excellent work! They drilled a 120m borehole on our farm and hit water on the first attempt. Highly professional team.", rating: 5 },
  { name: "Grace Akinyi", location: "Kisumu County", text: "The solar pump system they installed has been running flawlessly for 2 years. Zero maintenance issues. Worth every shilling.", rating: 5 },
  { name: "David Kipchoge", location: "Uasin Gishu County", text: "Fast response to our emergency repair call. Technicians arrived within 3 hours and had our pump running by evening.", rating: 5 },
];

const whyUs = [
  { icon: Award, title: "15+ Years Experience", desc: "Over a decade of borehole drilling across all terrain types in Kenya." },
  { icon: Users, title: "2,400+ Projects", desc: "Successfully completed projects for homes, farms, hotels, and institutions." },
  { icon: Shield, title: "5-Year Guarantee", desc: "All drilling and installation work backed by our workmanship guarantee." },
  { icon: Zap, title: "24/7 Emergency Service", desc: "Round-the-clock emergency response for critical water supply failures." },
];

const process = [
  { icon: MapPin, title: "Site Visit & Survey", desc: "We visit your land, assess the terrain and carry out a hydrogeological survey to pinpoint the best drilling spot." },
  { icon: ClipboardCheck, title: "Clear Written Quote", desc: "You receive an itemised quote covering drilling depth, casing, pump and installation, with no hidden costs." },
  { icon: Drill, title: "Drilling & Casing", desc: "Our crew drills to the agreed depth, installs casing and gravel pack, and flushes the borehole until water runs clear." },
  { icon: Droplets, title: "Pump & Handover", desc: "We install the pump and water system, test flow and quality, and walk you through running and maintaining it." },
];

const faqs = [
  { q: "How much does it cost to drill a borehole in Kenya?", a: "Cost depends on your location, the depth needed, the geology and the pump system you choose. Request a free site assessment and we will give you an itemised written quote." },
  { q: "How long does drilling take?", a: "Most boreholes are drilled within 1 to 3 days once the crew is on site. Surveying beforehand and pump installation afterwards add a few more days." },
  { q: "Do you do a survey before drilling?", a: "Yes. A hydrogeological survey helps locate the most promising water-bearing zone before any drilling begins, which reduces the risk of a dry hole." },
  { q: "Can you install solar pumps?", a: "Yes. We design and install solar-powered pumping systems that cut your electricity costs, and we also supply and fit electric and submersible pumps." },
  { q: "Do you serve my county?", a: "We work across Kenya. Send us your location on WhatsApp or the quote form and we will confirm availability and timelines for your area." },
];

function QuickQuote() {
  const [name, setName] = useState("");
  const [county, setCounty] = useState("");
  const [service, setService] = useState("Borehole Drilling");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Hello, my name is ${name || "a customer"}${county ? ` from ${county} County` : ""}. I would like a free quote for: ${service}.`;
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
  };

  const field = "w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-amber-300/70";

  return (
    <form onSubmit={submit} className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-2xl text-left" data-testid="form-quick-quote">
      <div className="text-lg font-bold mb-1">Get a free quote in minutes</div>
      <p className="text-sm text-white/70 mb-5">Tell us where you are and what you need. We reply on WhatsApp.</p>
      <div className="space-y-3">
        <input className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Your name" />
        <select className={`${field} [&>option]:text-foreground`} value={county} onChange={(e) => setCounty(e.target.value)} aria-label="County">
          <option value="">Select your county</option>
          {KENYA_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className={`${field} [&>option]:text-foreground`} value={service} onChange={(e) => setService(e.target.value)} aria-label="Service needed">
          {["Borehole Drilling", "Hydrogeological Survey", "Pump Installation", "Solar Water System", "Borehole Repair & Rehabilitation"].map((o) => <option key={o}>{o}</option>)}
        </select>
      </div>
      <button type="submit" className="mt-5 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 font-semibold py-3 transition-colors" data-testid="button-quick-quote">
        <MessageCircle className="h-4 w-4" /> Request Quote on WhatsApp
      </button>
      <a href="tel:+254762211512" className="mt-3 flex items-center justify-center gap-2 text-sm text-white/80 hover:text-white">
        <Phone className="h-3.5 w-3.5" /> or call +254 762 211 512
      </a>
    </form>
  );
}

export default function Home() {
  const { data: summary, isLoading: summaryLoading } = useGetCatalogSummary();
  const { data: services, isLoading: servicesLoading } = useListServices(
    { featured: true },
    { query: { queryKey: ["services", "featured"] } }
  );
  const { data: featuredProducts, isLoading: productsLoading } = useListFeaturedProducts();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, hsl(215 70% 12%) 0%, hsl(212 75% 22%) 55%, hsl(200 70% 30%) 100%)" }}
      >
        <div className="absolute inset-0 opacity-[0.12]" style={{
          backgroundImage: "linear-gradient(hsl(0 0% 100% / .5) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / .5) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse at 30% 40%, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 30% 40%, black 0%, transparent 70%)",
        }} />
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-28 grid lg:grid-cols-5 gap-12 items-center">
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-7">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Borehole specialists serving all 47 counties
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.05] mb-6">
              Reliable water,
              <span className="block text-amber-300">drilled right the first time.</span>
            </h1>

            <p className="text-lg text-white/80 max-w-xl mb-9 leading-relaxed">
              Hydrogeological surveys, borehole drilling, pump installation and solar water systems for homes, farms, schools and businesses across Kenya.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button asChild size="lg" className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-semibold px-8 text-base" data-testid="button-hero-quote">
                <Link href="/contact">Get Free Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white font-medium px-8 text-base">
                <Link href="/services">Our Services</Link>
              </Button>
            </div>

            <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/80">
              {["Free site assessment", "Itemised written quotes", "Workmanship guarantee", "24/7 emergency repairs"].map((t) => (
                <li key={t} className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-400" />{t}</li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <QuickQuote />
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 rounded-2xl bg-card border border-border shadow-xl divide-x divide-y md:divide-y-0 divide-border overflow-hidden">
            {summaryLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="p-6 text-center"><Skeleton className="h-8 w-16 mx-auto mb-2" /><Skeleton className="h-3 w-20 mx-auto" /></div>
              ))
            ) : [
              { value: `${summary?.countiesServed ?? 47}`, label: "Counties Served" },
              { value: `${(summary?.projectsCompleted ?? 2400).toLocaleString()}+`, label: "Projects Completed" },
              { value: `${summary?.totalServices ?? 12}+`, label: "Services Offered" },
              { value: `${summary?.yearsExperience ?? 15}+`, label: "Years Experience" },
            ].map((stat) => (
              <div key={stat.label} className="p-6 text-center">
                <div className="text-3xl font-extrabold text-primary" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Why Kenyans Trust Us</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">From Nairobi to Turkana, we bring the same commitment to quality water access.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="flex flex-col items-start p-6 rounded-xl border border-border bg-card hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">How it works</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">From first call to flowing water</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A simple, transparent process so you always know what happens next.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {process.map((step, i) => (
              <div key={step.title} className="relative rounded-2xl border border-border bg-card p-7 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="absolute top-5 right-6 text-5xl font-extrabold text-primary/10" style={{ fontFamily: "var(--font-display)" }}>0{i + 1}</div>
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-5">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Our Core Services</h2>
              <p className="text-muted-foreground">End-to-end water solutions — from survey to commissioning.</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/services">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          {servicesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <Card key={i}><CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {(services ?? []).map((service) => (
                <Link key={service.id} href={`/services/${service.id}`}>
                  <Card className="h-full hover:shadow-lg transition-all cursor-pointer group border-border" data-testid={`card-service-${service.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          {service.category}
                        </span>
                        {service.priceFrom && (
                          <span className="text-xs text-muted-foreground">From {formatKES(service.priceFrom)}</span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{service.shortDescription}</p>
                      {service.highlights.length > 0 && (
                        <ul className="space-y-1">
                          {service.highlights.slice(0, 3).map((h) => (
                            <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8 sm:hidden">
            <Button asChild variant="outline">
              <Link href="/services">View All Services <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Equipment & Products</h2>
              <p className="text-muted-foreground">Quality borehole equipment sourced from trusted international brands.</p>
            </div>
            <Button asChild variant="outline" className="hidden sm:inline-flex">
              <Link href="/products">Browse Store <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array(4).fill(0).map((_, i) => (
                <Card key={i}><CardContent className="p-4">
                  <Skeleton className="h-40 w-full mb-3 rounded-lg" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent></Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {(featuredProducts ?? []).slice(0, 8).map((product) => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <Card className="h-full hover:shadow-md transition-all cursor-pointer group" data-testid={`card-product-${product.id}`}>
                    <CardContent className="p-4">
                      <div className="bg-muted rounded-lg h-36 flex items-center justify-center mb-3 overflow-hidden">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="text-3xl text-muted-foreground/30 font-bold">{product.category.slice(0, 2).toUpperCase()}</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">{product.category}</div>
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-primary">{formatKES(product.price)}</span>
                        {product.inStock ? (
                          <span className="text-xs text-green-600 font-medium">In Stock</span>
                        ) : (
                          <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Button asChild>
              <Link href="/products">Browse All Products <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-muted/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">What Our Clients Say</h2>
            <p className="text-muted-foreground">Real feedback from customers across Kenya.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <Card key={t.name} className="border-border">
                <CardContent className="p-6">
                  <div className="flex gap-0.5 mb-4">
                    {Array(t.rating).fill(0).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div>
                    <div className="font-semibold text-foreground text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.location}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">FAQ</div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Questions we hear most</h2>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-6">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} value={`faq-${i}`}>
                <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-white" style={{ background: "linear-gradient(135deg, hsl(215 70% 12%), hsl(212 75% 24%))" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8 text-lg">Contact us today for a free site assessment and quote. We operate across all 47 counties of Kenya.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-amber-400 text-slate-900 hover:bg-amber-300 font-semibold" data-testid="button-cta-quote">
              <Link href="/contact">Get a Free Quote</Link>
            </Button>
            <a href="tel:+254762211512">
              <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 w-full sm:w-auto">
                <Phone className="mr-2 h-4 w-4" /> Call Now
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
