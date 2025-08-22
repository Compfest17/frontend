'use client';
import { useState } from 'react';
import MentionAutocomplete from './MentionAutocomplete';

export default function PostComposer({ forumId = null }) {
  const [postContent, setPostContent] = useState('');

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex gap-3">
        <img 
          src="/image/forum/test/profil-test.jpg" 
          alt="Profile" 
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          {forumId ? (
            <MentionAutocomplete
              forumId={forumId}
              value={postContent}
              onChange={setPostContent}
              placeholder="Apa yang sedang terjadi? Gunakan @ untuk mention user..."
              className="text-xl placeholder-gray-500 min-h-[120px]"
            />
          ) : (
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Apa yang sedang terjadi?"
              className="w-full text-xl placeholder-gray-500 border-none resize-none focus:outline-none min-h-[120px]"
              rows={3}
            />
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2M7 4v16M17 4v16" />
                </svg>
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.01M15 10h1.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 100-8 4 4 0 000 8zm0 0v3a4 4 0 01-8 0v-3m8 0H8" />
                </svg>
              </button>
              <button className="p-2 hover:bg-blue-50 rounded-full transition-colors">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                Tampilkan 105 postingan
              </div>
              <button 
                disabled={!postContent.trim()}
                className="bg-orange-500 text-white px-6 py-2 rounded-full font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Posting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
