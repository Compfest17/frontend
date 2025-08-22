import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const signUp = async (email, password, fullName, referralCode = null) => {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email,
        password,
        full_name: fullName,
        referral_code: referralCode?.trim() || null
      })
    });

    const result = await response.json();
    console.log('Registration result:', result);
    
    if (!response.ok) {
      return { data: null, error: { message: result.message } };
    }

    return { data: result.data, error: null };
  } catch (error) {
    console.error('Registration error:', error);
    return { data: null, error: { message: 'Network error' } };
  }
}

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  })
  return { data, error }
}

export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  })
  return { data, error }
}

export const updatePassword = async (password) => {
  const { data, error } = await supabase.auth.updateUser({
    password
  })
  return { data, error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  if (user && session) {
    return { 
      user: {
        ...user,
        access_token: session.access_token,
        refresh_token: session.refresh_token
      }, 
      error 
    }
  }
  
  return { user, error }
}

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback)
}
