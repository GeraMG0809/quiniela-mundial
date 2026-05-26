type LeaderBoardProps ={
    userName: string
    points: number
    exact: number
    matches : number
}


export default function leaderboard({
    userName,
    points,
    exact,
    matches

}:LeaderBoardProps){
    return(
        <div className="bg-amber-600 p-5 rounded-3xl w-full max-w-md border  border-zinc-500">
            
        </div>
    )
}