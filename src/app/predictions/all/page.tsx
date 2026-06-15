import Navbar from "@/components/NavBar"
import AllPredictionsDashboard from "@/components/AllPredictionsDashboard"

export default function AllPredictionsPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#3CAC3B]">
              Quiniela Mundial 2026
            </p>
            <h1 className="mt-3 text-4xl font-bold tracking-tight">
              Predicciones de todos
            </h1>
            <p className="mt-2 max-w-2xl text-zinc-400">
              Pronosticos guardados por partido y participante.
            </p>
          </div>
        </div>

        <AllPredictionsDashboard />
      </div>
    </main>
  )
}
