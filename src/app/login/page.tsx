"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Mail, Lock, Trophy } from "lucide-react"

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {

    e.preventDefault()

    setLoading(true)
    setError("")

    try {

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || "Error al iniciar sesión"
        )
      }

      router.push("/")
      router.refresh()

    } catch (err: any) {

      setError(
        err.message || "Error al iniciar sesión"
      )

    } finally {

      setLoading(false)

    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          <div className="flex flex-col items-center mb-8">

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2A398D] via-[#3CAC3B] to-[#E61D25] flex items-center justify-center mb-4">

              <Trophy className="w-8 h-8 text-white" />

            </div>

            <h1 className="text-3xl font-bold text-white">
              Iniciar Sesión
            </h1>

            <p className="text-zinc-400 mt-2 text-center">
              Accede a tu cuenta de la Quiniela Mundial 2026
            </p>

          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <div>

              <label className="text-sm text-zinc-300 block mb-2">
                Correo electrónico
              </label>

              <div className="relative">

                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-[#3CAC3B]"
                  placeholder="correo@ejemplo.com"
                />

              </div>

            </div>

            <div>

              <label className="text-sm text-zinc-300 block mb-2">
                Contraseña
              </label>

              <div className="relative">

                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />

                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:border-[#3CAC3B]"
                  placeholder="********"
                />

              </div>

            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#2A398D] to-[#3CAC3B] hover:opacity-90 transition-all"
            >
              {loading
                ? "Iniciando sesión..."
                : "Iniciar Sesión"}
            </button>

          </form>

        </div>

      </div>

    </main>
  )
}