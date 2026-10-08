import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Check, MessageCircle, BadgePercent } from "lucide-react";
import { IMAGES } from "@/lib/images";
import BlendedPhoto from "@/components/BlendedPhoto";
import { formatKES, whatsappLink } from "@/lib/utils";

// Edit these two numbers to change the offer.
const REGULAR_PRICE = 32000;
const OFFER_PRICE = 27000;

const SEEN_KEY = "kws-offer-seen";
const SHOW_DELAY_MS = 1800;

export default function OfferPopup() {
  const [open, setOpen] = useState(false);

  // Show once per visit (a new visit = a new browser session), shortly after the page settles.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage blocked: still show once per page load */
    }
    if (seen) return;
    const timer = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const message = `Hello, I would like to book the hydrogeological survey offer at ${formatKES(OFFER_PRICE)}.`;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-slate-950/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 duration-500" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-[61] w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-card shadow-2xl outline-none duration-500 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=open]:slide-in-from-bottom-6 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=closed]:slide-out-to-bottom-4"
          data-testid="popup-offer"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {/* Photo */}
          <div className="relative">
            <BlendedPhoto src={IMAGES.survey} alt="Geologist carrying out a hydrogeological survey next to a drilling rig" className="aspect-[4/3] max-h-[42vh]" />
            <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-amber-400 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900 shadow">
              <BadgePercent className="h-3.5 w-3.5" /> Today's offer
            </span>
            <Dialog.Close
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow transition hover:bg-white hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="Close"
              data-testid="button-close-offer"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="px-5 pb-5 pt-4">
            <Dialog.Title className="text-xl font-extrabold leading-tight text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Find water before you drill
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              Get our hydrogeological survey at a special price.
            </Dialog.Description>

            <div className="mt-3 flex flex-wrap items-end gap-x-3 gap-y-1">
              <span className="text-3xl font-extrabold leading-none text-primary" style={{ fontFamily: "var(--font-display)" }}>
                {formatKES(OFFER_PRICE)}
              </span>
              <span className="pb-0.5 text-sm text-muted-foreground line-through">{formatKES(REGULAR_PRICE)}</span>
              <span className="mb-0.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                Save {formatKES(REGULAR_PRICE - OFFER_PRICE)}
              </span>
            </div>

            <ul className="mt-3 space-y-1.5 text-sm text-foreground/80">
              {["Advanced ADMT-300S-X geophysical survey", "Pinpoints the best drill site, depth and water quality"].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  {t}
                </li>
              ))}
            </ul>

            <a
              href={whatsappLink(message)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 text-sm font-bold text-slate-900 shadow-md transition hover:bg-amber-300 hover:shadow-lg active:scale-[.98]"
              data-testid="button-claim-offer"
            >
              <MessageCircle className="h-4 w-4" /> Claim this offer on WhatsApp
            </a>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 w-full py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
            >
              Maybe later
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
