import type { ReactNode } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { MapPinIcon } from "@/components/icons/MapPinIcon";

type Variant = "primary" | "whatsapp" | "secondary";

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand text-white hover:brightness-110",
  // text-ink (not white) on WhatsApp green: white-on-#25D366 fails WCAG AA contrast.
  whatsapp: "bg-whatsapp text-ink hover:brightness-95",
  secondary: "border border-ink text-ink bg-transparent hover:bg-ink hover:text-white",
};

type ButtonProps = {
  href: string;
  variant: Variant;
  children: ReactNode;
  fullWidth?: boolean;
  onClick?: () => void;
  icon?: "whatsapp" | "maps" | "none";
};

export function Button({
  href,
  variant,
  children,
  fullWidth,
  onClick,
  icon = "none",
}: ButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-bold min-h-[44px] px-6 py-3 shadow-soft hover:shadow-soft-hover transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        variantClasses[variant]
      } ${fullWidth ? "w-full" : ""}`}
    >
      {icon === "whatsapp" && <WhatsAppIcon className="h-5 w-5 shrink-0" />}
      {icon === "maps" && <MapPinIcon className="h-5 w-5 shrink-0" />}
      <span>{children}</span>
    </a>
  );
}
