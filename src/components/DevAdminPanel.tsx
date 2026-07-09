import { PRIMARY_OUTPOSTS, type PrimaryOutpostId } from "../game/config/outposts";
import { useGameDispatch, useGameState } from "../game/GameContext";

const DEV_CLAIM_OUTPOST_IDS: readonly PrimaryOutpostId[] = [
    "survey_array",
    "commerce_hub",
]

export function DevAdminPanel() {
    const gameState = useGameState();
    const dispatch = useGameDispatch();

    const selectedSystem = gameState.selectedSystemId
        ? gameState.map.systemsById[gameState.selectedSystemId]
        : null

    const selectedSystemLabel = 
        selectedSystem === null
            ? "No system selected"
            : `${selectedSystem.name} (${selectedSystem.explorationState})`;

    const canUseSelectedSystem = selectedSystem !== null && !selectedSystem.isHome;

    function addResources(credits: number, science: number) {
        dispatch({
            type: "devAddResources",
            credits,
            science,
        });
    }

    function surveySelectedSystem() {
        if (selectedSystem === null) {
            return;
        }

        dispatch({
            type: "devSurveySystem",
            systemId: selectedSystem.id
        });
    }

    function claimSelectedSystem(outpostId: PrimaryOutpostId) {
        if (selectedSystem === null) {
            return;
        }

        dispatch({
            type: "devClaimWithOutpost",
            systemId: selectedSystem.id,
            outpostId,
        });
    }

    return (
        <section className="dev-admin-panel" aria-label="Dev admin panel">
            <div className="dev-admin-header">
                <h2>Dev Tools</h2>
                <span>DEV only</span>
            </div>

            <p className="dev-admin-selected">{selectedSystemLabel}</p>"

            <div className="dev-admin-grid">
                <button type="button" onClick={() => addResources(100, 0)}>
                    +100 Credits
                </button>

                <button type="button" onClick={() => addResources(1000, 0)}>
                    +1000 Credits
                </button>

                <button type="button" onClick={() => addResources(0, 100)}>
                    +100 Science
                </button>

                <button type="button" onClick={() => addResources(0, 1000)}>
                    +1000 Science
                </button>
            </div>

            <div className="dev-admin-actions">
                <button
                    type="button"
                    disabled={!canUseSelectedSystem}
                    onClick={surveySelectedSystem}
                >
                    Survey Selected
                </button>

                <button
                    type="button"
                    onClick={() => dispatch({ type: "devDetectAllSystems"})}
                >
                    Detect All Systems
                </button>

                {DEV_CLAIM_OUTPOST_IDS.map((outpostId) => (
                    <button
                        key={outpostId}
                        type="button"
                        disabled={!canUseSelectedSystem}
                        onClick={() => claimSelectedSystem(outpostId)}
                    >
                        Claim with {PRIMARY_OUTPOSTS[outpostId].name}
                    </button>
                ))}
            </div>
        </section>
    )
}