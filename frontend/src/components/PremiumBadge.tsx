import { Crown } from 'lucide-react';

interface PremiumBadgeProps {
  size?: 'sm' | 'md';
}

export default function PremiumBadge({ size = 'sm' }: PremiumBadgeProps) {
  if (size === 'md') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-400 text-white px-3 py-1 rounded-full text-sm font-heading font-semibold shadow-sm">
        <Crown className="w-3.5 h-3.5" />
        Premium
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-400 text-white px-2 py-0.5 rounded-full text-xs font-heading font-semibold shadow-sm">
      <Crown className="w-3 h-3" />
      Premium
    </div>
  );
}
