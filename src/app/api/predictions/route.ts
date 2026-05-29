import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {

  try {

    const body = await request.json()

    const {
      userId,
      matchId,
      homeScore,
      awayScore
    } = body

    const prediction = await prisma.prediction.create({
      data: {
        userId,
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

    const predictions = await prisma.prediction.findMany({
      include: {
        match: true,
        user: true
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