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

interface DeleteBetDialogProps {
  children: React.ReactNode
  onConfirm: () => void
}

export function DeleteBetDialog({ children, onConfirm }: DeleteBetDialogProps) {
  const [open, setOpen] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir esta aposta? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
