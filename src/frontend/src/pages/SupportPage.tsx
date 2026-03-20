import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HeadphonesIcon, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const FAQS = [
  {
    q: "How do I track my order?",
    a: 'You can track your order by visiting the "My Orders" section in your account. Each order shows its current status — Pending, Processing, Shipped, or Delivered.',
  },
  {
    q: "What is the return policy?",
    a: "We offer a 7-day return policy from the date of delivery. Items must be unused and in their original packaging. Contact our support team to initiate a return.",
  },
  {
    q: "Is delivery really free?",
    a: "Yes! All orders on TrNDMart come with free delivery, no matter the order value. We believe in transparent pricing — the price you see is the price you pay.",
  },
  {
    q: "How do I pay online?",
    a: "We accept all major credit/debit cards (Visa, Mastercard) and UPI payments through our secure Stripe integration. Your payment information is never stored on our servers.",
  },
  {
    q: "How do I contact support?",
    a: "You can reach us via email at support@trndmart.in or on WhatsApp using the button below. We typically respond within 24 hours on business days.",
  },
  {
    q: "When will my order arrive?",
    a: "Most orders are delivered within 3-7 business days. You'll receive a notification once your order is shipped with estimated delivery details.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "Order changes or cancellations are possible within 1 hour of placing the order. Contact support immediately and we'll do our best to accommodate your request.",
  },
  {
    q: "Is my personal information secure?",
    a: "Absolutely. We use industry-standard encryption to protect your personal data. We never sell or share your information with third parties.",
  },
];

export function SupportPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitting(false);
    setName("");
    setEmail("");
    setMessage("");
    toast.success("Message sent! We'll reply within 24 hours.");
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <HeadphonesIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="font-display text-4xl font-bold mb-3">
          Customer Support
        </h1>
        <p className="text-muted-foreground text-lg">
          We're here to help — 24/7 for all your questions
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-10">
        {/* FAQ */}
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <Accordion
            type="single"
            collapsible
            className="space-y-2"
            data-ocid="support.panel"
          >
            {FAQS.map((faq) => (
              <AccordionItem
                key={faq.q}
                value={faq.q}
                className="border border-border rounded-xl px-4 overflow-hidden"
              >
                <AccordionTrigger className="text-left font-medium hover:text-primary hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="font-display text-2xl font-bold mb-6">Contact Us</h2>
            <div className="space-y-3 mb-6">
              <a
                href="mailto:support@trndmart.in"
                data-ocid="support.email_link"
                className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/40 transition-colors group"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">Email Support</p>
                  <p className="text-muted-foreground text-sm">
                    support@trndmart.in
                  </p>
                </div>
              </a>
              <a
                href="https://wa.me/919999999999?text=Hi%20TrNDMart%20Support"
                target="_blank"
                rel="noopener noreferrer"
                data-ocid="support.whatsapp_button"
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl hover:border-green-400 transition-colors group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-green-800">WhatsApp</p>
                  <p className="text-green-600 text-sm">
                    Chat with us instantly
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold mb-4">Send a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="support-name">Your Name</Label>
                <Input
                  id="support-name"
                  data-ocid="support.name_input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="support-email">Email Address</Label>
                <Input
                  id="support-email"
                  data-ocid="support.email_input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="support-message">Message</Label>
                <Textarea
                  id="support-message"
                  data-ocid="support.message_textarea"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  rows={4}
                  className="mt-1 resize-none"
                />
              </div>
              <Button
                type="submit"
                data-ocid="support.submit_button"
                disabled={submitting}
                className="w-full bg-primary text-white hover:bg-primary/90"
              >
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
