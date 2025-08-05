"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddBetDialog } from "@/components/add-bet-dialog"
import { EditBetDialog } from "@/components/edit-bet-dialog"
import { BankrollDialog } from "@/components/bankroll-dialog"
import { DeleteBetDialog } from "@/components/delete-bet-dialog"
import { useBettingLocal } from "@/hooks/use-betting-local"
import type { Bet, BetInsert } from "@/types/betting"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  LogOut,
  Plus,
  Filter,
  Edit,
  Trash2,
  Settings,
  Wifi,
  WifiOff,
  User,
  Download,
  Upload,
} from "lucide-react"

interface BettingDashboardProps {
  user: { name: string; email: string } | null
  onLogout: () => void
}

export function BettingDashboard({ user, onLogout }: BettingDashboardProps) {
  const [filterSport, setFilterSport] = useState<string>("all")
  const [filterResult, setFilterResult] = useState<string>("all")

  const { bets, initialBankroll, loading, isConnected, userId, isMounted, addBet, updateBet, deleteBet, updateBankroll, exportData, importData } =
    useBettingLocal(user?.email || "")

  const filteredBets = bets.filter((bet) => {
    const sportMatch = filterSport === "all" || bet.sport === filterSport
    const resultMatch = filterResult === "all" || bet.result === filterResult
    return sportMatch && resultMatch
  })

  const totalProfit = bets.reduce((sum, bet) => sum + bet.profit, 0)
  const currentBankroll = initialBankroll + totalProfit
  const totalInvested = bets.reduce((sum, bet) => sum + bet.stake, 0)
  const winRate =
    bets.filter((bet) => bet.result !== "pending").length > 0
      ? (bets.filter((bet) => bet.result === "won").length / bets.filter((bet) => bet.result !== "pending").length) *
        100
      : 0
  const pendingBets = bets.filter((bet) => bet.result === "pending").length
  const wonBets = bets.filter((bet) => bet.result === "won").length
  const lostBets = bets.filter((bet) => bet.result === "lost").length

  const handleAddBet = (newBet: Omit<Bet, "id">) => {
    const betInsert: BetInsert = {
      date: newBet.date,
      sport: newBet.sport,
      match_name: newBet.match_name,
      bet_type: newBet.bet_type,
      odds: newBet.odds,
      stake: newBet.stake,
      result: newBet.result,
      profit: newBet.profit,
    }
    addBet(betInsert)
  }

  const getResultBadge = (result: string) => {
    switch (result) {
      case "won":
        return <Badge className="bg-green-100 text-green-800">Ganhou</Badge>
      case "lost":
        return <Badge className="bg-red-100 text-red-800">Perdeu</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
      default:
        return <Badge>-</Badge>
    }
  }

  if (loading || !isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Carregando seus dados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-2" />
            BetTracker
            {isConnected ? (
              <Wifi className="h-5 w-5 text-green-600 ml-2" title="Conectado ao banco de dados" />
            ) : (
              <WifiOff className="h-5 w-5 text-orange-600 ml-2" title="Modo offline - dados locais" />
            )}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="h-4 w-4" />
            <span>Bem-vindo, {user?.name}!</span>
            <span className="text-green-600 font-medium">
              (Banco Local)
            </span>
            {bets.length > 0 && (
              <span className="text-green-600 font-medium">
                • {bets.length} aposta{bets.length !== 1 ? 's' : ''} carregada{bets.length !== 1 ? 's' : ''}
              </span>
            )}
            {initialBankroll > 0 && (
              <span className="text-blue-600 font-medium">
                • Banca: R$ {initialBankroll.toFixed(2)}
              </span>
            )}
          </div>
          {userId && <p className="text-xs text-gray-500 mt-1">ID do usuário: {userId.slice(0, 8)}...</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportData} title="Exportar dados">
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button 
            variant="outline" 
            onClick={() => {
              const input = document.createElement('input')
              input.type = 'file'
              input.accept = '.json'
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0]
                if (file) {
                  importData(file)
                }
              }
              input.click()
            }}
            title="Importar dados"
          >
            <Upload className="h-4 w-4 mr-2" />
            Restore
          </Button>
          <BankrollDialog initialBankroll={initialBankroll} onUpdateBankroll={updateBankroll}>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Minha Banca
            </Button>
          </BankrollDialog>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Bankroll Configuration Alert */}
      {initialBankroll === 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <div className="flex-1">
                <p className="text-blue-800 font-medium">Configure sua Banca Inicial</p>
                <p className="text-blue-700 text-sm">
                  Para calcular corretamente seus lucros e perdas, configure o valor inicial da sua banca.
                </p>
              </div>
              <BankrollDialog initialBankroll={initialBankroll} onUpdateBankroll={updateBankroll}>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar Banca
                </Button>
              </BankrollDialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Stats Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Resumo das Suas Apostas</h3>
              <p className="text-gray-600">
                Total de apostas: <strong>{bets.length}</strong> | Ganhas:{" "}
                <strong className="text-green-600">{wonBets}</strong> | Perdidas:{" "}
                <strong className="text-red-600">{lostBets}</strong> | Pendentes:{" "}
                <strong className="text-yellow-600">{pendingBets}</strong>
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Total Investido</p>
              <p className="text-xl font-bold text-gray-900">R$ {totalInvested.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={initialBankroll === 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minha Banca Inicial</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {initialBankroll === 0 ? (
                <span className="text-orange-600">Não configurada</span>
              ) : (
                `R$ ${initialBankroll.toFixed(2)}`
              )}
            </div>
            {initialBankroll === 0 && (
              <p className="text-xs text-orange-600 mt-1">
                Clique em "Minha Banca" para configurar
              </p>
            )}
          </CardContent>
        </Card>

        <Card className={initialBankroll === 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minha Banca Atual</CardTitle>
            {initialBankroll === 0 ? (
              <Settings className="h-4 w-4 text-orange-600" />
            ) : currentBankroll >= initialBankroll ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                initialBankroll === 0 
                  ? "text-orange-600" 
                  : currentBankroll >= initialBankroll 
                    ? "text-green-600" 
                    : "text-red-600"
              }`}
            >
              {initialBankroll === 0 ? (
                <span>Configure a banca</span>
              ) : (
                `R$ ${currentBankroll.toFixed(2)}`
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {initialBankroll === 0 ? (
                "Configure sua banca inicial primeiro"
              ) : (
                `${totalProfit >= 0 ? "+" : ""}R$ ${totalProfit.toFixed(2)} de lucro`
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minha Taxa de Acerto</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{winRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {wonBets} de {wonBets + lostBets} apostas finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Apostas Pendentes</CardTitle>
            <Badge variant="secondary">{pendingBets}</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBets}</div>
            <p className="text-xs text-muted-foreground">
              R${" "}
              {bets
                .filter((bet) => bet.result === "pending")
                .reduce((sum, bet) => sum + bet.stake, 0)
                .toFixed(2)}{" "}
              em jogo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 items-center">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={filterSport} onValueChange={setFilterSport}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Esporte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os esportes</SelectItem>
              <SelectItem value="Futebol">Futebol</SelectItem>
              <SelectItem value="Basquete">Basquete</SelectItem>
              <SelectItem value="Tênis">Tênis</SelectItem>
              <SelectItem value="Vôlei">Vôlei</SelectItem>
              <SelectItem value="UFC">UFC</SelectItem>
              <SelectItem value="Fórmula 1">Fórmula 1</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterResult} onValueChange={setFilterResult}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Resultado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="won">Ganhou</SelectItem>
              <SelectItem value="lost">Perdeu</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AddBetDialog onAddBet={handleAddBet}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Aposta
          </Button>
        </AddBetDialog>
      </div>

      {/* Bets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Minhas Apostas</CardTitle>
          <CardDescription>
            Histórico completo das suas apostas esportivas
            {filteredBets.length !== bets.length && (
              <span className="ml-2 text-blue-600">
                (Mostrando {filteredBets.length} de {bets.length} apostas)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bets.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {loading ? "Carregando suas apostas..." : "Nenhuma aposta ainda"}
              </h3>
              <p className="text-gray-600 mb-4">
                {loading 
                  ? "Aguarde enquanto carregamos seus dados..." 
                  : "Comece adicionando sua primeira aposta esportiva!"
                }
              </p>
              {!loading && (
                <AddBetDialog onAddBet={handleAddBet}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Primeira Aposta
                  </Button>
                </AddBetDialog>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Esporte</TableHead>
                  <TableHead>Jogo</TableHead>
                  <TableHead>Tipo de Aposta</TableHead>
                  <TableHead>Odd</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Resultado</TableHead>
                  <TableHead>Lucro/Prejuízo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell>{new Date(bet.date).toLocaleDateString("pt-BR")}</TableCell>
                    <TableCell>{bet.sport}</TableCell>
                    <TableCell className="font-medium">{bet.match_name}</TableCell>
                    <TableCell>{bet.bet_type}</TableCell>
                    <TableCell>{bet.odds.toFixed(2)}</TableCell>
                    <TableCell>R$ {bet.stake.toFixed(2)}</TableCell>
                    <TableCell>{getResultBadge(bet.result)}</TableCell>
                    <TableCell className={bet.profit > 0 ? "text-green-600" : bet.profit < 0 ? "text-red-600" : ""}>
                      {bet.result === "pending" ? "-" : `R$ ${bet.profit.toFixed(2)}`}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <EditBetDialog bet={bet} onUpdateBet={updateBet}>
                          <Button variant="ghost" size="sm" title="Editar minha aposta">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </EditBetDialog>
                        <DeleteBetDialog onConfirm={() => deleteBet(bet.id)}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            title="Excluir minha aposta"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DeleteBetDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
