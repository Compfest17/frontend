'use client';

import { MapPin, Upload, Phone, X } from 'lucide-react';
import { useState } from 'react';

export default function Formulir() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter(file => {
      const isValidType = file.type.includes('image/jpeg') || file.type.includes('image/png');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
      return isValidType && isValidSize;
    });

    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newFile = {
          id: Date.now() + Math.random(),
          file: file,
          preview: e.target.result,
          name: file.name
        };
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const fakeEvent = { target: { files } };
    handleFileUpload(fakeEvent);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm max-w-2xl mx-auto">
      <form className="space-y-6">
        {/* Judul Laporan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul Laporan <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Contoh: Jalan Berlubang di Jalan Sudirman"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Deskripsi Laporan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Deskripsi Laporan <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Jelaskan detail kondisi jalan rusak, lokasi sekitar, dan dampaknya..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
          />
        </div>

        {/* Tanggal Kejadian */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Kejadian/Ditemukan <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Lokasi Kejadian */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lokasi Kejadian <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Alamat lengkap lokasi jalan rusak"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 mb-2"
          />
          <div className="flex">
            <input
              type="text"
              placeholder="Koordinat GPS (opsional)"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <button
              type="button"
              className="px-4 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 focus:outline-none flex items-center gap-2"
            >
              <MapPin size={16} />
            </button>
          </div>
        </div>

        {/* Foto Jalan Rusak */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Foto Jalan Rusak
          </label>
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <Upload size={48} className="text-gray-400 mb-2 mx-auto" />
            <p className="text-sm text-gray-600 mb-1">
              Seret & lepas foto di sini, atau{' '}
              <label className="font-medium cursor-pointer" style={{color: '#DD761C'}}>
                Pilih Foto
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-500">JPG, PNG Max. 5MB per file</p>
          </div>

          {/* Preview uploaded files */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="relative group">
                  <img
                    src={file.preview}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-md transition-all duration-200 opacity-80 hover:opacity-100"
                  >
                    <X size={14} />
                  </button>
                  <p className="text-xs text-gray-500 mt-1 truncate">{file.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kategori Kerusakan */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kategori Kerusakan <span className="text-red-500">*</span>
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
            <option value="">Pilih kategori kerusakan jalan</option>
            <option value="lubang">Lubang</option>
            <option value="retak">Retak</option>
            <option value="amblas">Amblas</option>
            <option value="lainnya">Lainnya</option>
          </select>
        </div>

        {/* Tingkat Urgensi */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tingkat Urgensi <span className="text-red-500">*</span>
          </label>
          <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
            <option value="">Pilih tingkat urgensi</option>
            <option value="rendah">Rendah</option>
            <option value="sedang">Sedang</option>
            <option value="tinggi">Tinggi</option>
            <option value="sangat-tinggi">Sangat Tinggi</option>
          </select>
        </div>

        {/* Kontak Pelapor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kontak Pelapor (Opsional)
          </label>
          <div className="flex">
            <div className="flex items-center px-3 py-2 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
              <Phone size={16} className="text-gray-600 mr-2" />
              <span className="text-sm text-gray-600"></span>
            </div>
            <input
              type="tel"
              placeholder="08123456789"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Kerahasiaan Identitas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Kerahasiaan Identitas <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="anonymous"
                className="mr-2"
                style={{accentColor: '#DD761C'}}
              />
              <span className="text-sm text-gray-700">Anonim (identitas disembunyikan)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="privacy"
                value="public"
                className="mr-2"
                style={{accentColor: '#DD761C'}}
              />
              <span className="text-sm text-gray-700">Tampilkan Identitas</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full text-white font-medium py-3 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 hover:opacity-90"
          style={{
            backgroundColor: '#DD761C',
            '--tw-ring-color': '#DD761C'
          }}
        >
          KIRIM LAPORAN
        </button>
      </form>
    </div>
  );
}
