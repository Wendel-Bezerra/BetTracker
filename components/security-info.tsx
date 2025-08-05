"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Lock, UserCheck, AlertTriangle } from "lucide-react"

interface SecurityInfoProps {
  userEmail: string
  isConnected: boolean
}

export function SecurityInfo({ userEmail, isConnected }: SecurityInfoProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-green-600" />
          Segurança da Conta
        </CardTitle>
        <CardDescription>Informações sobre a proteção dos seus dados</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Email Único</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Verificado
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Seu email <strong>{userEmail}</strong> é único no sistema. Nenhum outro usuário pode usar o mesmo email.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Dados Isolados</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Protegido
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Suas apostas e configurações são completamente isoladas. Outros usuários não podem ver ou modificar seus
              dados.
            </p>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-2">
            {isConnected ? (
              <>
                <Shield className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Conectado com Segurança</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Modo Offline</span>
              </>
            )}
          </div>
          <p className="text-xs text-gray-600">
            {isConnected
              ? "Seus dados estão sendo salvos com segurança no banco de dados com validações rigorosas."
              : "Dados salvos localmente. Conecte-se para sincronização segura com validação de email único."}
          </p>
        </div>

        <div className="bg-white p-3 rounded-lg border">
          <h4 className="text-sm font-medium mb-2">🔒 Medidas de Segurança Ativas:</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>✅ Validação de formato de email</li>
            <li>✅ Verificação de email único no cadastro</li>
            <li>✅ Isolamento completo de dados por usuário</li>
            <li>✅ Validação de propriedade em todas as operações</li>
            <li>✅ Normalização automática de emails (lowercase)</li>
            <li>✅ Constraints de banco de dados para integridade</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
