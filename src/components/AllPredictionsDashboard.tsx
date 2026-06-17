"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock,
  MapPin,
  RotateCcw,
  Search,
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

type PredictionsView = "pending" | "finished"

type ApiResponse = {
  view: PredictionsView
  date: string | null
  matches: PublicMatchPredictions[]
}

function formatMatchDate(matchDate: string) {
  return new Date(matchDate).toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDayLabel(dateValue: string) {
  return new Date(`${dateValue}T00:00:00`).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
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
      className: "border-zinc-700 bg-zinc-800/80 text-zinc-300",
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
  const [view, setView] = useState<PredictionsView>("pending")
  const [selectedDate, setSelectedDate] = useState("")
  const [matches, setMatches] = useState<PublicMatchPredictions[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function loadPredictions() {
      setLoading(true)
      setError("")

      try {
        const params = new URLSearchParams({ view })
        if (selectedDate) params.set("date", selectedDate)

        const response = await fetch(`/api/predictions/all?${params.toString()}`, {
          cache: "no-store",
        })
        const data = await response.json()

        if (!response.ok) {
          setError(data.error || "No se pudieron cargar las predicciones")
          setMatches([])
          return
        }

        const payload = data as ApiResponse
        setMatches(Array.isArray(payload.matches) ? payload.matches : [])
      } catch (fetchError) {
        console.error(fetchError)
        setError("Error de conexion al cargar las predicciones")
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    loadPredictions()
  }, [selectedDate, view])

  const summary = useMemo(() => {
    const participants = new Set<string>()
    let totalPredictions = 0

    for (const match of matches) {
      totalPredictions += match.predictions.length

      for (const prediction of match.predictions) {
        participants.add(prediction.user.id)
      }
    }

    return {
      participants: participants.size,
      totalPredictions,
      totalMatches: matches.length,
    }
  }, [matches])

  const heading = selectedDate
    ? `${view === "pending" ? "Pendientes" : "Finalizados"} del ${formatDayLabel(selectedDate)}`
    : view === "pending"
      ? "Pendientes con predicciones"
      : "Finalizados recientes"

  const emptyMessage = selectedDate
    ? "No hay predicciones registradas para ese dia."
    : view === "pending"
      ? "No hay partidos pendientes con predicciones."
      : "No hay partidos finalizados con predicciones."

  if (error) {
    return (
      <div className="rounded-[28px] border border-[#E61D25]/30 bg-[#E61D25]/10 p-8 text-center text-[#D1D4D1] shadow-2xl shadow-black/20 sm:p-10">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-[#E61D25]" />
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-4 shadow-2xl shadow-black/20 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#3CAC3B]">
              Vista
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">{heading}</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-[auto_minmax(220px,260px)_auto] sm:items-end">
            <div className="grid grid-cols-2 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-1">
              <button
                type="button"
                onClick={() => setView("pending")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  view === "pending"
                    ? "bg-linear-to-r from-[#2A398D] to-[#3CAC3B] text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                Pendientes
              </button>
              <button
                type="button"
                onClick={() => setView("finished")}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  view === "finished"
                    ? "bg-linear-to-r from-[#2A398D] to-[#3CAC3B] text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                Finalizados
              </button>
            </div>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                Filtrar por dia
              </span>
              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="h-11 w-full rounded-2xl border border-zinc-800 bg-zinc-950/70 pl-10 pr-3 text-sm text-white outline-none transition focus:border-[#3CAC3B] focus:ring-4 focus:ring-[#3CAC3B]/10"
                />
              </div>
            </label>

            {selectedDate ? (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-zinc-800 px-4 text-sm font-semibold text-zinc-300 transition hover:bg-white/5 hover:text-white"
              >
                <RotateCcw className="h-4 w-4" />
                Recientes
              </button>
            ) : (
              <div className="hidden h-11 items-center gap-2 rounded-2xl border border-zinc-800 px-4 text-sm text-zinc-500 sm:inline-flex">
                <Search className="h-4 w-4" />
                Sin fecha
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={Target} label="Pred." value={summary.totalPredictions} />
        <SummaryCard icon={Users} label="Usuarios" value={summary.participants} />
        <SummaryCard icon={CalendarDays} label="Partidos" value={summary.totalMatches} />
      </div>

      {loading ? (
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-8 text-center text-zinc-400 shadow-2xl shadow-black/20 sm:p-10">
          Cargando predicciones...
        </div>
      ) : matches.length === 0 ? (
        <div className="rounded-[28px] border border-zinc-800 bg-zinc-900/80 p-8 text-center text-zinc-400 shadow-2xl shadow-black/20 sm:p-10">
          {emptyMessage}
        </div>
      ) : (
        <div className="space-y-5">
          {matches.map((match) => (
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
}: {
  icon: typeof Target
  label: string
  value: number
}) {
  return (
    <div className="rounded-[22px] border border-zinc-800 bg-zinc-900/80 p-4 shadow-xl shadow-black/10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 sm:text-xs">
            {label}
          </p>
          <p className="mt-1 text-2xl font-bold text-white sm:text-3xl">{value}</p>
        </div>
        <div className="hidden rounded-2xl bg-[#3CAC3B]/10 p-3 text-[#3CAC3B] sm:block">
          <Icon className="h-5 w-5" />
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
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 -space-x-3">
              <FlagBadge team={match.homeTeam} />
              <FlagBadge team={match.awayTeam} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-200/80">
                {hasResult ? "Finalizado" : "Pendiente"}
              </p>
              <h3 className="truncate text-xl font-bold text-white sm:text-2xl">
                {match.homeTeam} vs {match.awayTeam}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-sm text-zinc-100">
            <span className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
              <Clock className="h-4 w-4 text-[#3CAC3B]" />
              {formatMatchDate(match.matchDate)}
            </span>
            <span className="inline-flex min-w-0 items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
              <MapPin className="h-4 w-4 shrink-0 text-[#E61D25]" />
              <span className="truncate">{match.venue}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-zinc-800 p-5 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-center gap-4">
            <TeamScore team={match.homeTeam} score={match.homeScore} />
            <div className="flex flex-col items-center gap-1 text-zinc-500">
              <span className="h-2 w-2 rounded-full bg-[#E61D25]" />
              <span className="text-sm font-bold">VS</span>
              <span className="h-2 w-2 rounded-full bg-[#E61D25]" />
            </div>
            <TeamScore team={match.awayTeam} score={match.awayScore} />
          </div>

          <div className="mt-5 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-zinc-400">
                Predicciones
              </span>
              <span className="rounded-full bg-[#3CAC3B]/15 px-3 py-1 text-xs font-semibold text-[#3CAC3B]">
                {match.predictions.length}
              </span>
            </div>
          </div>
        </aside>

        <div className="p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {match.predictions.map((prediction) => (
              <PredictionCard key={prediction.id} prediction={prediction} />
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}

function PredictionCard({ prediction }: { prediction: PublicPrediction }) {
  const badge = getPredictionBadge(prediction)
  const BadgeIcon = badge.icon

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#2A398D] to-[#3CAC3B] text-sm font-bold text-white shadow-lg">
            {getInitial(prediction.user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-white">{prediction.user.name}</p>
            <p className="text-xs text-zinc-500">{prediction.user.points} pts ranking</p>
          </div>
        </div>

        <span className="shrink-0 rounded-2xl bg-[#474A4A] px-3 py-2 text-lg font-bold text-white">
          {prediction.predictedHomeScore}
          <span className="mx-1.5 text-zinc-500">-</span>
          {prediction.predictedAwayScore}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${badge.className}`}
        >
          <BadgeIcon className="h-4 w-4" />
          {badge.label}
        </span>
        <span className="text-sm font-bold text-[#3CAC3B]">
          {prediction.points ?? "-"} pts
        </span>
      </div>
    </div>
  )
}

function FlagBadge({ team }: { team: string }) {
  return (
    <div className="relative h-12 w-12 overflow-hidden rounded-2xl border-2 border-white/20 bg-zinc-900 shadow-lg sm:h-14 sm:w-14">
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
      <div className="relative h-14 w-14 overflow-hidden rounded-2xl ring-4 ring-white/10 sm:h-16 sm:w-16">
        <Image
          src={getFlagUrl(team)}
          alt={team}
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-bold uppercase tracking-[0.16em] text-white sm:text-sm">
          {team.slice(0, 3)}
        </p>
        <p className="mt-1 text-3xl font-bold text-white">{score ?? "-"}</p>
      </div>
    </div>
  )
}
