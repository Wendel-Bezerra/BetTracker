"use client"

import { useState, useEffect } from "react"
import type { Bet, BetInsert } from "@/types/betting"
import { useToast } from "@/hooks/use-toast"

export function useBettingLocal(userEmail: string) {
  const [bets, setBets] = useState<Bet[]>([])
  const [initialBankroll, setInitialBankroll] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  const [isConnected, setIsConnected] = useState(true) // Sempre conectado localmente
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (userEmail && isMounted) {
      initializeUser()
    }
  }, [userEmail, isMounted])

  const initializeUser = async () => {
    try {
      console.log("🔄 Inicializando usuário local:", userEmail)

      // Buscar ou criar usuário
      const userResponse = await fetch(`/api/users?email=${encodeURIComponent(userEmail)}`)
      
      let currentUserId: string
      
      if (userResponse.status === 404) {
        // Criar novo usuário
        console.log("👤 Criando novo usuário...")
        const createResponse = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: userEmail, 
            name: userEmail.split('@')[0] 
          })
        })
        
        if (!createResponse.ok) {
          throw new Error('Erro ao criar usuário')
        }
        
        const newUser = await createResponse.json()
        currentUserId = newUser.id
        setUserId(newUser.id)
        console.log("✅ Usuário criado:", newUser.id)
      } else if (userResponse.ok) {
        const user = await userResponse.json()
        currentUserId = user.id
        setUserId(user.id)
        console.log("✅ Usuário encontrado:", user.id)
      } else {
        throw new Error('Erro ao buscar usuário')
      }

      // Carregar apostas e configurações com o userId já definido
      const [betsData, settingsData] = await Promise.all([
        loadBets(currentUserId),
        loadUserSettings(currentUserId)
      ])
      
      // Mensagem personalizada baseada no que foi carregado
      let welcomeMessage = "Bem-vindo!"
      let descriptionMessage = "Seus dados foram carregados com segurança."
      
      if (betsData && betsData.length > 0) {
        welcomeMessage = "Bem-vindo de volta!"
        descriptionMessage = `${betsData.length} apostas e banca de R$ ${settingsData?.initialBankroll || 0} carregados.`
      } else if (settingsData?.initialBankroll && settingsData.initialBankroll > 0) {
        welcomeMessage = "Bem-vindo de volta!"
        descriptionMessage = `Sua banca de R$ ${settingsData.initialBankroll} foi carregada.`
      } else {
        welcomeMessage = "Bem-vindo!"
        descriptionMessage = "Comece configurando sua banca inicial e adicionando apostas!"
      }
      
      toast({
        title: welcomeMessage,
        description: descriptionMessage,
      })
      
    } catch (error) {
      console.error("❌ Erro ao inicializar usuário:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do usuário",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadBets = async (userIdParam?: string) => {
    try {
      const currentUserId = userIdParam || userId
      if (!currentUserId) return []

      console.log("📊 Carregando apostas para usuário:", currentUserId)
      const response = await fetch(`/api/bets?userId=${currentUserId}`)
      
      if (!response.ok) {
        throw new Error('Erro ao carregar apostas')
      }
      
      const data = await response.json()
      setBets(data)
      console.log(`✅ ${data.length} apostas carregadas`)
      
      if (data.length > 0) {
        toast({
          title: "Dados Carregados",
          description: `${data.length} apostas carregadas do banco local.`,
        })
      }
      
      return data // Retorna os dados carregados
    } catch (error) {
      console.error("❌ Erro ao carregar apostas:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar apostas",
        variant: "destructive",
      })
      return []
    }
  }

  const loadUserSettings = async (userIdParam?: string) => {
    try {
      const currentUserId = userIdParam || userId
      if (!currentUserId) return

      const response = await fetch(`/api/settings?userId=${currentUserId}`)
      
      if (response.ok) {
        const data = await response.json()
        setInitialBankroll(data.initialBankroll)
        console.log("✅ Configurações carregadas - Banca inicial: R$", data.initialBankroll)
        return data // Retorna os dados para a mensagem personalizada
      }
      return null // Retorna null se não encontrar configurações
    } catch (error) {
      console.error("❌ Erro ao carregar configurações:", error)
      setInitialBankroll(0)
      return null
    }
  }

  const addBet = async (newBet: BetInsert) => {
    try {
      if (!userId) {
        throw new Error('Usuário não inicializado')
      }

      console.log("➕ Adicionando nova aposta para usuário:", userId)

      const response = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newBet, user_id: userId })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar aposta')
      }
      
      await loadBets()
      toast({
        title: "Sucesso",
        description: "Sua aposta foi adicionada com sucesso!",
      })
      console.log("✅ Aposta adicionada")
    } catch (error) {
      console.error("❌ Erro ao adicionar aposta:", error)
      toast({
        title: "Erro",
        description: "Erro ao adicionar sua aposta",
        variant: "destructive",
      })
    }
  }

  const updateBet = async (updatedBet: Bet) => {
    try {
      if (!userId) {
        throw new Error('Usuário não inicializado')
      }

      console.log("✏️ Atualizando aposta:", updatedBet.id)

      const response = await fetch('/api/bets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedBet, user_id: userId })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar aposta')
      }
      
      await loadBets()
      toast({
        title: "Sucesso",
        description: "Sua aposta foi atualizada com sucesso!",
      })
      console.log("✅ Aposta atualizada")
    } catch (error) {
      console.error("❌ Erro ao atualizar aposta:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar sua aposta",
        variant: "destructive",
      })
    }
  }

  const deleteBet = async (betId: string) => {
    try {
      if (!userId) {
        throw new Error('Usuário não inicializado')
      }

      console.log("🗑️ Removendo aposta:", betId)

      const response = await fetch(`/api/bets?betId=${betId}&userId=${userId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Erro ao remover aposta')
      }
      
      await loadBets()
      toast({
        title: "Sucesso",
        description: "Sua aposta foi removida com sucesso!",
      })
      console.log("✅ Aposta removida")
    } catch (error) {
      console.error("❌ Erro ao remover aposta:", error)
      toast({
        title: "Erro",
        description: "Erro ao remover sua aposta",
        variant: "destructive",
      })
    }
  }

  const updateBankroll = async (newBankroll: number) => {
    try {
      if (!userId) {
        throw new Error('Usuário não inicializado')
      }

      console.log("💰 Atualizando banca inicial para usuário:", userId, "valor:", newBankroll)

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, initialBankroll: newBankroll })
      })
      
      if (!response.ok) {
        throw new Error('Erro ao atualizar banca')
      }
      
      setInitialBankroll(newBankroll)
      const isFirstTime = initialBankroll === 0
      
      toast({
        title: isFirstTime ? "Banca Configurada!" : "Sucesso",
        description: isFirstTime 
          ? `Perfeito! Sua banca inicial foi configurada em R$ ${newBankroll.toFixed(2)}. Agora você pode rastrear seus lucros e prejuízos.`
          : `Sua banca inicial foi atualizada para R$ ${newBankroll.toFixed(2)}!`,
      })
      console.log("✅ Banca atualizada")
    } catch (error) {
      console.error("❌ Erro ao atualizar banca:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar sua banca inicial",
        variant: "destructive",
      })
    }
  }

  const exportData = async () => {
    try {
      const response = await fetch('/api/backup')
      if (!response.ok) {
        throw new Error('Erro ao exportar dados')
      }
      
      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bettracker-backup-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Backup Exportado",
        description: "Seus dados foram exportados com sucesso!",
      })
    } catch (error) {
      console.error("❌ Erro ao exportar dados:", error)
      toast({
        title: "Erro",
        description: "Erro ao exportar dados",
        variant: "destructive",
      })
    }
  }

  const importData = async (file: File) => {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao importar dados')
      }
      
      // Recarregar dados
      await loadBets()
      await loadUserSettings()
      
      toast({
        title: "Dados Importados",
        description: "Seus dados foram importados com sucesso!",
      })
    } catch (error) {
      console.error("❌ Erro ao importar dados:", error)
      toast({
        title: "Erro",
        description: "Erro ao importar dados",
        variant: "destructive",
      })
    }
  }

  return {
    bets,
    initialBankroll,
    loading,
    isConnected,
    userId,
    isMounted,
    addBet,
    updateBet,
    deleteBet,
    updateBankroll,
    exportData,
    importData,
  }
} 