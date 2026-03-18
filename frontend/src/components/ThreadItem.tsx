import { type Message } from '../backend';
import { useGetUserProfile } from '../hooks/useQueries';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type AppRoute } from '../App';

interface ThreadItemProps {
  threadId: string;
  lastMessage: Message | null;
  otherUserId: string;
  navigate: (route: AppRoute) => void;
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const date = new Date(ms);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Ontem';
  } else {
    return date.toLocaleDateString('pt-MZ', { day: '2-digit', month: 'short' });
  }
}

export default function ThreadItem({ threadId, lastMessage, otherUserId, navigate }: ThreadItemProps) {
  const { data: otherProfile } = useGetUserProfile(otherUserId);

  const name = otherProfile?.fullName ?? 'Utilizador';
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <button
      onClick={() => navigate({ page: 'conversation', threadId, otherUserId })}
      className="w-full text-left flex items-center gap-3 px-4 py-3.5 bg-card hover:bg-muted/50 transition-colors border-b border-border/50 active:bg-muted"
    >
      <Avatar className="w-12 h-12 flex-shrink-0">
        <AvatarImage src={otherProfile?.avatarUrl ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary font-heading font-bold text-sm">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-heading font-semibold text-sm text-foreground truncate">{name}</span>
          {lastMessage && (
            <span className="text-xs text-muted-foreground font-body flex-shrink-0">
              {formatTime(lastMessage.timestamp)}
            </span>
          )}
        </div>
        {lastMessage && (
          <p className="text-xs text-muted-foreground font-body truncate mt-0.5">
            {lastMessage.content}
          </p>
        )}
        {otherProfile?.profession && (
          <p className="text-xs text-primary/70 font-body truncate">{otherProfile.profession}</p>
        )}
      </div>
    </button>
  );
}
