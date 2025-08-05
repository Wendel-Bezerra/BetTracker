"use client"

import { useState, useEffect } from "react"
import { supabase, testConnection, checkTables } from "@/lib/supabase"
import type { Bet, BetInsert } from "@/types/betting"
import { useToast } from "@/hooks/use-toast"

export function useBetting(userEmail: string) {
  const [bets, setBets] = useState<Bet[]>([])
  const [initialBankroll, setInitialBankroll] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string>("")
  const [isConnected, setIsConnected] = useState(false)
  const [tablesExist, setTablesExist] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (userEmail && isMounted) {
      initializeConnection()
    }
  }, [userEmail, isMounted])

  const initializeConnection = async () => {
    try {
      console.log("🔄 Testando conexão com Supabase...")

      // SEMPRE carregar dados locais primeiro para mostrar conteúdo imediatamente
      loadLocalData()

      // Testar conexão primeiro
      const connected = await testConnection()
      setIsConnected(connected)

      if (!connected) {
        console.log("❌ Não foi possível conectar ao Supabase")
        return
      }

      console.log("✅ Conexão estabelecida!")

      // Verificar se as tabelas existem
      const tableStatus = await checkTables()
      setTablesExist(tableStatus.allTablesExist)

      if (!tableStatus.allTablesExist) {
        console.log("⚠️ Algumas tabelas não existem:", tableStatus)
        toast({
          title: "Configuração Necessária",
          description: "Execute os scripts SQL no Supabase para criar as tabelas.",
          variant: "destructive",
        })
        return
      }

      console.log("✅ Todas as tabelas existem!")
      await initializeUser()
    } catch (error) {
      console.error("❌ Erro ao inicializar conexão:", error)
    } finally {
      setLoading(false)
    }
  }

  const migrateExistingData = () => {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window === 'undefined') return

    // Verificar se existem dados antigos no formato anterior
    const oldBets = localStorage.getItem("betting-tracker-bets")
    const oldBankroll = localStorage.getItem("betting-tracker-bankroll")

    if (oldBets || oldBankroll) {
      console.log("🔄 Migrando dados existentes para o novo formato...")

      // Migrar apostas antigas
      if (oldBets) {
        const userKey = `betting-tracker-${userEmail}`
        const existingUserBets = localStorage.getItem(`${userKey}-bets`)

        if (!existingUserBets) {
          // Só migra se não existem dados específicos do usuário
          localStorage.setItem(`${userKey}-bets`, oldBets)
          console.log("✅ Apostas migradas para o usuário:", userEmail)
        }
      }

      // Migrar banca antiga
      if (oldBankroll) {
        const userKey = `betting-tracker-${userEmail}`
        const existingUserBankroll = localStorage.getItem(`${userKey}-bankroll`)

        if (!existingUserBankroll) {
          localStorage.setItem(`${userKey}-bankroll`, oldBankroll)
          console.log("✅ Banca migrada para o usuário:", userEmail)
        }
      }

      toast({
        title: "Dados Migrados",
        description: "Suas apostas anteriores foram preservadas!",
      })
    }
  }

  const loadLocalData = (showOfflineToast = false) => {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window === 'undefined') return

    // Primeiro, tentar migrar dados existentes
    migrateExistingData()

    // Carregar dados específicos do usuário do localStorage
    const userKey = `betting-tracker-${userEmail}`
    const localBets = localStorage.getItem(`${userKey}-bets`)
    const localBankroll = localStorage.getItem(`${userKey}-bankroll`)

    let loadedBetsCount = 0
    let loadedBankroll = 0

    if (localBets) {
      const parsedBets = JSON.parse(localBets)
      setBets(parsedBets)
      loadedBetsCount = parsedBets.length
      console.log(`✅ ${parsedBets.length} apostas carregadas do localStorage para ${userEmail}`)
    }

    if (localBankroll) {
      const parsedBankroll = Number.parseFloat(localBankroll)
      setInitialBankroll(parsedBankroll)
      loadedBankroll = parsedBankroll
      console.log(`✅ Banca de R$ ${parsedBankroll} carregada para ${userEmail}`)
    }

    // Mostrar mensagem informativa sobre dados carregados
    if (loadedBetsCount > 0) {
      toast({
        title: "Dados Carregados",
        description: `${loadedBetsCount} apostas e banca de R$ ${loadedBankroll.toFixed(2)} carregados.`,
      })
    } else {
      // Se não há apostas, mostrar mensagem de boas-vindas
      toast({
        title: "Bem-vindo!",
        description: "Comece adicionando sua primeira aposta esportiva!",
      })
    }

    // Só mostrar toast de modo offline se solicitado
    if (showOfflineToast) {
      toast({
        title: "Modo Offline",
        description:
          isConnected && !tablesExist
            ? "Execute os scripts SQL para criar as tabelas no Supabase."
            : "Usando dados locais. Verifique a configuração do Supabase.",
        variant: "default",
      })
    }
  }

  const saveLocalData = (newBets: Bet[], newBankroll?: number) => {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window === 'undefined') return

    const userKey = `betting-tracker-${userEmail}`
    localStorage.setItem(`${userKey}-bets`, JSON.stringify(newBets))
    if (newBankroll !== undefined) {
      localStorage.setItem(`${userKey}-bankroll`, newBankroll.toString())
    }
  }

  const validateUserEmail = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, email")
        .eq("email", email.toLowerCase().trim())
        .single()

      if (error && error.code === "PGRST116") {
        // Usuário não existe - isso é um problema se estamos tentando inicializar
        console.error("❌ Usuário não encontrado no banco:", email)
        return false
      }

      if (error) {
        console.error("❌ Erro ao validar usuário:", error)
        return false
      }

      console.log("✅ Usuário validado:", data.email)
      return true
    } catch (error) {
      console.error("❌ Erro na validação do usuário:", error)
      return false
    }
  }

  const initializeUser = async () => {
    try {
      console.log("🔄 Inicializando usuário:", userEmail)

      // Validar se o usuário existe e tem permissão
      const isValidUser = await validateUserEmail(userEmail)

      if (!isValidUser) {
        console.error("❌ Usuário inválido ou não encontrado")
        toast({
          title: "Erro de Autenticação",
          description: "Usuário não encontrado. Faça login novamente.",
          variant: "destructive",
        })
        loadLocalData(true) // Mostrar toast de modo offline
        return
      }

      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", userEmail.toLowerCase().trim())
        .single()

      if (userError) {
        console.error("Erro ao buscar usuário:", userError)
        throw userError
      }

      console.log("✅ Usuário encontrado:", userData.id)
      setUserId(userData.id)

      // Buscar ou criar configurações do usuário
      await initializeUserSettings(userData.id)

      // Buscar apostas do usuário do banco
      await loadBets(userData.id)

      // Tentar sincronizar dados locais com o banco
      await syncLocalDataToDatabase(userData.id)

      // Verificar se conseguimos carregar dados do banco
      const { data: betCount } = await supabase
        .from("bets")
        .select("id", { count: "exact" })
        .eq("user_id", userData.id)

      if (betCount && betCount.length > 0) {
        toast({
          title: "Bem-vindo de volta!",
          description: `Olá, ${userData.name}! ${betCount.length} apostas carregadas do banco de dados.`,
        })
      } else {
        toast({
          title: "Bem-vindo de volta!",
          description: `Olá, ${userData.name}! Seus dados foram carregados com segurança.`,
        })
      }
    } catch (error) {
      console.error("❌ Erro ao inicializar usuário:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do usuário. Usando modo offline.",
        variant: "destructive",
      })
      loadLocalData()
    }
  }

  const initializeUserSettings = async (currentUserId: string) => {
    try {
      // Buscar configurações do usuário
      let { data: settings, error: settingsError } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", currentUserId)
        .single()

      if (settingsError && settingsError.code === "PGRST116") {
        console.log("⚙️ Criando configurações iniciais...")
        // Configurações não existem, criar com banca inicial zero
        const { data: newSettings, error: createSettingsError } = await supabase
          .from("user_settings")
          .insert([
            {
              user_id: currentUserId,
              initial_bankroll: 0.0,
            },
          ])
          .select()
          .single()

        if (createSettingsError) {
          console.error("Erro ao criar configurações:", createSettingsError)
          throw createSettingsError
        }

        settings = newSettings
        console.log("✅ Configurações criadas com banca inicial de R$ 0,00")
      } else if (settingsError) {
        console.error("Erro ao buscar configurações:", settingsError)
        throw settingsError
      } else {
        console.log("✅ Configurações encontradas - Banca inicial: R$", settings.initial_bankroll)
      }

      setInitialBankroll(settings.initial_bankroll)
    } catch (error) {
      console.error("❌ Erro ao inicializar configurações:", error)
      // Usar valor zero se não conseguir carregar
      setInitialBankroll(0)
    }
  }

  const loadBets = async (userIdParam?: string) => {
    if (!isConnected || !tablesExist) {
      console.log("⚠️ Não conectado ou tabelas não existem, mantendo dados locais")
      return
    }

    try {
      const currentUserId = userIdParam || userId
      console.log("📊 Carregando apostas do banco para usuário:", currentUserId)

      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .eq("user_id", currentUserId)
        .order("date", { ascending: false })

      if (error) {
        console.error("Erro ao carregar apostas:", error)
        throw error
      }

      const formattedBets: Bet[] = data.map((bet) => ({
        id: bet.id,
        date: bet.date,
        sport: bet.sport,
        match_name: bet.match_name,
        bet_type: bet.bet_type,
        odds: bet.odds,
        stake: bet.stake,
        result: bet.result,
        profit: bet.profit,
      }))

      // Atualizar estado com dados do banco
      setBets(formattedBets)
      saveLocalData(formattedBets)
      console.log(`✅ ${formattedBets.length} apostas carregadas do banco para o usuário`)
      
      // Mostrar toast informativo se carregou dados do banco
      if (formattedBets.length > 0) {
        toast({
          title: "Dados Sincronizados",
          description: `${formattedBets.length} apostas carregadas do banco de dados.`,
        })
      }
    } catch (error) {
      console.error("❌ Erro ao carregar apostas do banco:", error)
      toast({
        title: "Erro de Sincronização",
        description: "Erro ao carregar apostas do servidor. Mantendo dados locais.",
        variant: "destructive",
      })
    }
  }

  const addBet = async (newBet: BetInsert) => {
    try {
      if (isConnected && tablesExist && userId) {
        console.log("➕ Adicionando nova aposta para usuário:", userId)

        const { data, error } = await supabase
          .from("bets")
          .insert([
            {
              user_id: userId,
              date: newBet.date,
              sport: newBet.sport,
              match_name: newBet.match_name,
              bet_type: newBet.bet_type,
              odds: newBet.odds,
              stake: newBet.stake,
              result: newBet.result,
              profit: newBet.profit,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("Erro ao adicionar aposta:", error)
          throw error
        }

        await loadBets()
        toast({
          title: "Sucesso",
          description: "Sua aposta foi adicionada com sucesso!",
        })
        console.log("✅ Aposta adicionada:", data.id)
      } else {
        // Modo offline - salvar com ID único baseado no usuário
        const newBetWithId: Bet = {
          id: `offline-${userEmail}-${Date.now()}`,
          ...newBet,
        }
        const updatedBets = [newBetWithId, ...bets]
        setBets(updatedBets)
        saveLocalData(updatedBets)

        toast({
          title: "Sucesso (Offline)",
          description: "Aposta salva localmente para sua conta.",
        })
      }
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
      if (isConnected && tablesExist && userId) {
        console.log("✏️ Atualizando aposta:", updatedBet.id, "para usuário:", userId)

        // Verificar se a aposta pertence ao usuário atual
        const { data: existingBet, error: checkError } = await supabase
          .from("bets")
          .select("user_id")
          .eq("id", updatedBet.id)
          .single()

        if (checkError) {
          console.error("Erro ao verificar propriedade da aposta:", checkError)
          throw checkError
        }

        if (existingBet.user_id !== userId) {
          throw new Error("Você não tem permissão para editar esta aposta")
        }

        const { error } = await supabase
          .from("bets")
          .update({
            date: updatedBet.date,
            sport: updatedBet.sport,
            match_name: updatedBet.match_name,
            bet_type: updatedBet.bet_type,
            odds: updatedBet.odds,
            stake: updatedBet.stake,
            result: updatedBet.result,
            profit: updatedBet.profit,
          })
          .eq("id", updatedBet.id)
          .eq("user_id", userId) // Garantir que só atualiza apostas do usuário

        if (error) {
          console.error("Erro ao atualizar aposta:", error)
          throw error
        }

        await loadBets()
        toast({
          title: "Sucesso",
          description: "Sua aposta foi atualizada com sucesso!",
        })
        console.log("✅ Aposta atualizada")
      } else {
        // Modo offline
        const updatedBets = bets.map((bet) => (bet.id === updatedBet.id ? updatedBet : bet))
        setBets(updatedBets)
        saveLocalData(updatedBets)

        toast({
          title: "Sucesso (Offline)",
          description: "Aposta atualizada localmente.",
        })
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar aposta:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao atualizar sua aposta",
        variant: "destructive",
      })
    }
  }

  const deleteBet = async (betId: string) => {
    try {
      if (isConnected && tablesExist && userId) {
        console.log("🗑️ Removendo aposta:", betId, "do usuário:", userId)

        // Verificar se a aposta pertence ao usuário atual antes de deletar
        const { error } = await supabase.from("bets").delete().eq("id", betId).eq("user_id", userId) // Garantir que só deleta apostas do usuário

        if (error) {
          console.error("Erro ao remover aposta:", error)
          throw error
        }

        await loadBets()
        toast({
          title: "Sucesso",
          description: "Sua aposta foi removida com sucesso!",
        })
        console.log("✅ Aposta removida")
      } else {
        // Modo offline
        const updatedBets = bets.filter((bet) => bet.id !== betId)
        setBets(updatedBets)
        saveLocalData(updatedBets)

        toast({
          title: "Sucesso (Offline)",
          description: "Aposta removida localmente.",
        })
      }
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
      if (isConnected && tablesExist && userId) {
        console.log("💰 Atualizando banca inicial para usuário:", userId, "valor:", newBankroll)

        const { error } = await supabase
          .from("user_settings")
          .update({
            initial_bankroll: newBankroll,
          })
          .eq("user_id", userId) // Garantir que só atualiza configurações do usuário

        if (error) {
          console.error("Erro ao atualizar banca:", error)
          throw error
        }

        setInitialBankroll(newBankroll)
        toast({
          title: "Sucesso",
          description: `Sua banca inicial foi atualizada para R$ ${newBankroll.toFixed(2)}!`,
        })
        console.log("✅ Banca atualizada")
      } else {
        // Modo offline
        setInitialBankroll(newBankroll)
        saveLocalData(bets, newBankroll)

        toast({
          title: "Sucesso (Offline)",
          description: "Banca atualizada localmente.",
        })
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar banca:", error)
      toast({
        title: "Erro",
        description: "Erro ao atualizar sua banca inicial",
        variant: "destructive",
      })
    }
  }

  const syncLocalDataToDatabase = async (currentUserId: string) => {
    try {
      // Verificar se estamos no cliente antes de acessar localStorage
      if (typeof window === 'undefined') return

      const userKey = `betting-tracker-${userEmail}`
      const localBets = localStorage.getItem(`${userKey}-bets`)
      const localBankroll = localStorage.getItem(`${userKey}-bankroll`)

      if (localBets) {
        const parsedBets = JSON.parse(localBets)
        console.log(`🔄 Sincronizando ${parsedBets.length} apostas locais com o banco...`)

        // Verificar quais apostas já existem no banco
        const { data: existingBets, error: fetchError } = await supabase
          .from("bets")
          .select("id")
          .eq("user_id", currentUserId)

        if (fetchError) {
          console.error("Erro ao buscar apostas existentes:", fetchError)
          return
        }

        const existingIds = new Set(existingBets?.map((bet) => bet.id) || [])
        const betsToSync = parsedBets.filter((bet: Bet) => !existingIds.has(bet.id))

        if (betsToSync.length > 0) {
          // Inserir apostas que não existem no banco
          const betsForInsert = betsToSync.map((bet: Bet) => ({
            id: bet.id.startsWith("offline-") ? undefined : bet.id, // Gerar novo ID se for offline
            user_id: currentUserId,
            date: bet.date,
            sport: bet.sport,
            match_name: bet.match_name,
            bet_type: bet.bet_type,
            odds: bet.odds,
            stake: bet.stake,
            result: bet.result,
            profit: bet.profit,
          }))

          const { error: insertError } = await supabase.from("bets").insert(betsForInsert)

          if (insertError) {
            console.error("Erro ao sincronizar apostas:", insertError)
          } else {
            console.log(`✅ ${betsToSync.length} apostas sincronizadas com sucesso!`)
            toast({
              title: "Sincronização Completa",
              description: `${betsToSync.length} apostas foram sincronizadas com o banco de dados.`,
            })
          }
        }
      }

      // Sincronizar banca se necessário
      if (localBankroll) {
        const parsedBankroll = Number.parseFloat(localBankroll)

        // Verificar se já existe configuração no banco
        const { data: existingSettings } = await supabase
          .from("user_settings")
          .select("initial_bankroll")
          .eq("user_id", currentUserId)
          .single()

        if (existingSettings && existingSettings.initial_bankroll === 0 && parsedBankroll !== 0) {
          // Atualizar com a banca local se a do banco for zero
          await supabase.from("user_settings").update({ initial_bankroll: parsedBankroll }).eq("user_id", currentUserId)

          console.log(`✅ Banca sincronizada: R$ ${parsedBankroll}`)
        }
      }
    } catch (error) {
      console.error("❌ Erro na sincronização:", error)
    }
  }

  return {
    bets,
    initialBankroll,
    loading,
    isConnected: isConnected && tablesExist,
    userId,
    isMounted,
    addBet,
    updateBet,
    deleteBet,
    updateBankroll,
  }
}
