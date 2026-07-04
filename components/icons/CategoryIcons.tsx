import type { CategoryIcon } from "@/lib/content";

type IconProps = { className?: string };

function SembakoIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M6 8h12l-1.2 11a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.8L6 8Z" />
      <path d="M9 8V6a3 3 0 0 1 6 0v2" />
    </svg>
  );
}

function JajananIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.5 11.5A8.5 8.5 0 1 1 12.5 3a6.5 6.5 0 0 0 8 8.5Z" />
      <circle cx="9" cy="13" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="13" cy="16" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RokokIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="3" y="11" width="15" height="4" rx="1" />
      <path d="M14 11v4" />
      <path d="M18 12.5h3" />
      <path d="M5 7c1-1 1-2 0-3M9 7c1-1 1-2 0-3" />
    </svg>
  );
}

function PulsaIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <rect x="6" y="2" width="12" height="20" rx="2" />
      <path d="M10 18h4" />
      <path d="M9 6h6v6H9z" />
    </svg>
  );
}

function EwalletIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" />
      <path d="M16 13.5h2.5" />
      <path d="M3 9h18" />
    </svg>
  );
}

function AirIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
    </svg>
  );
}

const iconMap: Record<CategoryIcon, (props: IconProps) => React.ReactElement> = {
  sembako: SembakoIcon,
  jajanan: JajananIcon,
  rokok: RokokIcon,
  pulsa: PulsaIcon,
  ewallet: EwalletIcon,
  air: AirIcon,
};

export function CategoryIconGlyph({
  icon,
  className,
}: {
  icon: CategoryIcon;
  className?: string;
}) {
  const Icon = iconMap[icon];
  return <Icon className={className} />;
}
