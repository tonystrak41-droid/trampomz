export default function SplashScreen() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50 animate-splash-fade"
      style={{
        background: 'linear-gradient(160deg, oklch(0.45 0.18 28) 0%, oklch(0.35 0.14 35) 50%, oklch(0.28 0.10 145) 100%)',
      }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <polygon points="30,5 55,20 55,40 30,55 5,40 5,20" fill="none" stroke="white" strokeWidth="1"/>
              <circle cx="30" cy="30" r="4" fill="white" opacity="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#geo)"/>
        </svg>
      </div>

      <div className="relative flex flex-col items-center gap-6">
        <div className="w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white/20">
          <img
            src="/assets/generated/trampo-logo.dim_512x512.png"
            alt="TrampoMZ Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="text-center">
          <h1 className="text-5xl font-heading font-extrabold text-white tracking-tight drop-shadow-lg">
            TrampoMZ
          </h1>
          <p className="text-white/80 text-lg font-body mt-2 tracking-wide">
            Conectando serviços em Moçambique
          </p>
        </div>

        <div className="flex gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/60"
              style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
