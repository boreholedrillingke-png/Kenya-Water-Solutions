import { Link } from "wouter";
import { ArrowRight, CheckCircle, Phone, Star, Zap, Shield, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useGetCatalogSummary,
  useListServices,
  useListFeaturedProducts,
  useListServiceCategories,
} from "@workspace/api-client-react";
import { formatKES } from "@/lib/utils";

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
        className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(210 60% 18%) 0%, hsl(210 80% 28%) 50%, hsl(200 70% 35%) 100%)",
        }}
      >
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "radial-gradient(circle at 25% 35%, hsl(40 80% 60%) 0%, transparent 50%), radial-gradient(circle at 75% 65%, hsl(200 100% 70%) 0%, transparent 50%)",
        }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white pt-24 pb-16">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Kenya's Leading Borehole Specialists — All 47 Counties
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Clean Water For Every
            <span className="block text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(90deg, hsl(40 90% 65%), hsl(55 100% 70%))" }}>
              Kenyan Home and Farm
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Professional borehole drilling, pump installation, solar water systems, and equipment supply. Trusted by thousands of households, farms, hotels, and county governments across Kenya.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold px-8 text-base" data-testid="button-hero-quote">
              <Link href="/contact">Get Free Quote <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-medium px-8 text-base">
              <Link href="/services">Our Services</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {summaryLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white/10 rounded-xl p-4">
                  <Skeleton className="h-8 w-16 mx-auto mb-1 bg-white/20" />
                  <Skeleton className="h-3 w-20 mx-auto bg-white/20" />
                </div>
              ))
            ) : [
              { value: `${summary?.countiesServed ?? 47}`, label: "Counties Served" },
              { value: `${(summary?.projectsCompleted ?? 2400).toLocaleString()}+`, label: "Projects Done" },
              { value: `${summary?.totalServices ?? 12}+`, label: "Services Offered" },
              { value: `${summary?.yearsExperience ?? 15}+`, label: "Years Experience" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl p-4">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-xs text-white/65 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-18 bg-background">
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

      {/* Featured Services */}
      <section className="py-18 bg-muted/40">
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
      <section className="py-18 bg-background">
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
      <section className="py-18 bg-muted/40">
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

      {/* CTA */}
      <section className="py-18 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-white/80 mb-8 text-lg">Contact us today for a free site assessment and quote. We operate across all 47 counties of Kenya.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold" data-testid="button-cta-quote">
              <Link href="/contact">Get a Free Quote</Link>
            </Button>
            <a href="tel:+254700000000">
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
