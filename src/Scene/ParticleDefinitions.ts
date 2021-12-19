export interface Dictionary<T> {
  [Key: string]: T;
}

export interface ParticleConfig {
  alphaStart: number;
  alphaStop: number;
  startScale: number;
  stopScale: number;
  scaleRandomizer: number;
  startColor: string;
  stopColor: string;
  startSpeed: number;
  stopSpeed: number;
  speedRandomizer: number;
  directionX: number;
  directionY: number;
  directionZ: number;
  startRotation: number;
  rotationSpeed: number;
  minLifetime: number;
  maxLifetime: number;
  spawnFrequency: number;
  maxParticles: number;
  src: string;
  spawnType: string;
  spawnX: number;
  spawnY: number;
  spawnWidth: number;
  spawnHeight: number;
  spawnRadius: number;
  blendMode: string;
  worldSpace: boolean;
}

export const ParticleSettingsUI: Dictionary<DatControlDefinition> = {
  alphaStart: { type: "number", min: 0, max: 1, default: 1 },
  alphaStop: { type: "number", min: 0, max: 1, default: 1 },
  startScale: { type: "number", min: 0, max: 100, default: 1 },
  stopScale: { type: "number", min: 0, max: 100, default: 1 },
  scaleRandomizer: { type: "number", min: 0, max: 1, default: 1 },
  startColor: { type: "color", default: "#0000ff" },
  stopColor: { type: "color", default: "#ffffff" },
  startSpeed: { type: "number", min: 0, max: 5000, default: 0 },
  stopSpeed: { type: "number", min: 0, max: 5000, default: 0 },
  speedRandomizer: { type: "number", min: 0, max: 1, default: 1 },
  directionX: { type: "number", min: -1, max: 1, default: 0 },
  directionY: { type: "number", min: -1, max: 1, default: 0.0 },
  directionZ: { type: "number", min: -1, max: 1, default: 0 },
  startRotation: { type: "number", min: 0, max: 360, default: 0 },
  rotationSpeed: { type: "number", min: 0, max: 3000, default: 0 },
  minLifetime: { type: "number", min: 0, max: 10, default: 4 },
  maxLifetime: { type: "number", min: 0, max: 10, default: 4 },
  spawnFrequency: { type: "number", min: 0.1, max: 10000, default: 100 },
  maxParticles: { type: "number", min: 0, max: 1000, default: 20000 },
  src: {
    type: "select",
    default: "/smoke.png",
    options: ["/particle.png"],
  },
  spawnType: {
    type: "select",
    default: "point",
    options: ["point", "rectangle", "circle"],
  },
  spawnX: { type: "number", min: 0, max: 3000, default: 0 },
  spawnY: { type: "number", min: 0, max: 3000, default: 0 },
  spawnWidth: {
    type: "number",
    min: 0,
    max: 3000,
    default: 1,
    conditionalKey: "spawnType",
    conditionalVal: "rectangle",
  },
  spawnHeight: {
    type: "number",
    min: 0,
    max: 3000,
    default: 1,
    conditionalKey: "spawnType",
    conditionalVal: "rectangle",
  },
  spawnRadius: {
    type: "number",
    min: 0,
    max: 3000,
    default: 1,
    conditionalKey: "spawnType",
    conditionalVal: "circle",
  },
  blendMode: {
    type: "select",
    default: "regular",
    options: ["additive", "regular"],
  },
  worldSpace: {
    type: "boolean",
    default: true,
  },
};

export const ParticleConfigFactory = (): ParticleConfig => {
  let result = {} as any; //ParticleConfig;
  for (let key in ParticleSettingsUI) {
    result[key] = ParticleSettingsUI[key].default;
  }
  result = result as ParticleConfig;
  return result;
};

export interface DatControlDefinition {
  type: string;
  default?: any;
  min?: number;
  max?: number;
  options?: Array<string>;
  conditionalKey?: any;
  conditionalVal?: any;
}
