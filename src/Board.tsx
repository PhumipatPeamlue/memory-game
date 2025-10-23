import styles from "./Board.module.css"
import { useCardsContext, useOpenCardHandlerContext } from "./GameProvider"

function Card({ id, imageURL, isOpened }: { id: number, imageURL: string, isOpened: boolean }) {
  const openCardHandler = useOpenCardHandlerContext()

  return (
    <div className={styles.card} onClick={() => openCardHandler(id)}>
      <div className={`${styles.cover} ${isOpened ? styles.invisible : ""}`}></div>
      <img src={imageURL} alt="" className={styles.image} />
    </div>
  )
}

export default function Board() {
  const cards = useCardsContext()

  return (
    <div className={styles.board}>
      {cards.map(card => <Card key={card.id} {...card} />)}
    </div>
  )
}