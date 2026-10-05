import { useState } from "react";
import { Link } from "wouter";
import { Search, ShoppingCart, MessageSquare, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  useListProducts,
  useListProductCategories,
  useAddToCart,
  useGetCart,
} from "@workspace/api-client-react";
import { formatKES, getCartSessionId, whatsappLink } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const { toast } = useToast();
  const sessionId = getCartSessionId();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);

  const { data: categories } = useListProductCategories();
  const { data: products, isLoading } = useListProducts(
    {
      category: activeCategory !== "All" ? activeCategory : undefined,
      inStock: inStockOnly || undefined,
      search: search || undefined,
      page,
      limit: 24,
    },
    { query: { queryKey: ["products", activeCategory, inStockOnly, search, page] } }
  );

  const addToCart = useAddToCart();

  function handleAddToCart(productId: number, productName: string) {
    addToCart.mutate(
      { data: { sessionId, productId, quantity: 1 } },
      {
        onSuccess: () => {
          toast({ title: "Added to cart", description: productName });
        },
      }
    );
  }

  const allCategories = ["All", ...(categories ?? []).map((c) => c.name)];
  const totalPages = products ? Math.ceil(products.total / 24) : 1;

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-foreground text-white pt-32 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-3 font-medium">Equipment Store</div>
          <h1 className="text-4xl font-bold mb-3">Products & Equipment</h1>
          <p className="text-white/70 text-lg max-w-2xl">
            Quality borehole pumps, solar systems, pipes, tanks, and accessories — sourced from trusted international brands.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search pumps, tanks, pipes..."
              className="pl-9"
              data-testid="input-search"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <button
            onClick={() => { setInStockOnly(!inStockOnly); setPage(1); }}
            data-testid="button-instock-filter"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
              inStockOnly
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
            }`}
          >
            <Filter className="h-4 w-4" />
            In Stock Only
          </button>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setPage(1); }}
              data-testid={`button-category-${cat}`}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${
                activeCategory === cat
                  ? "bg-primary text-white border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
              {cat !== "All" && categories && (
                <span className="ml-1.5 text-xs opacity-70">
                  {categories.find((c) => c.name === cat)?.count ?? ""}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Result count */}
        {products && (
          <p className="text-sm text-muted-foreground mb-6">
            Showing {products.items.length} of {products.total} products
            {activeCategory !== "All" && ` in ${activeCategory}`}
          </p>
        )}

        {/* Products grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array(12).fill(0).map((_, i) => (
              <Card key={i}><CardContent className="p-4">
                <Skeleton className="h-44 w-full rounded-lg mb-3" />
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-5 w-1/2 mb-3" />
                <Skeleton className="h-8 w-full" />
              </CardContent></Card>
            ))}
          </div>
        ) : (products?.items ?? []).length === 0 ? (
          <div className="text-center py-20">
            <div className="text-muted-foreground/30 text-6xl mb-4">—</div>
            <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
            <p className="text-muted-foreground text-sm mb-6">Try a different search term or category</p>
            <Button variant="outline" onClick={() => { setSearch(""); setActiveCategory("All"); setInStockOnly(false); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {(products?.items ?? []).map((product) => (
              <Card key={product.id} className="group hover:shadow-md transition-all flex flex-col" data-testid={`card-product-${product.id}`}>
                <CardContent className="p-0 flex flex-col h-full">
                  {/* Image */}
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="bg-muted h-44 rounded-t-xl flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-4xl font-bold text-muted-foreground/20">
                          {product.category.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Details */}
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span className="text-xs text-muted-foreground">{product.category}</span>
                      {product.inStock ? (
                        <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">In Stock</span>
                      ) : (
                        <span className="text-[10px] font-semibold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">Out of Stock</span>
                      )}
                    </div>
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                    {product.brand && <p className="text-xs text-muted-foreground mb-2">{product.brand}</p>}

                    <div className="flex items-baseline gap-2 mb-3 mt-auto">
                      <span className="text-base font-bold text-primary">{formatKES(product.price)}</span>
                      {product.comparePrice && (
                        <span className="text-xs text-muted-foreground line-through">{formatKES(product.comparePrice)}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 text-xs"
                        disabled={!product.inStock || addToCart.isPending}
                        onClick={() => handleAddToCart(product.id, product.name)}
                        data-testid={`button-add-cart-${product.id}`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5 mr-1.5" /> Add to Cart
                      </Button>
                      {product.whatsappOrderEnabled && (
                        <a
                          href={whatsappLink(`Hi, I would like to order: ${product.name} (Price: ${formatKES(product.price)})`)}
                          target="_blank"
                          rel="noopener noreferrer"
                          data-testid={`button-whatsapp-${product.id}`}
                        >
                          <Button size="sm" variant="outline" className="px-2.5 border-[#25D366] text-[#25D366] hover:bg-green-50">
                            <MessageSquare className="h-3.5 w-3.5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
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
      </div>
    </div>
  );
}
