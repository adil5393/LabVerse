/**
 * Pure Geometry Functions for Class 9 Circles Laboratory (Milestone M2)
 *
 * Implements authoritative mathematical calculations in world coordinates:
 * - Circle point projections and circumference constraints
 * - Chord length, midpoint, and perpendicular distance from center
 * - Angle subtended at center vs inscribed angles
 * - Angle in a semicircle (90° right angle)
 * - Cyclic quadrilateral opposite angle sums (180° supplementary)
 * - Tangent vector and perpendicularity verification
 */

import type { WorldPoint, CircleObject, CircumferencePoint, LabelSizePreference } from './types';

export const EPSILON = 1e-4;

/**
 * Converts screen coordinates to world coordinates.
 */
export function screenToWorld(
  screenX: number,
  screenY: number,
  zoom: number,
  panX: number,
  panY: number,
  canvasHeight: number
): WorldPoint {
  const x = (screenX - panX) / zoom;
  // Canvas Y is inverted relative to standard Cartesian Y
  const y = (canvasHeight / 2 - (screenY - panY)) / zoom;
  return {
    x: Number(x.toFixed(4)),
    y: Number(y.toFixed(4)),
  };
}

/**
 * Converts world coordinates to screen pixel coordinates.
 */
export function worldToScreen(
  worldX: number,
  worldY: number,
  zoom: number,
  panX: number,
  panY: number,
  canvasHeight: number
): { x: number; y: number } {
  const x = worldX * zoom + panX;
  const y = canvasHeight / 2 - worldY * zoom + panY;
  return { x, y };
}

/**
 * Calculates Euclidean distance between two points.
 */
export function distanceBetween(p1: WorldPoint, p2: WorldPoint): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates the exact Cartesian world coordinates for a point on a circle circumference.
 */
export function getCircumferenceCoords(
  circle: CircleObject,
  angleRad: number
): WorldPoint {
  return {
    x: Number((circle.center.x + circle.radius * Math.cos(angleRad)).toFixed(4)),
    y: Number((circle.center.y + circle.radius * Math.sin(angleRad)).toFixed(4)),
  };
}

/**
 * Finds the angle in radians [0, 2π) for any world point projected onto the circle circumference.
 */
export function projectPointToCircleAngle(
  center: WorldPoint,
  point: WorldPoint
): number {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  let angle = Math.atan2(dy, dx);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
}

/**
 * Calculates chord length and midpoint between two circumference points.
 */
export function calculateChordMetrics(
  circle: CircleObject,
  ptA: WorldPoint,
  ptB: WorldPoint
): {
  length: number;
  midpoint: WorldPoint;
  distFromCenter: number;
  subtendedAngleDeg: number;
} {
  const length = distanceBetween(ptA, ptB);
  const midpoint: WorldPoint = {
    x: Number(((ptA.x + ptB.x) / 2).toFixed(4)),
    y: Number(((ptA.y + ptB.y) / 2).toFixed(4)),
  };
  const distFromCenter = distanceBetween(circle.center, midpoint);

  // Subtended central angle using Law of Cosines: L² = r² + r² - 2r²cos(θ) = 2r²(1 - cos(θ))
  // sin(θ/2) = (L / 2) / r
  const halfChord = Math.min(1.0, length / (2 * Math.max(0.001, circle.radius)));
  const angleRad = 2 * Math.asin(halfChord);
  const subtendedAngleDeg = Number(((angleRad * 180) / Math.PI).toFixed(2));

  return {
    length: Number(length.toFixed(3)),
    midpoint,
    distFromCenter: Number(distFromCenter.toFixed(3)),
    subtendedAngleDeg,
  };
}

/**
 * Measures the planar angle ∠(P1 - Vertex - P2) in degrees [0°, 180°].
 */
