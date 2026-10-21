# LabVerse Physics Viewport Architecture Audit

**Status**: Completed  
**Author**: Antigravity Assistant  
**Date**: October 2026  
**Target Subsystems**: Physics Simulation Viewports (Work & Energy, Forces & Newton's Laws, Motion & Kinematics)

---

## 1. Executive Summary

This audit investigates recurring mobile responsiveness defects across the LabVerse Physics laboratories and embedded lesson interactive viewports. 

The core architectural flaw identified across the physics simulation suite is **Indiscriminate Scaled Desktop Projection**:
1. Simulation canvases are designed with hardcoded, desktop-oriented coordinate spaces (such as `1000 × 450` in `SimulationViewport` or `620 × 300` in `ForceFigure`).
2. When viewed on small screens (320px–430px wide), the SVG viewBox is simply scaled down uniformly using `preserveAspectRatio="xMidYMid meet"` or `w-full h-auto`.
3. Uniform downscaling reduces geometric elements, fonts, and displacement vectors by a factor of 2.5× to 3×, making simulated objects (carts, bags, buses, and arrows) appear microscopic and text illegible (dropping to 3–4px effective font size).
4. Desktop camera framing displays the entire laboratory apparatus (such as a 12-meter track) even when the educational lesson only focuses on an active 1-meter or 3-meter displacement.
5. In vertical experiments (specifically highlighted in **Work & Energy → Lesson 1 → Idea 2: Lifting a 5 kg bag of wheat**), the vertical rail and cart are placed at `x = 380` on a 1000px wide viewBox, resulting in over 60% of the canvas being empty void, while the active motion spans only ~22 SVG pixels (8 physical screen pixels on mobile).
6. Floating desktop engineering toolbars (up to 10 buttons wide) occupy the entire width of the mobile viewport, directly obscuring the simulation apparatus.

---

## 2. Component-by-Component Inventory & Root Causes

### 2.1 Work & Energy — `SimulationViewport.tsx` & `WorkView.tsx`
- **Files**:
  - `frontend/src/features/physics/work/components/SimulationViewport.tsx`
  - `frontend/src/features/physics/work/WorkView.tsx`
  - `frontend/src/features/physics/work/components/useViewportCamera.ts`
  - `frontend/src/features/physics/work/components/AnalysisDock.tsx`
- **ViewBox & Coordinate System**:
  - `W = 1000, H = 450` (Aspect ratio: `2.22 : 1`).
  - Container minimum heights: `min-h-[460px] md:min-h-[540px]`.
- **Identified Defects**:
  1. **Extreme Vertical Aspect Ratio Letterboxing**: On a 360px-wide mobile screen, a 1000:450 viewBox restricts the SVG height to only 162px.
  2. **The "Bag-Lifting" Presentation Failure (Lesson 1 Idea 2)**:
     - Configuration: `axis: 'vertical', forceN: 50, angleDeg: 90, displacement: 1, startPos: 0, massKg: 5`.
     - Apparatus placement: `cartX = 380`, `startY = 340` (0m), `endY = 317.5` (1m).
     - Empty space: From `x = 480` to `x = 1000` (over 520px horizontal width) contains zero apparatus elements.
     - Object sprite: A CAD rolling cart (`CART_01` with wheels, bearings, and `ACCEL_SENS_X`) is rendered on a vertical rail when the curriculum describes lifting a grain sack.
     - Motion scale: A 1m lift moves only 22.5 SVG pixels, which becomes ~8px on mobile screen.
     - Text sizes: `CART_01` label is `fontSize={9}` (effective 3.2px), force vector text is `fontSize="11"` (effective 3.9px).
  3. **Floating Toolbar Collision**:
     - The top-left mini toolbar has 9 controls: Select, Pan, Fit, Reset, Zoom In, Zoom Out, Zoom %, Vectors toggle, Grid toggle, W&N toggle.
     - Width of toolbar: ~340px. On a 360px viewport, it stretches across the canvas and directly overlays `x = 380`, covering the vertical rail, caliper bracket, and force vectors.
  4. **Unadapted Default Camera Framing**:
     - `useViewportCamera` initializes to `DEFAULT_CAMERA = { zoom: 1.0, panX: 0, panY: 0 }`.
     - The camera center is fixed at (500, 225). No automatic fit-to-apparatus is triggered on load for mobile viewports.
  5. **AnalysisDock Sizing Conflicts**:
     - Uses `window.innerWidth < 640` to determine `isMobile`, ignoring container query bounds when rendered inside embedded lesson split-views.
     - `AnalysisDock` tab bar with 5 tabs (`measurements`, `calculations`, `graphs`, `data`, `explanation`) causes horizontal clipping or crowded tabs.

---

### 2.2 Forces & Newton's Laws — `ForceFigure.tsx`, `ForceCart.tsx`, `TwoBody.tsx`, `BrakingDemo.tsx`
- **Files**:
  - `frontend/src/features/physics/forces/ForceFigure.tsx`
  - `frontend/src/features/physics/forces/ForceCart.tsx`
  - `frontend/src/features/physics/forces/TwoBody.tsx`
  - `frontend/src/features/physics/forces/BrakingDemo.tsx`
- **Identified Defects**:
  1. **`ForceFigure.tsx`**:
     - Desktop ViewBox: `0 0 620 300`.
     - Block size: `BW = 100, BH = 56`.
     - Arrow text labels: `fontSize={11}`.
     - On a 360px screen, the 620px viewBox scales down by 0.53×, shrinking text to ~5.8px and arrow shafts to 1.5–2px, making vector direction and magnitude difficult to distinguish.
  2. **`ForceCart.tsx` (Track)**:
     - `TRACK_W = 620, TRACK_H = 110`.
     - Cart sprite is only `width={34} height={26}`.
     - On a 360px phone, the cart is under 20px wide with wheel radius of 2.3px.
     - Position label (`fontSize={11}`) scales to ~5.8px.
  3. **`TwoBody.tsx`**:
     - ViewBox: `0 0 620 120`.
     - Carts A and B are `width={32} height={24}` (under 18px wide on mobile).
     - Internal force vector text (`fontSize={9}`) shrinks to 4.8px.
  4. **`BrakingDemo.tsx`**:
     - ViewBox: `0 0 680 150`.
     - Car is `carW = 110` in 680px viewBox.
     - Passenger is a circle of radius `r = 9` (18px diameter in viewBox, ~9px on screen).
     - Passenger relative movement (`s.relative / GAP_M * carW * 0.35`) is compressed to ~12 screen pixels total.

---

### 2.3 Motion & Kinematics — `MotionTrack.tsx` & `CircularMotion.tsx`
- **Files**:
  - `frontend/src/features/physics/motion/MotionTrack.tsx`
  - `frontend/src/features/physics/motion/CircularMotion.tsx`
- **Identified Defects**:
  1. **`MotionTrack.tsx`**:
     - ViewBox: `0 0 600 230`, `PAD = 28`, `TRACK_Y = 110`.
     - The movable object is a circle `r = 11` (22px diameter). On mobile (360px), it scales to 13px diameter.
     - History route legs (`shownLegs`) stack vertically above the track (`TRACK_Y - 38 - (i % 5) * 14`).
     - On small screens, multiple leg arrows overlap with the top route/displacement legends and ruler ticks.
     - Displacement arrow sits at `TRACK_Y + 92` with `fontSize={11}` (~6.2px on phone).

---

### 2.4 Work Lab Extensions — `KineticView.tsx`, `EnergyView.tsx`, `MachineViews.tsx`
- **Files**:
  - `frontend/src/features/physics/work/KineticView.tsx` (`W = 440, H = 190`)
  - `frontend/src/features/physics/work/EnergyView.tsx` (`W = 440, H = 250`)
  - `frontend/src/features/physics/work/MachineViews.tsx` (Ramp `440 × 262`, Pulley `440 × 270`, Lever `440 × 280`)
- **Identified Defects**:
  - While smaller base dimensions (`440px`) scale better than `1000px`, dragging handles (`r = 8px` to `9px`) have small touch hit areas on mobile (<24px physical touch target), violating the 44 × 44px minimum touch recommendation unless enlarged.

---

## 3. Root Cause Classification Matrix

| Subsystem | Root Cause | Underlying Mechanism | Impact on Mobile |
| :--- | :--- | :--- | :--- |
| **Work SimulationViewport** | Rigid 1000×450 Canvas | Hardcoded viewBox & CAD proportions | 162px canvas height, letterboxing, microscopic sprites |
| **Work Vertical Rail** | Asymmetric Centering & Span | Rail placed at `x=380`, 12m full range | 60% empty canvas on right; 1m lift is only 8px motion |
| **Object Representation** | Inappropriate Sprite Reuse | `CART_01` used for vertical bag lifting | Context mismatch; wheeled cart shown lifting vertically |
| **Viewport Camera** | Fixed Default Framing | `zoom=1.0, pan=0,0` at origin (500, 225) | No auto-framing of active apparatus on mobile |
| **Toolbar Architecture** | Unresponsive Desktop Bar | 9 buttons in flex row across top-left | Overlays and obscures the simulation apparatus |
| **Forces Figures & Carts** | Uniform 620px Scaling | Single SVG viewBox across all screen widths | Carts under 20px wide, labels under 6px font |
| **Motion Track** | Tight Vertical Spacing | Fixed 230px height with 5-layer history | Overlapping tick labels, leg arrows, and touch targets |
| **Analysis Dock** | Window Width Dependence | `window.innerWidth < 640` check | Ignores container width inside lesson embeds |

---

## 4. Architectural Solution Strategy

To resolve these recurring issues permanently without altering desktop presentation:

1. **Establish Viewport Presentation Profiles**:
   - `desktop`: Preserves current dimensions (`1000 × 450`), desktop camera framing, existing toolbars, and CAD cart rendering.
   - `mobile`: Uses container-aware responsive profiles (`containerWidth < 640px`):
     - Tailored mobile camera framing (auto-framing the active apparatus region).
     - Adaptive aspect ratios (`4:3` or `16:10` for mobile instead of ultra-wide `2.22:1`).
     - Contextual object sprites (dedicated wheat/grain sack sprite when `axis === 'vertical'`).
     - Minimum legible font thresholds (minimum 13–14 SVG px, equivalent to ≥12px physical screen size).
     - Responsive vector arrow thickness and distinct arrowheads.
     - Streamlined mobile toolbar with essential primary actions and consolidated secondary menu.
2. **Deterministic Shared State**:
   - The underlying physics engine (`workModel.ts`, `forceModel.ts`, `kinematics.ts`) remains 100% authoritative and unchanged.
   - Presentation profile only modifies camera transform, visual sizing, and layout arrangement.
3. **Container-Query / Measured Container Width**:
   - Viewport profile is determined by measuring the actual container bounding rect using `ResizeObserver`, ensuring correct behavior in embedded lesson cards, split views, and full-screen laboratory modes.
