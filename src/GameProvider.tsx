import _ from "lodash"
import { createContext, useContext, useEffect, useReducer, type JSX } from "react"

export class Card {
  readonly id: string
  readonly imageUrl: string
  private _isOpened: boolean

  constructor(id: string, imageUrl: string) {
    this.id = id
    this.imageUrl = imageUrl
    this._isOpened = false
  }

  get isOpened(): boolean {
    return this._isOpened
  }

  open(): void {
    this._isOpened = true
  }

  close(): void {
    this._isOpened = false
  }

  clone(): Card {
    const copy = new Card(this.id, this.imageUrl)
    
    if (this.isOpened) {
      copy.open()
    } else {
      copy.close()
    }

    return copy
  }

  isMatch(anotherCard: Card): boolean {
    return this.imageUrl === anotherCard.imageUrl
  }
}

class CardIdMemorizer {
  static size: number = 2
  private storage: string[] = []

  constructor(...ids: string[]) {
    if (ids.length > CardIdMemorizer.size) {
      throw new Error("ids's size is too large")
    }
    this.storage = ids
  }

  get isFull(): boolean {
    return this.storage.length >= CardIdMemorizer.size
  }

  memorize(id: string): void {
    if (this.isFull) {
      return
    }

    this.storage.push(id)
  }

  getCards(cards: Card[]): [Card, Card] {
    const cardIds = cards.map(card => card.id)
    this.storage.forEach(id => {
      if (!cardIds.includes(id)) {
        throw new Error("storaged id was not included in the state")
      }
    })

    const res = cards.filter(card => this.storage.includes(card.id))

    return [res[0], res[1]]
  }

  clone(): CardIdMemorizer {
    return new CardIdMemorizer(...this.storage)
  }
}

type Event =
  | "COMPARE_CARDS"
  | "RESET_GAME"
  | null

// useGame Hook
type State = {
  cards: Card[],
  cardIdMemo: CardIdMemorizer,
  event: Event,
  isFirstRound: boolean,
}

function newInitialState(imageUrls: string[]): State {
  imageUrls = _.shuffle([...imageUrls, ...imageUrls])
  const cards = imageUrls.map((url, i) => new Card(i.toString(), url))
  return {
    cards,
    cardIdMemo: new CardIdMemorizer(),
    event: null,
    isFirstRound: true,
  }
}

type Action =
  | { type: "OPEN_CARD", id: string }
  | { type: "COMPARE_CARDS" }
  | { type: "RESET_GAME", imageUrls: string[] }

function openCard(state: State, targetId: string): State {
  const cards = state.cards.map(card => {
    const clone = card.clone()
    if (clone.id === targetId) {
      clone.open()
    }
    return clone
  })

  const cardIdMemo = state.cardIdMemo.clone()
  cardIdMemo.memorize(targetId)

  const event = cardIdMemo.isFull ? "COMPARE_CARDS" : null

  return {
    cards,
    cardIdMemo,
    event,
    isFirstRound: false,
  }
}

function compareCards(state: State): State {
  const cards = state.cards.map(card => card.clone())
  const [card1, card2] = state.cardIdMemo.getCards(cards)
  if (!card1.isMatch(card2)) {
    card1.close()
    card2.close()
  }

  const event = cards.every(card => card.isOpened) ? "RESET_GAME" : null

  return {
    cards,
    cardIdMemo: new CardIdMemorizer(),
    event,
    isFirstRound: false,
  }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "OPEN_CARD":
      return openCard(state, action.id)
    case "COMPARE_CARDS":
      return compareCards(state)
    case "RESET_GAME":
      return newInitialState(action.imageUrls)
    default:
      throw new Error(`unknown '${action}' action`)
  }
}

function useGame(imageUrls: string[]): [State, React.ActionDispatch<[action: Action]>] {
  const [state, dispatch] = useReducer(reducer, newInitialState(imageUrls))

  const compareCardsHandler = (): () => void => {
    const id = setTimeout(() => dispatch({ type: "COMPARE_CARDS" }), 500)
    return () => clearTimeout(id)
  }

  const resetGameHandler = (): () => void => {
    const id = setTimeout(() => dispatch({ type: "RESET_GAME", imageUrls }), 1000)
    return () => clearTimeout(id)
  }

  useEffect(() => {
    switch (state.event) {
      case "COMPARE_CARDS": {
        let cleanupfn = compareCardsHandler()
        return cleanupfn
      }
      case "RESET_GAME": {
        let cleanupfn = resetGameHandler()
        return cleanupfn
      }
    }
  }, [state.event])

  return [state, dispatch]
}

// Contexts
function newUseContextError(hookName: string, componentName: string): Error {
  return new Error(`${hookName} hook requires to use in ${componentName} component or ${componentName} component's value is not setted properly`)
}

const CardsContext = createContext<Card[] | null>(null)

export function useCards(): Card[] {
  const cards = useContext(CardsContext)
  if (cards === null) {
    throw newUseContextError("useCards", "CardsContext")
  }
  return cards
}

const OpenCardHandlerContext = createContext<((id: string) => void) | null>(null)

export function useOpenCardHandler(): (id: string) => void {
  const handler = useContext(OpenCardHandlerContext)
  if (handler === null) {
    throw newUseContextError("useOpenCardHandler", "OpenCardHandlerContext")
  }
  return handler
}

const ResetGameHandlerContext = createContext<(() => void) | null>(null)

export function useResetGameHandler(): () => void {
  const handler = useContext(ResetGameHandlerContext)
  if (handler === null) {
    throw newUseContextError("useResetGameHandler", "ResetGameHandlerContext")
  }
  return handler
}

const IsResetEventContext = createContext<boolean | null>(null)

export function useIsResetEvent(): boolean {
  const isResetEvent = useContext(IsResetEventContext)
  if (isResetEvent === null) {
    throw newUseContextError("useIsResetEvent", "IsResetEventContext")
  }
  return isResetEvent
}

const IsFirstRoundContext = createContext<boolean | null>(null)

export function useIsFirstRound(): boolean {
  const isFirstRound = useContext(IsFirstRoundContext)
  if (isFirstRound === null) {
    throw newUseContextError("useIsFirstRound", "IsFirstRoundContext")
  }
  return isFirstRound
}

// Provider Component
export function GameProvider({ children, imageUrls }: { children: JSX.Element | JSX.Element[], imageUrls: string[] }) {
  const [game, dispatch] = useGame(imageUrls)

  function newOpenCardHandler(): (id: string) => void {
    switch (game.event) {
      case "COMPARE_CARDS":
      case "RESET_GAME":
        return () => { }
      default:
        return (id: string): void => dispatch({ type: "OPEN_CARD", id })
    }
  }

  function newResetGameHandler(): () => void {
    switch (game.event) {
      case "COMPARE_CARDS":
      case "RESET_GAME":
        return () => { }
      default:
        return (): void => dispatch({ type: "RESET_GAME", imageUrls })
    }
  }

  const isResetEvent = game.event === "RESET_GAME"

  return (
    <CardsContext value={game.cards}>
      <OpenCardHandlerContext value={newOpenCardHandler()}>
        <ResetGameHandlerContext value={newResetGameHandler()}>
          <IsResetEventContext value={isResetEvent}>
            <IsFirstRoundContext value={game.isFirstRound}>
              {children}
            </IsFirstRoundContext>
          </IsResetEventContext>
        </ResetGameHandlerContext>
      </OpenCardHandlerContext>
    </CardsContext>
  )
}