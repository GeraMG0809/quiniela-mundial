import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  // Usuario demo
  const user = await prisma.user.upsert({
    where: {
      email: "demo@quiniela.com"
    },
    update: {},
    create: {
      name: "Usuario Demo",
      email: "demo@quiniela.com",
      password: "123456"
    }
  })

  console.log("Usuario creado:", user)

  // Partidos demo
  const matches = [
    {
      homeTeam: "Alemania",
      awayTeam: "Corea del Norte",
      venue: "Estadio Azteca",
      matchDate: new Date("2026-06-15T18:00:00")
    },
    {
      homeTeam: "Argentina",
      awayTeam: "Francia",
      venue: "Estadio BBVA",
      matchDate: new Date("2026-06-16T20:00:00")
    },
    {
      homeTeam: "Japón",
      awayTeam: "España",
      venue: "Akron Stadium",
      matchDate: new Date("2026-06-17T22:00:00")
    }
  ]

  for (const match of matches) {

    await prisma.match.create({
      data: match
    })
  }

  console.log("Partidos creados")
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })