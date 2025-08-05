import { NextRequest, NextResponse } from 'next/server'
import { localDb } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json()
    
    if (!email || !name) {
      return NextResponse.json({ error: 'Email e nome são obrigatórios' }, { status: 400 })
    }

    // Verificar se usuário já existe
    const existingUser = localDb.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: 'Usuário já existe' }, { status: 409 })
    }

    const id = crypto.randomUUID()
    const result = localDb.createUser({ id, email, name })
    
    return NextResponse.json({ 
      id, 
      email, 
      name,
      message: 'Usuário criado com sucesso' 
    })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const id = searchParams.get('id')
    
    if (!email && !id) {
      return NextResponse.json({ error: 'Email ou ID é obrigatório' }, { status: 400 })
    }
    
    let user
    if (email) {
      user = localDb.getUserByEmail(email)
    } else if (id) {
      user = localDb.getUserById(id)
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json(user)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 