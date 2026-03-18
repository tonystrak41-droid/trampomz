import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, User, Phone, MapPin, Briefcase } from 'lucide-react';
import { useSaveCallerUserProfile } from '../hooks/useQueries';
import { Category } from '../backend';
import { toast } from 'sonner';

interface ProfileSetupModalProps {
  onComplete: () => void;
}

const CATEGORY_LABELS: Record<Category, string> = {
  [Category.electrician]: 'Electricista',
  [Category.plumber]: 'Canalizador',
  [Category.carpenter]: 'Carpinteiro',
  [Category.cleaner]: 'Limpeza',
  [Category.driver]: 'Motorista',
  [Category.mason]: 'Pedreiro',
  [Category.it]: 'Informática',
  [Category.other]: 'Outro',
};

export default function ProfileSetupModal({ onComplete }: ProfileSetupModalProps) {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [location, setLocation] = useState('');
  const [profession, setProfession] = useState('');
  const [isProvider, setIsProvider] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);

  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phoneNumber.trim() || !location.trim()) {
      toast.error('Por favor preencha todos os campos obrigatórios.');
      return;
    }
    if (isProvider && !profession.trim()) {
      toast.error('Por favor indique a sua profissão.');
      return;
    }

    try {
      await saveProfile.mutateAsync({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        location: location.trim(),
        profession: isProvider ? profession.trim() : 'Cliente',
        isProvider,
        isPremium: false,
        avatarUrl: undefined,
        category: isProvider ? category ?? undefined : undefined,
        portfolio: [],
      });
      toast.success('Perfil criado com sucesso!');
      onComplete();
    } catch {
      toast.error('Erro ao criar perfil. Tente novamente.');
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="max-w-md mx-auto rounded-2xl" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-xl font-heading font-bold">Complete o seu perfil</DialogTitle>
          <DialogDescription className="font-body text-sm">
            Precisamos de alguns dados para personalizar a sua experiência no TrampoMZ.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="font-body text-sm font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Nome completo *
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: João Machava"
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone" className="font-body text-sm font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Telefone *
            </Label>
            <Input
              id="phone"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Ex: +258 84 000 0000"
              className="rounded-xl"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className="font-body text-sm font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" /> Localização *
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Maputo, Sommerschield"
              className="rounded-xl"
              required
            />
          </div>

          {/* Provider toggle */}
          <div className="flex items-center justify-between bg-muted/50 rounded-xl px-4 py-3">
            <div>
              <p className="font-body text-sm font-medium">Sou prestador de serviços</p>
              <p className="font-body text-xs text-muted-foreground">Ofereço serviços a clientes</p>
            </div>
            <Switch
              checked={isProvider}
              onCheckedChange={setIsProvider}
            />
          </div>

          {isProvider && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="profession" className="font-body text-sm font-medium flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Profissão *
                </Label>
                <Input
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="Ex: Electricista, Canalizador..."
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-body text-sm font-medium">Categoria</Label>
                <Select onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-heading font-semibold text-base mt-2"
            disabled={saveProfile.isPending}
          >
            {saveProfile.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> A guardar...</>
            ) : (
              'Guardar perfil'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
