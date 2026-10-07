import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageBanner from "@/components/PageBanner";
import { IMAGES } from "@/lib/images";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useCreateInquiry } from "@workspace/api-client-react";
import { whatsappLink, KENYA_COUNTIES } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ContactForm {
  name: string;
  phone: string;
  email: string;
  county: string;
  inquiryType: string;
  message: string;
}

const contactInfo = [
  { icon: Phone, label: "Phone / WhatsApp", value: "+254 762 211 512", href: "tel:+254762211512" },
  { icon: Mail, label: "Email", value: "sabwaterdrillingcompany@gmail.com", href: "mailto:sabwaterdrillingcompany@gmail.com" },
  { icon: MapPin, label: "Head Office", value: "Nairobi, Kenya", href: null },
  { icon: Clock, label: "Working Hours", value: "Mon–Sat 7:00am – 6:00pm (Emergency 24/7)", href: null },
];

export default function Contact() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const createInquiry = useCreateInquiry();

  const form = useForm<ContactForm>({
    defaultValues: { name: "", phone: "", email: "", county: "", inquiryType: "", message: "" },
  });

  function onSubmit(values: ContactForm) {
    createInquiry.mutate(
      {
        data: {
          name: values.name,
          phone: values.phone,
          email: values.email || null,
          county: values.county || null,
          inquiryType: (values.inquiryType as "service_quote" | "product_order" | "general" | "emergency") || "general",
          serviceId: null,
          message: values.message,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          form.reset();
        },
        onError: () => {
          toast({ title: "Error", description: "Could not send inquiry. Please call us directly.", variant: "destructive" });
        },
      }
    );
  }

  const label = "text-xs";

  return (
    <div className="bg-background">
      <PageBanner
        image={IMAGES.water}
        eyebrow="Get in Touch"
        title="Contact Us"
        description="Get a free quote, ask a question, or report an emergency. We respond within 24 hours."
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={whatsappLink("Hello, I would like to inquire about your borehole services.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button className="w-full h-10 bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm">
              <MessageSquare className="mr-2 h-4 w-4" /> Chat on WhatsApp
            </Button>
          </a>
          <a href="tel:+254762211512" className="flex-1">
            <Button variant="outline" className="w-full h-10 border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white text-sm">
              <Phone className="mr-2 h-4 w-4" /> +254 762 211 512
            </Button>
          </a>
        </div>
      </PageBanner>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="rounded-2xl border border-border bg-card shadow-sm p-3">
          {/* Info row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3">
            {contactInfo.map((item) => {
              const inner = (
                <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 h-full hover:border-primary/40 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</div>
                    <div className="text-xs font-medium text-foreground break-words leading-snug">{item.value}</div>
                  </div>
                </div>
              );
              return item.href ? <a key={item.label} href={item.href}>{inner}</a> : <div key={item.label}>{inner}</div>;
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center h-full flex flex-col items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
                  <h2 className="text-base font-semibold text-foreground mb-1">Inquiry Sent Successfully</h2>
                  <p className="text-sm text-muted-foreground mb-4">Our team will contact you within 24 hours. For urgent matters, please call or WhatsApp us.</p>
                  <Button onClick={() => setSubmitted(false)} variant="outline" size="sm">Send Another Inquiry</Button>
                </div>
              ) : (
                <div className="rounded-xl border border-border p-4">
                  <h2 className="text-sm font-semibold text-foreground mb-3">Send us a message</h2>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <FormField control={form.control} name="name" rules={{ required: "Name is required" }} render={({ field }) => (
                          <FormItem>
                            <FormLabel className={label}>Full Name *</FormLabel>
                            <FormControl><Input className="h-9 text-sm" placeholder="John Kamau" {...field} data-testid="input-name" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" rules={{ required: "Phone is required" }} render={({ field }) => (
                          <FormItem>
                            <FormLabel className={label}>Phone *</FormLabel>
                            <FormControl><Input className="h-9 text-sm" placeholder="+254 7xx xxx xxx" {...field} data-testid="input-phone" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={label}>Email (optional)</FormLabel>
                            <FormControl><Input className="h-9 text-sm" type="email" placeholder="john@example.com" {...field} data-testid="input-email" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField control={form.control} name="county" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={label}>County</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-9 text-sm" data-testid="select-county"><SelectValue placeholder="Select your county" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {KENYA_COUNTIES.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="inquiryType" rules={{ required: "Please select an inquiry type" }} render={({ field }) => (
                          <FormItem>
                            <FormLabel className={label}>Inquiry Type *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-9 text-sm" data-testid="select-inquiry-type"><SelectValue placeholder="What can we help with?" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="service_quote">Service Quote</SelectItem>
                                <SelectItem value="product_order">Product Order</SelectItem>
                                <SelectItem value="general">General Inquiry</SelectItem>
                                <SelectItem value="emergency">Emergency Repair</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="message" rules={{ required: "Message is required" }} render={({ field }) => (
                        <FormItem>
                          <FormLabel className={label}>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              className="text-sm"
                              placeholder="Describe your water needs, location or project size..."
                              rows={3}
                              {...field}
                              data-testid="input-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <Button type="submit" className="w-full h-9" disabled={createInquiry.isPending} data-testid="button-submit">
                        {createInquiry.isPending ? "Sending..." : "Send Inquiry"}
                      </Button>
                    </form>
                  </Form>
                </div>
              )}
            </div>

            {/* Side: emergency + coverage */}
            <div className="flex flex-col gap-3">
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="text-sm font-semibold text-red-700 mb-1">24/7 Emergency Line</div>
                <p className="text-xs text-red-600 mb-3">For pump failures and urgent water supply emergencies.</p>
                <a href="tel:+254762211512">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full h-8 text-xs">
                    <Phone className="mr-2 h-3.5 w-3.5" /> +254 762 211 512
                  </Button>
                </a>
              </div>
              <div className="rounded-xl border border-border p-4 flex-1">
                <h3 className="text-sm font-semibold text-foreground mb-2">Counties we serve</h3>
                <div className="flex flex-wrap gap-1.5">
                  {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Kisii", "Kakamega", "Nyeri", "Meru", "Machakos", "Kitui"].map((c) => (
                    <span key={c} className="text-[11px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{c}</span>
                  ))}
                  <span className="text-[11px] text-primary font-medium px-1 py-0.5">+35 more</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
