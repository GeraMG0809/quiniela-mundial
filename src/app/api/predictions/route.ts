import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      matchId,
      homeScore,
      awayScore
    } = body

    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        {
          error: "No autenticado"
        },
        {
          status: 401
        }
      )
    }

    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId
        }
      },
      update: {
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore
      },
      create: {
        userId: user.id,
        matchId,
        predictedHomeScore: homeScore,
        predictedAwayScore: awayScore
      }
    })

    return NextResponse.json(prediction)

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Error al guardar predicción"
      },
      {
        status: 500
      }
    )
  }
}

export async function GET() {
  try {
    const user = await getSession()

    if (!user) {
      return NextResponse.json(
        {
          error: "No autenticado"
        },
        {
          status: 401
        }
      )
    }

    const predictions = await prisma.prediction.findMany({
      where: {
        userId: user.id
      },
      include: {
        match: true
      }
    })

    return NextResponse.json(predictions)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "Error al obtener predicciones"
      },
      {
        status: 500
      }
    )
  }
}