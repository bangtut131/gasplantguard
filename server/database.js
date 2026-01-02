const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY must be set in .env');
  // We don't exit process here to allow build steps to pass, but runtime will fail if not set.
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Supabase client initialized at', supabaseUrl);

module.exports = supabase;
