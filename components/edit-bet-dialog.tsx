"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Bet {
  id: string
  date: string
  sport: string
  match_name: string // Alterar de match para match_name
  bet_type: string
  odds: number
  stake: number
  result: "pending" | "won" | "lost"
  profit: number
}

interface EditBetDialogProps {
  children: React.ReactNode
  bet: Bet
  onUpdateBet: (bet: Bet) => void
}

export function EditBetDialog({ children, bet, onUpdateBet }: EditBetDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: bet.date,
    sport: bet.sport,
    match_name: bet.match_name, // Alterado de match para match_name
    bet_type: bet.bet_type, // Alterado de betType para bet_type
    odds: bet.odds.toString(),
    stake: bet.stake.toString(),
    result: bet.result,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const updatedBet: Bet = {
      ...bet,
      date: formData.date,
      sport: formData.sport,
      match_name: formData.match_name, // Alterado de formData.match para formData.match_name
      bet_type: formData.bet_type, // Alterado de formData.betType para formData.bet_type
      odds: Number.parseFloat(formData.odds),
      stake: Number.parseFloat(formData.stake),
      result: formData.result,
      profit:
        formData.result === "pending"
          ? 0
          : formData.result === "won"
            ? Number.parseFloat(formData.stake) * Number.parseFloat(formData.odds) - Number.parseFloat(formData.stake)
            : -Number.parseFloat(formData.stake),
    }

    onUpdateBet(updatedBet)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      // Reset form data when opening
      setFormData({
        date: bet.date,
        sport: bet.sport,
        match_name: bet.match_name, // Alterado para bet.match_name
        bet_type: bet.bet_type, // Alterado para bet.bet_type
        odds: bet.odds.toString(),
        stake: bet.stake.toString(),
        result: bet.result,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Aposta</DialogTitle>
          <DialogDescription>Altere os dados da sua aposta</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Data</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sport">Esporte</Label>
              <Select value={formData.sport} onValueChange={(value) => setFormData({ ...formData, sport: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Futebol">Futebol</SelectItem>
                  <SelectItem value="Basquete">Basquete</SelectItem>
                  <SelectItem value="Tênis">Tênis</SelectItem>
                  <SelectItem value="Vôlei">Vôlei</SelectItem>
                  <SelectItem value="UFC">UFC</SelectItem>
                  <SelectItem value="Fórmula 1">Fórmula 1</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-match">Jogo/Evento</Label>
            <Input
              id="edit-match"
              placeholder="Ex: Flamengo vs Palmeiras"
              value={formData.match_name}
              onChange={(e) => setFormData({ ...formData, match_name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bet-type">Tipo de Aposta</Label>
            <Input
              id="edit-bet-type"
              placeholder="Ex: Vitória do Flamengo, Over 2.5 gols"
              value={formData.bet_type}
              onChange={(e) => setFormData({ ...formData, bet_type: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-odds">Odd</Label>
              <Input
                id="edit-odds"
                type="number"
                step="0.01"
                placeholder="2.50"
                value={formData.odds}
                onChange={(e) => setFormData({ ...formData, odds: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stake">Valor Apostado (R$)</Label>
              <Input
                id="edit-stake"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={formData.stake}
                onChange={(e) => setFormData({ ...formData, stake: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-result">Resultado</Label>
            <Select
              value={formData.result}
              onValueChange={(value: "pending" | "won" | "lost") => setFormData({ ...formData, result: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="won">Ganhou</SelectItem>
                <SelectItem value="lost">Perdeu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Alterações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
