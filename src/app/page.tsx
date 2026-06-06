"use client"

import { useMemo, useState, useEffect } from "react"
import MatchCard from "@/components/MathCard"
import Navbar from "@/components/NavBar"
import RankingDashboard from "@/components/RankingDashboard"
import MatchesQueue from "@/components/MatchesQueue"
import { getFlagUrl } from "@/lib/flags"

type Prediction = {
  id: string
  matchId: string
  predictedHomeScore: number
  predictedAwayScore: number
  match: Match
}

type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  venue: string
  matchDate: string
  status: string
}

function getNextMatchDayMatches(matches: Match[]) {
  if (matches.length === 0) {
    return []
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const futureMatches = matches
    .map((match) => ({ match, date: new Date(match.matchDate) }))
    .filter(({ date }) => date > today)

  if (futureMatches.length === 0) {
    return []
  }

  const nextDayStart = futureMatches.reduce<Date | null>((earliest, item) => {
    const day = new Date(item.date)
    day.setHours(0, 0, 0, 0)

    if (!earliest || day.getTime() < earliest.getTime()) {
      return day
    }

    return earliest
  }, null)

  if (!nextDayStart) {
    return []
  }

  return futureMatches
    .filter(({ date }) => {
      const day = new Date(date)
      day.setHours(0, 0, 0, 0)
      return day.getTime() === nextDayStart.getTime()
    })
    .map(({ match }) => match)
}

export default function Home() {

  const [predictions, setPredictions] = useState<Prediction[]>([])

  const [matches, setMatches] = useState<Match[]>([])
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null)

  const predictionMap = useMemo(
    () =>
      predictions.reduce<Record<string, Prediction>>((acc, prediction) => {
        acc[prediction.matchId] = prediction
        return acc
      }, {}),
    [predictions]
  )

  const tomorrowMatches = useMemo(() => getNextMatchDayMatches(matches), [matches])

  const activeMatch = useMemo(() => {
    if (selectedMatchId) {
      return tomorrowMatches.find((match) => match.id === selectedMatchId) ?? null
    }

    return tomorrowMatches.length > 0 ? tomorrowMatches[0] : null
  }, [selectedMatchId, tomorrowMatches])

  async function loadPredictions() {
    try {
      const response = await fetch("/api/predictions")

      const data = await response.json()

      if (!response.ok) {
        setPredictions([])
        return
      }

      setPredictions(data)
    } catch (error) {
      console.error("Error cargando predicciones:", error)
      setPredictions([])
    }
  }

  async function loadMatches() {
    try {
      const response = await fetch("/api/matches")
      const data = await response.json()

      if (!response.ok) {
        console.error("Error cargando partidos:", data.error || response.statusText)
        setMatches([])
        return
      }

      setMatches(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error cargando partidos:", error)
      setMatches([])
    }
  }

  useEffect(() => {
    async function loadData() {
      await loadPredictions()
      await loadMatches()
    }

    void loadData()
  }, [])

  const activePrediction = activeMatch ? predictionMap[activeMatch.id] : undefined

  return (

    <main className="min-h-screen bg-zinc-950 text-white">

      <Navbar />

      <div className="p-6">

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Quiniela Mundial 2026</h1>
          <p className="text-sm text-zinc-400 max-w-3xl">
            Selecciona el próximo partido que quieres predecir y completa tu pronóstico. La tabla de posiciones está justo debajo.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <MatchesQueue
              matches={tomorrowMatches}
              activeMatch={activeMatch}
              setActiveMatch={(match) => setSelectedMatchId(match.id)}
              predictions={predictionMap}
            />
          </section>

          <section>
            {activeMatch ? (
              <MatchCard
                matchId={activeMatch.id}
                homeTeam={{
                  name: activeMatch.homeTeam,
                  code: activeMatch.homeTeam.slice(0, 3).toUpperCase(),
                  flagUrl: getFlagUrl(activeMatch.homeTeam),
                }}
                awayTeam={{
                  name: activeMatch.awayTeam,
                  code: activeMatch.awayTeam.slice(0, 3).toUpperCase(),
                  flagUrl: getFlagUrl(activeMatch.awayTeam),
                }}
                matchDate={new Date(activeMatch.matchDate).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
                matchTime={new Date(activeMatch.matchDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                venue={activeMatch.venue}
                existingPrediction={
                  activePrediction
                    ? {
                        homeScore: activePrediction.predictedHomeScore,
                        awayScore: activePrediction.predictedAwayScore,
                      }
                    : undefined
                }
                onSave={loadPredictions}
              />
            ) : (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-10 text-center text-zinc-400">
                {matches.length === 0
                  ? "Cargando partidos..."
                  : "No hay partidos programados para mañana."}
              </div>
            )}
          </section>

          <section className="pt-6">
            <RankingDashboard />
          </section>
        </div>
      </div>
    </main>
  )
}