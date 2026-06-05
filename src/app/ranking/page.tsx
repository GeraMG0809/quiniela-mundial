import Navbar from "@/components/NavBar"
import RankingDashboard from "@/components/RankingDashboard"

export default function RankingPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">Ranking de la quiniela</h1>
          <p className="mt-2 text-zinc-400">
            Revisa cómo va cada usuario según sus pronósticos exactos y resultados acertados.
          </p>
        </div>

        <RankingDashboard />
      </div>
    </main>
  )
}
