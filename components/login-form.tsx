"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, AlertCircle, Loader2 } from "lucide-react"

interface LoginFormProps {
  onLogin: (userData: { name: string; email: string }) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" })
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const email = loginData.email.toLowerCase().trim()

      if (!validateEmail(email)) {
        setError("Por favor, insira um email válido.")
        return
      }

      if (!loginData.password) {
        setError("Por favor, insira sua senha.")
        return
      }

      if (loginData.password.length < 6) {
        setError("Senha deve ter pelo menos 6 caracteres.")
        return
      }

      // Simulação de login - em modo local, aceitamos qualquer email válido
      // Em produção, você implementaria autenticação real
      onLogin({ name: email.split('@')[0], email: email })
    } catch (error) {
      console.error("Erro no login:", error)
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const email = registerData.email.toLowerCase().trim()
      const name = registerData.name.trim()

      // Validações básicas
      if (!name) {
        setError("Por favor, insira seu nome.")
        return
      }

      if (name.length < 2) {
        setError("Nome deve ter pelo menos 2 caracteres.")
        return
      }

      if (!validateEmail(email)) {
        setError("Por favor, insira um email válido.")
        return
      }

      if (!registerData.password) {
        setError("Por favor, insira uma senha.")
        return
      }

      if (registerData.password.length < 6) {
        setError("Senha deve ter pelo menos 6 caracteres.")
        return
      }

      // Em modo local, criar usuário diretamente
      console.log("✅ Usuário criado em modo local:", email)
      onLogin({ name: name, email: email })
    } catch (error) {
      console.error("Erro no registro:", error)
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <TrendingUp className="h-8 w-8 text-green-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-900">BetTracker</h1>
        </div>
        <CardTitle>Gerencie suas apostas esportivas</CardTitle>
        <CardDescription>Controle seus ganhos e perdas de forma profissional</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" disabled={loading}>
              Entrar
            </TabsTrigger>
            <TabsTrigger value="register" disabled={loading}>
              Cadastrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Seu nome completo"
                  value={registerData.name}
                  onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-600">
                  📧 Use um email único para identificar sua conta.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Senha</Label>
                <Input
                  id="register-password"
                  type="password"
                  placeholder="••••••••"
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  disabled={loading}
                  required
                />
                <p className="text-xs text-gray-600">Mínimo de 6 caracteres</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  "Criar Conta"
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-600">💾 Seus dados são salvos localmente no seu dispositivo.</p>
        </div>
      </CardContent>
    </Card>
  )
}
