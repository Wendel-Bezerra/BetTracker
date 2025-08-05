import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'UserId é obrigatório' }, { status: 400 })
    }
    
    const settings = localDb.getUserSettings(userId)
    
    if (!settings) {
      return NextResponse.json({ initialBankroll: 0 })
    }
    
    return NextResponse.json({ initialBankroll: settings.initial_bankroll })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, initialBankroll } = await request.json()
    
    if (!userId || initialBankroll === undefined) {
      return NextResponse.json({ error: 'UserId e initialBankroll são obrigatórios' }, { status: 400 })
    }

    const result = localDb.createOrUpdateUserSettings(userId, initialBankroll)
    
    return NextResponse.json({ 
      message: 'Configurações atualizadas com sucesso',
      initialBankroll
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 