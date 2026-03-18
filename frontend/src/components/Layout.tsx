import { type ReactNode } from 'react';
import { Home, MessageCircle, User, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { type AppRoute } from '../App';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface LayoutProps {
  children: ReactNode;
  route: AppRoute;
  navigate: (route: AppRoute) => void;
  onLogout: () => void;
}

export default function Layout({ children, route, navigate, onLogout }: LayoutProps) {
  const { clear } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await clear();
    onLogout();
  };

  const initials = userProfile?.fullName
    ? userProfile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const navItems = [
    { page: 'home' as const, icon: Home, label: 'Início' },
    { page: 'inbox' as const, icon: MessageCircle, label: 'Mensagens' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background max-w-lg mx-auto relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate({ page: 'home' })}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/30">
              <img src="/assets/generated/trampo-logo.dim_512x512.png" alt="TrampoMZ" className="w-full h-full object-cover" />
            </div>
            <span className="font-heading font-bold text-lg tracking-tight">TrampoMZ</span>
          </button>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full focus:outline-none">
                  <Avatar className="w-8 h-8 border-2 border-white/30">
                    <AvatarImage src={userProfile?.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-white/20 text-white text-xs font-heading font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <div className="px-3 py-2">
                  <p className="font-heading font-semibold text-sm truncate">{userProfile?.fullName ?? 'Utilizador'}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile?.location ?? ''}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ page: 'inbox' })} className="gap-2">
                  <MessageCircle className="w-4 h-4" /> Mensagens
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg z-40 bg-card border-t border-border shadow-lg">
        <div className="flex items-center justify-around h-16 px-4">
          {navItems.map(({ page, icon: Icon, label }) => {
            const isActive = route.page === page;
            return (
              <button
                key={page}
                onClick={() => navigate({ page })}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs font-body ${isActive ? 'font-semibold' : ''}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
