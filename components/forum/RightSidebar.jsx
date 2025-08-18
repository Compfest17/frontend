export default function RightSidebar() {
  const trendingDiscussions = [
    { 
      author: 'John Doe',
      username: '@johndoe',
      date: '11 Agustus 2024',
      title: 'Jalan berlubang parahh banget',
      content: 'agan ini kondisinya bener-bener parah banget! Aspalnya udah pada retak-retak, penuh lubang besar di mana-mana, dan gampang-gampang anjir traksinya bikin makin susah gejawan. Setiap kendaraan yang lewat pasti harus pelan-pelan dan...',
      comments: 800,
      likes: 145
    },
    { 
      author: 'Siti Nurhaliza',
      username: '@sitinur',
      date: '10 Agustus 2024',
      title: 'Lampu jalan mati sudah 2 minggu',
      content: 'Lampu jalan di sepanjang Jalan Raya Kemang sudah mati selama 2 minggu. Sangat berbahaya untuk pejalan kaki di malam hari. Mohon segera diperbaiki...',
      comments: 25,
      likes: 38
    },
    { 
      author: 'Ahmad Rahman',
      username: '@ahmadrhm',
      date: '9 Agustus 2024',
      title: 'Gorong-gorong tersumbat menyebabkan banjir',
      content: 'Setiap hujan deras, daerah perumahan kami selalu kebanjiran karena gorong-gorong tersumbat sampah. Sudah lapor tapi belum ada tindak lanjut...',
      comments: 67,
      likes: 89
    },
    { 
      author: 'Maria Santos',
      username: '@mariasnt',
      date: '8 Agustus 2024',
      title: 'Trotoar rusak membahayakan pejalan kaki',
      content: 'Trotoar di sekitar pasar tradisional kondisinya sangat memprihatinkan. Banyak yang retak dan berlubang, membahayakan keselamatan pejalan kaki terutama lansia...',
      comments: 42,
      likes: 76
    }
  ];

  return (
    <div className="w-80 p-4 space-y-6 sticky top-24 h-fit max-h-[calc(100vh-8rem)] overflow-y-auto">
      {/* Trending Discussions */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <h3 className="font-bold text-lg xl:text-xl mb-4">Sedang hangat dibicarakan</h3>
        <div className="space-y-4">
          {trendingDiscussions.map((discussion, index) => (
            <div key={index} className="hover:bg-gray-100 p-3 rounded-lg cursor-pointer -mx-1 transition-colors">
              {/* Author Info */}
              <div className="flex items-center gap-2 mb-2">
                <img 
                  src="/image/forum/test/profil-test.jpg" 
                  alt={discussion.author}
                  className="w-6 h-6 rounded-full"
                />
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="font-semibold text-gray-900">{discussion.author}</span>
                  <span>{discussion.username}</span>
                  <span>·</span>
                  <span>{discussion.date}</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="mb-2">
                <h4 className="font-semibold text-sm text-gray-900 mb-1">{discussion.title}</h4>
                <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                  {discussion.content}
                </p>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>{discussion.comments}</span>
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{discussion.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="text-orange-500 text-sm mt-3 hover:underline">
          Tampilkan lebih banyak
        </button>
      </div>
    </div>
  );
}
            