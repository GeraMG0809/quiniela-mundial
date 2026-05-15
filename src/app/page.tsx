export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-6">
      
      <h1 className="text-5xl font-bold text-center">
        Quiniela Mundial 2026
      </h1>

      <p className="text-zinc-400 mt-4 text-center max-w-md">
        Apuesta los resultados de los partidos del día con tus amigos y compite por el primer lugar.
      </p>

      <div className="flex gap-4 mt-8">
        <button className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-xl font-semibold">
          Crear Quiniela
        </button>

        <button className="bg-zinc-800 hover:bg-zinc-700 px-6 py-3 rounded-xl font-semibold">
          Unirse a Quiniela
        </button>
      </div>

    </main>
  )
}