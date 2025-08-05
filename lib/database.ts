import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

class LocalDatabase {
  private db: Database.Database
  private dbPath: string

  constructor() {
    // Criar pasta data se não existir
    const dataDir = path.join(process.cwd(), 'data')
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }

    this.dbPath = path.join(dataDir, 'bettracker.db')
    this.db = new Database(this.dbPath)
    this.initDatabase()
  }

  private initDatabase() {
    // Criar tabelas se não existirem
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        initial_bankroll REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS bets (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        sport TEXT NOT NULL,
        match_name TEXT NOT NULL,
        bet_type TEXT NOT NULL,
        odds REAL NOT NULL,
        stake REAL NOT NULL,
        result TEXT DEFAULT 'pending',
        profit REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
      CREATE INDEX IF NOT EXISTS idx_bets_date ON bets(date DESC);
      CREATE INDEX IF NOT EXISTS idx_bets_result ON bets(result);
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    `)
  }

  // Métodos para usuários
  createUser(user: { id: string; email: string; name: string }) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, name) VALUES (?, ?, ?)
    `)
    return stmt.run(user.id, user.email, user.name)
  }

  getUserByEmail(email: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email) as any
  }

  getUserById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id) as any
  }

  // Métodos para apostas
  createBet(bet: any) {
    const stmt = this.db.prepare(`
      INSERT INTO bets (id, user_id, date, sport, match_name, bet_type, odds, stake, result, profit)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(bet.id, bet.user_id, bet.date, bet.sport, bet.match_name, bet.bet_type, bet.odds, bet.stake, bet.result, bet.profit)
  }

  getBetsByUserId(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM bets WHERE user_id = ? ORDER BY date DESC')
    return stmt.all(userId) as any[]
  }

  updateBet(bet: any) {
    const stmt = this.db.prepare(`
      UPDATE bets 
      SET date = ?, sport = ?, match_name = ?, bet_type = ?, odds = ?, stake = ?, result = ?, profit = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `)
    return stmt.run(bet.date, bet.sport, bet.match_name, bet.bet_type, bet.odds, bet.stake, bet.result, bet.profit, bet.id, bet.user_id)
  }

  deleteBet(betId: string, userId: string) {
    const stmt = this.db.prepare('DELETE FROM bets WHERE id = ? AND user_id = ?')
    return stmt.run(betId, userId)
  }

  // Métodos para configurações
  getUserSettings(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM user_settings WHERE user_id = ?')
    return stmt.get(userId) as any
  }

  createOrUpdateUserSettings(userId: string, initialBankroll: number) {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO user_settings (id, user_id, initial_bankroll, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `)
    const id = `settings-${userId}`
    return stmt.run(id, userId, initialBankroll)
  }

  // Backup e restauração
  exportData() {
    const users = this.db.prepare('SELECT * FROM users').all()
    const bets = this.db.prepare('SELECT * FROM bets').all()
    const settings = this.db.prepare('SELECT * FROM user_settings').all()
    
    return {
      users,
      bets,
      settings,
      exportedAt: new Date().toISOString()
    }
  }

  importData(data: any) {
    // Limpar dados existentes
    this.db.exec('DELETE FROM bets; DELETE FROM user_settings; DELETE FROM users;')
    
    // Importar novos dados
    data.users?.forEach((user: any) => this.createUser(user))
    data.settings?.forEach((setting: any) => this.createOrUpdateUserSettings(setting.user_id, setting.initial_bankroll))
    data.bets?.forEach((bet: any) => this.createBet(bet))
  }

  // Estatísticas
  getStats(userId: string) {
    const totalBets = this.db.prepare('SELECT COUNT(*) as count FROM bets WHERE user_id = ?').get(userId) as any
    const wonBets = this.db.prepare('SELECT COUNT(*) as count FROM bets WHERE user_id = ? AND result = "won"').get(userId) as any
    const lostBets = this.db.prepare('SELECT COUNT(*) as count FROM bets WHERE user_id = ? AND result = "lost"').get(userId) as any
    const pendingBets = this.db.prepare('SELECT COUNT(*) as count FROM bets WHERE user_id = ? AND result = "pending"').get(userId) as any
    const totalProfit = this.db.prepare('SELECT SUM(profit) as total FROM bets WHERE user_id = ?').get(userId) as any
    const totalStake = this.db.prepare('SELECT SUM(stake) as total FROM bets WHERE user_id = ?').get(userId) as any

    return {
      totalBets: totalBets.count || 0,
      wonBets: wonBets.count || 0,
      lostBets: lostBets.count || 0,
      pendingBets: pendingBets.count || 0,
      totalProfit: totalProfit.total || 0,
      totalStake: totalStake.total || 0
    }
  }

  // Fechar conexão
  close() {
    this.db.close()
  }
}

export const localDb = new LocalDatabase() 