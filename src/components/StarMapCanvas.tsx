import { useEffect, useRef, useState } from "react";
import { Application, Circle, Container, Graphics } from "pixi.js";
import type {
    StarMapState,
    StarSystem,
    StarSystemId,
    StarVisual,
} from "../game/types";
import { axialToPixel, getHexCornerPoints } from "../game/map/hexLayout";
import type { PrimaryOutpostId } from "../game/config/outposts";

type StarMapCanvasProps = {
    map: StarMapState;
    selectedSystemId: StarSystemId | null;
    onSelectSystem: (systemId: StarSystemId) => void;
};

const STAR_COLORS: Record<StarVisual, number> = {
    yellow: 0xffdf7a,
    red: 0xff6b6b,
    blue: 0x7ab7ff,
    white: 0xf4f7ff,
    orange: 0xffa24c,
};

const OUTPOST_MARKER_COLORS: Record<PrimaryOutpostId, number> = {
    survey_array: 0x72e0ff,
    commerce_hub: 0xffd36e,
    science_station: 0xb48cff,
    power_relay: 0x9cffb1,
    extraction_rig: 0xff9f6e,
};

export function StarMapCanvas({
    map,
    selectedSystemId,
    onSelectSystem,
}: StarMapCanvasProps) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const appRef = useRef<Application | null>(null);
    const mapLayerRef = useRef<Container | null>(null);
    const [isPixiReady, setIsPixiReady] = useState(false);

    useEffect(() => {
        const hostElement = hostRef.current;

        if (!hostElement) {
            return;
        }

        let isCancelled = false;

        const app = new Application();
        const mapLayer = new Container();

        async function startPixi() {
            if (!hostElement) {
                return;
            }

            await app.init({
                resizeTo: hostElement,
                backgroundAlpha: 0,
                antialias: true,
            });

            if (isCancelled) {
                app.destroy();
                return;
            }

            hostElement.appendChild(app.canvas);

            app.stage.addChild(mapLayer);

            appRef.current = app;
            mapLayerRef.current = mapLayer;

            setIsPixiReady(true);
        }

        void startPixi();

        return () => {
            isCancelled = true;
            setIsPixiReady(false);

            // If the app finished initializing it's stored on the ref — destroy that instance.
            if (appRef.current) {
                appRef.current.destroy();
                appRef.current = null;
            } else {
                // Init didn't complete; attempt a safe destroy but swallow errors from incomplete setup.
                try {
                    app.destroy();
                } catch {
                    // ignore — destroy may fail if internal handlers weren't set up yet
                }
            }

            mapLayerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const app = appRef.current;
        const mapLayer = mapLayerRef.current;

        if (!isPixiReady || !app || !mapLayer) {
            return;
        }

        drawStarMap({
            app,
            mapLayer,
            map,
            selectedSystemId,
            onSelectSystem,
        });
    }, [isPixiReady, map, selectedSystemId, onSelectSystem]);

    return <div ref={hostRef} className="star-map-canvas" />;
}

type DrawStarMapOptions = {
    app: Application;
    mapLayer: Container;
    map: StarMapState;
    selectedSystemId: StarSystemId | null;
    onSelectSystem: (systemId: StarSystemId) => void;
};

function drawStarMap({
    app,
    mapLayer,
    map,
    selectedSystemId,
    onSelectSystem,
}: DrawStarMapOptions) {
    mapLayer.removeChildren();

    const centerX = app.screen.width / 2;
    const centerY = app.screen.height / 2;
    const hexPoints = getHexCornerPoints();

    for (const systemId of map.systemIds) {
        const system = map.systemsById[systemId];
        const pixel = axialToPixel(system.coord);

        const systemContainer = new Container();

        systemContainer.x = centerX + pixel.x;
        systemContainer.y = centerY + pixel.y;
        systemContainer.eventMode = "static";
        systemContainer.cursor = "pointer";
        systemContainer.hitArea = new Circle(0, 0, 28);

        systemContainer.on("pointertap", () => {
            onSelectSystem(system.id);
        });

        drawSystemHex(systemContainer, hexPoints, system, selectedSystemId);
        drawSystemStar(systemContainer, system, selectedSystemId);

        mapLayer.addChild(systemContainer);
    }
}

