"use client"

import { useState } from "react"

export default function Counter() {

  const [count, setCount] = useState(0)

  return (
    <div className="bg-zinc-900 p-6 rounded-2xl w-fit mt-10">

      <h2 className="text-2xl font-bold mb-4">
        Contador: {count}
      </h2>

      <button
        onClick={() => setCount(count + 1)}
        className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-xl font-semibold"
      >
        Incrementar
      </button>

    </div>
  )
}