"""
Reference Circuit Test Suite for Milestone D.2 — Generalized DC Circuit Solver
Tests all 12 reference cases specified in Milestone D.2 specification.
"""

import pytest
from backend.solver.dc_solver import (
    CircuitSolveRequest,
    ComponentInput,
    WireInput,
    AttachmentInput,
    EndpointRef,
    solve_circuit,
)


def test_ref_1_two_resistors_in_series():
    """
    Test 1 — Two resistors in series:
    9 V source -> 100 ohm -> 200 ohm -> source negative.
    Expected:
    - Total resistance: 300 ohm
    - Current: 30 mA (0.030 A)
    - 100 ohm drop: 3.0 V
    - 200 ohm drop: 6.0 V
    - Source output: 30 mA
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r_100", definitionId="resistor_100", properties={"resistanceOhms": 100.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="r_200", definitionId="resistor_200", properties={"resistanceOhms": 200.0}, terminals=["pin_1", "pin_2"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r_100", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r_100", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r_200", terminalId="pin_1")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r_200", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"
    assert res.hasCurrentFlow is True
    assert pytest.approx(res.componentStates["r_100"].currentA, abs=1e-4) == 0.030
    assert pytest.approx(res.componentStates["r_100"].voltageDropV, abs=1e-3) == 3.0
    assert pytest.approx(res.componentStates["r_200"].currentA, abs=1e-4) == 0.030
    assert pytest.approx(res.componentStates["r_200"].voltageDropV, abs=1e-3) == 6.0
    assert pytest.approx(res.componentStates["dc_1"].currentA, abs=1e-4) == 0.030
    assert pytest.approx(res.subcircuits[0].currentA, abs=1e-4) == 0.030


def test_ref_2_three_resistors_in_series():
    """
    Test 2 — Three resistors in series:
    9 V source -> 10 ohm -> 10 ohm -> 330 ohm -> negative.
    Expected:
    - Total resistance: 350 ohm
    - Current: ~25.714 mA (9 / 350 A)
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_10", properties={"resistanceOhms": 10.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="r2", definitionId="resistor_10", properties={"resistanceOhms": 10.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="r3", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r2", terminalId="pin_1")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r2", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r3", terminalId="pin_1")),
            WireInput(id="w4", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r3", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"
    expected_current = 9.0 / 350.0
    assert pytest.approx(res.componentStates["r1"].currentA, abs=1e-4) == expected_current
    assert pytest.approx(res.componentStates["r2"].currentA, abs=1e-4) == expected_current
    assert pytest.approx(res.componentStates["r3"].currentA, abs=1e-4) == expected_current
    assert pytest.approx(res.componentStates["dc_1"].currentA, abs=1e-4) == expected_current


def test_ref_3_two_leds_in_series():
    """
    Test 3 — Two LEDs in series:
    9 V source -> 330 ohm -> LED 1 -> LED 2 -> negative.
    Expected:
    - Current: ~15.152 mA ((9 - 4) / 330)
    - LED 1: conducting, 2.0 V drop
    - LED 2: conducting, 2.0 V drop
    - Both illuminated
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            ComponentInput(instanceId="led2", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led1", terminalId="anode")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led1", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led2", terminalId="anode")),
            WireInput(id="w4", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led2", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"
    expected_current = (9.0 - 4.0) / 330.0
    assert pytest.approx(res.componentStates["led1"].currentA, abs=1e-4) == expected_current
    assert pytest.approx(res.componentStates["led2"].currentA, abs=1e-4) == expected_current
    assert res.componentStates["led1"].conducting is True
    assert res.componentStates["led2"].conducting is True
    assert res.componentStates["led1"].brightness > 0.5
    assert res.componentStates["led2"].brightness > 0.5


def test_ref_4_three_resistors_and_two_leds():
    """
    Test 4 — Three resistors and two LEDs:
    9 V source -> 10 ohm -> 10 ohm -> 330 ohm -> LED 1 -> LED 2 -> negative.
    Expected:
    - Total resistance: 350 ohm
    - Total LED drop: 4.0 V
    - Current: ~14.286 mA ((9 - 4) / 350)
    - Both LEDs illuminated
    - Each 10 ohm resistor: ~0.143 V
    - 330 ohm resistor: ~4.714 V
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_10", properties={"resistanceOhms": 10.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="r2", definitionId="resistor_10", properties={"resistanceOhms": 10.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="r3", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            ComponentInput(instanceId="led2", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r2", terminalId="pin_1")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r2", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r3", terminalId="pin_1")),
            WireInput(id="w4", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r3", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led1", terminalId="anode")),
            WireInput(id="w5", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led1", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led2", terminalId="anode")),
            WireInput(id="w6", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led2", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"
    expected_current = (9.0 - 4.0) / 350.0
    assert pytest.approx(res.componentStates["r1"].currentA, abs=1e-4) == expected_current
    assert pytest.approx(res.componentStates["r1"].voltageDropV, abs=1e-3) == expected_current * 10.0
    assert pytest.approx(res.componentStates["r2"].voltageDropV, abs=1e-3) == expected_current * 10.0
    assert pytest.approx(res.componentStates["r3"].voltageDropV, abs=1e-3) == expected_current * 330.0
    assert res.componentStates["led1"].conducting is True
    assert res.componentStates["led2"].conducting is True


def test_ref_5_parallel_resistors():
    """
    Test 5 — Parallel resistors:
    9 V across parallel 100 ohm and 200 ohm resistors.
    Expected:
    - 100 ohm branch: 90 mA (0.090 A)
    - 200 ohm branch: 45 mA (0.045 A)
    - Source output: 135 mA (0.135 A)
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_100", properties={"resistanceOhms": 100.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="r2", definitionId="resistor_200", properties={"resistanceOhms": 200.0}, terminals=["pin_1", "pin_2"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r2", terminalId="pin_1")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
            WireInput(id="w4", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r2", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"
    assert pytest.approx(res.componentStates["r1"].currentA, abs=1e-4) == 0.090
    assert pytest.approx(res.componentStates["r2"].currentA, abs=1e-4) == 0.045
    assert pytest.approx(res.componentStates["dc_1"].currentA, abs=1e-4) == 0.135
    assert pytest.approx(res.subcircuits[0].currentA, abs=1e-4) == 0.135


def test_ref_6_two_parallel_led_branches():
    """
    Test 6 — Two parallel LED branches:
    9 V source feeding two parallel branches.
    Each branch: 330 ohm resistor + 1 red LED (nominal 2.0 V drop).
    Expected:
    - Each branch current: ~21.212 mA ((9 - 2) / 330)
    - Source output: ~42.424 mA
    - Both LEDs illuminated
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            # Branch A
            ComponentInput(instanceId="rA", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="ledA", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            # Branch B
            ComponentInput(instanceId="rB", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="ledB", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            # Branch A wiring
            WireInput(id="wA1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="rA", terminalId="pin_1")),
            WireInput(id="wA2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="rA", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="ledA", terminalId="anode")),
            WireInput(id="wA3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="ledA", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
            # Branch B wiring
            WireInput(id="wB1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="rB", terminalId="pin_1")),
            WireInput(id="wB2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="rB", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="ledB", terminalId="anode")),
            WireInput(id="wB3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="ledB", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"
    expected_branch = (9.0 - 2.0) / 330.0
    assert pytest.approx(res.componentStates["ledA"].currentA, abs=1e-4) == expected_branch
    assert pytest.approx(res.componentStates["ledB"].currentA, abs=1e-4) == expected_branch
    assert pytest.approx(res.componentStates["dc_1"].currentA, abs=1e-4) == 2 * expected_branch
    assert res.componentStates["ledA"].conducting is True
    assert res.componentStates["ledB"].conducting is True


def test_ref_7_reversed_series_led():
    """
    Test 7 — Reversed series LED:
    Reverse one LED in a two-LED series chain.
    Expected:
    - No conducting series current under ideal off-state model
    - Both LEDs off
    - Reversed LED warning diagnostic
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            ComponentInput(instanceId="led2", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led1", terminalId="anode")),
            # led2 reversed: cathode connected towards anode of led1
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led1", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led2", terminalId="cathode")),
            WireInput(id="w4", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led2", terminalId="anode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.hasCurrentFlow is False
    assert res.componentStates["led1"].conducting is False
    assert res.componentStates["led2"].conducting is False
    assert res.componentStates["led1"].currentA == 0.0
    assert res.componentStates["led2"].currentA == 0.0
    assert any(f.type == "REVERSED_LED" and f.affectedComponentId == "led2" for f in res.faults)


def test_ref_8_insufficient_supply_voltage():
    """
    Test 8 — Insufficient supply voltage:
    3 V source -> 330 ohm -> two series red LEDs (requiring 4.0 V) -> negative.
    Expected:
    - No forward conduction under fixed 2 V-per-LED model
    - Both LEDs off
    - Zero fabricated positive current
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_3v", properties={"voltageV": 3.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            ComponentInput(instanceId="led2", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_1")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led1", terminalId="anode")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led1", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="led2", terminalId="anode")),
            WireInput(id="w4", from_endpoint=EndpointRef(kind="component-terminal", instanceId="led2", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.hasCurrentFlow is False
    assert res.componentStates["led1"].conducting is False
    assert res.componentStates["led2"].conducting is False
    assert res.componentStates["led1"].currentA == 0.0
    assert res.componentStates["led2"].currentA == 0.0
    assert res.componentStates["dc_1"].currentA == 0.0


def test_ref_9_multiple_independent_networks():
    """
    Test 9 — Multiple independent networks:
    Circuit A: 9 V, three resistors (10, 10, 330), two LEDs.
    Circuit B: 5 V, one 330 ohm resistor, one red LED.
    Expected:
    - Both networks solved independently
    - Correct currents for each network
    - No cross-network contamination
    """
    req = CircuitSolveRequest(
        instances=[
            # Network A
            ComponentInput(instanceId="dc_A", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="rA1", definitionId="resistor_10", properties={"resistanceOhms": 10.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="rA2", definitionId="resistor_10", properties={"resistanceOhms": 10.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="rA3", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="ledA1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            ComponentInput(instanceId="ledA2", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            # Network B
            ComponentInput(instanceId="dc_B", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="rB1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="ledB1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        wires=[
            # Loop A
            WireInput(id="wA1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_A", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="rA1", terminalId="pin_1")),
            WireInput(id="wA2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="rA1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="rA2", terminalId="pin_1")),
            WireInput(id="wA3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="rA2", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="rA3", terminalId="pin_1")),
            WireInput(id="wA4", from_endpoint=EndpointRef(kind="component-terminal", instanceId="rA3", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="ledA1", terminalId="anode")),
            WireInput(id="wA5", from_endpoint=EndpointRef(kind="component-terminal", instanceId="ledA1", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="ledA2", terminalId="anode")),
            WireInput(id="wA6", from_endpoint=EndpointRef(kind="component-terminal", instanceId="ledA2", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_A", terminalId="neg")),
            # Loop B
            WireInput(id="wB1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_B", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="rB1", terminalId="pin_1")),
            WireInput(id="wB2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="rB1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="ledB1", terminalId="anode")),
            WireInput(id="wB3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="ledB1", terminalId="cathode"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_B", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"
    assert len(res.subcircuits) == 2

    expected_iA = (9.0 - 4.0) / 350.0  # ~14.286 mA
    expected_iB = (5.0 - 2.0) / 330.0  # ~9.091 mA

    assert pytest.approx(res.componentStates["dc_A"].currentA, abs=1e-4) == expected_iA
    assert pytest.approx(res.componentStates["dc_B"].currentA, abs=1e-4) == expected_iB
    assert res.componentStates["ledA1"].conducting is True
    assert res.componentStates["ledA2"].conducting is True
    assert res.componentStates["ledB1"].conducting is True


def test_ref_10_shared_node_branching():
    """
    Test 10 — Shared-node branching:
    One series resistor feeding two parallel resistor branches.
    9 V source -> R1 (100 ohm) -> branching node -> R2 (200 ohm) and R3 (300 ohm) to GND.
    Verify Kirchhoff's Current Law at branching node:
    I_in = I_branch1 + I_branch2 within numerical tolerance.
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_100", properties={"resistanceOhms": 100.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="r2", definitionId="resistor_200", properties={"resistanceOhms": 200.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="r3", definitionId="resistor_300", properties={"resistanceOhms": 300.0}, terminals=["pin_1", "pin_2"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_1")),
            # Branching node connects r1.pin_2 to r2.pin_1 and r3.pin_1
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r2", terminalId="pin_1")),
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r3", terminalId="pin_1")),
            # Returns to DC neg
            WireInput(id="w4", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r2", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
            WireInput(id="w5", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r3", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"

    i_in = res.componentStates["r1"].currentA
    i_b1 = res.componentStates["r2"].currentA
    i_b2 = res.componentStates["r3"].currentA

    # KCL verification:
    assert pytest.approx(i_in, abs=1e-5) == i_b1 + i_b2

    # Theoretical: Rp = 200*300/(500) = 120 ohm. Total R = 220 ohm.
    # i_in = 9 / 220 ~ 0.040909 A
    assert pytest.approx(i_in, abs=1e-4) == 9.0 / 220.0
    assert pytest.approx(res.componentStates["dc_1"].currentA, abs=1e-4) == 9.0 / 220.0


def test_ref_11_multiple_sources_and_contradictory_constraints():
    """
    Test 11 — Multiple sources in one network:
    Case A: Valid series-aiding two-source circuit (5 V + 4 V feeding 300 ohm).
    Case B: Contradictory ideal voltage sources in parallel (5 V and 9 V) -> explicit diagnostic.
    """
    # Case A: Two sources in one network
    req_a = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="dc_2", definitionId="dc_source_4v", properties={"voltageV": 4.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_300", properties={"resistanceOhms": 300.0}, terminals=["pin_1", "pin_2"]),
        ],
        wires=[
            # dc_1 pos to dc_2 neg (series aiding)
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_2", terminalId="neg")),
            # dc_2 pos to r1 pin_1
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_2", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_1")),
            # r1 pin_2 to dc_1 neg
            WireInput(id="w3", from_endpoint=EndpointRef(kind="component-terminal", instanceId="r1", terminalId="pin_2"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res_a = solve_circuit(req_a)
    assert res_a.status == "solved"
    # Total voltage is 5 + 4 = 9 V across 300 ohm -> 30 mA
    assert pytest.approx(res_a.componentStates["r1"].currentA, abs=1e-4) == 0.030
    assert pytest.approx(res_a.componentStates["dc_1"].currentA, abs=1e-4) == 0.030
    assert pytest.approx(res_a.componentStates["dc_2"].currentA, abs=1e-4) == 0.030

    # Case B: Contradictory sources in parallel
    req_b = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="dc_1", definitionId="dc_source_5v", properties={"voltageV": 5.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="dc_2", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
        ],
        wires=[
            WireInput(id="w1", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_2", terminalId="pos")),
            WireInput(id="w2", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_2", terminalId="neg")),
        ],
    )
    res_b = solve_circuit(req_b)
    assert res_b.status == "fault"
    assert any(f.type == "CONTRADICTORY_SOURCES" for f in res_b.faults)


def test_ref_12_breadboard_based_equivalents():
    """
    Test 12 — Breadboard-based equivalents:
    Recreate Test 3 (Two series LEDs on 9 V) through breadboard holes:
    DC pos -> wire to col_5_b -> r1 (pin 1 @ col_5_a, pin 2 @ col_9_a) ->
    col_9 strip -> led1 (anode @ col_9_b, cathode @ col_13_b) ->
    col_13 strip -> led2 (anode @ col_13_c, cathode @ col_17_c) ->
    wire from col_17_b to DC neg.
    """
    req = CircuitSolveRequest(
        instances=[
            ComponentInput(instanceId="bb_1", definitionId="breadboard_400", properties={}, terminals=[]),
            ComponentInput(instanceId="dc_1", definitionId="dc_source_9v", properties={"voltageV": 9.0}, terminals=["pos", "neg"]),
            ComponentInput(instanceId="r1", definitionId="resistor_330", properties={"resistanceOhms": 330.0}, terminals=["pin_1", "pin_2"]),
            ComponentInput(instanceId="led1", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
            ComponentInput(instanceId="led2", definitionId="led_5mm_red", properties={}, terminals=["anode", "cathode"]),
        ],
        attachments=[
            AttachmentInput(instanceId="r1", terminalId="pin_1", breadboardInstanceId="bb_1", holeId="col_5_a"),
            AttachmentInput(instanceId="r1", terminalId="pin_2", breadboardInstanceId="bb_1", holeId="col_9_a"),
            AttachmentInput(instanceId="led1", terminalId="anode", breadboardInstanceId="bb_1", holeId="col_9_b"),
            AttachmentInput(instanceId="led1", terminalId="cathode", breadboardInstanceId="bb_1", holeId="col_13_b"),
            AttachmentInput(instanceId="led2", terminalId="anode", breadboardInstanceId="bb_1", holeId="col_13_c"),
            AttachmentInput(instanceId="led2", terminalId="cathode", breadboardInstanceId="bb_1", holeId="col_17_c"),
        ],
        wires=[
            WireInput(id="w_in", from_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="pos"), to_endpoint=EndpointRef(kind="breadboard-hole", breadboardInstanceId="bb_1", holeId="col_5_b")),
            WireInput(id="w_out", from_endpoint=EndpointRef(kind="breadboard-hole", breadboardInstanceId="bb_1", holeId="col_17_b"), to_endpoint=EndpointRef(kind="component-terminal", instanceId="dc_1", terminalId="neg")),
        ],
    )
    res = solve_circuit(req)
    assert res.status == "solved"
    expected_current = (9.0 - 4.0) / 330.0
    assert pytest.approx(res.componentStates["led1"].currentA, abs=1e-4) == expected_current
    assert pytest.approx(res.componentStates["led2"].currentA, abs=1e-4) == expected_current
    assert res.componentStates["led1"].conducting is True
    assert res.componentStates["led2"].conducting is True

    # Verify breadboard strip flows were generated
    strip_flows = [f for f in res.conductorFlows if f.type == "breadboard-strip"]
    assert len(strip_flows) >= 3  # col 5, col 9, col 13, col 17
