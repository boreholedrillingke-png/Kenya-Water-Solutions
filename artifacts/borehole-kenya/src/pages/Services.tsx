import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle, Clock, MapPin } from "lucide-react";
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
      {/* Header */}
      <div className="bg-foreground text-white pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-3 font-medium">What We Do</div>
          <h1 className="text-4xl font-bold mb-4">Our Services</h1>
          <p className="text-white/70 max-w-2xl text-lg">
            Comprehensive borehole and water solutions from initial survey to final commissioning — and everything in between.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-10">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(services ?? []).map((service) => (
              <Card key={service.id} className="h-full group hover:shadow-lg transition-all border-border" data-testid={`card-service-${service.id}`}>
                <CardContent className="p-6 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {service.category}
                    </span>
                    {service.duration && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /> {service.duration}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {service.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                    {service.shortDescription}
                  </p>
                  {service.highlights.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {service.highlights.slice(0, 4).map((h) => (
                        <li key={h} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                    {service.priceFrom ? (
                      <span className="text-sm font-medium text-foreground">
                        From <span className="text-primary font-bold">{formatKES(service.priceFrom)}</span>
                        {service.priceUnit && <span className="text-muted-foreground font-normal"> / {service.priceUnit}</span>}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">Price on enquiry</span>
                    )}
                    <Button asChild size="sm" variant="outline">
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

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary/8 border border-primary/20 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Need a Custom Solution?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Every water project is unique. Contact our team for a free site assessment and tailored quote.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Request a Quote</Link>
            </Button>
            <a href="tel:+254700000000">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Call +254 700 000 000</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
