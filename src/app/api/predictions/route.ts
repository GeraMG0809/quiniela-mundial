import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      matchId,
      homeScore,
      awayScore
    } = body

    const cookieStore = await cookies()

    const session = cookieStore.get("session")

    if (!session) {
      return NextResponse.json(
        {
          error: "No autenticado"
        },
        {
          status: 401
        }
      )
    }

    const user = JSON.parse(session.value)

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

    const cookieStore = await cookies()

    const session = cookieStore.get("session")

    if (!session) {
      return NextResponse.json(
        {
          error: "No autenticado"
        },
        {
          status: 401
        }
      )
    }

    const user = JSON.parse(session.value)

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