import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

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