function drawSystemHex(
    container: Container,
    hexPoints: number[],
    system: StarSystem,
    selectedSystemId: StarSystemId | null,
) {
    const isSelected = system.id === selectedSystemId;
    const isUnknown = system.explorationState === "unknown";

    const hex = new Graphics();

    hex
        .poly(hexPoints)
        .stroke({
            color: isSelected ? 0x72e0ff : 0x2d3a52,
            width: isSelected ? 3 : 1,
            alpha: isUnknown ? 0.35 : 0.8,
        });

    container.addChild(hex);
}

function drawSystemStar(
    container: Container,
    system: StarSystem,
    selectedSystemId: StarSystemId | null,
) {
    const isSelected = system.id === selectedSystemId;
    const isUnknown = system.explorationState === "unknown";
    const starColor = STAR_COLORS[system.starVisual];

    if (isSelected) {
        const selectionRing = new Graphics();

        selectionRing.circle(0, 0, 17).stroke({
            color: 0x72e0ff,
            width: 2,
            alpha: 0.95,
        });

        container.addChild(selectionRing);
    }

    const star = new Graphics();

    star.circle(0, 0, system.isHome ? 8 : 6).fill({
        color: isUnknown ? 0x1a2233 : starColor,
        alpha: isUnknown ? 0.5 : 1,
    });

    container.addChild(star);

    if (system.claimState === "claimed") {
        const claimedRing = new Graphics();

        claimedRing.circle(0, 0, 12).stroke({
            color: 0x9cffb1,
            width: 2,
            alpha: 0.9,
        });

        container.addChild(claimedRing);
        drawClaimedOutpostMarker(container, system);
    }

    if (system.hasGradCommand) {
        const gradMarker = new Graphics();

        gradMarker.rect(-3, -18, 6, 6).fill({
            color: 0x9cffb1,
            alpha: 1,
        });

        container.addChild(gradMarker);
    }
}

function drawClaimedOutpostMarker(container: Container, system: StarSystem) {
    if (system.primaryOutpostId === null) {
        return;
    }

    const markerColor = OUTPOST_MARKER_COLORS[system.primaryOutpostId];
    const marker = new Graphics();
    const markerY = 18;

    marker.circle(0, markerY, 6).fill({
        color: 0x07111f,
        alpha: 0.92,
    });

    marker.circle(0, markerY, 6).stroke({
        color: markerColor,
        width: 1.5,
        alpha: 0.95,
    });

    switch (system.primaryOutpostId) {
        case "survey_array": {
            marker.moveTo(-3, markerY + 2);
            marker.lineTo(0, markerY - 3);
            marker.lineTo(3, markerY + 2);
            marker.stroke({
                color: markerColor,
                width: 1.75,
                alpha: 1,
            });
            break;
        }

        case "commerce_hub": {
            marker.circle(0, markerY, 2.75).fill({
                color: markerColor,
                alpha: 1,
            });
            break;
        }

        case "science_station": {
            marker
                .poly([
                    0,
                    markerY - 3.25,
                    3.25,
                    markerY + 2.75,
                    -3.25,
                    markerY + 2.75,
                ])
                .fill({
                    color: markerColor,
                    alpha: 1,
                });
            break;
        }

        case "power_relay": {
            marker
                .poly([
                    0,
                    markerY - 4,
                    3.5,
                    markerY,
                    0,
                    markerY + 4,
                    -3.5,
                    markerY,
                ])
                .fill({
                    color: markerColor,
                    alpha: 1,
                });
            break;
        }

        case "extraction_rig": {
            marker.rect(-3, markerY - 3, 6, 6).fill({
                color: markerColor,
                alpha: 1,
            });
            break;
        }
    }

    container.addChild(marker);
}