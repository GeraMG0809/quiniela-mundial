"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock,
  ListChecks,
  MapPin,
  Target,
  Trophy,
  Users,
} from "lucide-react"
import { getFlagUrl } from "@/lib/flags"

type PublicPrediction = {
  id: string
  user: {
    id: string
    name: string
    points: number
  }
  predictedHomeScore: number
  predictedAwayScore: number
  points: number | null
  exact: boolean
  correctResult: boolean
}

type PublicMatchPredictions = {
  id: string
  homeTeam: string
  awayTeam: string
  venue: string
  matchDate: string
  status: string
  homeScore: number | null
  awayScore: number | null
  predictions: PublicPrediction[]
}

type MatchFilter = "all" | "withPredictions" | "finished" | "upcoming"

const filters: Array<{ id: MatchFilter; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "withPredictions", label: "Con predicciones" },
  { id: "finished", label: "Finalizados" },
  { id: "upcoming", label: "Pendientes" },
]

function formatMatchDate(matchDate: string) {
  return new Date(matchDate).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?"
}

function isFinished(match: PublicMatchPredictions) {
  return match.homeScore !== null && match.awayScore !== null
}

function getPredictionBadge(prediction: PublicPrediction) {
  if (prediction.points === null) {
    return {
      label: "Pendiente",
      className: "border-zinc-700 bg-zinc-800/70 text-zinc-300",
      icon: CircleDashed,
    }
  }

  if (prediction.exact) {
    return {
      label: "Exacto",
      className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
      icon: Trophy,
    }
  }

  if (prediction.correctResult) {
    return {
      label: "Acierto",
      className: "border-[#3CAC3B]/40 bg-[#3CAC3B]/10 text-[#3CAC3B]",
      icon: CheckCircle2,
    }
  }

  return {
    label: "Sin puntos",
    className: "border-[#E61D25]/35 bg-[#E61D25]/10 text-[#E61D25]",
    icon: AlertTriangle,
  }
}

