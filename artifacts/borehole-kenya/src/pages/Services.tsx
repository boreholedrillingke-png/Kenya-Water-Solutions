import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Clock, Droplets } from "lucide-react";
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[108px] pb-6">
        <h1 className="sr-only">Our Services</h1>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              data-testid={`button-category-${cat}`}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* One grid, all rows the same height */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 auto-rows-fr gap-3">
          {isLoading
            ? Array(4).fill(0).map((_, i) => (
                <Card key={i}><CardContent className="p-3.5">
                  <Skeleton className="h-4 w-2/3 mb-2" />
                  <Skeleton className="h-3 w-full mb-1" />
                  <Skeleton className="h-3 w-4/5 mb-3" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent></Card>
              ))
            : (services ?? []).map((service) => (
                <Card key={service.id} className="h-full group hover:shadow-md transition-all border-border" data-testid={`card-service-${service.id}`}>
                  <CardContent className="p-3.5 flex flex-col h-full">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {service.category}
                      </span>
                      {service.duration && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground text-right">
                          <Clock className="h-3 w-3 shrink-0" /> {service.duration}
                        </span>
                      )}
                    </div>
                    <h2 className="text-sm font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {service.name}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-snug mb-2 line-clamp-3 min-h-[3.1em]">
                      {service.shortDescription}
                    </p>
                    {service.highlights.length > 0 && (
                      <ul className="space-y-0.5 mb-2">
                        {service.highlights.slice(0, 3).map((h) => (
                          <li key={h} className="flex items-start gap-1.5 text-[11px] leading-tight text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-500 shrink-0 mt-px" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-auto pt-2 border-t border-border">
                      <div className="text-xs text-foreground min-h-[2.1em] mb-1.5">
                        {service.priceFrom ? (
                          <>
                            From <span className="text-primary font-bold">{formatKES(service.priceFrom)}</span>
                            {service.priceUnit && <span className="text-muted-foreground"> / {service.priceUnit}</span>}
                          </>
                        ) : (
                          <span className="text-muted-foreground">Price on enquiry</span>
                        )}
                      </div>
                      <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs">
                        <Link href={`/services/${service.id}`}>
                          Details <ArrowRight className="ml-1 h-3 w-3" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

          {/* Water purification (quote based) */}
          {!isLoading && (
            <Card className="lg:col-span-2 lg:col-start-1 sm:col-span-2 border-border" data-testid="card-service-purification">
              <CardContent className="p-3.5 flex flex-col h-full">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    Purification
                  </span>
                  <Droplets className="h-3.5 w-3.5 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-foreground mb-1">Water Purification</h2>
                <p className="text-xs text-muted-foreground leading-snug mb-2">
                  Filtration and treatment systems that make your water safe and clean, matched to your water test results.
                </p>
                <ul className="space-y-0.5 mb-2">
                  {["Water testing", "Filtration and treatment", "Installation and servicing"].map((h) => (
                    <li key={h} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <CheckCircle className="h-3 w-3 text-green-500 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-2 border-t border-border flex items-center justify-between gap-3">
                  <span className="text-xs text-muted-foreground">Quote on request</span>
                  <Button asChild size="sm" className="h-8 text-xs">
                    <Link href="/contact">Request a Quote <ArrowRight className="ml-1 h-3 w-3" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Custom solution */}
          {!isLoading && (
            <div className="lg:col-span-2 sm:col-span-2 rounded-xl bg-primary/8 border border-primary/20 p-3.5 flex flex-col justify-center text-center">
              <h2 className="text-sm font-bold text-foreground mb-1">Need a Custom Solution?</h2>
              <p className="text-xs text-muted-foreground mb-3 max-w-sm mx-auto">
                Every water project is unique. Contact our team for a free site assessment and tailored quote.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button asChild size="sm" className="h-8 text-xs">
                  <Link href="/contact">Request a Quote</Link>
                </Button>
                <a href="tel:+254762211512">
                  <Button size="sm" variant="outline" className="h-8 text-xs w-full sm:w-auto">Call +254 762 211 512</Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
