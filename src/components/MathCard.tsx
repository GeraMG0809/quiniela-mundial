"use client"

import { useState } from "react"
import { MapPin, Clock, Save, Trophy } from "lucide-react"
import Image from "next/image"

interface Team {
  name: string
  flagUrl: string
  code: string
}

interface MatchCardProps {
  matchId: string
  homeTeam: Team
  awayTeam: Team
  matchDate: string
  matchTime: string
  venue: string
  onSave?: () => void
}

export default function MatchCard({
  matchId,
  homeTeam,
  awayTeam,
  matchDate,
  matchTime,
  venue,
  onSave,
}: MatchCardProps) {
  const [homeScore, setHomeScore] = useState("")
  const [awayScore, setAwayScore] = useState("")
  const [isSaved, setIsSaved] = useState(false)
  const [error, setError] = useState("")

  async function handleSave() {
    if (homeScore === "" || awayScore === "") {
      setError("Debes completar ambos marcadores")
      return
    }

    setError("")

    try {
      const response = await fetch("/api/predictions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId,
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar")
      }

      setIsSaved(true)

      setTimeout(() => {
        setIsSaved(false)
      }, 2000)

      onSave?.()
    } catch (err) {
      console.error(err)
      setError("No se pudo guardar la predicción")
    }
  }

  function handleScoreChange(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) {
    if (value === "" || /^[0-9]$/.test(value)) {
      setter(value)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-3xl bg-zinc-900 shadow-2xl border border-zinc-800">
        {/* Header */}
        <div className="relative h-24 bg-gradient-to-br from-[#2A398D] via-[#2A398D] to-[#3CAC3B]">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full">
            <Trophy className="w-4 h-4 text-white" />

            <span className="text-white text-sm font-semibold tracking-wide">
              Predicción
            </span>
          </div>

          {/* Fecha */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 text-white/90">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />

              <span className="text-sm font-medium">
                {matchTime}
              </span>
            </div>

            <div className="w-1 h-1 bg-white/60 rounded-full" />

            <span className="text-sm font-medium">
              {matchDate}
            </span>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            {/* Local */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="relative">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-4 ring-[#3CAC3B]/20 transition-transform hover:scale-105">
                  <Image
                    src={homeTeam.flagUrl}
                    alt={`Bandera de ${homeTeam.name}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#3CAC3B] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                  L
                </div>
              </div>

              <div className="text-center">
                <p className="font-bold text-white text-sm uppercase tracking-wider">
                  {homeTeam.code}
                </p>

                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                  {homeTeam.name}
                </p>
              </div>
            </div>

            {/* Marcadores */}
            <div className="flex items-center gap-3">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={homeScore}
                onChange={(e) =>
                  handleScoreChange(
                    e.target.value,
                    setHomeScore
                  )
                }
                placeholder="-"
                className="w-14 h-16 text-center text-3xl font-bold bg-[#2A398D]/10 border-2 border-[#2A398D]/20 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2A398D] focus:ring-4 focus:ring-[#2A398D]/10 transition-all"
              />

              <div className="flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#E61D25]" />

                <span className="text-lg font-bold text-zinc-400">
                  VS
                </span>

                <div className="w-2 h-2 rounded-full bg-[#E61D25]" />
              </div>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={awayScore}
                onChange={(e) =>
                  handleScoreChange(
                    e.target.value,
                    setAwayScore
                  )
                }
                placeholder="-"
                className="w-14 h-16 text-center text-3xl font-bold bg-[#2A398D]/10 border-2 border-[#2A398D]/20 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#2A398D] focus:ring-4 focus:ring-[#2A398D]/10 transition-all"
              />
            </div>

            {/* Visitante */}
            <div className="flex-1 flex flex-col items-center gap-3">
              <div className="relative">
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden shadow-lg ring-4 ring-[#E61D25]/20 transition-transform hover:scale-105">
                  <Image
                    src={awayTeam.flagUrl}
                    alt={`Bandera de ${awayTeam.name}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-[#E61D25] rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
                  V
                </div>
              </div>

              <div className="text-center">
                <p className="font-bold text-white text-sm uppercase tracking-wider">
                  {awayTeam.code}
                </p>

                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                  {awayTeam.name}
                </p>
              </div>
            </div>
          </div>

          {/* Venue */}
          <div className="mt-6 flex items-center justify-center gap-2 text-zinc-400">
            <MapPin className="w-4 h-4 text-[#E61D25]" />

            <span className="text-sm">
              {venue}
            </span>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm text-center mt-4">
              {error}
            </p>
          )}

          {/* Botón */}
          <button
            onClick={handleSave}
            disabled={homeScore === "" || awayScore === ""}
            className={`
              mt-6 w-full py-4 rounded-2xl font-semibold text-white
              flex items-center justify-center gap-2
              transition-all duration-300 ease-out
              ${
                homeScore !== "" && awayScore !== ""
                  ? "bg-gradient-to-r from-[#3CAC3B] to-[#2A398D] hover:shadow-lg hover:shadow-[#3CAC3B]/30 hover:-translate-y-0.5 active:translate-y-0"
                  : "bg-zinc-700 cursor-not-allowed"
              }
              ${isSaved ? "!bg-[#3CAC3B] scale-95" : ""}
            `}
          >
            <Save
              className={`w-5 h-5 transition-transform ${
                isSaved ? "animate-bounce" : ""
              }`}
            />

            <span className="tracking-wide">
              {isSaved
                ? "¡Guardado!"
                : "Guardar Predicción"}
            </span>
          </button>
        </div>

        {/* Decoración */}
        <div className="h-2 bg-gradient-to-r from-[#3CAC3B] via-[#2A398D] to-[#E61D25]" />
      </div>
    </div>
  )
}