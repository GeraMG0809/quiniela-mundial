"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Trophy, User, Mail, Lock, ShieldCheck, Loader2 } from "lucide-react"

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El correo es obligatorio"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El formato del correo no es válido"
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria"
    } else if (formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ general: data.error || "Error al crear la cuenta" })
        return
      }

      setSuccessMessage("Cuenta creada exitosamente. Redirigiendo...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch {
      setErrors({ general: "Error de conexión. Intenta de nuevo." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card principal */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl shadow-[#2A398D]/10 overflow-hidden">
          {/* Header con gradiente */}
          <div
            className="px-8 py-8 text-center"
            style={{
              background: "linear-gradient(135deg, #2A398D 0%, #3CAC3B 100%)",
            }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Crear Cuenta</h1>
            <p className="text-white/80 text-sm">
              Únete a la Quiniela Mundial 2026
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Mensaje de éxito */}
            {successMessage && (
              <div className="p-4 rounded-lg bg-[#3CAC3B]/20 border border-[#3CAC3B]/30 text-[#3CAC3B] text-sm text-center">
                {successMessage}
              </div>
            )}

            {/* Error general */}
            {errors.general && (
              <div className="p-4 rounded-lg bg-[#E61D25]/20 border border-[#E61D25]/30 text-[#E61D25] text-sm text-center">
                {errors.general}
              </div>
            )}

            {/* Campo Nombre */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-300"
              >
                Nombre completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.name
                      ? "border-[#E61D25] focus:ring-[#E61D25]/50"
                      : "border-zinc-700 focus:ring-[#2A398D]/50 focus:border-[#2A398D]"
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-[#E61D25] text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300"
              >
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.email
                      ? "border-[#E61D25] focus:ring-[#E61D25]/50"
                      : "border-zinc-700 focus:ring-[#2A398D]/50 focus:border-[#2A398D]"
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[#E61D25] text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-300"
              >
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.password
                      ? "border-[#E61D25] focus:ring-[#E61D25]/50"
                      : "border-zinc-700 focus:ring-[#2A398D]/50 focus:border-[#2A398D]"
                  }`}
                />
              </div>
              {errors.password && (
                <p className="text-[#E61D25] text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Campo Confirmar Contraseña */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-zinc-300"
              >
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ShieldCheck className="w-5 h-5 text-zinc-500" />
                </div>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-800/50 border rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.confirmPassword
                      ? "border-[#E61D25] focus:ring-[#E61D25]/50"
                      : "border-zinc-700 focus:ring-[#2A398D]/50 focus:border-[#2A398D]"
                  }`}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-[#E61D25] text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Botón Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-lg font-semibold text-white transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{
                background: isLoading
                  ? "#4a5568"
                  : "linear-gradient(135deg, #2A398D 0%, #3CAC3B 100%)",
                boxShadow: isLoading
                  ? "none"
                  : "0 4px 15px rgba(42, 57, 141, 0.4)",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </button>

            {/* Link a login */}
            <p className="text-center text-zinc-400 text-sm pt-4">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="font-medium transition-colors duration-200 hover:underline"
                style={{ color: "#3CAC3B" }}
              >
                Inicia sesión
              </Link>
            </p>
          </form>
        </div>

        {/* Footer decorativo */}
        <p className="text-center text-zinc-600 text-xs mt-6">
          Mundial 2026 - USA, México & Canadá
        </p>
      </div>
    </div>
  )
}
