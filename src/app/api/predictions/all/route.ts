import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { calculatePredictionScore } from "@/lib/scoring"

export async function GET() {
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

    const matches = await prisma.match.findMany({
      orderBy: {
        matchDate: "asc",
      },
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

    return NextResponse.json(payload)
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
