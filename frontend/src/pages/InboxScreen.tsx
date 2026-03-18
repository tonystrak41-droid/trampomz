import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMessageThreads, useGetMessages } from '../hooks/useQueries';
import { MessageCircle, RefreshCw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import ThreadItem from '../components/ThreadItem';
import { type AppRoute } from '../App';
import { type Message } from '../backend';

interface InboxScreenProps {
  navigate: (route: AppRoute) => void;
}

function ThreadWithMessages({
  threadId,
  navigate,
  myId,
}: {
  threadId: string;
  navigate: (route: AppRoute) => void;
  myId: string;
}) {
  const { data: messages = [] } = useGetMessages(threadId);

  const lastMessage: Message | null = messages.length > 0 ? messages[messages.length - 1] : null;

  // Determine the other user in the thread
  const otherUserId = lastMessage
    ? lastMessage.senderId.toString() === myId
      ? lastMessage.receiverId.toString()
      : lastMessage.senderId.toString()
    : threadId.replace('thread_', '').split('_').find(id => id !== myId) ?? '';

  if (!otherUserId) return null;

  return (
    <ThreadItem
      threadId={threadId}
      lastMessage={lastMessage}
      otherUserId={otherUserId}
      navigate={navigate}
    />
  );
}

export default function InboxScreen({ navigate }: InboxScreenProps) {
  const { identity } = useInternetIdentity();
  const myId = identity?.getPrincipal().toString() ?? '';
  const { data: threads = [], isLoading, refetch, isFetching } = useGetMessageThreads();

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-heading font-bold text-xl text-foreground">Mensagens</h1>
          <p className="text-xs text-muted-foreground font-body mt-0.5">
            {threads.length} {threads.length === 1 ? 'conversa' : 'conversas'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          disabled={isFetching}
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Thread list */}
      {isLoading ? (
        <div className="space-y-0">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <MessageCircle className="w-9 h-9 text-muted-foreground" />
          </div>
          <h3 className="font-heading font-semibold text-foreground mb-2">Sem mensagens</h3>
          <p className="text-sm text-muted-foreground font-body text-center">
            Contacte um prestador de serviços para iniciar uma conversa.
          </p>
          <button
            onClick={() => navigate({ page: 'home' })}
            className="mt-4 text-sm text-primary font-body font-medium"
          >
            Explorar prestadores →
          </button>
        </div>
      ) : (
        <div className="bg-card">
          {threads.map(threadId => (
            <ThreadWithMessages
              key={threadId}
              threadId={threadId}
              navigate={navigate}
              myId={myId}
            />
          ))}
        </div>
      )}
    </div>
  );
}
