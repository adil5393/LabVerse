"""
Unit and integration tests for LabVerse Python DC Solver.
Verifies all Milestone D electrical simulation requirements.
"""

import pytest
from backend.solver.dc_solver import (
    CircuitSolveRequest,
    ComponentInput,
    WireInput,
    AttachmentInput,
    EndpointRef,
    solve_circuit,
    calculate_led_brightness,
)


def test_reference_5v_series_circuit():
    """
    Mandatory Acceptance 1 & Architecture Rule:
    5V DC Supply + 330 ohm Resistor + LED (fixed 2.0V forward drop).
    Current must equal (5.0 - 2.0) / 330 = 3.0 / 330 ~ 0.00909A (9.09mA).
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            # DC Pos -> Resistor Pin 1
            WireInput(
                id="w1",
                from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"),
                to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_1"),
            ),
            # Resistor Pin 2 -> LED Anode
            WireInput(
                id="w2",
                from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_2"),
                to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_1", terminalId="anode"),
            ),
            # LED Cathode -> DC Neg
            WireInput(
                id="w3",
                from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_1", terminalId="cathode"),
                to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg"),
            ),
        ],
    )

    res = solve_circuit(req)
    assert res.status == "solved"
    assert res.hasCurrentFlow is True

    # Check LED
    led_state = res.componentStates["led_1"]
    assert led_state.conducting is True
    assert pytest.approx(led_state.currentA, abs=1e-4) == 0.00909
    assert pytest.approx(led_state.voltageDropV, abs=1e-2) == 2.0
    assert led_state.brightness > 0.5  # Clearly illuminated
    assert led_state.overcurrent is False

    # Check Resistor
    res_state = res.componentStates["res_1"]
    assert pytest.approx(res_state.currentA, abs=1e-4) == 0.00909
    assert pytest.approx(res_state.voltageDropV, abs=1e-2) == 3.0


def test_direct_supply_short_detection():
    """
    Mandatory Architecture Rule 3:
    Detect direct supply shorts from the electrical graph BEFORE numerical solving.
    Returns safe fault result without divergence or crashing.
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
        ],
        wires=[
            # Short wire directly connecting Pos and Neg
            WireInput(
                id="w_short",
                from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"),
                to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg"),
            )
        ],
    )

    res = solve_circuit(req)
    assert res.status == "fault"
    assert res.hasCurrentFlow is False
    assert len(res.faults) == 1
    assert res.faults[0].type == "DIRECT_SUPPLY_SHORT"


def test_reversed_led_circuit():
    """
    Acceptance Test 3:
    Reverse-biased LED (cathode connected to positive, anode to negative).
    No false current-flow animation, zero illumination, warning fault reported.
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            # DC Pos -> Resistor Pin 1
            WireInput(
                id="w1",
                from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"),
                to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_1"),
            ),
            # Resistor Pin 2 -> LED Cathode (REVERSED!)
            WireInput(
                id="w2",
                from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_2"),
                to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_1", terminalId="cathode"),
            ),
            # LED Anode -> DC Neg
            WireInput(
                id="w3",
                from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_1", terminalId="anode"),
                to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg"),
            ),
        ],
    )

    res = solve_circuit(req)
    assert res.status == "fault"
    assert res.hasCurrentFlow is False
    assert any(f.type == "REVERSED_LED" for f in res.faults)

    led_state = res.componentStates["led_1"]
    assert led_state.conducting is False
    assert led_state.currentA == 0.0
    assert led_state.brightness == 0.0


def test_open_circuit():
    """
    Acceptance Test 2:
    Open circuit (e.g. missing return wire).
    LED turns off, no current flow.
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            # Wire only from DC Pos to Resistor Pin 1
            WireInput(
                id="w1",
                from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"),
                to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_1"),
            )
        ],
    )

    res = solve_circuit(req)
    assert res.status == "open"
    assert res.hasCurrentFlow is False
    assert any(f.type == "OPEN_CIRCUIT" for f in res.faults)


