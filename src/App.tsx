import "./App.css"
import Board from "./Board"
import { GameProvider } from "./GameProvider"
import ResetGameButton from "./ResetGameButton"

export default function App() {
  return (
    <div className="container">
      <GameProvider imageUrls={[
        "https://images.unsplash.com/photo-1626808642875-0aa545482dfb",
        "https://images.unsplash.com/photo-1546842931-886c185b4c8c",
        "https://images.unsplash.com/photo-1520763185298-1b434c919102",
        "https://images.unsplash.com/photo-1442458017215-285b83f65851",
        "https://images.unsplash.com/photo-1496483648148-47c686dc86a8",
        "https://images.unsplash.com/photo-1591181520189-abcb0735c65d",
      ]}>
        <header className="header">
          <h1 className="title">Memory Game</h1>
          <ResetGameButton>Reset</ResetGameButton>
        </header>
        <main>
          <Board />
        </main>
      </GameProvider>
    </div>
  )
}