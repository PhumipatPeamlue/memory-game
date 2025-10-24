import styles from "./Button.module.css"

export default function Button({ children = "", onClick = undefined }: { children: string, onClick: (() => void) | undefined }) {
  return <button onClick={onClick} className={styles.button}>{children}</button>
}