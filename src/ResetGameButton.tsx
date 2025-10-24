import Button from "./Button";
import { useResetGameHandler } from "./GameProvider";

export default function ResetGameButton({ children }: { children: string }) {
  const resetGameHandler = useResetGameHandler()

  return <Button onClick={resetGameHandler}>{children}</Button>
}