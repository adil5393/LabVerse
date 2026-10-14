import { create } from 'zustand';
import type { GuidedStep } from '../types/workbench';

export const INITIAL_LED_GUIDED_STEPS: GuidedStep[] = [
  {
    id: 'step_1_breadboard',
    stepNumber: 1,
    title: 'Place Solderless Breadboard',
    instruction: 'Drag the 400-tie-point breadboard from the inventory onto the central ESD workbench mat.',
    learningObjective: 'Understand the standard prototyping base and tie-point grid geometry.',
    hint: 'Click "Add" next to Half-Size Solderless Breadboard in the Prototyping equipment catalog on the left.',
    targetComponentId: 'breadboard_half_400',
    isComplete: false,
  },
  {
    id: 'step_2_power',
    stepNumber: 2,
    title: 'Place DC Power Supply',
    instruction: 'Place the 5.0V DC Bench Source near the breadboard to supply electrical energy to the circuit.',
    learningObjective: 'Identify positive (VCC) and ground (GND) potential sources.',
    hint: 'Add the DC Bench Power Supply from the Power Sources category.',
    targetComponentId: 'dc_source_5v',
    isComplete: false,
  },
  {
    id: 'step_3_led',
    stepNumber: 3,
    title: 'Insert Red LED with Correct Polarity',
    instruction: 'Place the 5mm Red LED onto the breadboard. Note the longer lead is the Anode (+) and shorter is Cathode (-).',
    learningObjective: 'Understand diode semiconductor unidirectional conduction and forward voltage drop (~2.0V).',
    hint: 'LEDs only conduct when forward-biased. Ensure Anode is oriented toward higher electrical potential.',
    targetComponentId: 'led_5mm_red',
    isComplete: false,
  },
  {
    id: 'step_4_resistor',
    stepNumber: 4,
    title: 'Insert Current-Limiting Resistor (330Ω)',
    instruction: 'Place a 330Ω through-hole resistor in series with the LED to prevent excessive current flow.',
    learningObjective: "Apply Ohm's law (I = (V_supply - V_led) / R) to protect sensitive semiconductor devices.",
    hint: 'Without a resistor, connecting an LED directly to 5V will burn out the component or trip the power supply!',
    targetComponentId: 'resistor_330',
    isComplete: false,
  },
  {
    id: 'step_5_wires',
    stepNumber: 5,
    title: 'Complete Loop with Jumper Wires',
    instruction: 'Use jumper wires to connect DC Source (+) to the Resistor, Resistor to LED Anode, and LED Cathode back to DC Ground (-).',
    learningObjective: 'Establish an unbroken closed circuit loop with physical electrical continuity.',
    hint: 'Click on a component terminal or breadboard hole, then click another hole to route a wire.',
    targetComponentId: 'jumper_wire',
    isComplete: false,
  },
  {
    id: 'step_6_simulate',
    stepNumber: 6,
    title: 'Engage DC Supply & Observe Measurements',
    instruction: 'Toggle the circuit power ON. Observe that the LED illuminates and measured current reaches ~9.09 mA.',
    learningObjective: 'Scientifically verify theoretical calculations against real circuit simulation measurements.',
    hint: 'If the LED does not turn on, inspect for open circuits, reversed LED polarity, or disconnected jumper wires.',
    isComplete: false,
  },
];

interface GuidanceState {
  isGuided: boolean;
  activeStepIndex: number;
  steps: GuidedStep[];
  isHintOpen: boolean;

  setGuidedMode: (enabled: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  setStepComplete: (stepIndex: number, complete: boolean) => void;
  toggleHint: () => void;
  resetGuidance: () => void;
}

export const useGuidanceStore = create<GuidanceState>((set) => ({
  isGuided: true,
  activeStepIndex: 0,
  steps: INITIAL_LED_GUIDED_STEPS,
  isHintOpen: false,

  setGuidedMode: (enabled) => set({ isGuided: enabled }),

  nextStep: () =>
    set((state) => ({
      activeStepIndex: Math.min(state.steps.length - 1, state.activeStepIndex + 1),
    })),

  prevStep: () =>
    set((state) => ({
      activeStepIndex: Math.max(0, state.activeStepIndex - 1),
    })),

  goToStep: (index) =>
    set((state) => ({
      activeStepIndex: Math.max(0, Math.min(state.steps.length - 1, index)),
    })),

  setStepComplete: (stepIndex, complete) =>
    set((state) => ({
      steps: state.steps.map((s, idx) =>
        idx === stepIndex ? { ...s, isComplete: complete } : s
      ),
    })),

  toggleHint: () =>
    set((state) => ({
      isHintOpen: !state.isHintOpen,
    })),

  resetGuidance: () =>
    set({
      activeStepIndex: 0,
      steps: INITIAL_LED_GUIDED_STEPS,
      isHintOpen: false,
    }),
}));
