import { useState } from 'react';
import { ArrowLeft, MapPin, Phone, MessageCircle, Star, Info, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import StarRating from '../components/StarRating';
import ReviewItem from '../components/ReviewItem';
import PremiumBadge from '../components/PremiumBadge';
import { useGetUser, useGetReviews } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { type AppRoute } from '../App';

interface ProviderProfileScreenProps {
  providerId: string;
  navigate: (route: AppRoute) => void;
}

function generateThreadId(userId1: string, userId2: string): string {
  const sorted = [userId1, userId2].sort();
  return `thread_${sorted[0]}_${sorted[1]}`;
}

export default function ProviderProfileScreen({ providerId, navigate }: ProviderProfileScreenProps) {
  const { data: provider, isLoading: providerLoading } = useGetUser(providerId);
  const { data: reviews = [], isLoading: reviewsLoading } = useGetReviews(providerId);
  const { identity } = useInternetIdentity();

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.stars), 0) / reviews.length
    : 0;

  const isOwnProfile = identity?.getPrincipal().toString() === providerId;

  const handleHire = () => {
    if (!identity) return;
    const myId = identity.getPrincipal().toString();
    const threadId = generateThreadId(myId, providerId);
    navigate({ page: 'conversation', threadId, otherUserId: providerId });
  };

  const handleReview = () => {
    navigate({
      page: 'review',
      providerId,
      providerName: provider?.fullName ?? 'Prestador',
    });
  };

  if (providerLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex gap-4">
          <Skeleton className="w-24 h-24 rounded-2xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <p className="font-heading font-semibold text-foreground mb-2">Prestador não encontrado</p>
        <Button variant="outline" onClick={() => navigate({ page: 'home' })} className="rounded-xl">
          Voltar ao início
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => navigate({ page: 'home' })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Voltar</span>
        </button>
      </div>

      {/* Profile header */}
      <div className="px-4 pb-4">
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50">
          <div className="flex gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-muted border border-border">
                <img
                  src={provider.avatarUrl ?? '/assets/generated/avatar-placeholder.dim_256x256.png'}
                  alt={provider.fullName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/generated/avatar-placeholder.dim_256x256.png';
                  }}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 flex-wrap">
                <h1 className="font-heading font-bold text-lg text-foreground leading-tight">
                  {provider.fullName}
                </h1>
                {provider.isPremium && <PremiumBadge size="md" />}
              </div>
              <p className="text-primary font-body font-medium text-sm mt-0.5">{provider.profession}</p>

              <div className="flex items-center gap-1 mt-1.5">
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-body">{provider.location}</span>
              </div>

              {provider.phoneNumber && (
                <div className="flex items-center gap-1 mt-1">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-body">{provider.phoneNumber}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating summary */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-2">
              <StarRating value={Math.round(averageRating)} readonly size="md" />
              <span className="font-heading font-bold text-lg text-foreground">
                {averageRating > 0 ? averageRating.toFixed(1) : '—'}
              </span>
            </div>
            <span className="text-sm text-muted-foreground font-body">
              {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
            </span>
          </div>
        </div>
      </div>

      {/* Commission notice */}
      <div className="px-4 pb-3">
        <div className="flex items-start gap-2 bg-secondary/50 rounded-xl px-3 py-2.5 border border-secondary">
          <Info className="w-4 h-4 text-foreground/60 flex-shrink-0 mt-0.5" />
          <p className="text-xs font-body text-foreground/70">
            <span className="font-semibold">Comissão TrampoMZ:</span> 5% por serviço concluído. Pague diretamente ao prestador.
          </p>
        </div>
      </div>

      {/* Action buttons */}
      {!isOwnProfile && (
        <div className="px-4 pb-4 flex gap-3">
          <Button
            onClick={handleHire}
            className="flex-1 h-12 rounded-xl font-heading font-semibold text-base gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Contratar
          </Button>
          <Button
            onClick={handleReview}
            variant="outline"
            className="h-12 px-4 rounded-xl font-heading font-semibold gap-2"
          >
            <Star className="w-4 h-4" />
            Avaliar
          </Button>
        </div>
      )}

      <Separator className="mx-4" />

      {/* Reviews section */}
      <div className="px-4 pt-4 pb-6">
        <h2 className="font-heading font-bold text-base text-foreground mb-3">
          Avaliações
          {reviews.length > 0 && (
            <span className="text-muted-foreground font-normal text-sm ml-1.5">({reviews.length})</span>
          )}
        </h2>

        {reviewsLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="bg-card rounded-xl p-4 flex gap-3">
                <Skeleton className="w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-xl">
            <Star className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm font-body text-muted-foreground">
              Ainda sem avaliações. Seja o primeiro!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, idx) => (
              <ReviewItem key={idx} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
