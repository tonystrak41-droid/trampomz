import { useState } from 'react';
import { ArrowLeft, Loader2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import StarRating from '../components/StarRating';
import { useSubmitReview } from '../hooks/useQueries';
import { type AppRoute } from '../App';
import { toast } from 'sonner';

interface ReviewScreenProps {
  providerId: string;
  providerName: string;
  navigate: (route: AppRoute) => void;
}

export default function ReviewScreen({ providerId, providerName, navigate }: ReviewScreenProps) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const submitReview = useSubmitReview();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stars === 0) {
      toast.error('Por favor selecione uma classificação de estrelas.');
      return;
    }

    try {
      await submitReview.mutateAsync({ provider: providerId, stars, comment });
      toast.success('Avaliação enviada com sucesso!');
      navigate({ page: 'provider', providerId });
    } catch {
      toast.error('Erro ao enviar avaliação. Tente novamente.');
    }
  };

  const starLabels = ['', 'Muito mau', 'Mau', 'Razoável', 'Bom', 'Excelente'];

  return (
    <div className="flex flex-col">
      {/* Back button */}
      <div className="px-4 pt-4 pb-2">
        <button
          onClick={() => navigate({ page: 'provider', providerId })}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Voltar ao perfil</span>
        </button>
      </div>

      <div className="px-4 pt-2 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Star className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-heading font-bold text-xl text-foreground">Avaliar prestador</h1>
          <p className="text-sm text-muted-foreground font-body mt-1">
            Como foi a sua experiência com <span className="font-semibold text-foreground">{providerName}</span>?
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star rating */}
          <div className="bg-card rounded-2xl p-6 shadow-card border border-border/50 text-center">
            <Label className="font-heading font-semibold text-base text-foreground block mb-4">
              Classificação *
            </Label>
            <div className="flex justify-center mb-3">
              <StarRating value={stars} onChange={setStars} size="lg" />
            </div>
            {stars > 0 && (
              <p className="text-sm font-body font-medium text-primary animate-fade-in">
                {starLabels[stars]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="font-heading font-semibold text-sm text-foreground">
              Comentário (opcional)
            </Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Descreva a sua experiência com este prestador..."
              className="rounded-xl font-body text-sm min-h-[120px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground font-body text-right">
              {comment.length}/500
            </p>
          </div>

          <Button
            type="submit"
            className="w-full h-13 rounded-xl font-heading font-semibold text-base"
            disabled={submitReview.isPending || stars === 0}
          >
            {submitReview.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A enviar...</>
            ) : (
              'Enviar avaliação'
            )}
          </Button>
        </form>
      </div>

      {/* Footer */}
      <footer className="mt-auto px-4 py-6 text-center border-t border-border/50">
        <p className="text-xs text-muted-foreground font-body">
          © {new Date().getFullYear()} TrampoMZ. Feito com{' '}
          <span className="text-red-500">♥</span>{' '}
          usando{' '}
          <a
            href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'trampo-mz')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
