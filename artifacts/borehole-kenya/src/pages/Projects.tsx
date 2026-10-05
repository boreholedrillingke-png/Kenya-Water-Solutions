import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Droplets, ArrowRight, Calendar, Layers, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useListProjects } from "@workspace/api-client-react";

const SERVICE_TYPES = ["All", "Borehole Drilling", "Solar Pump Systems", "Pump Installation", "Water Treatment"];
const CLIENT_TYPES = ["All", "Community", "Agricultural", "Commercial", "Government", "Healthcare", "Education", "Hospitality", "Humanitarian", "Conservation", "Research"];
const REGIONS = ["All", "Nairobi Metropolitan", "Coast", "Rift Valley", "Nyanza", "Western", "Eastern", "Central", "North Eastern", "North Western"];

const CLIENT_COLORS: Record<string, string> = {
  Community: "bg-green-100 text-green-700",
  Agricultural: "bg-yellow-100 text-yellow-700",
  Commercial: "bg-blue-100 text-blue-700",
  Government: "bg-purple-100 text-purple-700",
  Healthcare: "bg-red-100 text-red-700",
  Education: "bg-indigo-100 text-indigo-700",
  Hospitality: "bg-pink-100 text-pink-700",
  Humanitarian: "bg-orange-100 text-orange-700",
  Conservation: "bg-teal-100 text-teal-700",
  Research: "bg-gray-100 text-gray-700",
};

export default function Projects() {
  const [serviceType, setServiceType] = useState("All");
  const [clientType, setClientType] = useState("All");
  const [region, setRegion] = useState("All");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListProjects(
    {
      serviceType: serviceType !== "All" ? serviceType : undefined,
      clientType: clientType !== "All" ? clientType : undefined,
      county: region !== "All" ? undefined : undefined,
      page,
      limit: 12,
    },
    { query: { queryKey: ["projects", serviceType, clientType, region, page] } }
  );

  const projects = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 12);

  function resetFilters() {
    setServiceType("All");
    setClientType("All");
    setRegion("All");
    setPage(1);
  }

  const hasFilters = serviceType !== "All" || clientType !== "All" || region !== "All";

  return (
    <div className="bg-background">
      {/* Header */}
      <div
        className="text-white pt-32 pb-16"
        style={{ background: "linear-gradient(135deg, hsl(210 60% 18%) 0%, hsl(210 80% 28%) 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-3 font-medium">Our Track Record</div>
          <h1 className="text-4xl font-bold mb-4">Completed Projects</h1>
          <p className="text-white/70 text-lg max-w-2xl leading-relaxed">
            Over 2,400 boreholes drilled and water systems installed across all 47 counties of Kenya. Browse our portfolio of real completed projects.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 max-w-2xl">
            {[
              { label: "Projects Completed", value: "2,400+" },
              { label: "Counties Covered", value: "47" },
              { label: "Years Experience", value: "15+" },
              { label: "Success Rate", value: "98%" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white mb-1">{s.value}</div>
                <div className="text-xs text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-5 mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Filter Projects</h2>
            {hasFilters && (
              <button onClick={resetFilters} className="text-xs text-primary hover:text-primary/70 transition-colors">
                Clear all filters
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Service Type</p>
              <div className="flex flex-wrap gap-2">
                {SERVICE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setServiceType(t); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      serviceType === t
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">Client Type</p>
              <div className="flex flex-wrap gap-2">
                {CLIENT_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => { setClientType(t); setPage(1); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      clientType === t
                        ? "bg-primary text-white border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Count */}
        <p className="text-sm text-muted-foreground mb-6">
          {isLoading ? "Loading..." : `Showing ${projects.length} of ${total} projects`}
          {hasFilters && " (filtered)"}
        </p>

        {/* Projects grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => (
              <Card key={i}><CardContent className="p-0">
                <Skeleton className="h-48 w-full rounded-t-xl" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </CardContent></Card>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Droplets className="h-12 w-12 text-muted-foreground/25 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground text-sm mb-4">Try adjusting your filters</p>
            <Button variant="outline" onClick={resetFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full group hover:shadow-lg transition-all cursor-pointer overflow-hidden" data-testid={`card-project-${project.id}`}>
                  <CardContent className="p-0 flex flex-col h-full">
                    {/* Image / colour block */}
                    <div
                      className="h-44 flex flex-col items-start justify-end p-4 relative overflow-hidden"
                      style={{ background: "linear-gradient(135deg, hsl(210 60% 22%) 0%, hsl(200 70% 32%) 100%)" }}
                    >
                      <div className="absolute inset-0 opacity-20" style={{
                        backgroundImage: "radial-gradient(circle at 70% 30%, hsl(40 80% 60%) 0%, transparent 60%)",
                      }} />
                      {project.featured && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                      <div className="relative">
                        <div className="text-2xl font-bold text-white leading-tight line-clamp-2 group-hover:text-amber-200 transition-colors">
                          {project.title}
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CLIENT_COLORS[project.clientType] ?? "bg-gray-100 text-gray-700"}`}>
                          {project.clientType}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {project.serviceType}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span>{project.town}, {project.county} County</span>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 flex-1 mb-4">
                        {project.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border pt-3">
                        {project.depth && (
                          <span className="flex items-center gap-1">
                            <Layers className="h-3 w-3" /> {project.depth}m deep
                          </span>
                        )}
                        {project.yield && (
                          <span className="flex items-center gap-1">
                            <Droplets className="h-3 w-3" /> {project.yield}
                          </span>
                        )}
                        <span className="flex items-center gap-1 ml-auto">
                          <Calendar className="h-3 w-3" /> {project.completionYear}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
            <span className="flex items-center px-4 text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary/8 border border-primary/20 p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Start Your Own Water Project</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Join thousands of satisfied clients across Kenya. Get a free hydrogeological assessment and quote for your location.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg">
              <Link href="/contact">Request a Free Quote</Link>
            </Button>
            <a href="tel:+254103400209">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">Call +254 103 400 209</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
