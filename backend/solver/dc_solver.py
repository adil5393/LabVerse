"""
LabVerse Python DC Circuit Solver — Milestone D.2
Authoritative numerical and topological DC circuit solver.
Implements:
1. Multi-circuit / subcircuit decomposition: identifies independent connected subcircuits and solves each separately.
2. Direct supply short detection per subcircuit (isolated from other subcircuits).
3. Open circuit loop detection per subcircuit.
4. Generalized Modified Nodal Analysis (MNA):
   - Arbitrary series, parallel, and series-parallel resistor networks.
   - Multiple independent DC voltage sources within a network.
   - Contradictory ideal voltage sources diagnostic.
5. Active-set piecewise-linear LED device model:
   - Evaluates multiple LEDs in series, parallel branches, and mixed networks.
   - Fixed 2.0V forward drop per conducting LED.
   - Current-based non-linear brightness curve B(I) = min(1.0, (I/I_ref)^0.6).
   - Overcurrent warning (>30mA).
   - Reversed LED fault detection.
   - Insufficient supply voltage handling (non-conducting, zero false current).
6. Generalized physical conductor graph mapping:
   - Solves physical current distribution on all jumper wires and breadboard internal strips using KCL.
   - Preserves conventional current direction (from higher potential to lower potential).
   - Series branches show uniform current; parallel branches show respective branch currents.
   - Unused breadboard strips carry zero current and do not animate.
"""

import json
from typing import Dict, List, Optional, Set, Tuple
import numpy as np
from pydantic import BaseModel, Field


class EndpointRef(BaseModel):
    kind: str  # 'component-terminal' | 'breadboard-hole' | 'junction'
    instanceId: Optional[str] = None
    terminalId: Optional[str] = None
    breadboardInstanceId: Optional[str] = None
    holeId: Optional[str] = None
    junctionId: Optional[str] = None


class ComponentInput(BaseModel):
    instanceId: str
    definitionId: str
    properties: Dict[str, float] = Field(default_factory=dict)
    terminals: List[str] = Field(default_factory=list)


class WireInput(BaseModel):
    model_config = {"populate_by_name": True}
    id: str
    from_endpoint: EndpointRef = Field(alias="from")
    to_endpoint: EndpointRef = Field(alias="to")


class AttachmentInput(BaseModel):
    instanceId: str
    terminalId: str
    breadboardInstanceId: str
    holeId: str


class CircuitSolveRequest(BaseModel):
    instances: List[ComponentInput]
    attachments: List[AttachmentInput] = Field(default_factory=list)
    wires: List[WireInput] = Field(default_factory=list)


class ComponentState(BaseModel):
    instanceId: str
    conducting: bool = False
    currentA: float = 0.0
    voltageDropV: float = 0.0
    brightness: float = 0.0
    overcurrent: bool = False
    powerDissipationW: float = 0.0


class BranchCurrent(BaseModel):
    branchId: str
    fromNode: str
    toNode: str
    currentA: float  # Signed conventional current from fromNode to toNode
    voltageDropV: float


class ConductorCurrentFlow(BaseModel):
    conductorId: str
    type: str  # 'wire' | 'breadboard-strip'
    fromKey: str
    toKey: str
    currentA: float
    breadboardInstanceId: Optional[str] = None
    fromHoleId: Optional[str] = None
    toHoleId: Optional[str] = None


class FaultInfo(BaseModel):
    type: str  # 'DIRECT_SUPPLY_SHORT' | 'REVERSED_LED' | 'OPEN_CIRCUIT' | 'OVERCURRENT' | 'CONTRADICTORY_SOURCES'
    severity: str  # 'error' | 'warning'
    message: str
    remedy: str
    affectedComponentId: Optional[str] = None
    affectedNodeId: Optional[str] = None


class SubcircuitLEDState(BaseModel):
    instanceId: str
    illuminated: bool
    currentA: float


class SubcircuitTelemetry(BaseModel):
    subcircuitId: str
    sourceInstanceId: Optional[str] = None
    sourceVoltageV: float = 0.0
    currentA: float = 0.0
    status: str = "conducting"  # "conducting" | "open" | "fault"
    componentInstanceIds: List[str] = Field(default_factory=list)
    ledStates: List[SubcircuitLEDState] = Field(default_factory=list)
    totalPowerW: float = 0.0
    sourceInstanceIds: List[str] = Field(default_factory=list)


class CircuitSolveResponse(BaseModel):
    status: str  # 'solved' | 'fault' | 'open'
    nodeVoltages: Dict[str, float] = Field(default_factory=dict)
    componentStates: Dict[str, ComponentState] = Field(default_factory=dict)
    branchCurrents: List[BranchCurrent] = Field(default_factory=list)
    conductorFlows: List[ConductorCurrentFlow] = Field(default_factory=list)
    subcircuits: List[SubcircuitTelemetry] = Field(default_factory=list)
    faults: List[FaultInfo] = Field(default_factory=list)
    hasCurrentFlow: bool = False


