import _ from "lodash"
import { createContext, useContext, useEffect, useReducer, type JSX } from "react"

const numberCardsInComparasion = 2

type Card = {
  id: number,
  imageURL: string,
  isOpened: boolean,
  isTemporarilyOpened: boolean,
}

type Turn =
  | "CARD_SELECTION"
  | "CARDS_COMPARISON"
  | null

type State = {
  cards: Card[],
  turn: Turn,
}

function newInitialState(images: string[]): State {
  images = _.shuffle([...images, ...images])
  const cards = images.map((image, i) => ({ id: i, imageURL: image, isOpened: false, isTemporarilyOpened: false }))
  return {
    cards,
    turn: "CARD_SELECTION",
  }
}

type Action =
  | { type: "OPEN_CARD", id: number }
  | { type: "COMPARE_CARDS" }
  | { type: "RESET_GAME", images: string[] }


function openCard(state: State, targetID: number): State {
  const updatedCards = state.cards.map(card => {
    if (card.id === targetID) {
      return { ...card, isOpened: true, isTemporarilyOpened: true }
    }
    return card
  })

  const readyToCompare = updatedCards.filter(card => card.isTemporarilyOpened).length === numberCardsInComparasion
  const nextTurn = readyToCompare ? "CARDS_COMPARISON" : "CARD_SELECTION"

  return {
    cards: updatedCards,
    turn: nextTurn,
  }
}

function compareCards(state: State): State {
  const updatedCards = state.cards.map(card => ({ ...card }))
  const targetCards = updatedCards.filter(card => card.isTemporarilyOpened)
  if (targetCards.length !== numberCardsInComparasion) {
    throw new Error("requires two temporaily opened cards for comparison")
  }

  const [card1, card2] = targetCards
  if (card1.imageURL !== card2.imageURL) {
    targetCards.forEach(card => card.isOpened = false)
  }

  targetCards.forEach(card => card.isTemporarilyOpened = false)

  const allCardsOpened = updatedCards.every(card => card.isOpened)
  const nextTurn = allCardsOpened ? null : "CARD_SELECTION"

  return {
    cards: updatedCards,
    turn: nextTurn,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_CARD":
      return openCard(state, action.id)
    case "COMPARE_CARDS":
      return compareCards(state)
    case "RESET_GAME":
      return newInitialState(action.images)
    default:
      throw new Error(`unknown '${action}' action`)
  }
}

function useGame(images: string[]): [State, React.ActionDispatch<[action: Action]>] {
  const [state, dispatch] = useReducer(reducer, newInitialState(images))

  useEffect(() => {
    let id: number

    switch (state.turn) {
      case null:
        id = setTimeout(() => {
          alert("congratulation!")
          dispatch({ type: "RESET_GAME", images: images })
        }, 1000)
        return () => clearTimeout(id)

      case "CARDS_COMPARISON":
        id = setTimeout(() => dispatch({ type: "COMPARE_CARDS" }), 500)
        return () => clearTimeout(id)
    }
  }, [state.turn])

  return [state, dispatch]
}

function newUseContextError(hookName: string, componentName: string): Error {
  return new Error(`${hookName} hook requires to use in ${componentName} component or ${componentName} component's value is not setted properly`)
}

const CardsContext = createContext<Card[] | null>(null)

export function useCardsContext(): Card[] {
  const cards = useContext(CardsContext)
  if (cards === null) {
    throw newUseContextError("useCardsContext", "CardsContext")
  }
  return cards
}

const IsEndingContext = createContext<boolean | null>(null)

export function useIsEndingContext(): boolean {
  const isEnding = useContext(IsEndingContext)
  if (isEnding === null) {
    throw newUseContextError("useIsEndingContext", "IsEndingContext")
  }
  return isEnding
}

const OpenCardHandlerContext = createContext<((id: number) => void) | null>(null)

export function useOpenCardHandlerContext(): (id: number) => void {
  const handler = useContext(OpenCardHandlerContext)
  if (handler === null) {
    throw newUseContextError("useOpenCardHandlerContext", "OpenCardHandlerContext")
  }
  return handler
}

const ResetGameHandlerContext = createContext<(() => void) | null>(null)

export function useResetGameHandlerContext(): () => void {
  const handler = useContext(ResetGameHandlerContext)
  if (handler === null) {
    throw newUseContextError("useResetGameHandlerContext", "ResetGameHandlerContext")
  }
  return handler
}

export function GameProvider({ children, images }: { children: JSX.Element | JSX.Element[], images: string[] }) {
  const [game, dispatch] = useGame(images)

  const isEnding = game.turn === null

  let openCardHandler: (id: number) => void
  let resetGameHandler: () => void
  switch (game.turn) {
    case "CARD_SELECTION":
      openCardHandler = (id: number): void => dispatch({ type: "OPEN_CARD", id })
      resetGameHandler = (): void => dispatch({ type: "RESET_GAME", images })
      break
    default:
      openCardHandler = (_: number): void => {}
      resetGameHandler = (): void => {}
      break
  }

  return (
    <CardsContext value={game.cards}>
      <IsEndingContext value={isEnding}>
        <OpenCardHandlerContext value={openCardHandler}>
          <ResetGameHandlerContext value={resetGameHandler}>
            {children}
          </ResetGameHandlerContext>
        </OpenCardHandlerContext>
      </IsEndingContext>
    </CardsContext>
  )
}