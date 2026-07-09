import {
    RESEARCH_PROJECTS,
    RESEARCH_PROJECT_IDS,
    type ResearchProjectId,
} from "../game/config/research";
import type { ResearchState } from "../game/types";
import { formatDuration } from "../game/utils/formatDuration";

type ResearchPanelProps = {
    research: ResearchState;
    startableProjectIds: ResearchProjectId[];
    science: number;
    researchSpeedPerSecond: number;
    onStartResearch: (projectId: ResearchProjectId) => void;
};

export function ResearchPanel({
    research,
    startableProjectIds,
    science,
    researchSpeedPerSecond,
    onStartResearch,
}: ResearchPanelProps) {
    const activeProject =
        research.activeProjectId !== null
            ? RESEARCH_PROJECTS[research.activeProjectId]
            : null;

    const activeResearchSecondsRemaining =
        activeProject !== null &&
        researchSpeedPerSecond > 0 &&
        research.activeProjectId !== null
            ? (activeProject.scienceCost -
                    research.projectsById[research.activeProjectId].progress) /
                researchSpeedPerSecond
            : null;

    const activeResearchEtaLabel =
        activeResearchSecondsRemaining !== null
            ? formatDuration(activeResearchSecondsRemaining)
            : "No active research";



    return (
        <div className="research-panel">
            <p className="research-summary">
                Science available: <strong>{science.toFixed(1)}</strong>
                {" . "}
                Research speed:{" "}
                <strong>{researchSpeedPerSecond.toFixed(2)}/sec</strong>
            </p>"

            {activeProject === null ? (
                <p className="panel-note">No active research.</p>
            ) : (
                <div>
                    <p className="panel-note">
                        Active: <strong>{activeProject.name}</strong>
                    </p>
                    <p className="panel-note">
                        ETA: {activeResearchEtaLabel}
                    </p>
                </div>
            )}

            <div className="research-project-list">
                {RESEARCH_PROJECT_IDS.map((projectId) => {
                    const project = RESEARCH_PROJECTS[projectId];
                    const projectState = research.projectsById[projectId]

                    const progressPercent = Math.round(
                        (projectState.progress / project.scienceCost) * 100,
                    );

                    const isActive = research.activeProjectId === projectId;
                    const canStart = startableProjectIds.includes(projectId);

                    return (
                        <div key={projectId} className="research-project-card">
                            <div className="research-project-header">
                                <h3>{project.name}</h3>
                                <span>{projectState.isCompleted ? "Done" : `${progressPercent}%`}</span>
                            </div>

                            <p>{project.description}</p>

                            <div className="survey-progress-bar">
                                <div
                                    className="survey-progress-fill"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>

                            <button
                                className="secondary-action-button"
                                type="button"
                                disabled={projectState.isCompleted || !canStart || isActive}
                                onClick={() => onStartResearch(projectId)}
                            >
                                {projectState.isCompleted
                                    ? "Completed"
                                    : isActive
                                        ? "Researching"
                                        : canStart
                                            ? "Start Research"
                                            : "Locked"}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}