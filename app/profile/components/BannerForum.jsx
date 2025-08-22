"use client";
import React, { useState } from 'react';
import { Star, Edit3 } from 'lucide-react';

// Mapping level names to image paths
const levelImages = {
  'Level Gundala': '/image/profile/gundala.png',
  'Level GatotKaca': '/image/profile/gatotkaca.png',
  'Level SriAsih': '/image/profile/sriasih.png',
  'Level Godam': '/image/profile/godam.png',
  'Level Aquanus': '/image/profile/aquanus.png',
};

// Mapping points for each level (dipakai di modal progress)
const levelPoints = {
  'Level Gundala': 0,
  'Level GatotKaca': 100,
  'Level SriAsih': 250,
  'Level Godam': 500,
  'Level Aquanus': 1000,
};
 
export default function BannerForum({ user, onEditProfile }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [activeBadge, setActiveBadge] = useState(null);

  const openBadgeModal = (badge) => {
    setActiveBadge(badge);
    setModalOpen(true);
  };

  const closeBadgeModal = () => {
    setModalOpen(false);
    setActiveBadge(null);
  };
   // Get current level name and image
   const levelName = user?.levels?.name || 'Level Gundala';
   const levelImgSrc = levelImages[levelName] || '/image/profile/gundala.png';
 
   // New: normalize levels into an array of {name, img} so we can stack multiple badges
   const badges = (() => {
     if (!user?.levels) return [{ name: levelName, img: levelImgSrc }];
     // if levels is an array of objects
     if (Array.isArray(user.levels)) {
       return user.levels.map(l => {
         const name = l?.name || levelName;
         return { name, img: levelImages[name] || '/image/profile/gundala.png', points: levelPoints[name] ?? 0 };
       });
     }
     // if levels is single object
     const singleName = user.levels?.name || levelName;
     return [{ name: singleName, img: levelImages[singleName] || '/image/profile/gundala.png', points: levelPoints[singleName] ?? 0 }];
   })();
 
   return (
     <div className="mx-auto p-4 sm:p-6">
         <div className="h-30 md:h-40 w-full overflow-hidden rounded-2xl">
         <img 
          src={user?.banner_url || "/profileBanner-img.svg"} 
          alt="Profile Banner" 
          sizes="100vw"
          className='object-cover object-center w-full h-full' 
         />
         </div>
         <div className="px-10 flex justify-center md:justify-start">
             <div className="relative">
               <img 
                 src={user?.avatar_url || "/profilePicture-img.svg"} 
                 alt="Profile Picture" 
                 className="md:-mt-18 -mt-15 md:w-36 w-28 h-28 md:h-36 rounded-full border-4 border-white shadow-lg object-cover" 
               />
 
               {/* Stack badges: moved slightly to bottom-right */}
               {user?.role === 'user' && (
                 <div
                   // moved slightly left and down
                   className="absolute bottom-1 right-0 flex items-end transform -translate-x-2 translate-y-1"
                   aria-hidden="true"
                 >
                   {badges.map((b, i) => (
                     <img
                       key={i}
                       src={b.img}
                       alt={b.name}
                       title={b.name}
                       className="w-10 h-10 rounded-full border-2 border-white bg-white object-contain shadow-sm cursor-pointer"
                       style={{ marginLeft: i === 0 ? 0 : -12, zIndex: 20 + i }}
                       onClick={() => openBadgeModal(b)}
                     />
                   ))}
                 </div>
               )}
             </div>
         </div>
         {/* Badge progress modal (inline to avoid client/server boundary issues) */}
         {modalOpen && (
           <div className="fixed inset-0 z-50 flex items-center justify-center">
             <div className="absolute inset-0 bg-black/50" onClick={closeBadgeModal} />
             <div className="relative z-60 w-full max-w-5xl mx-4 bg-white rounded-lg shadow-lg p-6">
               <div className="flex items-start justify-between mb-6">
                 <h2 className="w-full text-center text-2xl font-semibold">Lencana Badge</h2>
                 <button onClick={closeBadgeModal} className="ml-4 text-gray-500 hover:text-gray-700">Close</button>
               </div>
               
               {/* Build full list locally so modal shows all levels */}
               {/* fullList mirrors logic used previously in BadgeModal */}
               <div className="w-full overflow-x-auto py-4">
                 <div
                   className="flex items-center justify-start gap-6 px-6"
                   style={{ minWidth: `${Math.max(600, Object.keys(levelImages).length * 180)}px` }}
                 >
                   {Object.keys(levelImages).map((name, i, arr) => {
                     const isActive = activeBadge?.name === name;
                     const owned = badges.find(b => b.name === name);
                     const points = owned?.points ?? levelPoints[name] ?? 0;
                     const circleClasses = [
                       'flex items-center justify-center rounded-full w-36 h-36 shadow-md',
                       isActive ? 'border-4 border-amber-500 bg-white' : owned ? 'border-4 border-amber-200 bg-white' : 'border-4 border-gray-300 bg-gray-100',
                     ].join(' ');
                     const imageClasses = owned ? 'w-20 h-20 object-contain rounded-full' : 'w-20 h-20 object-contain rounded-full grayscale opacity-70';
                     const labelClass = isActive ? 'mb-4 text-sm text-center text-gray-700 font-medium' : 'mb-4 text-sm text-center text-gray-400';
                     const pointsClass = isActive ? 'mt-4 text-sm text-gray-600' : 'mt-4 text-sm text-gray-400';
 
                     return (
                       <React.Fragment key={name}>
                         <div className="flex flex-col items-center">
                           <div className={labelClass}>{name.replace('Level ', '')}</div>
                           <div className={circleClasses}>
                             <img src={levelImages[name]} alt={name} className={imageClasses} />
                           </div>
                           <div className={pointsClass}>{points + ' point'}</div>
                         </div>
                         {i !== arr.length - 1 && (
                           <div className="flex items-center px-3">
                             <svg width="80" height="24" viewBox="0 0 80 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                               <path d="M0 12H60" stroke={i <= (badges.findIndex(b => b.name === activeBadge?.name) || -1) ? "#F59E0B" : "#9CA3AF"} strokeWidth="4" strokeLinecap="round" />
                               <path d="M70 12L60 6V18L70 12Z" fill={i <= (badges.findIndex(b => b.name === activeBadge?.name) || -1) ? "#F59E0B" : "#9CA3AF"} />
                             </svg>
                           </div>
                         )}
                       </React.Fragment>
                     );
                   })}
                 </div>
               </div>
               
               {/* overall simple progress based on current_points */}
               <div className="mt-6">
                 <div className="text-sm text-gray-600 mb-2 text-center">
                   Progress: {(Number(user?.current_points) || 0)} points
                 </div>
                 <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                   <div
                     className="bg-amber-400 h-3"
                     style={{
                       width: `${Math.min(100, (((Number(user?.current_points) || 0)) / (levelPoints['Level Aquanus'] || 1)) * 100)}%`,
                     }}
                   />
                 </div>
               </div>
             </div>
           </div>
         )}
         <div className="py-3 md:pl-11 flex flex-col md:justify-start justify-center text-center md:text-left relative">
             {/* Mobile: Edit Button at top right */}
             {onEditProfile && (
               <div className="absolute top-3 right-0 md:hidden">
                 <button
                   onClick={onEditProfile}
                   className="flex items-center justify-center w-10 h-10 bg-[#DD761C] text-white rounded-full hover:bg-orange-600 transition-colors"
                   title="Edit Profile"
                 >
                   <Edit3 className="w-4 h-4" />
                 </button>
               </div>
             )}
             
             <div className="md:flex md:items-start md:justify-between">
               <div>
                 <h3 className="font-bold text-xl text-gray-900">
                   {user?.full_name || user?.username || user?.email || 'User'}
                 </h3>
                 
                 {/* Username and Phone */}
                 <div className="flex flex-col gap-1 mb-2">
                   {user?.username && (
                     <p className="text-sm text-gray-600">@{user.username}</p>
                   )}
                   {user?.phone && (
                     <p className="text-sm text-gray-600">{user.phone}</p>
                   )}
                 </div>
                 
                 <p className="text-gray-600 capitalize">
                   {user?.role === 'karyawan' ? 'Karyawan' : user?.role === 'admin' ? 'Administrator' : 'Member'}
                 </p>
                 
                 {/* Level and Points - Only show for regular users */}
                 {user?.role === 'user' && (
                   <div className="flex items-center gap-2 justify-center md:justify-start mt-1">
                     <div className="flex items-center gap-1 text-amber-600">
                       {/* <Award className="w-4 h-4" /> */}
                       {/* Level image */}
                       <img
                         src={levelImgSrc}
                         alt={levelName}
                         className="w-6 h-6 object-contain rounded-full border border-gray-200 bg-white"
                       />
                       <span className="font-medium">{levelName}</span>
                     </div>
                     <span className="text-gray-400">•</span>
                     <div className="flex items-center gap-1 text-amber-600">
                       <Star className="w-4 h-4 fill-current" />
                       <span className="font-medium">{user?.current_points || 0} points</span>
                     </div>
                   </div>
                 )}
               </div>
               
               {/* Desktop: Edit Button */}
               {onEditProfile && (
                 <button
                   onClick={onEditProfile}
                   className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#DD761C] text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                 >
                   <Edit3 className="w-4 h-4" />
                   Edit Profile
                 </button>
               )}
         </div>
         </div>
     </div>
   )
 }

