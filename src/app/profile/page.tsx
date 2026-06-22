"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Navbar from "@/components/NavBar"
import { User, Mail, Trophy, LogOut, Settings } from "lucide-react"

type UserProfile = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  points: number
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data = await response.json()

        if (!data.authenticated) {
          router.push("/login")
          return
        }

        setUser(data.user)
      } catch (error) {
        console.error("Error fetching profile:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white">
        <Navbar />
        <div className="p-6 max-w-7xl mx-auto">
          <div className="rounded-3xl border border-zinc-700/70 bg-zinc-900/80 p-8 text-zinc-400 text-center">
            Cargando perfil...
          </div>
        </div>
      </main>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Mi Perfil</h1>
          <p className="mt-2 text-zinc-400">
            Información de tu cuenta y estadísticas
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/20">
            <div className="bg-gradient-to-r from-[#2A398D] via-[#2A398D]/90 to-[#3CAC3B]/80 px-6 py-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2A398D] to-[#3CAC3B] flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                  <p className="text-sm text-zinc-200/80 capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-4">
                <Mail className="w-5 h-5 text-[#3CAC3B]" />
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-[0.18em]">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-3xl bg-white/5 p-4">
                <Trophy className="w-5 h-5 text-[#E61D25]" />
                <div>
                  <p className="text-xs text-zinc-400 uppercase tracking-[0.18em]">Puntos</p>
                  <p className="text-white font-medium">{user.points} pts</p>
                </div>
              </div>

              {user.role === "admin" && (
                <div className="flex items-center gap-3 rounded-3xl bg-[#E61D25]/10 p-4 border border-[#E61D25]/20">
                  <Settings className="w-5 h-5 text-[#E61D25]" />
                  <div>
                    <p className="text-xs text-[#E61D25] uppercase tracking-[0.18em]">Admin</p>
                    <p className="text-[#E61D25] font-medium">Acceso completo</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions Card */}
          <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/20">
            <div className="px-6 py-5 border-b border-zinc-800">
              <h3 className="text-xl font-bold text-white">Acciones</h3>
            </div>

            <div className="px-6 py-6 space-y-3">
              <button
                onClick={handleLogout}
                className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-[#E61D25]/40 bg-[#E61D25]/10 px-5 py-3 text-sm font-semibold text-[#E61D25] transition hover:bg-[#E61D25]/20"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
