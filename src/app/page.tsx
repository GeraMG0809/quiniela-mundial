"use client"

import { useState, useEffect } from "react"
import MatchCard from "@/components/MathCard"
import Navbar from "@/components/NavBar"
import Counter from "@/components/Counter"

type Prediction = {
  matchId: string
  prediction: string
}

const matches = [
  {
    matchId: "ger-prk",
    homeTeam: {
      name: "Alemania",
      code: "GER",
      flagUrl: "https://flagcdn.com/w320/de.png",
    },
    awayTeam: {
      name: "Corea del Norte",
      code: "PRK",
      flagUrl: "https://flagcdn.com/w320/kp.png",
    },
    matchDate: "15 Jun 2026",
    matchTime: "18:00",
    venue: "Estadio Olímpico, Berlín",
  },
  {
    matchId: "arg-fra",
    homeTeam: {
      name: "Argentina",
      code: "ARG",
      flagUrl: "https://flagcdn.com/w320/ar.png",
    },
    awayTeam: {
      name: "Francia",
      code: "FRA",
      flagUrl: "https://flagcdn.com/w320/fr.png",
    },
    matchDate: "15 Jun 2026",
    matchTime: "20:00",
    venue: "Estadio Monumental, Buenos Aires",
  },
  {
    matchId: "jpn-esp",
    homeTeam: {
      name: "Japón",
      code: "JPN",
      flagUrl: "https://flagcdn.com/w320/jp.png",
    },
    awayTeam: {
      name: "España",
      code: "ESP",
      flagUrl: "https://flagcdn.com/w320/es.png",
    },
    matchDate: "15 Jun 2026",
    matchTime: "22:00",
    venue: "Tokyo Stadium, Tokio",
  },
]

export default function Home() {
  const [predictions, setPredictions] = useState<Prediction[]>([])

  async function loadPredictions() {
    try {
      const response = await fetch("/api/predictions")
      const data = await response.json()
      setPredictions(data)
    } catch (error) {
      console.error("Error cargando predicciones:", error)
    }
  }

  useEffect(() => {
    loadPredictions()
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
              key={match.matchId}
              matchId={match.matchId}
              homeTeam={match.homeTeam}
              awayTeam={match.awayTeam}
              matchDate={match.matchDate}
              matchTime={match.matchTime}
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
                    <strong>Partido:</strong> {item.matchId}
                  </p>
                  <p>
                    <strong>Pronóstico:</strong> {item.prediction}
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