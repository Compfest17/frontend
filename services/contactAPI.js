import { supabase } from '@/lib/supabase-auth';

console.log('contactAPI: File loaded successfully!');

export const testFunction = () => {
  console.log('testFunction called successfully!');
  return 'Test successful';
};

export const submitContactMessage = async (messageData) => {
  try {
    console.log('contactAPI (Frontend): Submitting to Backend API:', messageData);
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });

    const result = await response.json();
    
    console.log('contactAPI (Frontend): Backend API response:', result);

    if (!response.ok) {
      if (result.details && Array.isArray(result.details)) {
        const errorMessages = result.details.map(detail => detail.msg).join(', ');
        throw new Error(`Validation error: ${errorMessages}`);
      }
      throw new Error(result.error || 'Failed to submit contact message');
    }

    return { data: result.data, error: null };
    
  } catch (error) {
    console.error('contactAPI (Frontend): Error submitting contact message:', error);
    return { data: null, error };
  }
};

export const getContactMessages = async () => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching contact messages:', error);
    return { data: null, error };
  }
};

export const updateContactMessageStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating contact message status:', error);
    return { data: null, error };
  }
};
