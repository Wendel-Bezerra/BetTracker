// Tipos estritos para apostas
export interface BetFormData {
  date: string
  sport: string
  match_name: string
  bet_type: string
  odds: string
  stake: string
  result: "pending" | "won" | "lost"
}

export interface Bet {
  id: string
  date: string
  sport: string
  match_name: string
  bet_type: string
  odds: number
  stake: number
  result: "pending" | "won" | "lost"
  profit: number
}

export interface BetInsert {
  date: string
  sport: string
  match_name: string
  bet_type: string
  odds: number
  stake: number
  result: "pending" | "won" | "lost"
  profit: number
}

export interface UserSettings {
  id: string
  user_id: string
  initial_bankroll: number
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

// Constantes para validação
export const SPORTS = ["Futebol", "Basquete", "Tênis", "Vôlei", "UFC", "Fórmula 1"] as const

export const BET_RESULTS = ["pending", "won", "lost"] as const

export type Sport = (typeof SPORTS)[number]
export type BetResult = (typeof BET_RESULTS)[number]
