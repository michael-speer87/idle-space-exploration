import { useEffect, useRef } from "react";
import { useGameDispatch, useGameState } from "./GameContext";
import { calculateRates } from "./systems/rateSystem";

const TICK_INTERVAL_MS = 250;
const MAX_DELTA_SECONDS = 0.5;

export function GameTicker() {
    const gameState = useGameState();
    const dispatch = useGameDispatch();

    const lastTickTimeRef = useRef<number | null>(null);

    const hasActiveSurvey = gameState.exploration.activeSurvey !== null;
    const hasActiveResearch = gameState.research.activeProjectId !== null;
    const rates = calculateRates(gameState);

    const hasActiveProduction =
        rates.creditsPerSecond > 0 || rates.sciencePerSecond > 0;
    
    const shouldTick = hasActiveSurvey || hasActiveProduction || hasActiveResearch;

    useEffect(() => {
        if (!shouldTick) {
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
    }, [dispatch, shouldTick]);

    return null;
}