import { NextResponse } from "next/server"

const predictions = [
  { matchId: "Alemania-Corea del Norte", prediction: "2-1" }
]

export async function GET() {
  return NextResponse.json(predictions)
}

export async function POST(request: Request) {
  const body = await request.json()
  const { matchId, prediction } = body

  // buscar si ya existe
  const existingPrediction = predictions.find(
    (item) => item.matchId === matchId
  )

  if (existingPrediction) {
    // actualizar
    existingPrediction.prediction = prediction
  } else {
    // crear nuevo
    predictions.push({
      matchId,
      prediction
    })
  }

  return NextResponse.json({
    message: "Pronóstico guardado",
    predictions
  })
}