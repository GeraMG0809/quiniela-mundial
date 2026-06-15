"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Menu,
  X,
  ChevronDown,
  User,
  Trophy,
  LogOut,
  Home,
  BarChart3,
  Settings,
  Target,
} from "lucide-react"

type User = {
  id: string
  name: string
  email: string
  role: "user" | "admin"
  points: number
}

type SessionResponse =
  | {
      authenticated: true
      user: User
    }
  | {
      authenticated: false
    }

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/me")
        const data: SessionResponse = await response.json()

        if (data.authenticated) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Error fetching session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      window.location.reload()
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex ${mobile ? "flex-col space-y-2" : "items-center space-x-1"}`}
    >
      <Link
        href="/"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 ${mobile ? "w-full" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <Home className="w-4 h-4" />
        <span>Inicio</span>
      </Link>
      <Link
        href="/ranking"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 ${mobile ? "w-full" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <BarChart3 className="w-4 h-4" />
        <span>Ranking</span>
      </Link>
      <Link
        href="/predictions/all"
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 ${mobile ? "w-full" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <Target className="w-4 h-4" />
        <span>Predicciones</span>
      </Link>
    </div>
  )

  const AuthButtons = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className={`flex ${mobile ? "flex-col space-y-3 w-full" : "items-center space-x-3"}`}
    >
      <Link
        href="/login"
        className={`px-5 py-2.5 rounded-lg border-2 border-[#3CAC3B] text-[#3CAC3B] font-semibold hover:bg-[#3CAC3B] hover:text-white transition-all duration-300 text-center ${mobile ? "w-full" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Iniciar Sesión
      </Link>
      <Link
        href="/register"
        className={`px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#2A398D] to-[#3CAC3B] text-white font-semibold hover:opacity-90 hover:shadow-lg hover:shadow-[#3CAC3B]/25 transition-all duration-300 text-center ${mobile ? "w-full" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        Registrarse
      </Link>
    </div>
  )

  const UserMenu = ({ mobile = false }: { mobile?: boolean }) => {
    if (mobile) {
      return (
        <div className="flex flex-col space-y-2 w-full border-t border-white/10 pt-4 mt-2">
          <div className="px-4 py-2 text-sm text-gray-400">
            Sesión: <span className="text-white font-medium">{user?.name}</span>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </Link>
          <Link
            href="/predictions"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Target className="w-4 h-4" />
            Mis Predicciones
          </Link>
          {user?.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-[#E61D25] hover:bg-[#E61D25]/10 transition-all duration-300"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Settings className="w-4 h-4" />
              Panel Admin
            </Link>
          )}
          <button
            onClick={() => {
              setMobileMenuOpen(false)
              handleLogout()
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-300 hover:text-[#E61D25] hover:bg-[#E61D25]/10 transition-all duration-300 w-full text-left"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      )
    }

    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2A398D] to-[#3CAC3B] flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user?.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-white font-medium max-w-[120px] truncate">
            {user?.name}
          </span>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`}
          />
        </button>

        <div
          className={`absolute right-0 mt-2 w-56 rounded-xl bg-[#474A4A] border border-white/10 shadow-xl shadow-black/20 overflow-hidden transition-all duration-300 origin-top-right ${
            menuOpen
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
        >
          <div className="px-4 py-3 border-b border-white/10">
            <p className="text-sm text-gray-400">Conectado como</p>
            <p className="text-white font-medium truncate">{user?.email}</p>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              onClick={() => setMenuOpen(false)}
            >
              <User className="w-4 h-4" />
              Mi Perfil
            </Link>
            <Link
              href="/predictions"
              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
              onClick={() => setMenuOpen(false)}
            >
              <Target className="w-4 h-4" />
              Mis Predicciones
            </Link>
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-2.5 text-[#E61D25] hover:bg-[#E61D25]/10 transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Panel Admin
              </Link>
            )}
          </div>

          <div className="border-t border-white/10 py-2">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-[#E61D25] hover:bg-[#E61D25]/10 transition-all duration-200 w-full"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  const LoadingSkeleton = () => (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
      <div className="hidden sm:block w-24 h-4 rounded bg-white/10 animate-pulse" />
    </div>
  )

  return (
    <nav className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#474A4A] via-[#474A4A] to-[#474A4A] border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2A398D] via-[#3CAC3B] to-[#E61D25] p-0.5 group-hover:shadow-lg group-hover:shadow-[#3CAC3B]/20 transition-all duration-300">
                <div className="w-full h-full rounded-[10px] bg-[#474A4A] flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-[#3CAC3B] group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-white font-bold text-lg leading-tight tracking-tight">
                Quiniela Mundial
              </span>
              <span className="text-xs font-semibold bg-gradient-to-r from-[#2A398D] via-[#3CAC3B] to-[#E61D25] bg-clip-text text-transparent">
                2026
              </span>
            </div>
          </Link>

          {/* Desktop Navigation - Center */}
          <div className="hidden md:flex items-center">
            <NavLinks />
          </div>

          {/* Desktop Auth/User - Right */}
          <div className="hidden md:flex items-center">
            {loading ? (
              <LoadingSkeleton />
            ) : user ? (
              <UserMenu />
            ) : (
              <AuthButtons />
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-4 bg-[#474A4A]/95 border-t border-white/5">
          <NavLinks mobile />

          {loading ? (
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
              <div className="w-24 h-4 rounded bg-white/10 animate-pulse" />
            </div>
          ) : user ? (
            <UserMenu mobile />
          ) : (
            <div className="pt-4 border-t border-white/10">
              <AuthButtons mobile />
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
