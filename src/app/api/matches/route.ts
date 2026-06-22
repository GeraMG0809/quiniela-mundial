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

export async function POST() {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        {
          error: "No autorizado"
        },
        {
          status: 401
        }
      )
    }

    const response = await fetch(
      "https://api.football-data.org/v4/competitions/WC/matches",
      {
        headers: {
          "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY!
        },
        cache: "no-store"
      }
    )

    if (!response.ok) {
      const errorText = await response.text()

      console.error("Error Football Data:", errorText)

      return NextResponse.json(
        {
          error: "Error obteniendo partidos de Football Data"
        },
        {
          status: 500
        }
      )
    }

    const data = await response.json()

    console.log(
      `Total partidos API: ${data.matches?.length || 0}`
    )

    let created = 0
    let skipped = 0

    for (const match of data.matches || []) {

      if (
        !match.homeTeam?.name ||
        !match.awayTeam?.name ||
        !match.utcDate
      ) {
        continue
      }

      const matchDate = new Date(match.utcDate)

      const dayStart = new Date(matchDate)
      dayStart.setHours(0, 0, 0, 0)

      const dayEnd = new Date(matchDate)
      dayEnd.setHours(23, 59, 59, 999)

      const existingMatch = await prisma.match.findFirst({
        where: {
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          matchDate: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      })

      if (existingMatch) {
        skipped++
        continue
      }

      await prisma.match.create({
        data: {
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,

          venue: "Por definir",

          matchDate,

          homeScore:
            match.score?.fullTime?.home ?? null,

          awayScore:
            match.score?.fullTime?.away ?? null,

          status:
            match.status === "FINISHED"
              ? "FINISHED"
              : "UPCOMING"
        }
      })

      created++
    }

    return NextResponse.json({
      success: true,
      created,
      skipped
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Error sincronizando partidos"
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
        {
          error: "No autorizado"
        },
        {
          status: 401
        }
      )
    }

    const body = await request.json()

    const {
      matchId,
      homeScore,
      awayScore
    } = body

    if (
      typeof matchId !== "string" ||
      typeof homeScore !== "number" ||
      typeof awayScore !== "number"
    ) {
      return NextResponse.json(
        {
          error: "Datos de partido inválidos"
        },
        {
          status: 400
        }
      )
    }

    const match = await prisma.match.findUnique({
      where: {
        id: matchId
      }
    })

    if (!match) {
      return NextResponse.json(
        {
          error: "Partido no encontrado"
        },
        {
          status: 404
        }
      )
    }

    const updatedMatch = await prisma.match.update({
      where: {
        id: matchId
      },
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
      {
        error: "Error al actualizar resultado"
      },
      {
        status: 500
      }
    )
  }
}