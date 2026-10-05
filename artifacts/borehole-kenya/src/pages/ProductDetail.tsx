import { Link, useParams } from "wouter";
import { ArrowLeft, ShoppingCart, MessageSquare, CheckCircle, Truck, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetProduct, useAddToCart } from "@workspace/api-client-react";
import { formatKES, getCartSessionId, whatsappLink } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [qty, setQty] = useState(1);
  const sessionId = getCartSessionId();

  const { data: product, isLoading } = useGetProduct(Number(id), {
    query: { queryKey: ["product", id] },
  });
  const addToCart = useAddToCart();

  function handleAddToCart() {
    if (!product) return;
    addToCart.mutate(
      { data: { sessionId, productId: product.id, quantity: qty } },
      {
        onSuccess: () => toast({ title: "Added to cart", description: `${qty}x ${product.name}` }),
        onError: () => toast({ title: "Error", description: "Could not add to cart", variant: "destructive" }),
      }
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-6 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Skeleton className="h-72 w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-28 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button asChild><Link href="/products">Browse Products</Link></Button>
        </div>
      </div>
    );
  }

  const savings = product.comparePrice ? product.comparePrice - product.price : null;
  const specs = product.specifications ?? {};

  return (
    <div className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">
          {/* Image */}
          <div className="rounded-xl overflow-hidden bg-muted h-72 lg:h-auto flex items-center justify-center">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <div className="text-6xl font-bold text-muted-foreground/20 mb-2">
                  {product.category.slice(0, 2).toUpperCase()}
                </div>
                <div className="text-sm text-muted-foreground">{product.category}</div>
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3 inline-block">
              {product.category}
            </span>
            {product.brand && (
              <p className="text-sm text-muted-foreground mb-1">{product.brand}</p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-tight">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-bold text-primary" data-testid="text-price">{formatKES(product.price)}</span>
              {product.comparePrice && (
                <span className="text-lg text-muted-foreground line-through">{formatKES(product.comparePrice)}</span>
              )}
            </div>
            {savings && (
              <p className="text-sm text-green-600 font-medium mb-4">You save {formatKES(savings)}</p>
            )}

            {/* Stock */}
            <div className="flex items-center gap-2 mb-5">
              {product.inStock ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    In Stock{product.stockQty ? ` (${product.stockQty} units)` : ""}
                  </span>
                </>
              ) : (
                <span className="text-sm font-medium text-red-500">Out of Stock</span>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{product.description}</p>

            {/* Delivery info */}
            {product.deliveryAvailable && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 p-3 rounded-lg bg-muted/60">
                <Truck className="h-4 w-4 text-primary flex-shrink-0" />
                Delivery available across Kenya
                {product.deliveryDays && <span className="ml-1">in {product.deliveryDays} working days</span>}
              </div>
            )}

            {/* Quantity + Cart */}
            {product.inStock && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-lg leading-none"
                    data-testid="button-qty-minus"
                  >−</button>
                  <span className="px-4 py-2.5 font-medium text-foreground min-w-[3rem] text-center" data-testid="text-qty">{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    className="px-3 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-lg leading-none"
                    data-testid="button-qty-plus"
                  >+</button>
                </div>
                <Button onClick={handleAddToCart} disabled={addToCart.isPending} className="flex-1" data-testid="button-add-cart">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {addToCart.isPending ? "Adding..." : "Add to Cart"}
                </Button>
              </div>
            )}

            {/* WhatsApp order */}
            {product.whatsappOrderEnabled && (
              <a
                href={whatsappLink(`Hi, I want to order ${qty}x ${product.name} (${formatKES(product.price)} each). Please confirm availability and delivery to my county.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                data-testid="button-whatsapp-order"
              >
                <Button variant="outline" className="w-full border-[#25D366] text-[#25D366] hover:bg-green-50">
                  <MessageSquare className="mr-2 h-4 w-4" /> Order via WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Specifications */}
        {Object.keys(specs).length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-foreground mb-5">Technical Specifications</h2>
            <Card className="border-border">
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(specs).map(([key, val], idx) => (
                      <tr key={key} className={idx % 2 === 0 ? "bg-muted/40" : ""}>
                        <td className="px-5 py-3 font-medium text-foreground w-2/5 border-b border-border">{key}</td>
                        <td className="px-5 py-3 text-muted-foreground border-b border-border">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contact CTA */}
        <div className="rounded-xl bg-primary/6 border border-primary/15 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Need Help Choosing?</h3>
            <p className="text-sm text-muted-foreground">Our technical team can recommend the right equipment for your borehole specifications.</p>
          </div>
          <a href="tel:+254762211512" className="flex-shrink-0">
            <Button variant="outline">
              <Phone className="mr-2 h-4 w-4" /> Call Us
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
