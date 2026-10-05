import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="bg-foreground text-white pt-32 pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-xs uppercase tracking-widest text-white/50 mb-3 font-medium">Get in Touch</div>
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-white/70 text-lg max-w-xl">
            Get a free quote, ask a technical question, or report an emergency. Our team responds within 24 hours.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact info sidebar */}
          <div className="space-y-6">
            {contactInfo.map((item) => (
              <div key={item.label} className="flex gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</div>
                  {item.href ? (
                    <a href={item.href} className="text-foreground font-medium hover:text-primary transition-colors text-sm">{item.value}</a>
                  ) : (
                    <p className="text-foreground text-sm">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* WhatsApp */}
            <div className="mt-6">
              <a
                href={whatsappLink("Hello, I would like to inquire about your borehole services.")}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white">
                  <MessageSquare className="mr-2 h-4 w-4" /> Chat on WhatsApp
                </Button>
              </a>
            </div>

            {/* Emergency */}
            <Card className="border-red-200 bg-red-50 mt-6">
              <CardContent className="p-4">
                <div className="text-sm font-semibold text-red-700 mb-1">24/7 Emergency Line</div>
                <p className="text-xs text-red-600 mb-3">For borehole pump failures and urgent water supply emergencies.</p>
                <a href="tel:+254762211512">
                  <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white w-full">
                    <Phone className="mr-2 h-3.5 w-3.5" /> +254 762 211 512
                  </Button>
                </a>
              </CardContent>
            </Card>

            {/* Coverage */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Counties We Serve</h3>
              <div className="flex flex-wrap gap-1.5">
                {["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika", "Kisii", "Kakamega", "Nyeri", "Meru", "Machakos", "Kitui"].map((c) => (
                  <span key={c} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{c}</span>
                ))}
                <span className="text-xs text-primary font-medium px-2 py-0.5">+35 more</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-10 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Inquiry Sent Successfully</h2>
                <p className="text-muted-foreground mb-6">Our team will contact you within 24 hours. For urgent matters, please call or WhatsApp us directly.</p>
                <Button onClick={() => setSubmitted(false)} variant="outline">Send Another Inquiry</Button>
              </div>
            ) : (
              <Card className="border-border">
                <CardContent className="p-8">
                  <h2 className="text-xl font-semibold text-foreground mb-1">Send Us a Message</h2>
                  <p className="text-sm text-muted-foreground mb-6">Fill in the form and we'll get back to you with a detailed response or quote.</p>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField control={form.control} name="name" rules={{ required: "Name is required" }} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl><Input placeholder="John Kamau" {...field} data-testid="input-name" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" rules={{ required: "Phone is required" }} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl><Input placeholder="+254 7xx xxx xxx" {...field} data-testid="input-phone" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField control={form.control} name="email" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (optional)</FormLabel>
                            <FormControl><Input type="email" placeholder="john@example.com" {...field} data-testid="input-email" /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="county" render={({ field }) => (
                          <FormItem>
                            <FormLabel>County</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-county"><SelectValue placeholder="Select your county" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {KENYA_COUNTIES.map((c) => (
                                  <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="inquiryType" rules={{ required: "Please select an inquiry type" }} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Inquiry Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-inquiry-type"><SelectValue placeholder="What can we help you with?" /></SelectTrigger>
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

                      <FormField control={form.control} name="message" rules={{ required: "Message is required" }} render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your water needs, location, project size, or any specific requirements..."
                              rows={5}
                              {...field}
                              data-testid="input-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <Button type="submit" size="lg" className="w-full" disabled={createInquiry.isPending} data-testid="button-submit">
                        {createInquiry.isPending ? "Sending..." : "Send Inquiry"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
