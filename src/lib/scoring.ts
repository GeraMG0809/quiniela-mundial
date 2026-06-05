export type PredictionScore = {
  points: number
  exact: boolean
  correctResult: boolean
}

export function getMatchOutcome(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "HOME"
  if (homeScore < awayScore) return "AWAY"
  return "DRAW"
}

export function calculatePredictionScore(
  predictedHomeScore: number,
  predictedAwayScore: number,
  actualHomeScore: number,
  actualAwayScore: number
): PredictionScore {
  const exact =
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore

  const predictedOutcome = getMatchOutcome(predictedHomeScore, predictedAwayScore)
  const actualOutcome = getMatchOutcome(actualHomeScore, actualAwayScore)

  const correctResult = predictedOutcome === actualOutcome

  const points = exact ? 3 : correctResult ? 1 : 0

  return {
    points,
    exact,
    correctResult
  }
}

export type UserScoreSummary = {
  points: number
  exactCount: number
  correctResultCount: number
  predictionsCount: number
}

export function calculateUserScore(predictions: Array<{
  predictedHomeScore: number
  predictedAwayScore: number
  match: {
    homeScore: number | null
    awayScore: number | null
  }
}>): UserScoreSummary {
  let points = 0
  let exactCount = 0
  let correctResultCount = 0
  let predictionsCount = 0

  for (const prediction of predictions) {
    const actualHomeScore = prediction.match.homeScore
    const actualAwayScore = prediction.match.awayScore

    if (actualHomeScore === null || actualAwayScore === null) {
      continue
    }

    const result = calculatePredictionScore(
      prediction.predictedHomeScore,
      prediction.predictedAwayScore,
      actualHomeScore,
      actualAwayScore
    )

    points += result.points
    predictionsCount += 1

    if (result.exact) {
      exactCount += 1
    }

    if (result.correctResult) {
      correctResultCount += 1
    }
  }

  return {
    points,
    exactCount,
    correctResultCount,
    predictionsCount
  }
}
