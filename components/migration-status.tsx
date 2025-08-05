"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Database, HardDrive, CheckCircle, AlertCircle } from "lucide-react"

interface MigrationStatusProps {
  userEmail: string
  isConnected: boolean
}

export function MigrationStatus({ userEmail, isConnected }: MigrationStatusProps) {
  const [localData, setLocalData] = useState<{
    oldBets: number
    userBets: number
    oldBankroll: boolean
    userBankroll: boolean
  }>({
    oldBets: 0,
    userBets: 0,
    oldBankroll: false,
    userBankroll: false,
  })
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (isMounted) {
      checkLocalData()
    }
  }, [userEmail, isMounted])

  const checkLocalData = () => {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window === 'undefined') return

    // Verificar dados antigos
    const oldBets = localStorage.getItem("betting-tracker-bets")
    const oldBankroll = localStorage.getItem("betting-tracker-bankroll")

    // Verificar dados específicos do usuário
    const userKey = `betting-tracker-${userEmail}`
    const userBets = localStorage.getItem(`${userKey}-bets`)
    const userBankroll = localStorage.getItem(`${userKey}-bankroll`)

    setLocalData({
      oldBets: oldBets ? JSON.parse(oldBets).length : 0,
      userBets: userBets ? JSON.parse(userBets).length : 0,
      oldBankroll: !!oldBankroll,
      userBankroll: !!userBankroll,
    })
  }

  const clearOldData = () => {
    // Verificar se estamos no cliente antes de acessar localStorage
    if (typeof window === 'undefined') return

    localStorage.removeItem("betting-tracker-bets")
    localStorage.removeItem("betting-tracker-bankroll")
    checkLocalData()
  }

  if (!isMounted || (localData.oldBets === 0 && !localData.oldBankroll)) {
    return null // Não mostrar se não há dados antigos ou se não está montado
  }

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          Status da Migração de Dados
        </CardTitle>
        <CardDescription>Verificação dos seus dados existentes e status da migração</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Dados Antigos (Formato Anterior)
            </h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Apostas:</span>
                <Badge variant={localData.oldBets > 0 ? "default" : "secondary"}>{localData.oldBets}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Banca:</span>
                <Badge variant={localData.oldBankroll ? "default" : "secondary"}>
                  {localData.oldBankroll ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              Dados do Usuário (Novo Formato)
            </h4>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm">Apostas:</span>
                <Badge variant={localData.userBets > 0 ? "default" : "secondary"}>{localData.userBets}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Banca:</span>
                <Badge variant={localData.userBankroll ? "default" : "secondary"}>
                  {localData.userBankroll ? "Sim" : "Não"}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {localData.userBets > 0 && (localData.oldBets > 0 || localData.oldBankroll) && (
          <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Migração Concluída!</p>
              <p className="text-xs text-green-700">
                Seus dados foram migrados com sucesso. Você pode limpar os dados antigos.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={clearOldData}>
              Limpar Dados Antigos
            </Button>
          </div>
        )}

        {localData.oldBets > 0 && localData.userBets === 0 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Migração Pendente</p>
              <p className="text-xs text-yellow-700">
                Seus dados antigos serão migrados automaticamente quando você recarregar a página.
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-1" />
              Recarregar
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-1">
          <p>
            <strong>Usuário atual:</strong> {userEmail}
          </p>
          <p>
            <strong>Status da conexão:</strong> {isConnected ? "Conectado" : "Offline"}
          </p>
          {isConnected && <p className="text-green-600">✅ Dados serão sincronizados automaticamente com o banco</p>}
        </div>
      </CardContent>
    </Card>
  )
}