def endpoint_key(ep: EndpointRef) -> str:
    if ep.kind == "breadboard-hole":
        return json.dumps(["hole", ep.breadboardInstanceId or "", ep.holeId or ""])
    elif ep.kind == "component-terminal":
        return json.dumps(["terminal", ep.instanceId or "", ep.terminalId or ""])
    elif ep.kind == "junction":
        return json.dumps(["junction", ep.junctionId or ""])
    return "unknown"


def term_key(instance_id: str, terminal_id: str) -> str:
    return json.dumps(["terminal", instance_id, terminal_id])


def hole_key(bb_instance_id: str, hole_id: str) -> str:
    return json.dumps(["hole", bb_instance_id, hole_id])


# Documented Eye-Sensitivity Non-linear Brightness Curve:
# B(I) = min(1.0, (I / I_ref) ** 0.6) where I_ref = 20mA (0.02A)
def calculate_led_brightness(current_a: float) -> float:
    if current_a <= 0.0001:  # < 0.1mA negligible light
        return 0.0
    i_ref = 0.020  # 20mA reference nominal brightness
    ratio = current_a / i_ref
    b = min(1.0, ratio ** 0.6)
    return round(b, 4)


class DSU:
    def __init__(self):
        self.parent: Dict[str, str] = {}

    def find(self, item: str) -> str:
        if item not in self.parent:
            self.parent[item] = item
            return item
        if self.parent[item] != item:
            self.parent[item] = self.find(self.parent[item])
        return self.parent[item]

    def union(self, a: str, b: str):
        root_a = self.find(a)
        root_b = self.find(b)
        if root_a != root_b:
            self.parent[root_b] = root_a


def get_breadboard_strip_id(hole_id: str) -> str:
    if hole_id.startswith("col_"):
        parts = hole_id.split("_")
        col = parts[1]
        row = parts[2]
        if row in ["a", "b", "c", "d", "e"]:
            return f"strip_top_col_{col}"
        else:
            return f"strip_bottom_col_{col}"
    elif hole_id.startswith("rail_top_pos"):
        return "strip_rail_top_pos"
    elif hole_id.startswith("rail_top_neg"):
        return "strip_rail_top_neg"
    elif hole_id.startswith("rail_bottom_pos"):
        return "strip_rail_bottom_pos"
    elif hole_id.startswith("rail_bottom_neg"):
        return "strip_rail_bottom_neg"
    return "strip_unknown"


def gaussian_solve(A_mat: np.ndarray, b_vec: np.ndarray) -> Optional[np.ndarray]:
    """
    Robust linear system solver with partial pivoting.
    """
    n = len(b_vec)
    A = A_mat.copy().astype(float)
    b = b_vec.copy().astype(float)

    for i in range(n):
        # Pivot selection
        max_row = i + int(np.argmax(np.abs(A[i:, i])))
        if abs(A[max_row, i]) < 1e-12:
            return None  # Singular

        if max_row != i:
            A[[i, max_row]] = A[[max_row, i]]
            b[[i, max_row]] = b[[max_row, i]]

        # Eliminate below
        factors = A[i + 1 :, i] / A[i, i]
        A[i + 1 :, i:] -= np.outer(factors, A[i, i:])
        b[i + 1 :] -= factors * b[i]

    # Back-substitution
    x = np.zeros(n, dtype=float)
    for i in range(n - 1, -1, -1):
        x[i] = (b[i] - np.dot(A[i, i + 1 :], x[i + 1 :])) / A[i, i]

    return x