export function calculateAngleDegrees(
  p1: WorldPoint,
  vertex: WorldPoint,
  p2: WorldPoint
): number {
  const v1x = p1.x - vertex.x;
  const v1y = p1.y - vertex.y;
  const v2x = p2.x - vertex.x;
  const v2y = p2.y - vertex.y;

  const dot = v1x * v2x + v1y * v2y;
  const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
  const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);

  if (mag1 < 1e-6 || mag2 < 1e-6) return 0;

  const cosTheta = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
  const angleRad = Math.acos(cosTheta);
  return Number(((angleRad * 180) / Math.PI).toFixed(2));
}

/**
 * Resolves world coordinates, display name, parent circle ID and center status for any point reference.
 */
export function resolveCirclePointCoords(
  pointId: string,
  circles: Record<string, CircleObject>,
  circumferencePoints: Record<string, CircumferencePoint>
): { coords: WorldPoint; name: string; circleId: string; isCenter: boolean } | null {
  // 1. Check circumference points
  if (circumferencePoints[pointId]) {
    const pt = circumferencePoints[pointId];
    const circle = circles[pt.circleId];
    if (!circle) return null;
    return {
      coords: getCircumferenceCoords(circle, pt.angleRad),
      name: pt.name,
      circleId: pt.circleId,
      isCenter: false,
    };
  }

  // 2. Check circle centers (handles center_<circleId>, circle.id, or 'center')
  for (const circle of Object.values(circles)) {
    if (pointId === circle.id || pointId === 'center' || pointId === `center_${circle.id}`) {
      return {
        coords: circle.center,
        name: circle.name || 'O',
        circleId: circle.id,
        isCenter: true,
      };
    }
  }

  return null;
}

/**
 * Computes exact minor arc sweep parameters (start, end, direction, bisector) between two rays.
 * Guarantees drawing the smaller angle [0°, 180°] rather than accidentally sweeping a reflex arc.
 */
export function calculateMinorArcSweep(
  vertexScreen: { x: number; y: number },
  p1Screen: { x: number; y: number },
  p2Screen: { x: number; y: number }
): {
  startAngle: number;
  endAngle: number;
  anticlockwise: boolean;
  bisectorAngle: number;
} {
  const a1 = Math.atan2(p1Screen.y - vertexScreen.y, p1Screen.x - vertexScreen.x);
  const a2 = Math.atan2(p2Screen.y - vertexScreen.y, p2Screen.x - vertexScreen.x);

  let diff = (a2 - a1) % (2 * Math.PI);
  if (diff < -Math.PI) diff += 2 * Math.PI;
  if (diff > Math.PI) diff -= 2 * Math.PI;

  const anticlockwise = diff < 0;
  const bisectorAngle = a1 + diff / 2;

  return {
    startAngle: a1,
    endAngle: a2,
    anticlockwise,
    bisectorAngle,
  };
}

/**
 * Verifies Theorem 3: The angle subtended by an arc at the center is double
 * the angle subtended by it at any point on the remaining part of the circle.
 * ∠AOB = 2 * ∠APB
 */
export function verifyInscribedAngleTheorem(
  centerAngleDeg: number,
  inscribedAngleDeg: number
): {
  isValid: boolean;
  ratio: number;
  differenceFromDouble: number;
} {
  const expectedDouble = inscribedAngleDeg * 2;
  const diff = Math.abs(centerAngleDeg - expectedDouble);
  const ratio = inscribedAngleDeg > 0 ? centerAngleDeg / inscribedAngleDeg : 0;

  return {
    isValid: diff < 0.25, // Small numerical tolerance for floating-point calculations
    ratio: Number(ratio.toFixed(2)),
    differenceFromDouble: Number(diff.toFixed(2)),
  };
}

/**
 * Verifies Theorem 5: The angle in a semicircle is a right angle (90°).
 */
export function verifyAngleInSemicircle(angleDeg: number): {
  isRightAngle: boolean;
  deviation: number;
} {
  const deviation = Math.abs(angleDeg - 90.0);
  return {
    isRightAngle: deviation < 0.2,
    deviation: Number(deviation.toFixed(2)),
  };
}

/**
 * Verifies Theorem 6: Opposite angles of a cyclic quadrilateral are supplementary (sum = 180°).
 */
