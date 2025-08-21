'use client';
import { useState, useEffect } from 'react';
import ForumCard from '../../../components/formulir/ForumCard';
import ProfileData from '../../../data/profileData.json';
import saveData from '../../../data/saveData.json';
import {MonitorUp, BookmarkCheck} from 'lucide-react';


export default function BodyProfile() {
  const [filteredPosts, setFilteredPosts] = useState(forumData.posts);
  const [filteredSave, setFilteredSave] = useState(saveData.posts);
  const [currentPage, setCurrentPage] = useState(1);
  
  const postsPerPage = 9;
  const savePerPage = 9;
  
  // Get current posts for the page
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  //Get current save
  const indexOfLastSave = currentPage * savePerPage;
  const indexOfFirstSave = indexOfLastSave - savePerPage;
  const currentSave = filteredSave.slice(indexOfFirstSave, indexOfLastSave);


  //Switch Tabs
  const [activeTab, setActiveTab] = useState(1);

  const handleActiveTab = (index) => {
    setActiveTab(index);
  }

  return (
    <div className="container px-4 sm:px-6 py-8">
      <div className='mb-5 flex gap-5'>

        <div onClick={() => setActiveTab(1)} className={`${activeTab == 1? "text-amber-600  border-amber-600 border-b-1":"border-white border-b-1"}  hover:text-amber-600  w-fit cursor-pointer smooth flex items-center gap-1`}><MonitorUp size={18}/>Postingan</div>

        <div onClick={() => setActiveTab(2)} className={`${activeTab == 2? "text-amber-600  border-amber-600 border-b-1":"border-white border-b-1"}  hover:text-amber-600  w-fit cursor-pointer smooth flex items-center gap-1`}><BookmarkCheck size={18}/>Simpan</div>
      </div>
      {/* Postingan */}
      <div className={`${activeTab ==1? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8":"hidden"}`}>
        {currentPosts.map((post) => (
          <ForumCard key={post.id} post={post} />
        ))}
      </div>
      
      {/* Simpan */}
      <div className={`${activeTab ==2? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8":"hidden"}`}>
        {currentSave.map((save) => (
          <ForumCard key={save.id} post={save} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Tidak ada diskusi yang ditemukan.</p>
        </div>
      )}
    </div>
  );
}
