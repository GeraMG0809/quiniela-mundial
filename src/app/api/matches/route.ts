import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

interface TheSportsDBEvent {
  idEvent: string
  strEvent: string
  strHomeTeam: string
  strAwayTeam: string
  intHomeScore: string | null
  intAwayScore: string | null
  strVenue: string
  dateEvent: string
  strTime: string
  strStatus: string
}

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
      "https://www.thesportsdb.com/api/v1/json/3/eventsseason.php?id=4429&s=2026",
      {
        cache: "no-store"
      }
    )

    const data = await response.json()

    const events: TheSportsDBEvent[] = data.events || []

    let created = 0
    let skipped = 0

    for (const event of events) {

      if (
        !event.strHomeTeam ||
        !event.strAwayTeam ||
        !event.dateEvent
      ) {
        continue
      }

      // IMPORTANTE:
      // TheSportsDB entrega la hora en UTC.
      // La Z indica a JavaScript que la hora ya viene en UTC.
      const matchDate = new Date(
        `${event.dateEvent}T${event.strTime || "00:00:00"}Z`
      )

      const existingMatch = await prisma.match.findFirst({
        where: {
          homeTeam: event.strHomeTeam,
          awayTeam: event.strAwayTeam,
          matchDate
        }
      })

      if (existingMatch) {
        skipped++
        continue
      }

      await prisma.match.create({
        data: {
          homeTeam: event.strHomeTeam,
          awayTeam: event.strAwayTeam,

          venue:
            event.strVenue ||
            "Por definir",

          matchDate,

          homeScore: null,
          awayScore: null,

          status: "UPCOMING"
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