import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nuxofsjzrgdauzriraze.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im51eG9mc2p6cmdkYXV6cmlyYXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjQ1NjQsImV4cCI6MjA4NjA0MDU2NH0.WYdapxhTkmoX1WhZ7LobTOfN_7GzwBCl0a-S1hbTpLo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