export function verifyCyclicQuadOppositeAngles(
  angle1Deg: number,
  angle2Deg: number
): {
  isSupplementary: boolean;
  sum: number;
  deviation: number;
} {
  const sum = angle1Deg + angle2Deg;
  const deviation = Math.abs(sum - 180.0);
  return {
    isSupplementary: deviation < 0.35,
    sum: Number(sum.toFixed(2)),
    deviation: Number(deviation.toFixed(2)),
  };
}

/**
 * Computes the tangent segment endpoints at a given contact point on the circle.
 * Tangent line is perpendicular to radius vector (P - Center).
 */
export function calculateTangentSegment(
  circle: CircleObject,
  contactPoint: WorldPoint,
  segmentLengthWorld: number = 6.0
): {
  pStart: WorldPoint;
  pEnd: WorldPoint;
  isPerpendicularToRadius: boolean;
} {
  const rx = contactPoint.x - circle.center.x;
  const ry = contactPoint.y - circle.center.y;
  const rMag = Math.sqrt(rx * rx + ry * ry);

  if (rMag < 1e-6) {
    return {
      pStart: contactPoint,
      pEnd: contactPoint,
      isPerpendicularToRadius: false,
    };
  }

  // Unit perpendicular vector: (-ry / rMag, rx / rMag)
  const tx = -ry / rMag;
  const ty = rx / rMag;
  const halfLen = segmentLengthWorld / 2;

  const pStart: WorldPoint = {
    x: Number((contactPoint.x - tx * halfLen).toFixed(4)),
    y: Number((contactPoint.y - ty * halfLen).toFixed(4)),
  };
  const pEnd: WorldPoint = {
    x: Number((contactPoint.x + tx * halfLen).toFixed(4)),
    y: Number((contactPoint.y + ty * halfLen).toFixed(4)),
  };

  // Dot product of radius vector (rx, ry) and tangent vector (tx, ty) must be 0
  const dotProduct = rx * tx + ry * ty;
  const isPerpendicular = Math.abs(dotProduct) < EPSILON;

  return {
    pStart,
    pEnd,
    isPerpendicularToRadius: isPerpendicular,
  };
}

/**
 * Determines whether two chords of the same circle are equal in length and equidistant from the center.
 * Theorem 2: Equal chords are equidistant from the center.
 */
export function verifyEqualChordsEquidistant(
  chord1Length: number,
  chord1Dist: number,
  chord2Length: number,
  chord2Dist: number
): {
  areChordsEqual: boolean;
  areDistancesEqual: boolean;
  lengthDiff: number;
  distanceDiff: number;
} {
  const lengthDiff = Math.abs(chord1Length - chord2Length);
  const distanceDiff = Math.abs(chord1Dist - chord2Dist);

  return {
    areChordsEqual: lengthDiff < 0.05,
    areDistancesEqual: distanceDiff < 0.05,
    lengthDiff: Number(lengthDiff.toFixed(3)),
    distanceDiff: Number(distanceDiff.toFixed(3)),
  };
}

/**
 * Calculates the diametrically opposite point B on a circle for given circumference point A.
 * For circle center C(cx, cy) and point A(ax, ay):
 * B = (2*cx - ax, 2*cy - ay)
 * Angle: (thetaA + π) mod 2π
 */
export function calculateOppositeDiameterPoint(
  circle: CircleObject,
  pointA: WorldPoint
): {
  oppositePoint: WorldPoint;
  oppositeAngleRad: number;
} {
  const oppX = Number((2 * circle.center.x - pointA.x).toFixed(4));
  const oppY = Number((2 * circle.center.y - pointA.y).toFixed(4));
  const oppositePoint: WorldPoint = { x: oppX, y: oppY };

  let oppositeAngleRad = projectPointToCircleAngle(circle.center, oppositePoint);
  if (oppositeAngleRad < 0) {
    oppositeAngleRad += 2 * Math.PI;
  }

  return {
    oppositePoint,
    oppositeAngleRad: Number(oppositeAngleRad.toFixed(4)),
  };
}

/**
 * Computes bounding box enclosing all active circle geometry in world units.
 */
