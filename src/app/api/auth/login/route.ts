import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

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

    const response = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      points: user.points
    })

    response.cookies.set(
      "session",
      JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }),
      {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7
      }
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