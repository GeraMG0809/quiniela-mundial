import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const {
      name,
      email,
      password
    } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "El correo ya está registrado" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Error al registrar usuario" },
      { status: 500 }
    )
  }
}