export function computeConstructionBoundingBox(
  circles: CircleObject[],
  points: WorldPoint[] = []
): { minX: number; maxX: number; minY: number; maxY: number } {
  if (circles.length === 0 && points.length === 0) {
    return { minX: -5, maxX: 5, minY: -5, maxY: 5 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  circles.forEach((c) => {
    minX = Math.min(minX, c.center.x - c.radius);
    maxX = Math.max(maxX, c.center.x + c.radius);
    minY = Math.min(minY, c.center.y - c.radius);
    maxY = Math.max(maxY, c.center.y + c.radius);
  });

  points.forEach((p) => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });

  // Guard against degenerate zero-size bounds
  if (maxX <= minX) {
    minX -= 2;
    maxX += 2;
  }
  if (maxY <= minY) {
    minY -= 2;
    maxY += 2;
  }

  return {
    minX: Number(minX.toFixed(2)),
    maxX: Number(maxX.toFixed(2)),
    minY: Number(minY.toFixed(2)),
    maxY: Number(maxY.toFixed(2)),
  };
}

/**
 * Calculates optimal viewport zoom and pan to fit active geometry inside the canvas.
 */
export function calculateFitViewport(
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  canvasWidth: number,
  canvasHeight: number,
  paddingPx: number = 80
): { zoom: number; panX: number; panY: number } {
  const spanX = Math.max(1, bounds.maxX - bounds.minX);
  const spanY = Math.max(1, bounds.maxY - bounds.minY);

  const usableWidth = Math.max(150, canvasWidth - paddingPx * 2);
  const usableHeight = Math.max(150, canvasHeight - paddingPx * 2);

  // Compute zoom so geometry spans usable area comfortably
  const targetZoomRaw = Math.min(usableWidth / spanX, usableHeight / spanY);
  // Clamp zoom to sensible education viewing ranges (20px to 110px per unit)
  const zoom = Math.max(20, Math.min(110, Math.round(targetZoomRaw)));

  const centerWorldX = (bounds.minX + bounds.maxX) / 2;
  const centerWorldY = (bounds.minY + bounds.maxY) / 2;

  // Center world coordinates at (canvasWidth / 2, canvasHeight / 2)
  const panX = -centerWorldX * zoom;
  const panY = centerWorldY * zoom;

  const roundedPanX = Math.round(panX);
  const roundedPanY = Math.round(panY);

  return {
    zoom,
    panX: roundedPanX === 0 ? 0 : roundedPanX,
    panY: roundedPanY === 0 ? 0 : roundedPanY,
  };
}

/**
 * Shared Typography System for Class 9 Circles (Milestone M2.1)
 */
export interface LabelTypographyConfig {
  pointLabelSize: number;
  measurementSize: number;
  secondaryCoordSize: number;
  haloWidth: number;
  badgePaddingX: number;
  badgePaddingY: number;
  badgeRadius: number;
  fontFamily: string;
}

export const LABEL_TYPOGRAPHY_CONFIGS: Record<LabelSizePreference, LabelTypographyConfig> = {
  small: {
    pointLabelSize: 14,
    measurementSize: 13,
    secondaryCoordSize: 11,
    haloWidth: 3,
    badgePaddingX: 6,
    badgePaddingY: 3,
    badgeRadius: 4,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  normal: {
    pointLabelSize: 17,
    measurementSize: 15,
    secondaryCoordSize: 13,
    haloWidth: 4,
    badgePaddingX: 8,
    badgePaddingY: 4,
    badgeRadius: 6,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  large: {
    pointLabelSize: 20,
    measurementSize: 18,
    secondaryCoordSize: 15,
    haloWidth: 5,
    badgePaddingX: 10,
    badgePaddingY: 5,
    badgeRadius: 8,
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
};

/**
 * Draws high-contrast halo text on canvas ensuring legibility across light, dark, and complex backgrounds.
 */
export function drawHaloText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: {
    fillColor?: string;
    haloColor?: string;
    haloWidth?: number;
    font?: string;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
  } = {}
): void {
  const {
    fillColor = '#ffffff',
    haloColor = '#090d16',
    haloWidth = 4,
    font = 'bold 16px Inter, sans-serif',
    align = 'left',
    baseline = 'alphabetic',
  } = options;

  ctx.save();
  ctx.font = font;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;

  // Dark halo
  ctx.strokeStyle = haloColor;
  ctx.lineWidth = haloWidth;
  ctx.lineJoin = 'round';
  ctx.miterLimit = 2;
  ctx.strokeText(text, x, y);

  // Crisp foreground text
  ctx.fillStyle = fillColor;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Draws a high-contrast pill badge with rounded corners for geometric measurements.
 */
export function drawPillBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  centerY: number,
  options: {
    bgColor?: string;
    textColor?: string;
    borderColor?: string;
    fontSize?: number;
    fontFamily?: string;
    paddingX?: number;
    paddingY?: number;
    borderRadius?: number;
  } = {}
): void {
  const {
    bgColor = 'rgba(15, 23, 42, 0.88)',
    textColor = '#38bdf8',
    borderColor = 'rgba(56, 189, 248, 0.4)',
    fontSize = 15,
    fontFamily = 'Inter, system-ui, sans-serif',
    paddingX = 8,
    paddingY = 4,
    borderRadius = 6,
  } = options;

  ctx.save();
  ctx.font = `bold ${fontSize}px ${fontFamily}`;
  const textWidth = ctx.measureText(text).width;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = fontSize + paddingY * 2;
  const left = centerX - boxWidth / 2;
  const top = centerY - boxHeight / 2;

  // Rounded rect background
  ctx.fillStyle = bgColor;
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(left, top, boxWidth, boxHeight, borderRadius);
  } else {
    ctx.rect(left, top, boxWidth, boxHeight);
  }
  ctx.fill();
  ctx.stroke();

  // Text inside badge
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, centerX, centerY);
  ctx.restore();
}

/**
 * Screen-space tolerance hit testing for points.
 */
export function pointHitsScreenPoint(
  clickScreenX: number,
  clickScreenY: number,
  targetScreenX: number,
  targetScreenY: number,
  tolerancePx: number = 18
): boolean {
  const dx = clickScreenX - targetScreenX;
  const dy = clickScreenY - targetScreenY;
  return Math.hypot(dx, dy) <= tolerancePx;
}

/**
 * Screen-space tolerance hit testing for circle circumference.
 */
export function pointHitsCircleCircumference(
  clickScreenX: number,
  clickScreenY: number,
  circleCenterScreenX: number,
  circleCenterScreenY: number,
  circleRadiusScreenPx: number,
  tolerancePx: number = 18
): boolean {
  const distToCenter = Math.hypot(clickScreenX - circleCenterScreenX, clickScreenY - circleCenterScreenY);
  return Math.abs(distToCenter - circleRadiusScreenPx) <= tolerancePx;
}

/**
 * Distance from screen point (px, py) to line segment (x1, y1)-(x2, y2).
 */
export function distanceToScreenSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);

  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return Math.hypot(px - projX, py - projY);
}

/**
 * Validates student practice input against mathematical ground truth.
 */
export function validatePracticeAnswer(
  userAnswer: string,
  correctAnswer: number | string,
  tolerance: number = 0.05
): boolean {
  const cleanedUser = userAnswer.trim().toLowerCase();
  const cleanedTarget = String(correctAnswer).trim().toLowerCase();

  // Exact string match
  if (cleanedUser === cleanedTarget) return true;

  // Normalized unit comparison (e.g., "8 cm" vs "8cm" vs "8")
  const userNumMatch = cleanedUser.match(/[-+]?[0-9]*\.?[0-9]+/);
  const targetNumMatch = cleanedTarget.match(/[-+]?[0-9]*\.?[0-9]+/);

  if (userNumMatch && targetNumMatch) {
    const userVal = parseFloat(userNumMatch[0]);
    const targetVal = parseFloat(targetNumMatch[0]);
    if (!isNaN(userVal) && !isNaN(targetVal)) {
      return Math.abs(userVal - targetVal) <= tolerance;
    }
  }

  return false;
}

