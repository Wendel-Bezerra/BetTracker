"use client"

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
import { Badge } from "@/components/ui/badge"
import { Crown, Plus, Star, Zap, Users, BarChart3 } from "lucide-react"

interface PremiumModalProps {
  children: React.ReactNode
}

export function PremiumModal({ children }: PremiumModalProps) {
  const [open, setOpen] = useState(false)

  const features = [
    {
      icon: <Plus className="h-5 w-5" />,
      title: "Múltiplas Bankrolls",
      description: "Crie quantas bankrolls quiser para organizar suas apostas"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Análises Avançadas",
      description: "Estatísticas detalhadas por bankroll e performance geral"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Exportação Avançada",
      description: "Exporte dados específicos de cada bankroll"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Suporte Prioritário",
      description: "Atendimento exclusivo para usuários premium"
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-yellow-500 mr-2" />
            <DialogTitle className="text-2xl font-bold">Funcionalidade Premium</DialogTitle>
          </div>
          <DialogDescription className="text-lg">
            Desbloqueie o poder das múltiplas bankrolls!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badge Premium */}
          <div className="flex justify-center">
            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-sm">
              <Star className="h-4 w-4 mr-1" />
              FUNCIONALIDADE PREMIUM
            </Badge>
          </div>

          {/* Descrição */}
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Crie múltiplas bankrolls para organizar suas apostas de forma profissional.
            </p>
            <p className="text-sm text-gray-500">
              Cada bankroll terá seu próprio histórico, estatísticas e controle de banca.
            </p>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mt-0.5">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">
                Esta funcionalidade estará disponível em breve!
              </p>
              <p className="text-xs text-gray-500">
                Fique atento às novidades e seja um dos primeiros a experimentar.
              </p>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Entendi
              </Button>
              <Button 
                className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                disabled
              >
                <Crown className="h-4 w-4 mr-2" />
                Em Breve
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 