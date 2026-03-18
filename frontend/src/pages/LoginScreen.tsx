import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, Star, MessageCircle } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
        onLoginSuccess();
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{
      background: 'linear-gradient(160deg, oklch(0.45 0.18 28) 0%, oklch(0.35 0.14 35) 60%, oklch(0.28 0.10 145) 100%)',
    }}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,5 55,20 55,40 30,55 5,40 5,20" fill="none" stroke="white" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo2)"/>
        </svg>
      </div>

      {/* Top section */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div className="w-24 h-24 rounded-full overflow-hidden shadow-2xl border-4 border-white/30 mb-6">
          <img
            src="/assets/generated/trampo-logo.dim_512x512.png"
            alt="TrampoMZ"
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="text-4xl font-heading font-extrabold text-white text-center mb-2">
          TrampoMZ
        </h1>
        <p className="text-white/80 text-center font-body text-base mb-10">
          A plataforma de serviços de Moçambique
        </p>

        {/* Feature highlights */}
        <div className="w-full max-w-sm space-y-3 mb-10">
          {[
            { icon: Briefcase, text: 'Encontre técnicos e profissionais locais' },
            { icon: Star, text: 'Avaliações reais de clientes verificados' },
            { icon: MessageCircle, text: 'Contacte diretamente pelo app' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-white/90 text-sm font-body">{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom card */}
      <div className="relative bg-background rounded-t-3xl px-6 pt-8 pb-10 shadow-2xl">
        <h2 className="text-2xl font-heading font-bold text-foreground mb-2">
          Bem-vindo!
        </h2>
        <p className="text-muted-foreground text-sm font-body mb-6">
          Faça login para encontrar serviços ou oferecer os seus.
        </p>

        <Button
          onClick={handleAuth}
          disabled={isLoggingIn}
          className="w-full h-14 text-base font-heading font-semibold rounded-2xl"
          size="lg"
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              A entrar...
            </>
          ) : isAuthenticated ? (
            'Sair'
          ) : (
            'Entrar com Google'
          )}
        </Button>

        <p className="text-center text-xs text-muted-foreground mt-4 font-body">
          Ao entrar, aceita os nossos Termos de Serviço e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
