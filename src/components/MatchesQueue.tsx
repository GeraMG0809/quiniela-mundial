"use client"

import Image from "next/image"
import { Tv } from "lucide-react"
import { getFlagUrl } from "@/lib/flags"

type Prediction = {
  id: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
}

type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  venue: string
  matchDate: string
  status: string
}

interface MatchesQueueProps {
  matches: Match[]
  activeMatch: Match | null
  setActiveMatch: (match: Match) => void
  predictions: Record<string, Prediction>
}

export default function MatchesQueue({
  matches,
  activeMatch,
  setActiveMatch,
  predictions,
}: MatchesQueueProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-mono font-bold text-slate-400 tracking-wider flex items-center gap-1">
          <Tv className="w-3.5 h-3.5 text-rose-500" /> Cola de partidos
        </span>
        <span className="text-[10px] text-rose-400 font-mono tracking-widest uppercase">
          selecciona el partido a predecir
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {matches.map((match) => {
          const isSelected = activeMatch?.id === match.id
          const savedPred = predictions[match.id]
          const hasPrediction = !!savedPred

          return (
            <button
              key={match.id}
              onClick={() => setActiveMatch(match)}
              className={`relative p-2.5 rounded-lg border text-left transition-all duration-300 cursor-pointer overflow-hidden group ${
                isSelected
                  ? "bg-linear-to-b from-[#474A4A] to-[#474A4A] border-cyan-500/70 shadow-lg shadow-cyan-500/15"
                  : "bg-[#474A4A] border-slate-900/80 hover:border-slate-800 hover:bg-[#474A4A]"
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-[#2A398D] to-rose-500" />
              )}

              {hasPrediction && (
                <div className="absolute top-1.5 right-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 glow-blue animate-pulse" title="Predicción guardada" />
                </div>
              )}

              <div className="text-[10px] font-mono text-slate-500 group-hover:text-slate-400 transition-colors uppercase mb-1">
                {new Date(match.matchDate).toLocaleDateString("es-ES", {
                  weekday: "short",
                  month: "short",
                  day: "2-digit",
                })}
              </div>

              <div className="flex items-center gap-1.5 my-1">
                <Image
                  src={getFlagUrl(match.homeTeam)}
                  alt={match.homeTeam}
                  width={40}
                  height={28}
                  className="rounded-sm border border-slate-800/80 object-cover"
                  referrerPolicy="no-referrer"
                />
                <span className="text-xs font-sport font-bold text-slate-300 group-hover:text-white transition-colors tracking-wide">
                  {match.homeTeam.substring(0, 3).toUpperCase()}
                </span>
                <span className="text-[10px] font-mono text-slate-500">v</span>
                <span className="text-xs font-sport font-bold text-slate-300 group-hover:text-white transition-colors tracking-wide">
                  {match.awayTeam.substring(0, 3).toUpperCase()}
                </span>
                <Image
                  src={getFlagUrl(match.awayTeam)}
                  alt={match.awayTeam}
                  width={40}
                  height={28}
                  className="rounded-sm border border-slate-800/80 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="text-[9px] font-mono text-slate-400 truncate mt-1.5 uppercase flex items-center justify-between">
                <span>{new Date(match.matchDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                {hasPrediction && (
                  <span className="text-emerald-400 font-bold font-mono">
                    [{savedPred.predictedHomeScore}-{savedPred.predictedAwayScore}]
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
