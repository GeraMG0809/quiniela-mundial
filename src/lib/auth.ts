import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export type SessionUser = {
  id: string
  name: string
  email: string
  role: string
  points: number
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
}

export async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get("session")

  if (!session?.value) {
    return null
  }

  try {
    return JSON.parse(session.value) as SessionUser
  } catch (error) {
    console.error("Error parsing session cookie:", error)
    return null
  }
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set("session", "", {
    ...sessionCookieOptions,
    expires: new Date(0),
    maxAge: undefined,
  })
}
