import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      matchId,
      homeScore,
      awayScore,
      allowUpdate = false
    } = body
    // obtener sesión del usuario
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

    // verificar que el partido exista y que no esté bloqueado (10 minutos antes)
    const match = await prisma.match.findUnique({ where: { id: matchId } })

    if (!match) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      )
    }

    // denegar si el partido no está en estado UPCOMING
    if (match.status && match.status !== "UPCOMING") {
      return NextResponse.json(
        { error: "Predicciones cerradas para este partido" },
        { status: 400 }
      )
    }

    // calcular tiempo de bloqueo: 10 minutos antes del inicio
    const matchTime = new Date(match.matchDate).getTime()
    const lockTime = matchTime - 10 * 60 * 1000 // 10 minutos en ms

    if (Date.now() >= lockTime) {
      return NextResponse.json(
        { error: "Predicciones cerradas: faltan menos de 10 minutos" },
        { status: 400 }
      )
    }

    const existingPrediction = await prisma.prediction.findUnique({
      where: {
        userId_matchId: {
          userId: user.id,
          matchId
        }
      }
    })

    if (existingPrediction && !allowUpdate) {
      return NextResponse.json(
        {
          error: "Ya existe una predicción para este partido. Edítala en Mis Predicciones."
        },
        {
          status: 409
        }
      )
    }

    const prediction = existingPrediction
      ? await prisma.prediction.update({
          where: { id: existingPrediction.id },
          data: {
            predictedHomeScore: homeScore,
            predictedAwayScore: awayScore
          }
        })
      : await prisma.prediction.create({
          data: {
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