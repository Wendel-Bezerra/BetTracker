import { createClient } from "@supabase/supabase-js"

// Suas credenciais do Supabase
const supabaseUrl = "https://gnmvbcwbmuvaozztpxie.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdubXZiY3dibXV2YW96enRweGllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MTQxOTksImV4cCI6MjA2OTk5MDE5OX0.xyR-u5Te6UXly3cWC72wBl17zCff3ROa6tz6WSBBT3Y"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para o banco de dados
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          created_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          initial_bankroll: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          initial_bankroll?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          initial_bankroll?: number
          created_at?: string
          updated_at?: string
        }
      }
      bets: {
        Row: {
          id: string
          user_id: string
          date: string
          sport: string
          match_name: string
          bet_type: string
          odds: number
          stake: number
          result: "pending" | "won" | "lost"
          profit: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          sport: string
          match_name: string
          bet_type: string
          odds: number
          stake: number
          result?: "pending" | "won" | "lost"
          profit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          sport?: string
          match_name?: string
          bet_type?: string
          odds?: number
          stake?: number
          result?: "pending" | "won" | "lost"
          profit?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Função para testar a conexão
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("users").select("count").limit(1)
    if (error) {
      console.error("Erro de conexão com Supabase:", error)
      return false
    }
    console.log("✅ Conexão com Supabase estabelecida com sucesso!")
    return true
  } catch (error) {
    console.error("❌ Erro ao testar conexão:", error)
    return false
  }
}

// Função para verificar se as tabelas existem
export async function checkTables() {
  try {
    const { data: users, error: usersError } = await supabase.from("users").select("count").limit(1)
    const { data: settings, error: settingsError } = await supabase.from("user_settings").select("count").limit(1)
    const { data: bets, error: betsError } = await supabase.from("bets").select("count").limit(1)

    return {
      users: !usersError,
      user_settings: !settingsError,
      bets: !betsError,
      allTablesExist: !usersError && !settingsError && !betsError,
    }
  } catch (error) {
    console.error("Erro ao verificar tabelas:", error)
    return {
      users: false,
      user_settings: false,
      bets: false,
      allTablesExist: false,
    }
  }
}
