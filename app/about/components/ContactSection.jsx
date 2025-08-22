'use client';

import { useState, useCallback } from 'react'; // Import useCallback
import { submitContactMessage } from '@/services/contactAPI';
import TurnstileWidget from '@/components/TurnstileWidget';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // Can be 'success', 'error', or null
  const [errorMessage, setErrorMessage] = useState(''); // State for specific error messages
  const [turnstileToken, setTurnstileToken] = useState(''); 

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage('');
    
    if (process.env.NEXT_PUBLIC_TURNSTILE_ENABLED === 'true' && !turnstileToken) {
      setErrorMessage('Silakan selesaikan verifikasi untuk mengirim pesan.');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
        throw new Error('Harap isi semua kolom yang wajib diisi (*).');
      }
      
      if (formData.message.trim().length < 5) {
        throw new Error('Pesan harus memiliki panjang minimal 5 karakter.');
      }
      
      const result = await submitContactMessage({ ...formData, turnstileToken });

      if (result.error) {
        throw new Error(result.error.message || 'Gagal mengirim pesan');
      }

      setSubmitStatus('success');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting message:', error);
      setErrorMessage(error.message || 'Terjadi kesalahan. Silakan coba lagi.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- PERUBAHAN DIMULAI DI SINI ---

  // Gunakan useCallback untuk menstabilkan fungsi agar tidak dibuat ulang setiap render
  const handleTurnstileExpire = useCallback(() => {
    setTurnstileToken('');
  }, []);

  const handleTurnstileError = useCallback((error) => {
    console.error('Turnstile error:', error);
    setErrorMessage('Verifikasi gagal, silakan muat ulang halaman dan coba lagi.');
    setSubmitStatus('error');
    setTurnstileToken('');
  }, []);

  // --- AKHIR DARI PERUBAHAN ---

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Hubungi Kami
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ada pertanyaan tentang platform kami? Tim kami siap membantu Anda dalam membangun kota yang lebih baik.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          
          <div 
            className="relative rounded-2xl lg:rounded-3xl p-6 lg:p-12 text-white overflow-hidden min-h-[500px] lg:min-h-[600px]"
            style={{
              backgroundImage: `linear-gradient(rgba(221, 118, 28, 0.85), rgba(197, 102, 26, 0.85)), url('/image/auth/Slider2.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            <div className="relative z-10">
              <h1 className="text-3xl lg:text-5xl font-bold mb-4 lg:mb-6">
                Contact us
              </h1>
              
              <p className="text-base lg:text-lg mb-8 lg:mb-12 text-orange-50 leading-relaxed">
                Ask about our platform, infrastructure reporting, or anything else. 
                Our highly trained team are standing by, ready to help improve your city.
              </p>

              <div className="text-center">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 text-white">
                  Mari Bersama Membangun
                </h3>
                <h4 className="text-xl lg:text-2xl font-semibold text-orange-100">
                  Kota yang Lebih Baik
                </h4>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl lg:rounded-3xl p-6 lg:p-12 shadow-xl">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Pesan berhasil dikirim! Tim kami akan segera menghubungi Anda.
                  </div>
                </div>
              )}
              
              {submitStatus === 'error' && errorMessage && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errorMessage}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contoh@email.com"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon <span className="text-gray-500">(opsional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+62 xxx xxxx xxxx"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesan <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Sampaikan pertanyaan atau saran Anda tentang platform GatotKota..."
                  required
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                />
              </div>

              <TurnstileWidget
                onVerify={setTurnstileToken}
                onExpire={handleTurnstileExpire}
                onError={handleTurnstileError}
                className="my-4"
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#DD761C] hover:bg-[#C5661A] disabled:bg-orange-300 text-white font-semibold py-4 lg:py-5 px-6 rounded-lg transition-all duration-200 text-base lg:text-lg transform hover:scale-[0.98] active:scale-[0.96] disabled:transform-none"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Mengirim Pesan...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
