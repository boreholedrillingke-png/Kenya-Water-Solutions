import { useState } from "react";
import { Link } from "wouter";
import { MapPin, Droplets, Calendar, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import PageBanner from "@/components/PageBanner";
import { IMAGES, pickImage } from "@/lib/images";
import { useListProjects } from "@workspace/api-client-react";

const PAGE_SIZE = 8;
const SERVICE_TYPES = ["All", "Borehole Drilling", "Solar Pump Systems", "Pump Installation", "Water Treatment"];
const CLIENT_TYPES = ["All", "Community", "Agricultural", "Commercial", "Government", "Healthcare", "Education", "Hospitality", "Humanitarian", "Conservation", "Research"];

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

const select =
  "h-8 rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function Projects() {
  const [serviceType, setServiceType] = useState("All");
  const [clientType, setClientType] = useState("All");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListProjects(
    {
      serviceType: serviceType !== "All" ? serviceType : undefined,
      clientType: clientType !== "All" ? clientType : undefined,
      page,
      limit: PAGE_SIZE,
    },
    { query: { queryKey: ["projects", serviceType, clientType, page] } }
  );

  const projects = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasFilters = serviceType !== "All" || clientType !== "All";

  function resetFilters() {
    setServiceType("All");
    setClientType("All");
    setPage(1);
  }

  return (
    <div className="bg-background">
      <PageBanner
        image={IMAGES.rig}
        eyebrow="Our Track Record"
        title="Completed Projects"
        description="Boreholes and water systems delivered for homes, farms and institutions across Kenya."
      >
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: "Projects", value: "2,400+" },
            { label: "Counties", value: "47" },
            { label: "Years", value: "15+" },
            { label: "Success", value: "98%" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg bg-white/10 border border-white/15 px-2 py-2.5 text-center">
              <div className="text-lg font-extrabold text-amber-300 leading-none mb-1">{s.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/65">{s.label}</div>
            </div>
          ))}
        </div>
      </PageBanner>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-2xl border border-border bg-card shadow-sm p-3">
          {/* Filters + count */}
          <div className="flex flex-wrap items-center gap-2 mb-3 px-1">
            <select className={select} value={serviceType} onChange={(e) => { setServiceType(e.target.value); setPage(1); }} aria-label="Service type">
              {SERVICE_TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All services" : t}</option>)}
            </select>
            <select className={select} value={clientType} onChange={(e) => { setClientType(e.target.value); setPage(1); }} aria-label="Client type">
              {CLIENT_TYPES.map((t) => <option key={t} value={t}>{t === "All" ? "All clients" : t}</option>)}
            </select>
            {hasFilters && (
              <button onClick={resetFilters} className="text-xs text-primary hover:text-primary/70 transition-colors">Clear</button>
            )}
            <span className="ml-auto text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `Showing ${projects.length} of ${total} projects`}
            </span>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {Array(PAGE_SIZE).fill(0).map((_, i) => (
                <Card key={i}><CardContent className="p-0">
                  <Skeleton className="h-24 w-full rounded-t-xl" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </CardContent></Card>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <Droplets className="h-8 w-8 text-muted-foreground/25 mx-auto mb-2" />
              <h3 className="text-sm font-medium text-foreground mb-1">No projects found</h3>
              <p className="text-muted-foreground text-xs mb-3">Try adjusting your filters</p>
              <Button variant="outline" size="sm" onClick={resetFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {projects.map((project) => (
                <Link key={project.id} href={`/projects/${project.id}`}>
                  <Card className="h-full group hover:shadow-md transition-all cursor-pointer overflow-hidden" data-testid={`card-project-${project.id}`}>
                    <CardContent className="p-0 flex flex-col h-full">
                      <div
                        className="h-28 flex items-end p-3 relative overflow-hidden"
                        style={{
                          background: `linear-gradient(180deg, hsl(215 70% 8% / .15) 0%, hsl(215 70% 8% / .88) 100%), url(${pickImage(project.serviceType, project.title, project.description)}) center / cover`,
                        }}
                      >
                        {project.featured && (
                          <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider bg-amber-400 text-amber-900 px-1.5 py-0.5 rounded-full">
                            Featured
                          </span>
                        )}
                        <div className="text-sm font-bold text-white leading-tight line-clamp-2 group-hover:text-amber-200 transition-colors">
                          {project.title}
                        </div>
                      </div>

                      <div className="p-3 flex flex-col flex-1">
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${CLIENT_COLORS[project.clientType] ?? "bg-gray-100 text-gray-700"}`}>
                            {project.clientType}
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                            {project.serviceType}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mb-1.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{project.town}, {project.county} County</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 flex-1 mb-2">
                          {project.description}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground border-t border-border pt-2">
                          {project.depth && (
                            <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {project.depth}m</span>
                          )}
                          {project.yield && (
                            <span className="flex items-center gap-1"><Droplets className="h-3 w-3" /> {project.yield}</span>
                          )}
                          <span className="flex items-center gap-1 ml-auto"><Calendar className="h-3 w-3" /> {project.completionYear}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-3">
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="px-3 text-xs text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" className="h-8 text-xs" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </div>

        {/* Slim CTA */}
        <div className="mt-3 rounded-xl bg-primary/8 border border-primary/20 px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm font-semibold text-foreground">Start your own water project</span>
          <div className="flex gap-2">
            <Button asChild size="sm" className="h-8 text-xs"><Link href="/contact">Request a Free Quote</Link></Button>
            <a href="tel:+254762211512">
              <Button size="sm" variant="outline" className="h-8 text-xs">Call +254 762 211 512</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
