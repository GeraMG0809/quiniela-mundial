"use client"

import { useEffect, useState } from "react"
import { Trophy, TrendingUp, TrendingDown, Minus, Users, Medal } from "lucide-react"

type RankingUser = {
  id: string
  position: number
  name: string
  points: number
  exacts: number
  hits: number
  predictions: number
  movement: "up" | "down" | "same"
}

type ApiRankingUser = {
  id: string
  name: string
  points: number
  exactCount: number
  correctResultCount: number
  predictionsCount: number
  rank: number
}

export default function RankingDashboard() {
  const [ranking, setRanking] = useState<RankingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const response = await fetch("/api/ranking", { cache: "no-store" })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "No se pudo cargar el ranking")
          setRanking([])
          return
        }

        const previousRanking = JSON.parse(
          window.localStorage.getItem("quinielaRanking") || "[]"
        ) as ApiRankingUser[]

        const previousPositions = previousRanking.reduce<Record<string, number>>(
          (acc, item) => {
            acc[item.id] = item.rank
            return acc
          },
          {}
        )

        const currentRanking = (data as ApiRankingUser[]).map((item) => {
          const previousPosition = previousPositions[item.id]
          let movement: RankingUser["movement"] = "same"

          if (previousPosition !== undefined) {
            if (item.rank < previousPosition) movement = "up"
            if (item.rank > previousPosition) movement = "down"
          }

          return {
            id: item.id,
            position: item.rank,
            name: item.name,
            points: item.points,
            exacts: item.exactCount,
            hits: item.correctResultCount,
            predictions: item.predictionsCount,
            movement
          }
        })

        window.localStorage.setItem("quinielaRanking", JSON.stringify(data))
        setRanking(currentRanking)
      } catch (fetchError) {
        console.error(fetchError)
        setError("Error de conexión al cargar el ranking")
      } finally {
        setLoading(false)
      }
    }

    loadRanking()
  }, [])

  const getPositionStyle = (position: number) => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-yellow-600/30 via-yellow-500/20 to-yellow-600/30 border-yellow-500/50"
      case 2:
        return "bg-gradient-to-r from-slate-400/20 via-slate-300/15 to-slate-400/20 border-slate-400/50"
      case 3:
        return "bg-gradient-to-r from-amber-700/25 via-amber-600/15 to-amber-700/25 border-amber-600/50"
      default:
        return "bg-zinc-800/50 border-zinc-700/50 hover:bg-zinc-700/50"
    }
  }

  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-lg shadow-yellow-500/30">
          <Trophy className="w-4 h-4 text-yellow-900" />
        </div>
      )
    }
    if (position === 2) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-500 shadow-lg shadow-slate-400/30">
          <Medal className="w-4 h-4 text-slate-800" />
        </div>
      )
    }
    if (position === 3) {
      return (
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg shadow-amber-600/30">
          <Medal className="w-4 h-4 text-amber-900" />
        </div>
      )
    }
    return (
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-700 text-zinc-300 font-semibold text-sm">
        {position}
      </div>
    )
  }

  const getMovementIcon = (movement: "up" | "down" | "same") => {
    switch (movement) {
      case "up":
        return (
          <div className="flex items-center gap-1 text-[#3CAC3B]">
            <TrendingUp className="w-4 h-4" />
          </div>
        )
      case "down":
        return (
          <div className="flex items-center gap-1 text-[#E61D25]">
            <TrendingDown className="w-4 h-4" />
          </div>
        )
      default:
        return (
          <div className="flex items-center gap-1 text-zinc-500">
            <Minus className="w-4 h-4" />
          </div>
        )
    }
  }

  return (
    <div className="w-full">
      <div className="bg-gradient-to-r from-[#2A398D] via-[#2A398D]/90 to-[#3CAC3B]/80 rounded-t-2xl p-6 border border-zinc-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
              <Trophy className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Ranking General</h2>
              <p className="text-zinc-300 text-sm mt-1">
                Clasificación actual de la Quiniela Mundial 2026
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
            <Users className="w-5 h-5 text-[#3CAC3B]" />
            <span className="text-white font-semibold">{ranking.length} Participantes</span>
          </div>
        </div>
      </div>

      <div className="bg-zinc-900/80 backdrop-blur-sm rounded-b-2xl border border-t-0 border-zinc-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-zinc-800/90 backdrop-blur-sm border-b border-zinc-700/50">
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Pos
                </th>
                <th className="px-4 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Puntos
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Exactos
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Aciertos
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Predicciones
                </th>
                <th className="px-4 py-4 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Mov
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    Cargando ranking...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-yellow-300">
                    {error}
                  </td>
                </tr>
              ) : ranking.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                    Aún no hay participantes en el ranking.
                  </td>
                </tr>
              ) : (
                ranking.map((user, index) => (
                  <tr
                    key={user.id}
                    className={`border-l-2 transition-all duration-300 ${getPositionStyle(user.position)}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-4">{getPositionBadge(user.position)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2A398D] to-[#3CAC3B] flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={`font-medium ${user.position <= 3 ? "text-white" : "text-zinc-300"}`}>
                          {user.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`font-bold text-lg ${user.position === 1 ? "text-yellow-400" : user.position <= 3 ? "text-white" : "text-[#3CAC3B]"}`}>
                        {user.points}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 bg-[#2A398D]/30 text-[#7B8FD4] rounded-lg font-semibold text-sm">
                        {user.exacts}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-1 bg-[#3CAC3B]/20 text-[#3CAC3B] rounded-lg font-semibold text-sm">
                        {user.hits}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-zinc-400 font-medium">{user.predictions}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">{getMovementIcon(user.movement)}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
