import { useEffect, useRef } from "react";
import { useGameDispatch, useGameState } from "./GameContext";

const TICK_INTERVAL_MS = 250;
const MAX_DELTA_SECONDS = 0.5;

export function GameTicker() {
    const gameState = useGameState();
    const dispatch = useGameDispatch();

    const lastTickTimeRef = useRef<number | null>(null)

    useEffect(() => {
        const activeSurvey = gameState.exploration.activeSurvey;

        if (activeSurvey === null) {
            lastTickTimeRef.current = null;
            return;
        }

        lastTickTimeRef.current = performance.now()

        const intervalId = window.setInterval(() => {
            const now = performance.now();
            const lastTickTime = lastTickTimeRef.current ?? now;

            const deltaSeconds = Math.min(
                (now - lastTickTime) / 1000,
                MAX_DELTA_SECONDS,
            );

            lastTickTimeRef.current = now;

            dispatch({
                type: "advanceGameTime",
                seconds: deltaSeconds,
            });
        }, TICK_INTERVAL_MS);

        return () => {
            window.clearInterval(intervalId);
        };
    }, [dispatch, gameState.exploration.activeSurvey?.systemId]);

    return null;
}