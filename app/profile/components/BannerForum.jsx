import { Star, Award, Edit3 } from 'lucide-react';

export default function BannerForum({ user, onEditProfile }) {
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
            <img 
              src={user?.avatar_url || "/profilePicture-img.svg"} 
              alt="Profile Picture" 
              className="md:-mt-18 -mt-15 md:w-36 w-27 h-27 md:h-36 rounded-full border-4 border-white shadow-lg object-cover" 
            />
        </div>
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
                      <Award className="w-4 h-4" />
                      <span className="font-medium">{user?.levels?.name || 'Level Gundala'}</span>
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
