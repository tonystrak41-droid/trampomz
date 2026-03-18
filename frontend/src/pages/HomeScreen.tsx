import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import CategoryIcon from '../components/CategoryIcon';
import ProviderCard from '../components/ProviderCard';
import { useGetAllProviders, useGetReviews } from '../hooks/useQueries';
import { Category, type User } from '../backend';
import { type AppRoute } from '../App';

const CATEGORIES: { category: Category; label: string }[] = [
  { category: Category.electrician, label: 'Electricista' },
  { category: Category.plumber, label: 'Canalizador' },
  { category: Category.carpenter, label: 'Carpinteiro' },
  { category: Category.cleaner, label: 'Limpeza' },
  { category: Category.driver, label: 'Motorista' },
  { category: Category.mason, label: 'Pedreiro' },
  { category: Category.it, label: 'Informática' },
  { category: Category.other, label: 'Outro' },
];

interface HomeScreenProps {
  navigate: (route: AppRoute) => void;
}

function ProviderCardWithRating({ provider, navigate }: { provider: User; navigate: (route: AppRoute) => void }) {
  const { data: reviews = [] } = useGetReviews(provider.id.toString());
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + Number(r.stars), 0) / reviews.length
    : 0;

  return (
    <ProviderCard
      provider={provider}
      averageRating={averageRating}
      reviewCount={reviews.length}
      navigate={navigate}
    />
  );
}

export default function HomeScreen({ navigate }: HomeScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const { data: allProviders = [], isLoading } = useGetAllProviders();

  const filteredProviders = useMemo(() => {
    let providers = allProviders;

    if (selectedCategory) {
      providers = providers.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      providers = providers.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.profession.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
      );
    }

    // Premium providers first
    return [...providers].sort((a, b) => {
      if (a.isPremium && !b.isPremium) return -1;
      if (!a.isPremium && b.isPremium) return 1;
      return 0;
    });
  }, [allProviders, selectedCategory, searchQuery]);

  const handleCategoryClick = (category: Category) => {
    setSelectedCategory(prev => prev === category ? null : category);
  };

  return (
    <div className="flex flex-col">
      {/* Hero header */}
      <div
        className="px-4 pt-6 pb-8"
        style={{
          background: 'linear-gradient(135deg, oklch(0.45 0.18 28) 0%, oklch(0.38 0.14 35) 100%)',
        }}
      >
        <h2 className="text-white font-heading font-bold text-xl mb-1">
          Encontre um profissional
        </h2>
        <p className="text-white/70 font-body text-sm mb-4">
          Serviços de confiança em Moçambique
        </p>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por nome ou profissão..."
            className="pl-9 pr-4 h-11 rounded-xl bg-white border-0 shadow-md font-body text-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 pt-5 pb-2">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Categorias</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORIES.map(({ category, label }) => (
            <CategoryIcon
              key={category}
              category={category}
              label={label}
              isSelected={selectedCategory === category}
              onClick={() => handleCategoryClick(category)}
            />
          ))}
        </div>
      </div>

      {/* Providers list */}
      <div className="px-4 pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm text-foreground">
            {selectedCategory
              ? `${CATEGORIES.find(c => c.category === selectedCategory)?.label ?? ''}`
              : 'Prestadores recomendados'}
            {!isLoading && (
              <span className="text-muted-foreground font-normal ml-1.5">
                ({filteredProviders.length})
              </span>
            )}
          </h3>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-primary font-body font-medium"
            >
              Ver todos
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card rounded-2xl p-4 flex gap-3">
                <Skeleton className="w-16 h-16 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-heading font-semibold text-foreground mb-1">
              Nenhum prestador encontrado
            </p>
            <p className="text-sm text-muted-foreground font-body">
              {searchQuery ? 'Tente outra pesquisa' : 'Ainda não há prestadores nesta categoria'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProviders.map(provider => (
              <ProviderCardWithRating
                key={provider.id.toString()}
                provider={provider}
                navigate={navigate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
