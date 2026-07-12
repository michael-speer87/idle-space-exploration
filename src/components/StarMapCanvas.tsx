import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
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

export type StarMapCameraHandle = {
    zoomIn: () => void;
    zoomOut: () => void;
    center: () => void;
}

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

const MIN_MAP_SCALE = 0.55;
const MAX_MAP_SCALE = 2.25;
const MAP_ZOOM_SENSITIVITY = 0.0015;
const MAP_ZOOM_STEP = 1.2;

export const StarMapCanvas = forwardRef<
    StarMapCameraHandle,
    StarMapCanvasProps
>(function StarMapCanvas(
    {
        map,
        selectedSystemId,
        onSelectSystem,
    },
    ref,
) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const appRef = useRef<Application | null>(null);
    const mapLayerRef = useRef<Container | null>(null);
    const cameraLayerRef = useRef<Container | null>(null);

    const interactionStateRef = useRef<MapInteractionState>({
        suppressSelection: false,
    });

    const [isPixiReady, setIsPixiReady] = useState(false);

    useImperativeHandle(
        ref,
        () => ({
            zoomIn() {
                zoomFromViewportCenter(
                    appRef.current,
                    cameraLayerRef.current,
                    MAP_ZOOM_STEP,
                );
            },

            zoomOut() {
                zoomFromViewportCenter(
                    appRef.current,
                    cameraLayerRef.current,
                    1 / MAP_ZOOM_STEP,
                );
            },

            center() {
                const app = appRef.current;
                const cameraLayer = cameraLayerRef.current;

                if (app === null || cameraLayer === null) {
                    return;
                }

                cameraLayer.scale.set(1);

                cameraLayer.position.set(
                    app.screen.width / 2,
                    app.screen.height / 2,
                );
            },
        }),
        [],
    );

    useEffect(() => {
        const hostElement = hostRef.current;

        if (!hostElement) {
            return;
        }

        let isCancelled = false;

        const app = new Application();
        const cameraLayer = new Container();
        const mapLayer = new Container();

        cameraLayer.addChild(mapLayer);

        let removePanListeners: (() => void) | null = null;
        let removeZoomListener: (() => void) | null = null;

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

            app.stage.addChild(cameraLayer);

            cameraLayer.position.set(
                app.screen.width / 2,
                app.screen.height / 2,
            );

            removePanListeners = installMapPanning(
                app.canvas,
                cameraLayer,
                interactionStateRef.current,
            );

            removeZoomListener = installMapZoom(
                app,
                cameraLayer,
            );

            appRef.current = app;
            cameraLayerRef.current = cameraLayer
            mapLayerRef.current = mapLayer

            setIsPixiReady(true);
        }

        void startPixi();

        return () => {
            isCancelled = true;
            setIsPixiReady(false);

            removePanListeners?.();
            removeZoomListener?.();

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
            cameraLayerRef.current = null;
        };
    }, []);

    useEffect(() => {
        const app = appRef.current;
        const mapLayer = mapLayerRef.current;

        if (!isPixiReady || !app || !mapLayer) {
            return;
        }

        drawStarMap({
            mapLayer,
            map,
            selectedSystemId,
            onSelectSystem,
            canSelectSystem: () => !interactionStateRef.current.suppressSelection,
        });
    }, [isPixiReady, map, selectedSystemId, onSelectSystem]);

    return <div ref={hostRef} className="star-map-canvas" />;
});

type MapInteractionState = {
    suppressSelection: boolean;
};

function installMapPanning(
    canvas: HTMLCanvasElement,
    cameraLayer: Container,
    interactionState: MapInteractionState,
): () => void {
    let activePointerId: number | null = null;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let totalMovement = 0;
    let selectionReleaseTimer: number | null = null;

    function handlePointerDown(event: PointerEvent) {
        const isUnsupportedMouseButton =
            event.pointerType === "mouse" && event.button !== 0;

        if (
            !event.isPrimary ||
            isUnsupportedMouseButton ||
            activePointerId !== null
        ) {
            return;
        }

        event.preventDefault();

        activePointerId = event.pointerId;
        lastPointerX = event.clientX;
        lastPointerY = event.clientY;
        totalMovement = 0;

        interactionState.suppressSelection = false;

        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = "grabbing";
    }

    function handlePointerMove(event: PointerEvent) {
        if (event.pointerId !== activePointerId) {
            return;
        }

        event.preventDefault();

        const deltaX = event.clientX - lastPointerX;
        const deltaY = event.clientY - lastPointerY;

        lastPointerX = event.clientX;
        lastPointerY = event.clientY;

        cameraLayer.x += deltaX;
        cameraLayer.y += deltaY;

        totalMovement += Math.hypot(deltaX, deltaY);

        if (totalMovement >= 6) {
            interactionState.suppressSelection = true;
        }
    }

    function handlePointerEnd(event: PointerEvent) {
        if (event.pointerId !== activePointerId) {
            return;
        }

        if (canvas.hasPointerCapture(event.pointerId)) {
            canvas.releasePointerCapture(event.pointerId);
        }

        activePointerId = null;
        canvas.style.cursor = "grab";

        if (!interactionState.suppressSelection) {
            return;
        }

        if (selectionReleaseTimer !== null) {
            window.clearTimeout(selectionReleaseTimer);
        }

        selectionReleaseTimer = window.setTimeout(() => {
            interactionState.suppressSelection = false;
            selectionReleaseTimer = null;
        }, 0);
    }

    canvas.style.cursor = "grab";
    canvas.style.touchAction = "none";
    canvas.style.userSelect = "none";

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerup", handlePointerEnd);
    canvas.addEventListener("pointercancel", handlePointerEnd);
    canvas.addEventListener("lostpointercapture", handlePointerEnd);

    return () => {
        canvas.removeEventListener("pointerdown", handlePointerDown);
        canvas.removeEventListener("pointermove", handlePointerMove);
        canvas.removeEventListener("pointerup", handlePointerEnd);
        canvas.removeEventListener("pointercancel", handlePointerEnd);
        canvas.removeEventListener(
            "lostpointercapture",
            handlePointerEnd,
        );

        if (selectionReleaseTimer !== null) {
            window.clearTimeout(selectionReleaseTimer);
        }
    };
}

