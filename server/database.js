const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env');
  // Return null instead of initializing invalid client to prevent crashes
  module.exports = null;
  return;
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase client initialized at', supabaseUrl);

module.exports = supabase;
