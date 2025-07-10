import { supabase } from '../lib/supabase';

export const generateUniqueCode = async (): Promise<string> => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  let isUnique = false;
  
  while (!isUnique) {
    result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Check if code already exists in database
    const { data, error } = await supabase
      .from('products')
      .select('unique_code')
      .eq('unique_code', result)
      .maybeSingle();
    
    // If no data found, the code is unique
    if (!data) {
      isUnique = true;
    }
  }
  
  return result;
};