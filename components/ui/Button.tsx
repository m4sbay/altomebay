import type { ReactNode, ButtonHTMLAttributes } from "react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { MapPinIcon } from "@/components/icons/MapPinIcon";
type Props = { href?: string; variant?: "primary" | "whatsapp" | "secondary"; children: ReactNode; fullWidth?: boolean; onClick?: () => void; icon?: "whatsapp" | "maps" | "none"; external?: boolean; disabled?: boolean; className?: string; type?: ButtonHTMLAttributes<HTMLButtonElement>["type"] };
export function Button({href,variant="primary",children,fullWidth,onClick,icon,external=false,disabled=false,className="",type="button"}:Props) {
 const classes=`action action-${variant} ${fullWidth?"action-full w-full":""} ${className}`;
 const content=<>{icon==="whatsapp" && <WhatsAppIcon className="h-5 w-5"/>}{icon==="maps" && <MapPinIcon className="h-5 w-5"/>}<span className="button-label inline-flex items-center justify-center [padding-inline:var(--control-label-padding)] min-w-0">{children}</span></>;
 if(disabled) return <button type="button" disabled className={classes}>{content}</button>;
 if(href) return <a href={href} className={classes} onClick={onClick} {...(external?{target:"_blank",rel:"noopener noreferrer"}:{})}>{content}</a>;
 return <button type={type} className={classes} onClick={onClick}>{content}</button>;
}