def solve_conductor_flows(
    dsu: DSU,
    terminal_injections: Dict[str, float],
    wires: List[WireInput],
    attachments: List[AttachmentInput],
    breadboards: List[ComponentInput],
) -> List[ConductorCurrentFlow]:
    """
    Solves physical current distribution on all wires and breadboard strips using KCL.
    Every conductor has uniform conductivity.
    Boundary conditions are given by terminal_injections[term_key] (amps entering node).
    """
    # Group physical conductors and terminals by electrical node root
    node_terminals: Dict[str, Dict[str, float]] = {}
    for t_k, inj in terminal_injections.items():
        if abs(inj) > 1e-8:
            root = dsu.find(t_k)
            node_terminals.setdefault(root, {})[t_k] = inj

    node_wires: Dict[str, List[WireInput]] = {}
    for w in wires:
        u = endpoint_key(w.from_endpoint)
        root = dsu.find(u)
        node_wires.setdefault(root, []).append(w)

    node_attachments: Dict[str, List[AttachmentInput]] = {}
    for att in attachments:
        u = term_key(att.instanceId, att.terminalId)
        root = dsu.find(u)
        node_attachments.setdefault(root, []).append(att)

    # Collect plugged holes per breadboard strip
    plugged_by_strip: Dict[Tuple[str, str, str], Set[str]] = {}
    for att in attachments:
        u = term_key(att.instanceId, att.terminalId)
        root = dsu.find(u)
        s_id = get_breadboard_strip_id(att.holeId)
        plugged_by_strip.setdefault((root, att.breadboardInstanceId, s_id), set()).add(att.holeId)
    for w in wires:
        for ep in [w.from_endpoint, w.to_endpoint]:
            if ep.kind == "breadboard-hole" and ep.breadboardInstanceId and ep.holeId:
                u = endpoint_key(ep)
                root = dsu.find(u)
                s_id = get_breadboard_strip_id(ep.holeId)
                plugged_by_strip.setdefault((root, ep.breadboardInstanceId, s_id), set()).add(ep.holeId)

    flows: List[ConductorCurrentFlow] = []

    # Solve flow on each electrical node independently
    all_roots = set(node_terminals.keys())
    for root in all_roots:
        term_map = node_terminals.get(root, {})
        if sum(abs(v) for v in term_map.values()) < 1e-7:
            continue

        c_wires = node_wires.get(root, [])
        c_atts = node_attachments.get(root, [])

        # Build list of vertices in this conductor network
        vertices: Set[str] = set(term_map.keys())
        for w in c_wires:
            vertices.add(endpoint_key(w.from_endpoint))
            vertices.add(endpoint_key(w.to_endpoint))
        for att in c_atts:
            vertices.add(term_key(att.instanceId, att.terminalId))
            vertices.add(hole_key(att.breadboardInstanceId, att.holeId))

        # Build breadboard strip segments
        strip_segments: List[Tuple[str, str, str]] = []  # (bb_id, h1, h2)
        for (n_root, bb_id, s_id), holes in plugged_by_strip.items():
            if n_root != root or len(holes) < 2:
                continue
            h_list = sorted(list(holes))
            for i in range(len(h_list) - 1):
                strip_segments.append((bb_id, h_list[i], h_list[i + 1]))
                vertices.add(hole_key(bb_id, h_list[i]))
                vertices.add(hole_key(bb_id, h_list[i + 1]))

        vertex_list = list(vertices)
        if len(vertex_list) < 2:
            continue
        v_idx = {v: i for i, v in enumerate(vertex_list)}
        num_v = len(vertex_list)

        # Conductance matrix for this conductor network
        # Normalized resistances:
        # wire: 1.0, attachment: 0.001 (very high conductance), strip segment: 0.01
        G_cond = np.zeros((num_v, num_v), dtype=float)
        b_cond = np.zeros(num_v, dtype=float)

        for t_k, inj in term_map.items():
            if t_k in v_idx:
                b_cond[v_idx[t_k]] += inj

        def add_cond_edge(u_key: str, v_key: str, res_val: float):
            if u_key not in v_idx or v_key not in v_idx:
                return
            i1 = v_idx[u_key]
            i2 = v_idx[v_key]
            g = 1.0 / res_val
            G_cond[i1, i1] += g
            G_cond[i2, i2] += g
            G_cond[i1, i2] -= g
            G_cond[i2, i1] -= g

        for w in c_wires:
            add_cond_edge(endpoint_key(w.from_endpoint), endpoint_key(w.to_endpoint), 1.0)
        for att in c_atts:
            add_cond_edge(term_key(att.instanceId, att.terminalId), hole_key(att.breadboardInstanceId, att.holeId), 0.001)
        for bb_id, h1, h2 in strip_segments:
            add_cond_edge(hole_key(bb_id, h1), hole_key(bb_id, h2), 0.01)

        # Set reference vertex 0: u[0] = 0
        G_reduced = G_cond[1:, 1:].copy()
        # Add tiny numerical shunt
        np.fill_diagonal(G_reduced, G_reduced.diagonal() + 1e-9)
        b_reduced = b_cond[1:].copy()

        u_sol = np.zeros(num_v, dtype=float)
        sol_reduced = gaussian_solve(G_reduced, b_reduced)
        if sol_reduced is not None:
            u_sol[1:] = sol_reduced

        # Extract wire flows
        for w in c_wires:
            u_k = endpoint_key(w.from_endpoint)
            v_k = endpoint_key(w.to_endpoint)
            val_u = u_sol[v_idx[u_k]]
            val_v = u_sol[v_idx[v_k]]
            i_val = (val_u - val_v) / 1.0
            if abs(i_val) > 1e-6:
                if i_val > 0:
                    f_from, f_to = u_k, v_k
                else:
                    f_from, f_to = v_k, u_k
                flows.append(
                    ConductorCurrentFlow(
                        conductorId=w.id,
                        type="wire",
                        fromKey=f_from,
                        toKey=f_to,
                        currentA=round(abs(i_val), 6),
                    )
                )

        # Extract breadboard strip flows
        for bb_id, h1, h2 in strip_segments:
            u_k = hole_key(bb_id, h1)
            v_k = hole_key(bb_id, h2)
            val_u = u_sol[v_idx[u_k]]
            val_v = u_sol[v_idx[v_k]]
            i_val = (val_u - val_v) / 0.01
            if abs(i_val) > 1e-6:
                if i_val > 0:
                    f_from, f_to = u_k, v_k
                    h_from, h_to = h1, h2
                else:
                    f_from, f_to = v_k, u_k
                    h_from, h_to = h2, h1
                flows.append(
                    ConductorCurrentFlow(
                        conductorId=f"strip:{bb_id}:{h_from}:{h_to}",
                        type="breadboard-strip",
                        fromKey=f_from,
                        toKey=f_to,
                        currentA=round(abs(i_val), 6),
                        breadboardInstanceId=bb_id,
                        fromHoleId=h_from,
                        toHoleId=h_to,
                    )
                )

    return flows


