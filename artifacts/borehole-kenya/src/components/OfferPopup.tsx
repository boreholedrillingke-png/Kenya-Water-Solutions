import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check, MessageCircle, BadgePercent } from "lucide-react";
import { IMAGES } from "@/lib/images";
import BlendedPhoto from "@/components/BlendedPhoto";
import { formatKES, whatsappLink } from "@/lib/utils";

// Edit these two numbers to change the offer.
const REGULAR_PRICE = 32000;
const OFFER_PRICE = 27000;

const SHOW_DELAY_MS = 1800;

export default function OfferPopup() {
  const [open, setOpen] = useState(false);

  // Show on every page load / refresh, shortly after the page settles.
  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const message = `Hello, I would like to book the hydrogeological survey offer at ${formatKES(OFFER_PRICE)}.`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-500" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-3rem)] max-w-[310px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-card shadow-2xl outline-none duration-500 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-4"
          data-testid="popup-offer"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Photo */}
          <div className="relative">
            <BlendedPhoto src={IMAGES.survey} alt="Geologist carrying out a hydrogeological survey next to a drilling rig" className="aspect-[16/9] max-h-[26vh]" />
            <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-900 shadow">
              <BadgePercent className="h-3 w-3" /> Today's offer
            </span>
            <Dialog.Close
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Close"
              data-testid="button-close-offer"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="px-4 pb-3 pt-3">
            <Dialog.Title className="text-base font-extrabold leading-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Find water before you drill
            </Dialog.Title>
            <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
              Get our hydrogeological survey at a special price.
            </Dialog.Description>

            <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-2xl font-extrabold leading-none text-primary" style={{ fontFamily: "var(--font-display)" }}>
                {formatKES(OFFER_PRICE)}
              </span>
              <span className="pb-0.5 text-xs text-muted-foreground line-through">{formatKES(REGULAR_PRICE)}</span>
              <span className="mb-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                Save {formatKES(REGULAR_PRICE - OFFER_PRICE)}
              </span>
            </div>

            <ul className="mt-2 space-y-1 text-xs text-foreground/80">
              {["Advanced ADMT-300S-X geophysical survey", "Pinpoints the best drill site, depth and water quality"].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>

            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-400 py-2 text-xs font-bold text-slate-900 shadow-md transition hover:bg-amber-300 hover:shadow-lg active:scale-[.98]"
              data-testid="button-claim-offer"
            >
              <MessageCircle className="h-4 w-4" /> Claim this offer on WhatsApp
            </a>
            <button
              onClick={() => setOpen(false)}
              className="mt-1 w-full py-1 text-[11px] text-muted-foreground transition hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
