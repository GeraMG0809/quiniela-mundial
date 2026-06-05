import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { calculateUserScore } from "@/lib/scoring"

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        predictions: {
          include: {
            match: true
          }
        }
      }
    })

    const rankedUsers = users
      .map((user) => {
        const score = calculateUserScore(user.predictions)

        return {
          id: user.id,
          name: user.name,
          points: score.points,
          exactCount: score.exactCount,
          correctResultCount: score.correctResultCount,
          predictionsCount: score.predictionsCount
        }
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points
        if (b.exactCount !== a.exactCount) return b.exactCount - a.exactCount
        if (b.correctResultCount !== a.correctResultCount)
          return b.correctResultCount - a.correctResultCount
        return a.name.localeCompare(b.name)
      })
      .map((item, index) => ({
        ...item,
        rank: index + 1
      }))

    return NextResponse.json(rankedUsers)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Error al obtener el ranking"
      },
      {
        status: 500
      }
    )
  }
}
