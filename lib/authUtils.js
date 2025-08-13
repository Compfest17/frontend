export const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < 8) {
    errors.push('Minimal 8 karakter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Perlu huruf besar');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Perlu huruf kecil');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Perlu angka');
  }
  
  return errors;
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  
  return strength;
};

export const getAuthError = (error, type = 'login') => {
  const message = error.message.toLowerCase();
  
  if (type === 'login') {
    if (message.includes('invalid login credentials')) {
      return 'Email atau password salah';
    }
    if (message.includes('email not confirmed')) {
      return 'Email belum diverifikasi';
    }
    if (message.includes('too many requests')) {
      return 'Terlalu banyak percobaan, coba lagi nanti';
    }
    return 'Login gagal, coba lagi';
  }
  
  if (type === 'register') {
    if (message.includes('user already registered') || message.includes('already exists')) {
      return 'Email sudah terdaftar';
    }
    if (message.includes('invalid email')) {
      return 'Format email tidak valid';
    }
    if (message.includes('password')) {
      return 'Password tidak memenuhi syarat';
    }
    return 'Registrasi gagal, coba lagi';
  }
  
  if (type === 'reset') {
    if (message.includes('user not found')) {
      return 'Email tidak terdaftar';
    }
    return 'Reset password gagal';
  }
  
  return 'Terjadi kesalahan';
};
