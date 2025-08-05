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

interface BankrollDialogProps {
  children: React.ReactNode
  initialBankroll: number
  onUpdateBankroll: (bankroll: number) => void
}

export function BankrollDialog({ children, initialBankroll, onUpdateBankroll }: BankrollDialogProps) {
  const [open, setOpen] = useState(false)
  const [bankroll, setBankroll] = useState(initialBankroll.toString())

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newBankroll = Number.parseFloat(bankroll)
    if (newBankroll > 0) {
      onUpdateBankroll(newBankroll)
      setOpen(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      setBankroll(initialBankroll.toString())
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialBankroll === 0 ? "Configure sua Banca Inicial" : "Editar Banca Inicial"}
          </DialogTitle>
          <DialogDescription>
            {initialBankroll === 0 
              ? "Para começar a rastrear seus lucros e prejuízos, configure o valor inicial da sua banca. Este será o ponto de partida para todos os seus cálculos."
              : "Defina o valor da sua banca inicial. Este será o ponto de partida para calcular seus lucros e prejuízos."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankroll">Banca Inicial (R$)</Label>
            <Input
              id="bankroll"
              type="number"
              step="0.01"
              min="0.01"
              placeholder={initialBankroll === 0 ? "Ex: 1000.00" : "1000.00"}
              value={bankroll}
              onChange={(e) => setBankroll(e.target.value)}
              required
            />
            {initialBankroll === 0 && (
              <p className="text-xs text-gray-600">
                💡 Exemplo: Se você começou com R$ 1000,00, digite 1000.00
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialBankroll === 0 ? "Configurar Banca" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
