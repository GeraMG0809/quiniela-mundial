import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { calculatePredictionScore } from "@/lib/scoring"

type PredictionsView = "pending" | "finished"

function getDateRange(dateValue: string | null) {
  if (!dateValue || !/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    return null
  }

  const start = new Date(`${dateValue}T00:00:00`)
  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return { start, end }
}

export async function GET(request: Request) {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        {
          error: "Debes iniciar sesión para ver las predicciones",
        },
        {
          status: 401,
        }
      )
    }

    const { searchParams } = new URL(request.url)
    const view = searchParams.get("view") === "finished" ? "finished" : "pending"
    const dateRange = getDateRange(searchParams.get("date"))
    const hasDateFilter = dateRange !== null

    const baseFilters: Prisma.MatchWhereInput[] = [
      {
        predictions: {
          some: {},
        },
      },
    ]

    if (dateRange) {
      baseFilters.push({
        matchDate: {
          gte: dateRange.start,
          lt: dateRange.end,
        },
      })
    }

    const statusFilter: Prisma.MatchWhereInput =
      view === "finished"
        ? {
            OR: [
              { status: "FINISHED" },
              {
                AND: [
                  { homeScore: { not: null } },
                  { awayScore: { not: null } },
                ],
              },
            ],
          }
        : {
            AND: [
              { status: "UPCOMING" },
              { homeScore: null },
              { awayScore: null },
            ],
          }

    const matches = await prisma.match.findMany({
      where: {
        AND: [...baseFilters, statusFilter],
      },
      orderBy: {
        matchDate: view === "finished" && !hasDateFilter ? "desc" : "asc",
      },
      take: hasDateFilter ? 40 : view === "finished" ? 10 : 12,
      include: {
        predictions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                points: true,
              },
            },
          },
        },
      },
    })

    const payload = matches.map((match) => {
      const hasResult = match.homeScore !== null && match.awayScore !== null

      return {
        id: match.id,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        venue: match.venue,
        matchDate: match.matchDate,
        status: match.status,
        homeScore: match.homeScore,
        awayScore: match.awayScore,
        predictions: match.predictions
          .map((prediction) => {
            const score = hasResult
              ? calculatePredictionScore(
                  prediction.predictedHomeScore,
                  prediction.predictedAwayScore,
                  match.homeScore as number,
                  match.awayScore as number
                )
              : null

            return {
              id: prediction.id,
              user: prediction.user,
              predictedHomeScore: prediction.predictedHomeScore,
              predictedAwayScore: prediction.predictedAwayScore,
              points: score?.points ?? null,
              exact: score?.exact ?? false,
              correctResult: score?.correctResult ?? false,
            }
          })
          .sort((a, b) => a.user.name.localeCompare(b.user.name)),
      }
    })

    return NextResponse.json({
      view: view satisfies PredictionsView,
      date: searchParams.get("date"),
      matches: payload,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Error al obtener las predicciones",
      },
      {
        status: 500,
      }
    )
  }
}
