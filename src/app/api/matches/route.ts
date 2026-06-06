import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

export async function GET() {

  try {

    const matches = await prisma.match.findMany({
      orderBy: {
        matchDate: "asc"
      }
    })

    return NextResponse.json(matches)

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "Error al obtener partidos"
      },
      {
        status: 500
      }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { matchId, homeScore, awayScore } = body

    if (typeof matchId !== "string" || typeof homeScore !== "number" || typeof awayScore !== "number") {
      return NextResponse.json(
        { error: "Datos de partido inválidos" },
        { status: 400 }
      )
    }

    const match = await prisma.match.findUnique({ where: { id: matchId } })

    if (!match) {
      return NextResponse.json(
        { error: "Partido no encontrado" },
        { status: 404 }
      )
    }

    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        homeScore,
        awayScore,
        status: "FINISHED"
      }
    })

    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Error al actualizar resultado" },
      { status: 500 }
    )
  }
}
