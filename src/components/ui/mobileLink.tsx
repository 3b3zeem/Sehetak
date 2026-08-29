import Link from 'next/link';

export const MobileLink = ({
  href,
  icon: Icon,
  label,
  variant = 'default',
  setIsOpen,
}: {
  href: string;
  icon: any;
  label: string;
  variant?: 'default' | 'primary' | 'amber' | 'danger';
  setIsOpen: (open: boolean) => void;
}) => {
    const isDanger = variant === 'danger';
    const isPrimary = variant === 'primary';
    const isAmber = variant === 'amber';

    return (
      <Link
        href={href}
        onClick={() => setIsOpen(false)}
        className={`flex items-center gap-2 p-2.5 border transition-colors ${
          isPrimary
            ? 'bg-[#008080]/10 border-[#008080]/30 text-[#008080] font-bold hover:bg-[#008080]/20'
            : isAmber
            ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold hover:bg-amber-100'
            : isDanger
            ? 'bg-red-50 border-red-200 text-red-700 font-bold hover:bg-red-100'
            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-[#008080]'
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{label}</span>
      </Link>
    );
  };