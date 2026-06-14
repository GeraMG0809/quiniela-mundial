import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { calculateUserScore } from "@/lib/scoring"

export async function POST() {
  try {
    const session = await getSession()

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      include: {
        predictions: {
          include: {
            match: true
          }
        }
      }
    })

    let updatedUsers = 0

    await prisma.$transaction(
      users.map((user) => {
        const score = calculateUserScore(user.predictions)

        updatedUsers += 1

        return prisma.user.update({
          where: { id: user.id },
          data: { points: score.points }
        })
      })
    )

    return NextResponse.json({
      success: true,
      updatedUsers,
      message: `Tabla actualizada: ${updatedUsers} participantes con puntos guardados.`
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Error al actualizar la tabla de puntos" },
      { status: 500 }
    )
  }
}