def solve_circuit(req: CircuitSolveRequest) -> CircuitSolveResponse:
    # 1. Build Netlist DSU for Electrical Nodes
    dsu = DSU()

    # Register all component terminals
    for inst in req.instances:
        if "breadboard" in inst.definitionId:
            continue
        for term_id in inst.terminals:
            dsu.find(term_key(inst.instanceId, term_id))

    # Register breadboard internal strips
    breadboards = [i for i in req.instances if "breadboard" in i.definitionId]
    for bb in breadboards:
        # Col strips 1..30 top (a..e)
        for col in range(1, 31):
            top_holes = [hole_key(bb.instanceId, f"col_{col}_{r}") for r in ["a", "b", "c", "d", "e"]]
            for h in top_holes[1:]:
                dsu.union(top_holes[0], h)

            bottom_holes = [hole_key(bb.instanceId, f"col_{col}_{r}") for r in ["f", "g", "h", "i", "j"]]
            for h in bottom_holes[1:]:
                dsu.union(bottom_holes[0], h)

        # Power rails (25 holes each)
        for rail_type in ["pos", "neg"]:
            for loc in ["top", "bottom"]:
                rail_holes = [hole_key(bb.instanceId, f"rail_{loc}_{rail_type}_{i}") for i in range(1, 26)]
                for h in rail_holes[1:]:
                    dsu.union(rail_holes[0], h)

    # Attachments
    for att in req.attachments:
        t_k = term_key(att.instanceId, att.terminalId)
        h_k = hole_key(att.breadboardInstanceId, att.holeId)
        dsu.union(t_k, h_k)

    # Wires
    for wire in req.wires:
        from_k = endpoint_key(wire.from_endpoint)
        to_k = endpoint_key(wire.to_endpoint)
        dsu.union(from_k, to_k)

    # 2. Subcircuit Decomposition
    subcircuit_dsu = DSU()
    active_components = [i for i in req.instances if not "breadboard" in i.definitionId]

    for comp in active_components:
        if len(comp.terminals) >= 2:
            node_0 = dsu.find(term_key(comp.instanceId, comp.terminals[0]))
            for term_id in comp.terminals[1:]:
                node_i = dsu.find(term_key(comp.instanceId, term_id))
                subcircuit_dsu.union(node_0, node_i)

    # Group components by subcircuit root
    subcircuits: Dict[str, List[ComponentInput]] = {}
    for comp in active_components:
        if len(comp.terminals) > 0:
            node_0 = dsu.find(term_key(comp.instanceId, comp.terminals[0]))
            sub_id = subcircuit_dsu.find(node_0)
            subcircuits.setdefault(sub_id, []).append(comp)

    all_node_voltages: Dict[str, float] = {}
    all_comp_states: Dict[str, ComponentState] = {}
    all_branch_currents: List[BranchCurrent] = []
    all_subcircuits: List[SubcircuitTelemetry] = []
    all_faults: List[FaultInfo] = []
    terminal_injections: Dict[str, float] = {}
    any_current_flow = False
    has_fault = False

    # 3. Solve Each Independent Subcircuit via MNA
    for sub_id, comps in subcircuits.items():
        sources = [c for c in comps if "dc_source" in c.definitionId]
        resistors = [c for c in comps if "resistor" in c.definitionId]
        leds = [c for c in comps if "led" in c.definitionId]

        if not sources:
            # Unpowered subcircuit: mark all components non-conducting
            for comp in comps:
                all_comp_states[comp.instanceId] = ComponentState(
                    instanceId=comp.instanceId,
                    conducting=False,
                    currentA=0.0,
                    voltageDropV=0.0,
                )
            continue

        # Check for direct supply shorts upfront
        direct_short_found = False
        for src in sources:
            pos_term = term_key(src.instanceId, "pos")
            neg_term = term_key(src.instanceId, "neg")
            if dsu.find(pos_term) == dsu.find(neg_term):
                direct_short_found = True
                has_fault = True
                all_faults.append(
                    FaultInfo(
                        type="DIRECT_SUPPLY_SHORT",
                        severity="error",
                        message=f"Direct short circuit detected on power supply {src.instanceId}!",
                        remedy="Remove the direct conductor between positive and negative terminals. Add a current-limiting resistor.",
                        affectedComponentId=src.instanceId,
                        affectedNodeId=dsu.find(pos_term),
                    )
                )
                all_node_voltages[dsu.find(pos_term)] = 0.0
                all_comp_states[src.instanceId] = ComponentState(
                    instanceId=src.instanceId,
                    conducting=False,
                    voltageDropV=0.0,
                    currentA=0.0,
                )

        if direct_short_found:
            for c in comps:
                if c.instanceId not in all_comp_states:
                    all_comp_states[c.instanceId] = ComponentState(
                        instanceId=c.instanceId,
                        conducting=False,
                        voltageDropV=0.0,
                        currentA=0.0,
                    )
            all_subcircuits.append(
                SubcircuitTelemetry(
                    subcircuitId=f"sub_{sources[0].instanceId}",
                    sourceInstanceId=sources[0].instanceId,
                    sourceVoltageV=float(sources[0].properties.get("voltageV", 5.0)),
                    currentA=0.0,
                    status="fault",
                    componentInstanceIds=[c.instanceId for c in comps],
                    ledStates=[],
                )
            )
            continue

        # Check for contradictory ideal voltage sources in parallel
        contradictory_sources = False
        for i in range(len(sources)):
            for j in range(i + 1, len(sources)):
                s1, s2 = sources[i], sources[j]
                s1_pos, s1_neg = dsu.find(term_key(s1.instanceId, "pos")), dsu.find(term_key(s1.instanceId, "neg"))
                s2_pos, s2_neg = dsu.find(term_key(s2.instanceId, "pos")), dsu.find(term_key(s2.instanceId, "neg"))
                v1 = float(s1.properties.get("voltageV", 5.0))
                v2 = float(s2.properties.get("voltageV", 5.0))
                if (s1_pos == s2_pos and s1_neg == s2_neg and abs(v1 - v2) > 0.01) or (
                    s1_pos == s2_neg and s1_neg == s2_pos and abs(v1 + v2) > 0.01
                ):
                    contradictory_sources = True
                    has_fault = True
                    all_faults.append(
                        FaultInfo(
                            type="CONTRADICTORY_SOURCES",
                            severity="error",
                            message=f"Contradictory ideal voltage sources in parallel: {s1.instanceId} ({v1}V) and {s2.instanceId} ({v2}V)!",
                            remedy="Avoid connecting ideal voltage sources with different voltages directly in parallel.",
                            affectedComponentId=s1.instanceId,
                        )
                    )
                    break
            if contradictory_sources:
                break

        if contradictory_sources:
            for c in comps:
                all_comp_states[c.instanceId] = ComponentState(instanceId=c.instanceId, conducting=False)
            all_subcircuits.append(
                SubcircuitTelemetry(
                    subcircuitId=f"sub_{sources[0].instanceId}",
                    sourceInstanceId=sources[0].instanceId,
                    sourceVoltageV=float(sources[0].properties.get("voltageV", 5.0)),
                    currentA=0.0,
                    status="fault",
                    componentInstanceIds=[c.instanceId for c in comps],
                )
            )
            continue

        # Collect distinct electrical nodes for this subcircuit
        node_set: Set[str] = set()
        for comp in comps:
            for term_id in comp.terminals:
                node_set.add(dsu.find(term_key(comp.instanceId, term_id)))

        # Choose ground reference node: negative terminal of first source
        primary_source = sources[0]
        ground_node = dsu.find(term_key(primary_source.instanceId, "neg"))
        non_ground_nodes = [n for n in sorted(list(node_set)) if n != ground_node]
        node_index: Dict[str, int] = {ground_node: 0}
        for idx, n in enumerate(non_ground_nodes):
            node_index[n] = idx + 1  # 1-based index for non-ground nodes

        num_nodes = len(non_ground_nodes)
        num_sources = len(sources)
        num_leds = len(leds)

        # Active-Set Piecewise-Linear Search for LED Conduction States
        best_sol: Optional[Tuple[np.ndarray, np.ndarray, np.ndarray]] = None  # (v_nodes, i_sources, i_leds)
        best_on_mask = 0

        # Try candidate states ordered by number of conducting LEDs descending
        candidate_states: List[Tuple[int, int]] = []
        for mask in range(1 << num_leds):
            candidate_states.append((bin(mask).count("1"), mask))
        candidate_states.sort(key=lambda x: x[0], reverse=True)

        for num_on, mask in candidate_states:
            on_led_indices = [j for j in range(num_leds) if (mask >> j) & 1 == 1]
            sys_size = num_nodes + num_sources + len(on_led_indices)

            A_sys = np.zeros((sys_size, sys_size), dtype=float)
            b_sys = np.zeros(sys_size, dtype=float)

            # Tiny shunt conductance to ground to avoid floating singularity
            np.fill_diagonal(A_sys[:num_nodes, :num_nodes], 1e-10)

            # Resistors
            for res in resistors:
                r_val = max(0.01, float(res.properties.get("resistanceOhms", 330.0)))
                g = 1.0 / r_val
                u = node_index[dsu.find(term_key(res.instanceId, "pin_1"))]
                v = node_index[dsu.find(term_key(res.instanceId, "pin_2"))]
                if u > 0:
                    A_sys[u - 1, u - 1] += g
                if v > 0:
                    A_sys[v - 1, v - 1] += g
                if u > 0 and v > 0:
                    A_sys[u - 1, v - 1] -= g
                    A_sys[v - 1, u - 1] -= g

            # Voltage Sources
            for s_idx, src in enumerate(sources):
                aux_idx = num_nodes + s_idx
                u = node_index[dsu.find(term_key(src.instanceId, "pos"))]
                v = node_index[dsu.find(term_key(src.instanceId, "neg"))]
                v_set = float(src.properties.get("voltageV", 5.0))
                if u > 0:
                    A_sys[u - 1, aux_idx] += 1.0
                    A_sys[aux_idx, u - 1] += 1.0
                if v > 0:
                    A_sys[v - 1, aux_idx] -= 1.0
                    A_sys[aux_idx, v - 1] -= 1.0
                A_sys[aux_idx, aux_idx] = -1e-5  # small internal source resistance
                b_sys[aux_idx] = v_set

            # Conducting LEDs
            for l_sub_idx, l_idx in enumerate(on_led_indices):
                led_comp = leds[l_idx]
                aux_idx = num_nodes + num_sources + l_sub_idx
                u = node_index[dsu.find(term_key(led_comp.instanceId, "anode"))]
                v = node_index[dsu.find(term_key(led_comp.instanceId, "cathode"))]
                if u > 0:
                    A_sys[u - 1, aux_idx] += 1.0
                    A_sys[aux_idx, u - 1] += 1.0
                if v > 0:
                    A_sys[v - 1, aux_idx] -= 1.0
                    A_sys[aux_idx, v - 1] -= 1.0
                A_sys[aux_idx, aux_idx] = -1e-5  # small internal LED resistance
                b_sys[aux_idx] = 2.0  # Nominal forward drop

            # Off LEDs (small off-conductance to avoid artificial floating nodes and reflect reverse voltage)
            for l_idx in range(num_leds):
                if (mask >> l_idx) & 1 == 0:
                    g_off = 1e-7
                    u = node_index[dsu.find(term_key(leds[l_idx].instanceId, "anode"))]
                    v = node_index[dsu.find(term_key(leds[l_idx].instanceId, "cathode"))]
                    if u > 0:
                        A_sys[u - 1, u - 1] += g_off
                    if v > 0:
                        A_sys[v - 1, v - 1] += g_off
                    if u > 0 and v > 0:
                        A_sys[u - 1, v - 1] -= g_off
                        A_sys[v - 1, u - 1] -= g_off

            x_sol = gaussian_solve(A_sys, b_sys)
            if x_sol is None:
                continue

            # Extract voltages
            v_cand = np.zeros(len(node_set), dtype=float)
            for idx, n in enumerate(non_ground_nodes):
                v_cand[idx + 1] = x_sol[idx]

            # Extract source currents
            i_src_cand = np.zeros(num_sources, dtype=float)
            for s_idx in range(num_sources):
                i_src_cand[s_idx] = x_sol[num_nodes + s_idx]

            # Extract LED currents
            i_led_cand = np.zeros(num_leds, dtype=float)
            for l_sub_idx, l_idx in enumerate(on_led_indices):
                i_led_cand[l_idx] = x_sol[num_nodes + num_sources + l_sub_idx]

            # Verify Active-Set Consistency:
            # 1. Every ON LED must carry positive forward current (> 1e-5 A)
            is_consistent = True
            for l_idx in on_led_indices:
                if i_led_cand[l_idx] <= 1e-5:
                    is_consistent = False
                    break

            # 2. Every OFF LED must have forward voltage <= 2.0V + 1e-4
            if is_consistent:
                for l_idx in range(num_leds):
                    if (mask >> l_idx) & 1 == 0:
                        u = node_index[dsu.find(term_key(leds[l_idx].instanceId, "anode"))]
                        v = node_index[dsu.find(term_key(leds[l_idx].instanceId, "cathode"))]
                        v_fwd = v_cand[u] - v_cand[v]
                        if v_fwd > 2.0001:
                            is_consistent = False
                            break

            if is_consistent:
                best_sol = (v_cand, i_src_cand, i_led_cand)
                best_on_mask = mask
                break

        # Fallback to all-OFF if no conducting state was consistent
        if best_sol is None:
            best_on_mask = 0
            sys_size = num_nodes + num_sources
            A_sys = np.zeros((sys_size, sys_size), dtype=float)
            b_sys = np.zeros(sys_size, dtype=float)
            np.fill_diagonal(A_sys[:num_nodes, :num_nodes], 1e-10)

            for res in resistors:
                r_val = max(0.01, float(res.properties.get("resistanceOhms", 330.0)))
                g = 1.0 / r_val
                u = node_index[dsu.find(term_key(res.instanceId, "pin_1"))]
                v = node_index[dsu.find(term_key(res.instanceId, "pin_2"))]
                if u > 0:
                    A_sys[u - 1, u - 1] += g
                if v > 0:
                    A_sys[v - 1, v - 1] += g
                if u > 0 and v > 0:
                    A_sys[u - 1, v - 1] -= g
                    A_sys[v - 1, u - 1] -= g

            for led_comp in leds:
                g_off = 1e-7
                u = node_index[dsu.find(term_key(led_comp.instanceId, "anode"))]
                v = node_index[dsu.find(term_key(led_comp.instanceId, "cathode"))]
                if u > 0:
                    A_sys[u - 1, u - 1] += g_off
                if v > 0:
                    A_sys[v - 1, v - 1] += g_off
                if u > 0 and v > 0:
                    A_sys[u - 1, v - 1] -= g_off
                    A_sys[v - 1, u - 1] -= g_off

            for s_idx, src in enumerate(sources):
                aux_idx = num_nodes + s_idx
                u = node_index[dsu.find(term_key(src.instanceId, "pos"))]
                v = node_index[dsu.find(term_key(src.instanceId, "neg"))]
                v_set = float(src.properties.get("voltageV", 5.0))
                if u > 0:
                    A_sys[u - 1, aux_idx] += 1.0
                    A_sys[aux_idx, u - 1] += 1.0
                if v > 0:
                    A_sys[v - 1, aux_idx] -= 1.0
                    A_sys[aux_idx, v - 1] -= 1.0
                A_sys[aux_idx, aux_idx] = -1e-5
                b_sys[aux_idx] = v_set

            x_sol = gaussian_solve(A_sys, b_sys)
            v_cand = np.zeros(len(node_set), dtype=float)
            i_src_cand = np.zeros(num_sources, dtype=float)
            if x_sol is not None:
                for idx, n in enumerate(non_ground_nodes):
                    v_cand[idx + 1] = x_sol[idx]
                for s_idx in range(num_sources):
                    i_src_cand[s_idx] = x_sol[num_nodes + s_idx]
            best_sol = (v_cand, i_src_cand, np.zeros(num_leds, dtype=float))

        v_nodes, i_sources, i_leds = best_sol

        # Record node voltages
        all_node_voltages[ground_node] = 0.0
        for idx, n in enumerate(non_ground_nodes):
            all_node_voltages[n] = round(float(v_nodes[idx + 1]), 4)

        # Check for reverse-biased LEDs
        for l_idx, led in enumerate(leds):
            is_on = (best_on_mask >> l_idx) & 1 == 1
            if not is_on:
                u = node_index[dsu.find(term_key(led.instanceId, "anode"))]
                v = node_index[dsu.find(term_key(led.instanceId, "cathode"))]
                v_rev = v_nodes[v] - v_nodes[u]
                if v_rev > 0.5:
                    has_fault = True
                    all_faults.append(
                        FaultInfo(
                            type="REVERSED_LED",
                            severity="warning",
                            message=f"LED {led.instanceId} is reverse-biased (anode is at lower potential than cathode).",
                            remedy="Flip the LED orientation so the longer lead (anode) connects towards the positive supply.",
                            affectedComponentId=led.instanceId,
                        )
                    )

        # Populate Resistor States
        for res in resistors:
            r_val = max(0.01, float(res.properties.get("resistanceOhms", 330.0)))
            u = node_index[dsu.find(term_key(res.instanceId, "pin_1"))]
            v = node_index[dsu.find(term_key(res.instanceId, "pin_2"))]
            v1, v2 = v_nodes[u], v_nodes[v]
            v_drop = abs(v1 - v2)
            i_res = v_drop / r_val
            p_res = i_res * v_drop
            is_cond = i_res > 1e-6
            if is_cond:
                any_current_flow = True

            all_comp_states[res.instanceId] = ComponentState(
                instanceId=res.instanceId,
                conducting=is_cond,
                currentA=round(i_res, 6),
                voltageDropV=round(v_drop, 4),
                powerDissipationW=round(p_res, 4),
            )

            all_branch_currents.append(
                BranchCurrent(
                    branchId=f"branch_{res.instanceId}",
                    fromNode=dsu.find(term_key(res.instanceId, "pin_1")),
                    toNode=dsu.find(term_key(res.instanceId, "pin_2")),
                    currentA=round((v1 - v2) / r_val, 6),
                    voltageDropV=round(v_drop, 4),
                )
            )

            # Injected current into nodes:
            # Current flowing from pin_1 to pin_2: leaves pin_1 (-), enters pin_2 (+)
            i_signed = (v1 - v2) / r_val
            terminal_injections[term_key(res.instanceId, "pin_1")] = -i_signed
            terminal_injections[term_key(res.instanceId, "pin_2")] = +i_signed

        # Populate LED States
        sub_led_states: List[SubcircuitLEDState] = []
        for l_idx, led in enumerate(leds):
            is_on = (best_on_mask >> l_idx) & 1 == 1
            i_led = i_leds[l_idx] if is_on else 0.0
            u = node_index[dsu.find(term_key(led.instanceId, "anode"))]
            v = node_index[dsu.find(term_key(led.instanceId, "cathode"))]
            v_drop = 2.0 if is_on else max(0.0, v_nodes[u] - v_nodes[v])
            b_val = calculate_led_brightness(i_led) if is_on else 0.0
            overcurrent = i_led > 0.030

            if is_on:
                any_current_flow = True

            if overcurrent:
                has_fault = True
                all_faults.append(
                    FaultInfo(
                        type="OVERCURRENT",
                        severity="warning",
                        message=f"LED current ({i_led * 1000:.1f} mA) exceeds safe maximum rating of 30 mA!",
                        remedy="Increase series resistance (e.g. use 330 Ω or higher) to prevent damage.",
                        affectedComponentId=led.instanceId,
                    )
                )

            all_comp_states[led.instanceId] = ComponentState(
                instanceId=led.instanceId,
                conducting=is_on,
                currentA=round(i_led, 6),
                voltageDropV=round(v_drop, 4),
                brightness=b_val,
                overcurrent=overcurrent,
                powerDissipationW=round(i_led * v_drop, 4),
            )

            sub_led_states.append(
                SubcircuitLEDState(
                    instanceId=led.instanceId,
                    illuminated=is_on,
                    currentA=round(i_led, 6),
                )
            )

            all_branch_currents.append(
                BranchCurrent(
                    branchId=f"branch_{led.instanceId}",
                    fromNode=dsu.find(term_key(led.instanceId, "anode")),
                    toNode=dsu.find(term_key(led.instanceId, "cathode")),
                    currentA=round(i_led, 6),
                    voltageDropV=round(v_drop, 4),
                )
            )

            # Injected current into nodes:
            terminal_injections[term_key(led.instanceId, "anode")] = -i_led
            terminal_injections[term_key(led.instanceId, "cathode")] = +i_led

        # Populate Power Supply States
        total_sub_current = 0.0
        total_sub_power = 0.0
        for s_idx, src in enumerate(sources):
            # In MNA, i_sources[s_idx] is current entering the positive terminal.
            # Therefore, current supplied by the source out of its positive terminal is -i_sources[s_idx].
            i_src_delivered = -i_sources[s_idx]
            v_set = float(src.properties.get("voltageV", 5.0))
            is_cond = abs(i_src_delivered) > 1e-6
            p_src = abs(i_src_delivered * v_set)

            if is_cond:
                any_current_flow = True
                total_sub_current += max(0.0, i_src_delivered)
                total_sub_power += p_src

            all_comp_states[src.instanceId] = ComponentState(
                instanceId=src.instanceId,
                conducting=is_cond,
                currentA=round(i_src_delivered, 6),
                voltageDropV=round(v_set, 4),
                powerDissipationW=round(p_src, 4),
            )

            # Injected current into nodes from source:
            # Leaves pos terminal (+), enters neg terminal (-)
            terminal_injections[term_key(src.instanceId, "pos")] = +i_src_delivered
            terminal_injections[term_key(src.instanceId, "neg")] = -i_src_delivered

        # Subcircuit status
        sub_has_fault = any(
            f.affectedComponentId in [c.instanceId for c in comps]
            for f in all_faults
        )
        sub_status = "fault" if sub_has_fault else "conducting" if total_sub_current > 1e-6 else "open"

        if sub_status == "open":
            all_faults.append(
                FaultInfo(
                    type="OPEN_CIRCUIT",
                    severity="warning",
                    message=f"Circuit path for source {primary_source.instanceId} is open.",
                    remedy="Verify jumper wire connections and component placement.",
                    affectedComponentId=primary_source.instanceId,
                )
            )

        all_subcircuits.append(
            SubcircuitTelemetry(
                subcircuitId=f"sub_{primary_source.instanceId}",
                sourceInstanceId=primary_source.instanceId,
                sourceVoltageV=float(primary_source.properties.get("voltageV", 5.0)),
                currentA=round(total_sub_current, 6),
                status=sub_status,
                componentInstanceIds=[c.instanceId for c in comps],
                ledStates=sub_led_states,
                totalPowerW=round(total_sub_power, 4),
                sourceInstanceIds=[s.instanceId for s in sources],
            )
        )

    # 4. Solve Physical Conductor Current Distribution
    all_conductor_flows = solve_conductor_flows(
        dsu=dsu,
        terminal_injections=terminal_injections,
        wires=req.wires,
        attachments=req.attachments,
        breadboards=breadboards,
    )

    overall_status = "fault" if (has_fault and not any_current_flow) else "solved" if any_current_flow else "open"

    return CircuitSolveResponse(
        status=overall_status,
        nodeVoltages=all_node_voltages,
        componentStates=all_comp_states,
        branchCurrents=all_branch_currents,
        conductorFlows=all_conductor_flows,
        subcircuits=all_subcircuits,
        faults=all_faults,
        hasCurrentFlow=any_current_flow,
    )
