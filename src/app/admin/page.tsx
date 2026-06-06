"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Navbar from "@/components/NavBar"
import { getFlagUrl } from "@/lib/flags"
import { Clock, MapPin, Save, AlertTriangle, CheckCircle } from "lucide-react"

type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  venue: string
  matchDate: string
  status: string
  homeScore: number | null
  awayScore: number | null
}

type MatchUpdate = {
  homeValue: string
  awayValue: string
  error: string
  success: string
  saving: boolean
}

function formatMatchDate(matchDate: string) {
  const date = new Date(matchDate)
  return date.toLocaleDateString("es-ES", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function sanitizeScoreValue(value: string) {
  if (value === "") return ""
  if (/^\d{1,2}$/.test(value)) {
    return String(Number(value))
  }
  return value
}

export default function AdminPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [matchUpdates, setMatchUpdates] = useState<Record<string, MatchUpdate>>({})
  const [globalMessage, setGlobalMessage] = useState("")

  useEffect(() => {
    loadMatches()
  }, [])

  async function loadMatches() {
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/matches", { cache: "no-store" })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "No se pudieron cargar los partidos.")
        setMatches([])
        return
      }

      setMatches(data)
      const initialUpdates = (data as Match[]).reduce<Record<string, MatchUpdate>>((acc, match) => {
        acc[match.id] = {
          homeValue: match.homeScore !== null ? String(match.homeScore) : "",
          awayValue: match.awayScore !== null ? String(match.awayScore) : "",
          error: "",
          success: "",
          saving: false
        }
        return acc
      }, {})

      setMatchUpdates(initialUpdates)
    } catch (err) {
      console.error(err)
      setError("Error de conexión al cargar los partidos.")
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  function updateField(matchId: string, field: "homeValue" | "awayValue", value: string) {
    const sanitized = sanitizeScoreValue(value)
    setMatchUpdates((current) => ({
      ...current,
      [matchId]: {
        ...current[matchId],
        [field]: sanitized,
        error: "",
        success: ""
      }
    }))
  }

  async function handleSave(match: Match) {
    const update = matchUpdates[match.id]
    if (!update) return

    if (update.homeValue === "" || update.awayValue === "") {
      setMatchUpdates((current) => ({
        ...current,
        [match.id]: {
          ...current[match.id],
          error: "Debes completar ambos marcadores.",
          success: ""
        }
      }))
      return
    }

    const homeScore = Number(update.homeValue)
    const awayScore = Number(update.awayValue)

    setMatchUpdates((current) => ({
      ...current,
      [match.id]: {
        ...current[match.id],
        saving: true,
        error: "",
        success: ""
      }
    }))

    try {
      const response = await fetch("/api/matches", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          matchId: match.id,
          homeScore,
          awayScore
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        setMatchUpdates((current) => ({
          ...current,
          [match.id]: {
            ...current[match.id],
            error: responseData.error || "No se pudo guardar el resultado.",
            saving: false,
            success: ""
          }
        }))
        return
      }

      setMatches((current) =>
        current.map((item) =>
          item.id === match.id
            ? {
                ...item,
                homeScore: responseData.homeScore,
                awayScore: responseData.awayScore,
                status: responseData.status
              }
            : item
        )
      )

      setMatchUpdates((current) => ({
        ...current,
        [match.id]: {
          ...current[match.id],
          saving: false,
          error: "",
          success: "Resultado guardado correctamente."
        }
      }))

      setGlobalMessage("Resultado actualizado correctamente.")
      window.setTimeout(() => setGlobalMessage(""), 3000)
    } catch (err) {
      console.error(err)
      setMatchUpdates((current) => ({
        ...current,
        [match.id]: {
          ...current[match.id],
          saving: false,
          error: "Error de conexión al guardar el resultado.",
          success: ""
        }
      }))
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Panel de Resultados</h1>
          <p className="mt-2 text-zinc-400 max-w-2xl">
            Registra los resultados oficiales de los partidos para que el ranking se actualice con los pronósticos reales.
          </p>
        </div>

        {globalMessage && (
          <div className="mb-6 rounded-3xl border border-[#3CAC3B]/30 bg-[#3CAC3B]/10 p-4 text-[#D1D4D1] shadow-lg shadow-[#3CAC3B]/10">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle className="w-5 h-5 text-[#3CAC3B]" />
              {globalMessage}
            </div>
          </div>
        )}

        {loading ? (
          <div className="rounded-3xl border border-zinc-700/70 bg-zinc-900/80 p-8 text-zinc-400 text-center">
            Cargando partidos...
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-zinc-700/70 bg-zinc-900/80 p-8 text-yellow-300 text-center">
            {error}
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-3xl border border-zinc-700/70 bg-zinc-900/80 p-8 text-zinc-400 text-center">
            No hay partidos disponibles.
          </div>
        ) : (
          <div className="space-y-6">
            {matches.map((match) => {
              const update = matchUpdates[match.id] || {
                homeValue: match.homeScore !== null ? String(match.homeScore) : "",
                awayValue: match.awayScore !== null ? String(match.awayScore) : "",
                error: "",
                success: "",
                saving: false
              }

              return (
                <article
                  key={match.id}
                  className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/20"
                >
                  <div className="bg-linear-to-r from-[#2A398D] via-[#2A398D]/90 to-[#3CAC3B]/80 px-6 py-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200/80">
                          Partido ID {match.id}
                        </p>
                        <h2 className="text-2xl font-bold text-white">
                          {match.homeTeam} vs {match.awayTeam}
                        </h2>
                      </div>
                      <div className="flex flex-col items-start gap-2 text-zinc-100 sm:items-end">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-zinc-100">
                          <Clock className="w-4 h-4 text-[#3CAC3B]" />
                          {formatMatchDate(match.matchDate)}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-zinc-100">
                          <MapPin className="w-4 h-4 text-[#E61D25]" />
                          {match.venue}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-6 sm:px-8">
                    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[ 
                          {
                            team: match.homeTeam,
                            value: update.homeValue,
                            field: "homeValue" as const,
                            label: "Local",
                            flag: getFlagUrl(match.homeTeam)
                          },
                          {
                            team: match.awayTeam,
                            value: update.awayValue,
                            field: "awayValue" as const,
                            label: "Visitante",
                            flag: getFlagUrl(match.awayTeam)
                          }
                        ].map((teamItem) => (
                          <div
                            key={teamItem.team}
                            className="rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4"
                          >
                            <div className="flex items-center gap-3">
                              <div className="relative h-14 w-14 overflow-hidden rounded-3xl ring-1 ring-white/10">
                                <Image
                                  src={teamItem.flag}
                                  alt={`Bandera de ${teamItem.team}`}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-zinc-300 uppercase tracking-[0.18em]">
                                  {teamItem.label}
                                </p>
                                <p className="text-base font-bold text-white">
                                  {teamItem.team}
                                </p>
                              </div>
                            </div>

                            <div className="mt-5">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={2}
                                value={teamItem.value}
                                onChange={(event) =>
                                  updateField(match.id, teamItem.field, event.target.value)
                                }
                                className="w-full rounded-3xl border border-[#2A398D]/40 bg-[#474A4A] px-4 py-4 text-center text-3xl font-bold text-white outline-none transition focus:border-[#3CAC3B] focus:ring-4 focus:ring-[#3CAC3B]/10"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-zinc-800 bg-[#474A4A]/90 p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-3 rounded-3xl bg-white/5 p-4 text-sm text-zinc-200">
                            <span className="font-semibold">Estado</span>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${match.status === "FINISHED" ? "bg-[#3CAC3B]/15 text-[#3CAC3B]" : "bg-[#E61D25]/15 text-[#E61D25]"}`}>
                              {match.status}
                            </span>
                          </div>

                          <div className="rounded-3xl bg-zinc-950/80 p-4 text-sm text-zinc-300">
                            <p>
                              Resultado actual:
                              <span className="font-semibold text-white ml-1">
                                {match.homeScore ?? "-"} - {match.awayScore ?? "-"}
                              </span>
                            </p>
                            <p className="mt-2 text-zinc-400">
                              Guarda el resultado oficial para actualizar el ranking.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {update.error && (
                            <div className="rounded-3xl border border-[#E61D25]/20 bg-[#E61D25]/10 p-3 text-sm text-[#D1D4D1]">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {update.error}
                              </div>
                            </div>
                          )}

                          {update.success && (
                            <div className="rounded-3xl border border-[#3CAC3B]/20 bg-[#3CAC3B]/10 p-3 text-sm text-[#D1D4D1]">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#3CAC3B]" /> {update.success}
                              </div>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => handleSave(match)}
                            disabled={update.saving}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-linear-to-r from-[#3CAC3B] to-[#2A398D] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3CAC3B]/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Save className="w-4 h-4" />
                            {update.saving ? "Guardando..." : "Guardar resultado"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
