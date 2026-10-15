import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import Home from "@/pages/Home";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Contact from "@/pages/Contact";
import Purification from "@/pages/Purification";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import Feed from "@/pages/Feed";
import Admin from "@/pages/Admin";
import Join from "@/pages/Join";
import Account from "@/pages/Account";
import { captureRef } from "@/lib/member";
import NotFound from "@/pages/not-found";
import { hydrateCache, persistCache, prefetchSite } from "@/lib/prefetch";
import OfferPopup from "@/components/OfferPopup";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnWindowFocus: false },
  },
});

function Router() {
  const [loc] = useLocation();
  const onAdmin = loc === "/admin" || loc === "/join" || loc === "/account"; // no offer popup or chat button on the admin page
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/services" component={Services} />
          <Route path="/services/:id" component={ServiceDetail} />
          <Route path="/products" component={Products} />
          <Route path="/products/:id" component={ProductDetail} />
          <Route path="/cart" component={Cart} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/:id" component={ProjectDetail} />
          <Route path="/feed" component={Feed} />
          <Route path="/admin" component={Admin} />
          <Route path="/join" component={Join} />
          <Route path="/account" component={Account} />
          <Route path="/purification" component={Purification} />
          <Route path="/contact" component={Contact} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      {!onAdmin && <WhatsAppButton />}
      {!onAdmin && <OfferPopup />}
    </div>
  );
}

captureRef();
hydrateCache(queryClient);
persistCache(queryClient);

function App() {
  useEffect(() => {
    prefetchSite(queryClient);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
