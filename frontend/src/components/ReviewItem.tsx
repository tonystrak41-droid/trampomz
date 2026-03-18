import { type Review } from '../backend';
import StarRating from './StarRating';
import { useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ReviewItemProps {
  review: Review;
}

function formatDate(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function ReviewItem({ review }: ReviewItemProps) {
  const reviewerId = review.reviewer.toString();
  const { data: reviewerProfile } = useGetUserProfile(reviewerId);

  const name = reviewerProfile?.fullName ?? 'Utilizador';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 shadow-xs">
      <div className="flex items-start gap-3">
        <Avatar className="w-9 h-9 flex-shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-heading font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-heading font-semibold text-sm text-foreground truncate">{name}</span>
            <span className="text-xs text-muted-foreground font-body flex-shrink-0">
              {formatDate(review.timestamp)}
            </span>
          </div>
          <StarRating value={Number(review.stars)} readonly size="sm" />
          {review.comment && (
            <p className="text-sm font-body text-foreground/80 mt-1.5 leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
