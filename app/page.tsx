"use client"

import { useState } from "react"
import { LoginForm } from "@/components/login-form"
import { BettingDashboard } from "@/components/betting-dashboard"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setUser(null)
    setIsLoggedIn(false)
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <LoginForm onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <BettingDashboard user={user} onLogout={handleLogout} />
    </div>
  )
}