def test_resistor_value_change_affects_current_and_brightness():
    """
    Acceptance Test 4:
    Changing resistor value: 330 ohm vs 1000 ohm.
    Higher resistance decreases current and brightness consistently.
    """
    # 330 ohm circuit
    req_330 = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_1", terminalId="anode")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_1", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res_330 = solve_circuit(req_330)

    # 1000 ohm circuit: I = (5.0 - 2.0) / 1000 = 3.0mA = 0.003A
    req_1000 = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_1", definitionId="resistor_1k", properties={"resistanceOhms": 1000.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=req_330.wires,
    )
    res_1000 = solve_circuit(req_1000)

    assert res_330.componentStates["led_1"].currentA > res_1000.componentStates["led_1"].currentA
    assert res_330.componentStates["led_1"].brightness > res_1000.componentStates["led_1"].brightness
    assert pytest.approx(res_1000.componentStates["led_1"].currentA, abs=1e-4) == 0.003


def test_overcurrent_warning():
    """
    Overcurrent warning when series resistor is too small (e.g. 50 ohm -> I = 3.0 / 50 = 60mA > 30mA).
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_1", definitionId="resistor_small", properties={"resistanceOhms": 50.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_1", terminalId="anode")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_1", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )

    res = solve_circuit(req)
    assert res.componentStates["led_1"].overcurrent is True
    assert any(f.type == "OVERCURRENT" for f in res.faults)


def test_two_independent_valid_circuits():
    """
    Test two independent circuits simulated simultaneously.
    Both circuits must retain their own nodes, components, currents and LED states.
    """
    req = CircuitSolveRequest(
        instances=[
            # Circuit A
            ComponentInput(instanceId="dc_A", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_A", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_A", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            # Circuit B
            ComponentInput(instanceId="dc_B", definitionId="dc_source_5v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_B", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_B", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            # Wires A
            WireInput(id="wA1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_A", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_A", terminalId="pin_1")),
            WireInput(id="wA2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_A", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_A", terminalId="anode")),
            WireInput(id="wA3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_A", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_A", terminalId="neg")),
            # Wires B
            WireInput(id="wB1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_B", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_B", terminalId="pin_1")),
            WireInput(id="wB2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_B", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_B", terminalId="anode")),
            WireInput(id="wB3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_B", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_B", terminalId="neg")),
        ],
    )

    res = solve_circuit(req)
    assert res.status == "solved"
    assert res.hasCurrentFlow is True
    # Both LEDs illuminate
    assert res.componentStates["led_A"].conducting is True
    assert pytest.approx(res.componentStates["led_A"].currentA, abs=1e-4) == 0.00909
    assert res.componentStates["led_B"].conducting is True
    assert pytest.approx(res.componentStates["led_B"].currentA, abs=1e-4) == (9.0 - 2.0) / 330.0


def test_independent_circuit_fault_isolation():
    """
    Circuit A is valid, Circuit B has a direct short.
    Fault on Circuit B must not invalidate Circuit A.
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_A", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_A", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_A", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            ComponentInput(instanceId="dc_B", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
        ],
        wires=[
            # Wires A (valid)
            WireInput(id="wA1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_A", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_A", terminalId="pin_1")),
            WireInput(id="wA2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_A", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_A", terminalId="anode")),
            WireInput(id="wA3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_A", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_A", terminalId="neg")),
            # Wire B (direct short)
            WireInput(id="wB_short", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_B", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_B", terminalId="neg")),
        ],
    )

    res = solve_circuit(req)
    assert res.status == "solved" # Still has active current from A
    assert res.componentStates["led_A"].conducting is True
    assert any(f.type == "DIRECT_SUPPLY_SHORT" and f.affectedComponentId == "dc_B" for f in res.faults)


def test_breadboard_internal_strip_flow():
    """
    Circuit wired through breadboard holes.
    Internal strip flows must be generated for connected holes carrying branch current.
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="bb_1", definitionId="breadboard_400", properties={}, terminals=[]),
            ComponentInput(instanceId="res_1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        attachments=[
            AttachmentInput(instanceId="res_1", terminalId="pin_1", breadboardInstanceId="bb_1", holeId="col_5_a"),
            AttachmentInput(instanceId="res_1", terminalId="pin_2", breadboardInstanceId="bb_1", holeId="col_9_a"),
            AttachmentInput(instanceId="led_1", terminalId="anode", breadboardInstanceId="bb_1", holeId="col_9_b"),
            AttachmentInput(instanceId="led_1", terminalId="cathode", breadboardInstanceId="bb_1", holeId="col_13_b"),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="breadboard-hole", breadboardInstanceId="bb_1", holeId="col_5_b")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="breadboard-hole", breadboardInstanceId="bb_1", holeId="col_13_c"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )

    res = solve_circuit(req)
    assert res.status == "solved"
    assert res.componentStates["led_1"].conducting is True
    strip_flows = [f for f in res.conductorFlows if f.type == "breadboard-strip"]
    assert len(strip_flows) >= 1
    # Column 9 connects resistor pin 2 and LED anode
    col9 = next(f for f in strip_flows if "col_9" in (f.fromHoleId or ""))
    assert col9 is not None
    assert pytest.approx(col9.currentA, abs=1e-4) == 0.00909


def test_subcircuit_telemetry_multi_circuit():
    """
    Milestone D.1 Task 2 & Verification Requirement:
    Multi-subcircuit telemetry with 187 ohm (16.04 mA) and 225 ohm (13.33 mA).
    Verifies subcircuit telemetry payload and signed DC source current output.
    """
    req = CircuitSolveRequest(
        instances=[
            # Subcircuit A: 5V, 187 ohm, LED
            ComponentInput(instanceId="dc_A", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_A", definitionId="resistor_187", properties={"resistanceOhms": 187.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_A", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            # Subcircuit B: 5V, 225 ohm, LED
            ComponentInput(instanceId="dc_B", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="res_B", definitionId="resistor_225", properties={"resistanceOhms": 225.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led_B", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            # Loop A
            WireInput(id="wA1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_A", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_A", terminalId="pin_1")),
            WireInput(id="wA2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_A", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_A", terminalId="anode")),
            WireInput(id="wA3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_A", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_A", terminalId="neg")),
            # Loop B
            WireInput(id="wB1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_B", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="res_B", terminalId="pin_1")),
            WireInput(id="wB2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="res_B", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led_B", terminalId="anode")),
            WireInput(id="wB3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led_B", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_B", terminalId="neg")),
        ],
    )

    res = solve_circuit(req)
    assert res.status == "solved"
    assert len(res.subcircuits) == 2

    # Verify Subcircuit A: (5.0 - 2.0) / 187 = 0.01604278 A ~ 16.04 mA
    sub_a = next(s for s in res.subcircuits if s.sourceInstanceId == "dc_A")
    assert pytest.approx(sub_a.currentA, abs=1e-4) == 0.01604
    assert pytest.approx(sub_a.sourceVoltageV, abs=1e-2) == 5.0
    assert sub_a.ledStates[0].illuminated is True

    # Verify Subcircuit B: (5.0 - 2.0) / 225 = 0.01333333 A ~ 13.33 mA
    sub_b = next(s for s in res.subcircuits if s.sourceInstanceId == "dc_B")
    assert pytest.approx(sub_b.currentA, abs=1e-4) == 0.01333
    assert pytest.approx(sub_b.sourceVoltageV, abs=1e-2) == 5.0
    assert sub_b.ledStates[0].illuminated is True

    # Check Power Supply Output Current in componentStates
    assert pytest.approx(res.componentStates["dc_A"].currentA, abs=1e-4) == 0.01604
    assert pytest.approx(res.componentStates["dc_B"].currentA, abs=1e-4) == 0.01333


