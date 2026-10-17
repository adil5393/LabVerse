/**
 * Scientific Constants and Defaults for LabVerse Chemistry Laboratory
 */

// Absolute zero offset: 0 K = -273.15 °C
export const ZERO_CELSIUS_IN_KELVIN = 273.15;

// Standard atmospheric pressure in Pascals
export const STANDARD_PRESSURE_PA = 101325; // 1 atm

// Boltzmann constant scaled for 2D educational simulation coordinates
export const EDUCATIONAL_KB = 1.38e-2;

// Standard sample mass used in thermodynamic calculations (100 grams)
export const DEFAULT_SAMPLE_MASS_KG = 0.1;

// Default heating / cooling power in Watts (Joules / second)
export const DEFAULT_HEAT_POWER_WATTS = 250;

// Default chamber geometry in simulation space
export const CHAMBER_WIDTH = 500;
export const CHAMBER_HEIGHT_MAX = 420;
export const CHAMBER_HEIGHT_MIN = 140;
export const DEFAULT_PISTON_HEIGHT = 380;

// Simulation timestep (fixed 60 Hz equivalent)
export const SIMULATION_DT = 1 / 60;
export const SUB_STEPS = 2; // Numerical substeps per frame for stability
