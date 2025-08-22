"use client";
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/supabase-auth';

export default function BadgeModal({ isOpen, onClose, currentBadge, allBadges = [] }) {
  if (!isOpen) return null;

  const [userProfile, setUserProfile] = useState(null);

  // Default level images & points (sinkronkan bila ada perubahan di komponen lain)
  const levelImages = {
    'Level Gundala': '/image/profile/gundala.png',
    'Level GatotKaca': '/image/profile/gatotkaca.png',
    'Level SriAsih': '/image/profile/sriasih.png',
    'Level Godam': '/image/profile/godam.png',
    'Level Aquanus': '/image/profile/aquanus.png',
  };
  const levelPoints = {
    'Level Gundala': 0,
    'Level GatotKaca': 100,
    'Level SriAsih': 250,
    'Level Godam': 500,
    'Level Aquanus': 1000,
  };

  // fetch latest profile when modal opens (mirip behaviour di profile/page.jsx)
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    async function fetchProfile() {
      try {
        const { user: currentUser } = await getCurrentUser();
        if (!currentUser) return;
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${currentUser.access_token}` },
        });
        if (!mounted) return;
        if (res.ok) {
          const result = await res.json();
          setUserProfile(result.data.user);
          return;
        }
      } catch (e) {
        console.error('BadgeModal fetch profile error', e);
      }
    }
    fetchProfile();
    return () => { mounted = false; };
  }, [isOpen]);

  // Build full list of levels (so badges lain selalu tampil di modal)
  // Prefer data from fetched userProfile (for real points/ownership), fallback to allBadges passed from BannerForum
  const userLevels = (userProfile?.levels && (Array.isArray(userProfile.levels) ? userProfile.levels : [userProfile.levels])) || [];

  // use the canonical levelPoints for thresholds
  const fullList = Object.keys(levelImages).map(name => ({
    name,
    img: levelImages[name],
    points: levelPoints[name] ?? 0,
    // owned if user's current_points meets threshold OR userLevels contains the level OR BannerForum passed it
    owned: (userProfile?.current_points ?? 0) >= (levelPoints[name] ?? 0) || Boolean(userLevels.find(l => l?.name === name)) || Boolean(allBadges.find(b => b.name === name)),
  }));

  // Determine indexes:
  // clickedIndex = badge user clicked (currentBadge prop)
  const clickedIndex = currentBadge ? fullList.findIndex(b => b.name === currentBadge.name) : -1;
  // progressIndex = highest index that current_points >= threshold
  const currentPoints = userProfile?.current_points ?? 0;
  let progressIndex = -1;
  for (let i = 0; i < fullList.length; i++) {
    if (currentPoints >= (fullList[i].points || 0)) progressIndex = i;
  }
  // decide which index to visually treat as active: clicked if any, else progressIndex
  const visualActiveIndex = clickedIndex !== -1 ? clickedIndex : progressIndex;

  // compute min width so many badges still fit (scrollable if overflow)
  const minWidthPx = Math.max(600, fullList.length * 180);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal content */}
      <div className="relative z-60 w-full max-w-5xl mx-4 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-start justify-between mb-6">
          <h2 className="w-full text-center text-2xl font-semibold">Lencana Badge</h2>
          <button onClick={onClose} className="ml-4 text-gray-500 hover:text-gray-700">Close</button>
        </div>

        {/* Horizontal stepper */}
        <div className="w-full overflow-x-auto py-4">
          <div className="flex items-center justify-start gap-6 px-6" style={{ minWidth: `${minWidthPx}px` }}>
            {fullList.map((b, i) => {
              const isOwned = b.owned;
              const isActive = i === visualActiveIndex;
              const circleClasses = [
                'flex items-center justify-center rounded-full w-36 h-36 shadow-md',
                isActive ? 'border-4 border-amber-500 bg-white' : isOwned ? 'border-4 border-amber-200 bg-white' : 'border-4 border-gray-300 bg-gray-100',
              ].join(' ');

              const imageClasses = isOwned ? 'w-20 h-20 object-contain rounded-full' : 'w-20 h-20 object-contain rounded-full grayscale opacity-70';
              const labelClass = isActive ? 'mb-4 text-sm text-center text-gray-700 font-medium' : 'mb-4 text-sm text-center text-gray-400';
              const pointsClass = isActive ? 'mt-4 text-sm text-gray-600' : 'mt-4 text-sm text-gray-400';

              return (
                <React.Fragment key={b.name}>
                  <div className="flex flex-col items-center">
                    {/* label above */}
                    <div className={labelClass}>{b.name.replace('Level ', '')}</div>

                    {/* circle with image */}
                    <div className={circleClasses}>
                      <img src={b.img} alt={b.name} className={imageClasses} />
                    </div>

                    {/* points below */}
                    <div className={pointsClass}>{(b.points ?? 0) + ' point'}</div>
                  </div>

                  {/* inline arrow connector (between items) */}
                  {i !== fullList.length - 1 && (
                    <div className="flex items-center px-3">
                      <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 12H60" stroke={i <= visualActiveIndex ? "#F59E0B" : "#9CA3AF"} strokeWidth="4" strokeLinecap="round" />
                        <path d="M70 12L60 6V18L70 12Z" fill={i <= visualActiveIndex ? "#F59E0B" : "#9CA3AF"} />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* simple overall progress bar */}
        <div className="mt-6">
          {/* Use current_points from fetched profile (same logic as profile/page.jsx) */}
          <div className="text-sm text-gray-600 mb-2 text-center">
            Progress: {currentPoints} points
          </div>
          <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-3"
              style={{
                width: `${Math.min(100, (currentPoints / (fullList[fullList.length - 1]?.points || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
