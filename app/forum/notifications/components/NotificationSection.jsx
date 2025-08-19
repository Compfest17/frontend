'use client';
import { useState } from 'react';
import NotificationItem from '../../../../components/forum/NotificationItem';

export default function NotificationSection() {
  // Extended notification data with different types
  const allNotifications = [
    {
      id: 1,
      type: 'like',
      category: 'general',
      user: 'John Doe',
      action: 'menyukai laporan Anda',
      content: 'Jalan berlubang parahh banget',
      time: '16j',
      read: false,
      avatar: '/image/forum/test/profil-test.jpg'
    },
    {
      id: 2,
      type: 'system',
      category: 'general',
      user: 'Sistem GatotKota',
      action: 'Laporan Anda telah diverifikasi oleh admin dan sedang dalam proses penanganan.',
      content: 'Jalan berlubang parahh banget',
      time: '2j',
      read: false,
      avatar: '/image/forum/test/profil-test.jpg'
    },
    {
      id: 3,
      type: 'mention',
      category: 'mention',
      user: '@ariefmuhammaddd',
      action: 'menyebut Anda dalam komentar:',
      content: '"@johndoe setuju banget dengan laporan ini, kondisinya memang parah"',
      time: '4j',
      read: false,
      avatar: '/image/forum/test/profil-test.jpg'
    },
    {
      id: 4,
      type: 'comment',
      category: 'general',
      user: 'Siti Nurhaliza',
      action: 'mengomentari laporan Anda',
      content: 'Lampu jalan mati sudah 2 minggu di Jalan Raya Kemang',
      time: '6j',
      read: true,
      avatar: '/image/forum/test/profil-test.jpg'
    },
    {
      id: 5,
      type: 'system',
      category: 'general',
      user: 'Dinas Pekerjaan Umum',
      action: 'memperbarui status laporan Anda menjadi "Selesai".',
      content: 'Drainase tersumbat menyebabkan banjir',
      time: '1h',
      read: false,
      avatar: '/image/forum/test/profil-test.jpg'
    },
    {
      id: 6,
      type: 'mention',
      category: 'mention',
      user: '@zikrisaputra8116',
      action: 'menyebut Anda dalam diskusi:',
      content: '"@johndoe coba hubungi hotline dinas terkait untuk laporan ini"',
      time: '8j',
      read: true,
      avatar: '/image/forum/test/profil-test.jpg'
    },
    {
      id: 7,
      type: 'like',
      category: 'general',
      user: 'Ahmad Fauzi',
      action: 'menyukai komentar Anda di',
      content: 'Trotoar rusak membahayakan pejalan kaki',
      time: '12j',
      read: true,
      avatar: '/image/forum/test/profil-test.jpg'
    },
    {
      id: 8,
      type: 'mention',
      category: 'mention',
      user: '@frtii_19',
      action: 'menyebut Anda:',
      content: '"@johndoe rasanya seperti off-road gratis ya hehe"',
      time: '1d',
      read: false,
      avatar: '/image/forum/test/profil-test.jpg'
    }
  ];

  // Hapus filter berdasarkan tab, tampilkan semua notifikasi
  const filteredNotifications = allNotifications;

  return (
    <div className="w-full max-w-2xl mx-auto lg:border-x border-gray-200 min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-20 bg-white/80 backdrop-blur-md border-b border-gray-200 z-20">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Notifikasi</h1>
            {/* Hapus tombol setting */}
          </div>
        </div>
        {/* Hapus Tabs */}
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-gray-200">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-5-5V9a6 6 0 10-12 0v3l-5 5h5m7 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum ada notifikasi
              </h3>
              <p className="text-gray-500">
                Semua notifikasi Anda akan muncul di sini.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Load More - only show when there are notifications */}
      {filteredNotifications.length > 0 && (
        <div className="text-center py-8 border-t border-gray-200">
          <button className="text-orange-500 text-sm font-medium py-2 hover:bg-orange-50 px-4 rounded-lg transition-colors">
            Tampilkan lebih banyak
          </button>
        </div>
      )}
    </div>
  );
}