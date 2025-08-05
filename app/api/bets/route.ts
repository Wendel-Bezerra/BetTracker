import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const bet = await request.json()
    
    if (!bet.user_id || !bet.date || !bet.sport || !bet.match_name || !bet.bet_type || !bet.odds || !bet.stake) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    bet.id = crypto.randomUUID()
    bet.result = bet.result || 'pending'
    bet.profit = bet.profit || 0
    
    const result = localDb.createBet(bet)
    
    return NextResponse.json({ 
      id: bet.id,
      message: 'Aposta criada com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao criar aposta:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'UserId é obrigatório' }, { status: 400 })
    }
    
    const bets = localDb.getBetsByUserId(userId)
    
    return NextResponse.json(bets)
  } catch (error) {
    console.error('Erro ao buscar apostas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const bet = await request.json()
    
    if (!bet.id || !bet.user_id) {
      return NextResponse.json({ error: 'ID e user_id são obrigatórios' }, { status: 400 })
    }

    const result = localDb.updateBet(bet)
    
    return NextResponse.json({ 
      message: 'Aposta atualizada com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao atualizar aposta:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const betId = searchParams.get('betId')
    const userId = searchParams.get('userId')
    
    if (!betId || !userId) {
      return NextResponse.json({ error: 'BetId e userId são obrigatórios' }, { status: 400 })
    }
    
    const result = localDb.deleteBet(betId, userId)
    
    return NextResponse.json({ 
      message: 'Aposta removida com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao remover aposta:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 