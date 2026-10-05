import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Clock, MapPin, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useListServices, useListServiceCategories } from "@workspace/api-client-react";
import { formatKES } from "@/lib/utils";

export default function Services() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const { data: categories } = useListServiceCategories();
  const { data: services, isLoading } = useListServices(
    activeCategory !== "All" ? { category: activeCategory } : {},
    { query: { queryKey: ["services", activeCategory] } }
  );

  const allCategories = ["All", ...(categories ?? []).map((c) => c.name)];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[116px] pb-10">
        <h1 className="sr-only">Our Services</h1>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              data-testid={`button-category-${cat}`}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <Card key={i}><CardContent className="p-6">
                <Skeleton className="h-6 w-2/3 mb-3" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-4/5 mb-4" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(services ?? []).map((service) => (
              <Card key={service.id} className="h-full group hover:shadow-lg transition-all border-border" data-testid={`card-service-${service.id}`}>
                <CardContent className="p-4 flex flex-col h-full">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {service.category}
                    </span>
                    {service.duration && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {service.duration}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-semibold text-foreground mb-1.5 group-hover:text-primary transition-colors">
                    {service.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-snug mb-3 flex-1 line-clamp-3">
                    {service.shortDescription}
                  </p>
                  {service.highlights.length > 0 && (
                    <ul className="space-y-1 mb-3">
                      {service.highlights.slice(0, 3).map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-col gap-2 pt-3 border-t border-border mt-auto">
                    {service.priceFrom ? (
                      <span className="text-sm font-medium text-foreground">
                        From <span className="text-primary font-bold">{formatKES(service.priceFrom)}</span>
                        {service.priceUnit && <span className="text-muted-foreground font-normal"> / {service.priceUnit}</span>}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Price on enquiry</span>
                    )}
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link href={`/services/${service.id}`}>
                        Details <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Purification + Custom solution */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          <Card className="border-border" data-testid="card-service-purification">
            <CardContent className="p-5 flex flex-col h-full">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  Purification
                </span>
                <Droplets className="h-4 w-4 text-primary" />
              </div>
              <h2 className="text-base font-semibold text-foreground mb-1.5">Water Purification</h2>
              <p className="text-sm text-muted-foreground leading-snug mb-3">
                Filtration and treatment systems that make your water safe and clean, matched to your water test results.
              </p>
              <ul className="space-y-1 mb-4">
                {["Water testing", "Filtration and treatment", "Installation and servicing"].map((h) => (
                  <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-border mt-auto">
                <span className="text-sm text-muted-foreground">Quote on request</span>
                <Button asChild size="sm">
                  <Link href="/contact">Request a Quote <ArrowRight className="ml-1.5 h-3.5 w-3.5" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-xl bg-primary/8 border border-primary/20 p-5 flex flex-col justify-center text-center">
            <h2 className="text-lg font-bold text-foreground mb-2">Need a Custom Solution?</h2>
            <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
              Every water project is unique. Contact our team for a free site assessment and tailored quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/contact">Request a Quote</Link>
              </Button>
              <a href="tel:+254762211512">
                <Button variant="outline" className="w-full sm:w-auto">Call +254 762 211 512</Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
