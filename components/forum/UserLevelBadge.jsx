'use client';

export default function UserLevelBadge({ levelName, size = 'lg', className = '' }) {
  if (!levelName) return null;

  const levelImages = {
    'Level Gundala': '/image/profile/gundala.png',
    'Level GatotKaca': '/image/profile/gatotkaca.png',
    'Level SriAsih': '/image/profile/sriasih.png',
    'Level Godam': '/image/profile/godam.png',
    'Level Aquanus': '/image/profile/aquanus.png',
  };

  const sizeClass = (
    size === 'xs' ? 'w-5 h-5' :
    size === 'sm' ? 'w-6 h-6' :
    size === 'md' ? 'w-5 h-5' :
    size === 'lg' ? 'w-7 h-7' :
    size === 'xl' ? 'w-8 h-8' :
    'w-7 h-7'
  );
  const src = levelImages[levelName] || '/image/profile/gundala.png';

  return (
    <span className={`inline-flex items-center justify-center rounded-full border border-amber-200 bg-white ${sizeClass} ${className}`}>
      <img src={src} alt={levelName} className="rounded-full object-contain w-full h-full" />
    </span>
  );
}