export default function AllPredictionsDashboard() {
  const [matches, setMatches] = useState<PublicMatchPredictions[]>([])
  const [filter, setFilter] = useState<MatchFilter>("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadPredictions() {
      try {
        const response = await fetch("/api/predictions/all", {
          cache: "no-store",
        })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "No se pudieron cargar las predicciones")
          setMatches([])
          return
        }

        setMatches(Array.isArray(data) ? data : [])
      } catch (fetchError) {
        console.error(fetchError)
        setError("Error de conexion al cargar las predicciones")
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    loadPredictions()
  }, [])

  const summary = useMemo(() => {
    const participants = new Map<string, string>()
    let totalPredictions = 0
    let finishedMatches = 0

    for (const match of matches) {
      totalPredictions += match.predictions.length
      if (isFinished(match)) finishedMatches += 1

      for (const prediction of match.predictions) {
        participants.set(prediction.user.id, prediction.user.name)
      }
    }

    return {
      participants: participants.size,
      totalPredictions,
      totalMatches: matches.length,
      finishedMatches,
    }
  }, [matches])

  const topParticipant = useMemo(() => {
    const totals = new Map<
      string,
      { id: string; name: string; predictions: number; points: number }
    >()

    for (const match of matches) {
      for (const prediction of match.predictions) {
        const current = totals.get(prediction.user.id) || {
          id: prediction.user.id,
          name: prediction.user.name,
          predictions: 0,
          points: prediction.user.points,
        }

        current.predictions += 1
        current.points = prediction.user.points
        totals.set(prediction.user.id, current)
      }
    }

    return Array.from(totals.values()).sort((a, b) => {
      if (b.predictions !== a.predictions) return b.predictions - a.predictions
      if (b.points !== a.points) return b.points - a.points
      return a.name.localeCompare(b.name)
    })[0]
  }, [matches])

  const visibleMatches = useMemo(() => {
    return matches.filter((match) => {
      if (filter === "withPredictions") return match.predictions.length > 0
      if (filter === "finished") return isFinished(match)
      if (filter === "upcoming") return !isFinished(match)
      return true
    })
  }, [filter, matches])

  if (loading) {
    return (
      <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-10 text-center text-zinc-400 shadow-2xl shadow-black/20">
        Cargando predicciones...
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-[28px] border border-[#E61D25]/30 bg-[#E61D25]/10 p-10 text-center text-[#D1D4D1] shadow-2xl shadow-black/20">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[#E61D25]" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Target}
          label="Predicciones"
          value={summary.totalPredictions}
          tone="green"
        />
        <SummaryCard
          icon={Users}
          label="Participantes"
          value={summary.participants}
          tone="blue"
        />
        <SummaryCard
          icon={CalendarDays}
          label="Partidos"
          value={summary.totalMatches}
          tone="red"
        />
        <SummaryCard
          icon={Trophy}
          label="Finalizados"
          value={summary.finishedMatches}
          tone="gold"
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3 text-zinc-300">
            <ListChecks className="h-5 w-5 text-[#3CAC3B]" />
            <span className="text-sm font-semibold uppercase tracking-[0.24em]">
              Vista general
            </span>
          </div>
          {topParticipant && (
            <p className="mt-2 text-sm text-zinc-400">
              Mas activo:{" "}
              <span className="font-semibold text-white">{topParticipant.name}</span>
              <span className="text-zinc-500"> / </span>
              {topParticipant.predictions} predicciones
            </p>
          )}
        </div>

        <div className="inline-flex w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 p-1 sm:w-auto">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition sm:flex-none sm:px-4 ${
                filter === item.id
                  ? "bg-linear-to-r from-[#2A398D] to-[#3CAC3B] text-white shadow-lg shadow-[#3CAC3B]/10"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visibleMatches.length === 0 ? (
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-10 text-center text-zinc-400 shadow-2xl shadow-black/20">
          No hay partidos para este filtro.
        </div>
      ) : (
        <div className="space-y-6">
          {visibleMatches.map((match) => (
            <MatchPredictionBlock key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Target
  label: string
  value: number
  tone: "green" | "blue" | "red" | "gold"
}) {
  const toneClass = {
    green: "from-[#3CAC3B]/25 to-[#3CAC3B]/5 text-[#3CAC3B]",
    blue: "from-[#2A398D]/35 to-[#2A398D]/5 text-blue-300",
    red: "from-[#E61D25]/25 to-[#E61D25]/5 text-[#E61D25]",
    gold: "from-yellow-500/25 to-yellow-500/5 text-yellow-300",
  }[tone]

  return (
    <div className="rounded-[24px] border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl shadow-black/10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        </div>
        <div className={`rounded-2xl bg-linear-to-br p-3 ${toneClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

function MatchPredictionBlock({ match }: { match: PublicMatchPredictions }) {
  const hasResult = isFinished(match)

  return (
    <article className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-900/80 shadow-2xl shadow-black/20">
      <div className="bg-linear-to-r from-[#2A398D] via-[#2A398D]/90 to-[#3CAC3B]/80 px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex -space-x-3">
              <FlagBadge team={match.homeTeam} />
              <FlagBadge team={match.awayTeam} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-200/80">
                {match.status}
              </p>
              <h2 className="truncate text-2xl font-bold text-white">
                {match.homeTeam} vs {match.awayTeam}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-zinc-100">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
              <Clock className="h-4 w-4 text-[#3CAC3B]" />
              {formatMatchDate(match.matchDate)}
            </span>
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
              <MapPin className="h-4 w-4 text-[#E61D25]" />
              {match.venue}
            </span>
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-800 p-5 sm:p-6 xl:border-b-0 xl:border-r">
          <div className="flex items-center justify-center gap-5">
            <TeamScore team={match.homeTeam} score={match.homeScore} />
            <div className="flex flex-col items-center gap-1 text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-[#E61D25]" />
              <span className="text-sm font-bold">VS</span>
              <span className="h-2 w-2 rounded-full bg-[#E61D25]" />
            </div>
            <TeamScore team={match.awayTeam} score={match.awayScore} />
          </div>

          <div className="mt-6 border-t border-zinc-800 pt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-zinc-400">
                Resultado oficial
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                  hasResult
                    ? "bg-[#3CAC3B]/15 text-[#3CAC3B]"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {hasResult ? "Cerrado" : "Por jugar"}
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              {match.predictions.length} predicciones registradas
            </p>
          </div>
        </aside>

        <div className="min-w-0">
          {match.predictions.length === 0 ? (
            <div className="p-8 text-center text-zinc-400">
              Sin predicciones registradas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-950/55">
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Participante
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Pronostico
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Estado
                    </th>
                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                      Puntos
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/70">
                  {match.predictions.map((prediction) => {
                    const badge = getPredictionBadge(prediction)
                    const BadgeIcon = badge.icon

                    return (
                      <tr
                        key={prediction.id}
                        className="transition hover:bg-white/[0.03]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-[#2A398D] to-[#3CAC3B] text-sm font-bold text-white shadow-lg">
                              {getInitial(prediction.user.name)}
                            </div>
                            <div>
                              <p className="font-semibold text-white">
                                {prediction.user.name}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {prediction.user.points} pts ranking
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex min-w-24 items-center justify-center rounded-2xl bg-[#474A4A] px-4 py-2 text-xl font-bold text-white">
                            {prediction.predictedHomeScore}
                            <span className="mx-2 text-zinc-500">-</span>
                            {prediction.predictedAwayScore}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${badge.className}`}
                          >
                            <BadgeIcon className="h-4 w-4" />
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-lg font-bold text-[#3CAC3B]">
                            {prediction.points ?? "-"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function FlagBadge({ team }: { team: string }) {
  return (
    <div className="relative h-14 w-14 overflow-hidden rounded-2xl border-2 border-white/20 bg-zinc-900 shadow-lg">
      <Image
        src={getFlagUrl(team)}
        alt={team}
        fill
        sizes="56px"
        className="object-cover"
      />
    </div>
  )
}

function TeamScore({
  team,
  score,
}: {
  team: string
  score: number | null
}) {
  return (
    <div className="flex flex-1 flex-col items-center gap-3 text-center">
      <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-4 ring-white/10">
        <Image
          src={getFlagUrl(team)}
          alt={team}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold uppercase tracking-[0.16em] text-white">
          {team.slice(0, 3)}
        </p>
        <p className="mt-1 text-3xl font-bold text-white">{score ?? "-"}</p>
      </div>
    </div>
  )
}
