import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetMessages, useSendMessage, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { type AppRoute } from '../App';

interface ConversationScreenProps {
  threadId: string;
  otherUserId: string;
  navigate: (route: AppRoute) => void;
}

function formatTime(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  return new Date(ms).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' });
}

export default function ConversationScreen({ threadId, otherUserId, navigate }: ConversationScreenProps) {
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { identity } = useInternetIdentity();
  const myId = identity?.getPrincipal().toString() ?? '';

  const { data: messages = [], isLoading } = useGetMessages(threadId);
  const { data: otherProfile } = useGetUserProfile(otherUserId);
  const sendMessage = useSendMessage();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const content = messageText.trim();
    if (!content || sendMessage.isPending) return;

    setMessageText('');
    try {
      await sendMessage.mutateAsync({
        receiverId: otherUserId,
        content,
        threadId,
      });
    } catch {
      setMessageText(content);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const otherName = otherProfile?.fullName ?? 'Utilizador';
  const otherProfession = otherProfile?.profession;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border shadow-xs flex-shrink-0">
        <button
          onClick={() => navigate({ page: 'inbox' })}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-heading font-semibold text-sm text-foreground truncate">{otherName}</h2>
          {otherProfession && (
            <p className="text-xs text-primary font-body truncate">{otherProfession}</p>
          )}
        </div>
        {otherProfile?.isProvider && (
          <button
            onClick={() => navigate({ page: 'provider', providerId: otherUserId })}
            className="text-xs text-primary font-body font-medium"
          >
            Ver perfil
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                <Skeleton className={`h-10 rounded-2xl ${i % 2 === 0 ? 'w-40' : 'w-52'}`} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground font-body">
              Inicie a conversa com {otherName}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId.toString() === myId;
            return (
              <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2.5 rounded-2xl shadow-xs ${
                    isMe
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card text-foreground border border-border/50 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm font-body leading-relaxed">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 bg-card border-t border-border flex-shrink-0">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva uma mensagem..."
          className="flex-1 rounded-full h-11 font-body text-sm border-border/70"
          disabled={sendMessage.isPending}
        />
        <Button
          onClick={handleSend}
          disabled={!messageText.trim() || sendMessage.isPending}
          size="icon"
          className="w-11 h-11 rounded-full flex-shrink-0"
        >
          {sendMessage.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
