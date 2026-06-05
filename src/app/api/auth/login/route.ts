import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { sessionCookieOptions } from "@/lib/auth"
import { calculateUserScore } from "@/lib/scoring"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      email,
      password
    } = body

    const user = await prisma.user.findUnique({
      where: {
        email
      },
      include: {
        predictions: {
          include: {
            match: true
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        {
          error: "Correo o contraseña incorrectos"
        },
        {
          status: 401
        }
      )
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password
    )

    if (!validPassword) {
      return NextResponse.json(
        {
          error: "Correo o contraseña incorrectos"
        },
        {
          status: 401
        }
      )
    }

    const score = calculateUserScore(user.predictions)

    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: score.points
      }
    })

    response.cookies.set(
      "session",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: score.points
      }),
      sessionCookieOptions
    )

    return response

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Error al iniciar sesión"
      },
      {
        status: 500
      }
    )
  }
}