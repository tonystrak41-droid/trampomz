import { Zap, Droplets, Hammer, Sparkles, Car, Building2, Monitor, MoreHorizontal } from 'lucide-react';
import { Category } from '../backend';

interface CategoryIconProps {
  category: Category;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const CATEGORY_ICONS: Record<Category, React.ComponentType<{ className?: string }>> = {
  [Category.electrician]: Zap,
  [Category.plumber]: Droplets,
  [Category.carpenter]: Hammer,
  [Category.cleaner]: Sparkles,
  [Category.driver]: Car,
  [Category.mason]: Building2,
  [Category.it]: Monitor,
  [Category.other]: MoreHorizontal,
};

export default function CategoryIcon({ category, label, isSelected, onClick }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-all ${
        isSelected ? 'scale-105' : 'hover:scale-105'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${
          isSelected
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'bg-card text-foreground border border-border hover:border-primary/30'
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span className={`text-xs font-body text-center leading-tight ${
        isSelected ? 'text-primary font-semibold' : 'text-muted-foreground'
      }`}>
        {label}
      </span>
    </button>
  );
}
