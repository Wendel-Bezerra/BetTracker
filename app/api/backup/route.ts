import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/database'

export async function GET() {
  try {
    const data = localDb.exportData()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao exportar dados:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    if (!data.users || !data.bets || !data.settings) {
      return NextResponse.json({ error: 'Dados inválidos para importação' }, { status: 400 })
    }

    localDb.importData(data)
    
    return NextResponse.json({ 
      message: 'Dados importados com sucesso',
      importedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Erro ao importar dados:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 