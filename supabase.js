// config/supabase.js
const SUPABASE_CONFIG = {
    url: 'https://jjmgjyykxfzpwevoockl.supabase.co', // Replace with actual URL
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpqbWdqeXlreGZ6cHdldm9vY2tsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAwODgxNDIsImV4cCI6MjA3NTY2NDE0Mn0.pFlDfhfldWLr3cBwZP47DhnRF9PbXX6O5e-E-cng19I', // Replace with actual key
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
};

const supabase = window.supabase.createClient(
    SUPABASE_CONFIG.url, 
    SUPABASE_CONFIG.anonKey, 
    SUPABASE_CONFIG.options
);