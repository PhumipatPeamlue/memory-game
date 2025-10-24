import styles from "./Board.module.css"
import { Card, useCards, useOpenCardHandler } from "./GameProvider"

function ImageCard({ card }: { card: Card }) {
  const openCardHandler = useOpenCardHandler()

  return (
    <div className={styles.card} onClick={() => openCardHandler(card.id)}>
      <div className={`${styles.cover} ${card.isOpened ? styles.invisible : ""}`}></div>
      <img src={card.imageUrl} alt="" className={styles.image} />
    </div>
  )
}

export default function Board() {
  const cards = useCards()

  return (
    <div className={styles.board}>
      {cards.map(card => <ImageCard key={card.id} card={card} />)}
    </div>
  )
}