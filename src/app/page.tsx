"use client"

import { useState, useEffect } from "react"
import MatchCard from "@/components/MathCard"
import Navbar from "@/components/NavBar"
import Counter from "@/components/Counter"

type Prediction = {
  matchId: string
  prediction: string
}

type Match = {
  id: string
  homeTeam: string
  awayTeam: string
  venue: string
  matchDate: string
}

export default function Home() {

  const [predictions, setPredictions] = useState<Prediction[]>([])

  const [matches, setMatches] = useState<Match[]>([])

  async function loadPredictions() {

    try {

      const response = await fetch("/api/predictions")

      const data = await response.json()

      setPredictions(data)

    } catch (error) {

      console.error(
        "Error cargando predicciones:",
        error
      )
    }
  }

  async function loadMatches() {

    try {

      const response = await fetch("/api/matches")

      const data = await response.json()

      setMatches(data)

    } catch (error) {

      console.error(
        "Error cargando partidos:",
        error
      )
    }
  }

  useEffect(() => {

    loadPredictions()

    loadMatches()

  }, [])

  return (

    <main className="min-h-screen bg-zinc-950 text-white">

      <Navbar />

      <div className="p-6">

        <h1 className="text-4xl font-bold mb-8">
          Quiniela Mundial 2026
        </h1>

        <div className="flex flex-col gap-4">

          {matches.map((match) => (

            <MatchCard
              key={match.id}

              matchId={match.id}

              homeTeam={{
                name: match.homeTeam,
                code: match.homeTeam.slice(0, 3).toUpperCase(),
                flagUrl: "https://flagcdn.com/w320/de.png"
              }}

              awayTeam={{
                name: match.awayTeam,
                code: match.awayTeam.slice(0, 3).toUpperCase(),
                flagUrl: "https://flagcdn.com/w320/fr.png"
              }}

              matchDate={
                new Date(match.matchDate)
                  .toLocaleDateString()
              }

              matchTime={
                new Date(match.matchDate)
                  .toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
              }

              venue={match.venue}

              onSave={loadPredictions}
            />
          ))}
        </div>

        <div className="mt-8">

          <h2 className="text-xl font-bold mb-2">
            Predicciones:
          </h2>

          <div className="bg-zinc-900 p-4 rounded-xl">

            {predictions.length > 0 ? (

              predictions.map((item, index) => (

                <div
                  key={index}
                  className="mb-3 border-b border-zinc-700 pb-2"
                >

                  <p>
                    <strong>Partido:</strong>
                    {" "}
                    {item.matchId}
                  </p>

                  <p>
                    <strong>Pronóstico:</strong>
                    {" "}
                    {item.prediction}
                  </p>
                </div>
              ))

            ) : (

              <p className="text-zinc-400">
                No hay predicciones todavía.
              </p>
            )}
          </div>
        </div>
      </div>

      <Counter />
    </main>
  )
}