"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Clock, MapPin, Edit3, Save, X, CheckCircle, AlertTriangle } from "lucide-react"
import Navbar from "@/components/NavBar"
import { getFlagUrl } from "@/lib/flags"

type PredictionItem = {
  id: string
  predictedHomeScore: number
  predictedAwayScore: number
  matchId: string
  match: {
    id: string
    homeTeam: string
    awayTeam: string
    venue: string
    matchDate: string
    status: string
  }
}

type EditablePrediction = PredictionItem & {
  editing: boolean
  homeValue: string
  awayValue: string
  saving: boolean
  message: string
  error: string
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

function isPredictionEditable(matchDate: string, status: string) {
  const matchTime = new Date(matchDate).getTime()
  const lockTime = matchTime - 10 * 60 * 1000
  return status === "UPCOMING" && Date.now() < lockTime
}

function sanitizeScoreInput(value: string) {
  if (value === "") return ""
  if (/^\d{1,2}$/.test(value)) return String(Number(value))
  return value
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<EditablePrediction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [globalMessage, setGlobalMessage] = useState("")

  useEffect(() => {
    loadPredictions()
  }, [])

  async function loadPredictions() {
    setLoading(true)
    setError("")
    setGlobalMessage("")

    try {
      const response = await fetch("/api/predictions", { cache: "no-store" })
      const data = await response.json()

      if (!response.ok) {
        setError(
          response.status === 401
            ? "Debes iniciar sesión para ver tus predicciones."
            : data.error || "No se pudieron cargar las predicciones."
        )
        setPredictions([])
        return
      }

      const editablePredictions = (data as PredictionItem[]).map((item) => ({
        ...item,
        editing: false,
        saving: false,
        message: "",
        error: "",
        homeValue: String(item.predictedHomeScore),
        awayValue: String(item.predictedAwayScore)
      }))

      setPredictions(editablePredictions)
    } catch (err) {
      console.error(err)
      setError("Error de conexión al cargar predicciones.")
      setPredictions([])
    } finally {
      setLoading(false)
    }
  }

  function handleEdit(id: string) {
    setPredictions((current) =>
      current.map((prediction) =>
        prediction.id === id
          ? { ...prediction, editing: true, message: "", error: "" }
          : prediction
      )
    )
  }

  function handleCancel(id: string) {
    setPredictions((current) =>
      current.map((prediction) =>
        prediction.id === id
          ? {
              ...prediction,
              editing: false,
              error: "",
              message: "",
              homeValue: String(prediction.predictedHomeScore),
              awayValue: String(prediction.predictedAwayScore)
            }
          : prediction
      )
    )
  }

  function handleChange(id: string, field: "homeValue" | "awayValue", value: string) {
    const sanitized = sanitizeScoreInput(value)
    setPredictions((current) =>
      current.map((prediction) =>
        prediction.id === id
          ? { ...prediction, [field]: sanitized, message: "", error: "" }
          : prediction
      )
    )
  }

  async function handleSave(id: string) {
    setPredictions((current) =>
      current.map((prediction) =>
        prediction.id === id ? { ...prediction, saving: true, error: "", message: "" } : prediction
      )
    )

    const prediction = predictions.find((item) => item.id === id)
    if (!prediction) return

    const homeScore = Number(prediction.homeValue)
    const awayScore = Number(prediction.awayValue)

    if (prediction.homeValue === "" || prediction.awayValue === "") {
      setPredictions((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, error: "Completa ambos marcadores antes de guardar.", saving: false }
            : item
        )
      )
      return
    }

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          matchId: prediction.match.id,
          homeScore,
          awayScore,
          allowUpdate: true
        })
      })

      const responseData = await response.json()

      if (!response.ok) {
        setPredictions((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  error:
                    response.status === 401
                      ? "Debes iniciar sesión para editar tus predicciones."
                      : responseData.error || "No se pudo guardar la predicción.",
                  saving: false
                }
              : item
          )
        )
        return
      }

      setPredictions((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                editing: false,
                saving: false,
                predictedHomeScore: responseData.predictedHomeScore,
                predictedAwayScore: responseData.predictedAwayScore,
                homeValue: String(responseData.predictedHomeScore),
                awayValue: String(responseData.predictedAwayScore),
                message: "Predicción guardada correctamente.",
                error: ""
              }
            : item
        )
      )
      setGlobalMessage("Predicción actualizada correctamente.")
      window.setTimeout(() => setGlobalMessage(""), 3000)
    } catch (err) {
      console.error(err)
      setPredictions((current) =>
        current.map((item) =>
          item.id === id
            ? { ...item, error: "Error de conexión al guardar la predicción.", saving: false }
            : item
        )
      )
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Mis Predicciones</h1>
          <p className="mt-2 text-zinc-400 max-w-2xl">
            Revisa tus pronósticos guardados, edítalos antes de que comience el partido y mantén tu ranking al día.
          </p>
        </div>

        <div className="space-y-6">
          {globalMessage && (
            <div className="rounded-3xl border border-[#3CAC3B]/30 bg-[#3CAC3B]/10 p-4 text-[#d6ffd6] shadow-lg shadow-[#3CAC3B]/10">
              <div className="flex items-center gap-2 font-semibold">
                <CheckCircle className="w-5 h-5 text-[#3CAC3B]" />
                {globalMessage}
              </div>
            </div>
          )}

          {loading ? (
            <div className="rounded-3xl border border-zinc-700/70 bg-zinc-900/80 p-8 text-zinc-400 text-center">
              Cargando tus predicciones...
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-zinc-700/70 bg-zinc-900/80 p-8 text-yellow-300 text-center">
              {error}
            </div>
          ) : predictions.length === 0 ? (
            <div className="rounded-3xl border border-zinc-700/70 bg-zinc-900/80 p-8 text-zinc-400 text-center">
              Aún no tienes predicciones guardadas.
            </div>
          ) : (
            predictions.map((prediction) => {
              const editable = isPredictionEditable(prediction.match.matchDate, prediction.match.status)
              return (
                <article
                  key={prediction.id}
                  className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/20"
                >
                  <div className="bg-linear-to-r from-[#2A398D] via-[#2A398D]/90 to-[#3CAC3B]/80 px-6 py-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200/80">
                          Partido
                        </p>
                        <h2 className="text-2xl font-bold text-white">
                          {prediction.match.homeTeam} vs {prediction.match.awayTeam}
                        </h2>
                      </div>
                      <div className="flex flex-col items-start gap-2 text-zinc-100 sm:items-end">
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-zinc-100">
                          <Clock className="w-4 h-4 text-[#3CAC3B]" />
                          {formatMatchDate(prediction.match.matchDate)}
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-sm text-zinc-100">
                          <MapPin className="w-4 h-4 text-[#E61D25]" />
                          {prediction.match.venue}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-6 sm:px-8">
                    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {[
                          {
                            team: prediction.match.homeTeam,
                            score: prediction.predictedHomeScore,
                            value: prediction.homeValue,
                            field: "homeValue" as const,
                            label: "Local",
                            flag: getFlagUrl(prediction.match.homeTeam)
                          },
                          {
                            team: prediction.match.awayTeam,
                            score: prediction.predictedAwayScore,
                            value: prediction.awayValue,
                            field: "awayValue" as const,
                            label: "Visitante",
                            flag: getFlagUrl(prediction.match.awayTeam)
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
                              {prediction.editing ? (
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={2}
                                  value={teamItem.value}
                                  onChange={(event) =>
                                    handleChange(prediction.id, teamItem.field, event.target.value)
                                  }
                                  className="w-full rounded-3xl border border-[#2A398D]/40 bg-[#0f1322] px-4 py-4 text-center text-3xl font-bold text-white outline-none transition focus:border-[#3CAC3B] focus:ring-4 focus:ring-[#3CAC3B]/10"
                                />
                              ) : (
                                <div className="rounded-3xl bg-[#111827] px-4 py-5 text-center text-4xl font-bold text-white">
                                  {teamItem.score}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col justify-between gap-6 rounded-3xl border border-zinc-800 bg-[#080a12]/90 p-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-3 rounded-3xl bg-white/5 p-4 text-sm text-zinc-200">
                            <span className="font-semibold">Estado</span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] ${
                                editable ? "bg-[#3CAC3B]/15 text-[#3CAC3B]" : "bg-[#E61D25]/15 text-[#E61D25]"
                              }`}
                            >
                              {editable ? "Editable" : "Cerrado"}
                            </span>
                          </div>

                          <div className="rounded-3xl bg-zinc-950/80 p-4 text-sm text-zinc-300">
                            <p>
                              Predicción actual:
                              <span className="font-semibold text-white ml-1">
                                {prediction.predictedHomeScore} - {prediction.predictedAwayScore}
                              </span>
                            </p>
                            <p className="mt-2 text-zinc-400">
                              Elige "Editar" para actualizar tu marcador.
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {prediction.error && (
                            <div className="rounded-3xl border border-[#E61D25]/20 bg-[#E61D25]/10 p-3 text-sm text-[#ffe3e3]">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> {prediction.error}
                              </div>
                            </div>
                          )}

                          {prediction.message && (
                            <div className="rounded-3xl border border-[#3CAC3B]/20 bg-[#3CAC3B]/10 p-3 text-sm text-[#d6ffd6]">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-[#3CAC3B]" /> {prediction.message}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-col gap-3">
                            {prediction.editing ? (
                              <div className="flex flex-col gap-3 sm:flex-row">
                                <button
                                  type="button"
                                  onClick={() => handleSave(prediction.id)}
                                  disabled={prediction.saving}
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl bg-linear-to-r from-[#3CAC3B] to-[#2A398D] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3CAC3B]/20 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Save className="w-4 h-4" />
                                  {prediction.saving ? "Guardando..." : "Guardar"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCancel(prediction.id)}
                                  disabled={prediction.saving}
                                  className="inline-flex w-full items-center justify-center gap-2 rounded-3xl border border-zinc-700 bg-transparent px-5 py-3 text-sm font-semibold text-zinc-200 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <X className="w-4 h-4" />
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleEdit(prediction.id)}
                                disabled={!editable}
                                className={`inline-flex w-full items-center justify-center gap-2 rounded-3xl px-5 py-3 text-sm font-semibold transition ${
                                  editable
                                    ? "bg-linear-to-r from-[#3CAC3B] to-[#2A398D] text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#3CAC3B]/20"
                                    : "border border-zinc-700 bg-zinc-900 text-zinc-500 cursor-not-allowed"
                                }`}
                              >
                                <Edit3 className="w-4 h-4" />
                                Editar
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </main>
  )
}
