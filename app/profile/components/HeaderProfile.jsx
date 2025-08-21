import {Award} from 'lucide-react';
export default function HeaderProfile() {
  return (
    <div className="mx-auto p-4 sm:p-6">
        <div className="h-30 md:h-40 w-full overflow-hidden rounded-2xl">
        <img 
         src="/profileBanner-img.svg" 
         alt="Profile Banner" 
         sizes="100vw"
         className='object-cover object-top w-full' 
        />
        </div>
        <div className="px-10 flex justify-center md:justify-start">
            <img src="/profilePicture-img.svg" alt="Profile Picture" className="md:-mt-18 -mt-15 md:w-{150} w-27" />
        </div>
        <div className="py-3 md:pl-11 flex flex-col md:justify-start justify-center text-center md:text-left">
            <h3 className="font-bold">Wiro Sableng</h3>
            <p>Member Luar Biasa</p>
            <p className="text-amber-600 flex items-center gap-1"><Award size={18}/>1430 Points</p>
        </div>
    </div>
  )
}
