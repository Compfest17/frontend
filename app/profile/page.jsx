export default function ProfilePage() {
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
            <p className="text-amber-600">(Logo) 1430 poin</p>
        </div>
        <div className="md:px-11 ml-5 md:ml-0 mt-15">
          <a href="" className="md:mr-10 mr-7">Postingan</a>
          <a href="">Simpan</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:px-7 mt-5">
          <div className="bg-white shadow-2xl p-3 mx-3 rounded-xl">
            <img src="/profileBanner-img.svg" alt="" className="rounded-lg" />
            <div className="my-3 px-2">
              <h3 className="text-lg">Parah bangett, bendera nya ilang, saking susahnya nyari bendera, sampai dibikinin flm</h3>
              <p className="text-zinc-500 mt-2">14 Agustus 2025</p>
            </div>
            <div className="flex px-2">
              <img src="profilePicture-img.svg" alt="" className="w-10 h-auto" />
              <span className="flex justify-center items-center ml-2">Wiro Sableng</span>
            </div>
          </div>
          <div className="bg-white shadow-2xl p-3 rounded-xl mx-3 flex flex-wrap">
            <img src="/profileBanner-img.svg" alt="" className="rounded-lg" />
            <div className="my-3 px-2">
              <h3 className="text-lg">Parah bangett, bendera nya ilang, saking susahnya nyari bendera, sampai dibikinin flm</h3>
              <p className="text-zinc-500 mt-2">14 Agustus 2025</p>
            </div>
            <div className="flex px-2">
              <img src="profilePicture-img.svg" alt="" className="w-10 h-auto" />
              <span className="flex justify-center items-center ml-2">Wiro Sableng</span>
            </div>
          </div>
          <div className="bg-white   shadow-2xl p-3 rounded-xl mx-3 flex flex-col">
            <img src="/profileBanner-img.svg" alt="" className="rounded-lg" />
            <div className="my-3 px-2">
              <h3 className="text-lg">Parah bangett, bendera nya ilang, saking susahnya nyari bendera, sampai dibikinin flm</h3>
              <p className="text-zinc-500 mt-2">14 Agustus 2025</p>
            </div>
            <div className="flex px-2">
              <img src="profilePicture-img.svg" alt="" className="w-10 h-auto" />
              <span className="flex justify-center items-center ml-2">Wiro Sableng</span>
            </div>
          </div>

        </div>
    </div>
  );
}
