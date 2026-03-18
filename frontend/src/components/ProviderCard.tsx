import { MapPin, Star } from 'lucide-react';
import { type User } from '../backend';
import PremiumBadge from './PremiumBadge';
import { type AppRoute } from '../App';

interface ProviderCardProps {
  provider: User;
  averageRating: number;
  reviewCount: number;
  navigate: (route: AppRoute) => void;
}

export default function ProviderCard({ provider, averageRating, reviewCount, navigate }: ProviderCardProps) {
  const providerId = provider.id.toString();

  return (
    <button
      onClick={() => navigate({ page: 'provider', providerId })}
      className="w-full text-left bg-card rounded-2xl shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden border border-border/50 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted border border-border">
            <img
              src={provider.avatarUrl ?? '/assets/generated/avatar-placeholder.dim_256x256.png'}
              alt={provider.fullName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/generated/avatar-placeholder.dim_256x256.png';
              }}
            />
          </div>
          {provider.isPremium && (
            <div className="absolute -top-1 -right-1">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-[8px] font-bold">★</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-heading font-semibold text-sm text-foreground truncate">
                  {provider.fullName}
                </h3>
                {provider.isPremium && <PremiumBadge size="sm" />}
              </div>
              <p className="text-xs text-primary font-body font-medium mt-0.5 truncate">
                {provider.profession}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-body font-semibold text-foreground">
                {averageRating > 0 ? averageRating.toFixed(1) : 'Novo'}
              </span>
              {reviewCount > 0 && (
                <span className="text-xs text-muted-foreground font-body">({reviewCount})</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="text-xs font-body truncate">{provider.location}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
