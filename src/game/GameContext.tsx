import {
    createContext,
    useContext,
    useReducer,
    type Dispatch,
    type ReactNode,
} from "react";
import type { GameState } from "./types";
import { createNewGame } from "./createNewGame";
import { gameReducer, type GameAction } from "./gameReducer";

const GameStateContext = createContext<GameState | null>(null);
const GameDispatchContext = createContext<Dispatch<GameAction> | null>(null);

type GameProviderProps = {
    children: ReactNode;
};

export function GameProvider({ children }: GameProviderProps) {
    const [gameState, dispatch] = useReducer(
        gameReducer,
        undefined,
        () => createNewGame(12345),
    );

    return (
        <GameStateContext.Provider value={gameState}>
            <GameDispatchContext.Provider value={dispatch}>
                {children}
            </GameDispatchContext.Provider>
        </GameStateContext.Provider>
    );
}

export function useGameState(): GameState {
    const gameState = useContext(GameStateContext);

    if (gameState === null) {
        throw new Error("useGameState must be used inside GameProvider");
    }

    return gameState;
}

export function useGameDispatch(): Dispatch<GameAction> {
    const dispatch = useContext(GameDispatchContext);

    if (dispatch === null) {
        throw new Error("useGameDispatch must be used inside GameProvider.");
    }

    return dispatch;
}