const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('Supabase client initialized at', supabaseUrl);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

module.exports = supabase;