function zoomFromViewportCenter(
  app: Application | null,
  cameraLayer: Container | null,
  zoomFactor: number,
): void {
  if (app === null || cameraLayer === null) {
    return;
  }

  const nextScale = clamp(
    cameraLayer.scale.x * zoomFactor,
    MIN_MAP_SCALE,
    MAX_MAP_SCALE,
  );

  zoomCameraAtPoint(
    cameraLayer,
    nextScale,
    app.screen.width / 2,
    app.screen.height / 2,
  );
}

function zoomCameraAtPoint(
  cameraLayer: Container,
  nextScale: number,
  anchorX: number,
  anchorY: number,
): void {
  const currentScale = cameraLayer.scale.x;

  if (nextScale === currentScale) {
    return;
  }

  const mapPointX =
    (anchorX - cameraLayer.x) / currentScale;

  const mapPointY =
    (anchorY - cameraLayer.y) / currentScale;

  cameraLayer.scale.set(nextScale);

  cameraLayer.position.set(
    anchorX - mapPointX * nextScale,
    anchorY - mapPointY * nextScale,
  );
}

function installMapZoom(
    app: Application,
    cameraLayer: Container,
): () => void {
    const canvas = app.canvas;

    function handleWheel(event: WheelEvent) {
        event.preventDefault();

        const canvasRect = canvas.getBoundingClientRect();

        if (canvasRect.width <= 0 || canvasRect.height <= 0) {
            return;
        }

        const pointerX =
            (event.clientX - canvasRect.left) *
            (app.screen.width / canvasRect.width);

        const pointerY =
            (event.clientY - canvasRect.top) *
            (app.screen.height / canvasRect.height);

        const currentScale = cameraLayer.scale.x;
        const normalizedDelta = normalizeWheelDelta(
            event,
            app.screen.height,
        );

        const zoomFactor = Math.exp(
            -normalizedDelta * MAP_ZOOM_SENSITIVITY,
        );

        const nextScale = clamp(
            currentScale * zoomFactor,
            MIN_MAP_SCALE,
            MAX_MAP_SCALE,
        );

        if (nextScale === currentScale) {
            return;
        }

        /*
         * Convert the cursor position into map-space coordinates before
         * changing the scale. After scaling, reposition the camera so the
         * same map coordinate remains beneath the cursor.
         */
        zoomCameraAtPoint(
            cameraLayer,
            nextScale,
            pointerX,
            pointerY,
        );
    }

    canvas.addEventListener("wheel", handleWheel, {
        passive: false,
    });

    return () => {
        canvas.removeEventListener("wheel", handleWheel);
    };
}

function normalizeWheelDelta(
    event: WheelEvent,
    viewportHeight: number,
): number {
    switch (event.deltaMode) {
        case WheelEvent.DOM_DELTA_LINE:
            return event.deltaY * 16;

        case WheelEvent.DOM_DELTA_PAGE:
            return event.deltaY * viewportHeight;

        case WheelEvent.DOM_DELTA_PIXEL:
        default:
            return event.deltaY;
    }
}

function clamp(
    value: number,
    minimum: number,
    maximum: number,
): number {
    return Math.min(maximum, Math.max(minimum, value));
}

type DrawStarMapOptions = {
    mapLayer: Container;
    map: StarMapState;
    selectedSystemId: StarSystemId | null;
    onSelectSystem: (systemId: StarSystemId) => void;
    canSelectSystem: () => boolean;
};

function drawStarMap({
    mapLayer,
    map,
    selectedSystemId,
    onSelectSystem,
    canSelectSystem,
}: DrawStarMapOptions) {
    mapLayer.removeChildren();

    const hexPoints = getHexCornerPoints();

    for (const systemId of map.systemIds) {
        const system = map.systemsById[systemId];
        const pixel = axialToPixel(system.coord);

        const systemContainer = new Container();

        systemContainer.x = pixel.x;
        systemContainer.y = pixel.y;
        systemContainer.eventMode = "static";
        systemContainer.cursor = "pointer";
        systemContainer.hitArea = new Circle(0, 0, 28);

        systemContainer.on("pointertap", () => {
            if (!canSelectSystem()) {
                return;
            }

            onSelectSystem(system.id);
        })

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