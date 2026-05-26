export default function Navbar() {
  return (
    <nav className="w-full border-b border-zinc-800 bg-zinc-950 text-white">

      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        <a
          href="/home"
          className="text-2xl font-bold text-green-500"
        >
          QuinielaMX
        </a>

        <div className="flex gap-6 text-sm font-medium">

          <a
            href="/leaderboard"
            className="hover:text-green-400 transition-colors"
          >
            Tabla de posiciones
          </a>

          <a
            href="/predictions"
            className="hover:text-green-400 transition-colors"
          >
            Pronósticos
          </a>

          <a
            href="/results"
            className="hover:text-green-400 transition-colors"
          >
            Resultados anteriores
          </a>

        </div>

      </div>

    </nav>
  )
}