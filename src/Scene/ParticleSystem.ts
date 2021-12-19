import { ParticleConfig, ParticleConfigFactory } from "./ParticleDefinitions";
import { Dictionary } from "./ParticleDefinitions";

import THREE, {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  Geometry,
  ImageUtils,
  Material,
  NormalBlending,
  Object3D,
  Points,
  PointsMaterial,
  ShaderMaterial,
  TextureLoader,
  Vector3,
} from "three";

const randomId = () => {
  return Math.floor(Math.random() * 100000).toFixed(0);
};

export enum SpawnType {
  Circle = "Circle",
  Point = "Point",
  Rectangle = "Rectangle",
  Ring = "Ring",
  Burst = "Burst",
}

export interface Particle {
  position: Vector3;
  velocity: Vector3;
  color: Color;
  lifetime: number;
  creationTime: number;
  creationSystemPosition: Vector3;
  size: number;
  rotation: number;
  alpha: number;
  speedRandomizer: number;
  scaleRandomizer: number;
}

export interface attribute {
  name: string;
  size: number;
}

class ParticleSystem {
  public object: Object3D;
  public playing: boolean = true;
  private geometry: BufferGeometry;
  private material: ShaderMaterial;
  public config: ParticleConfig = ParticleConfigFactory();
  public src: string | undefined;
  public camera: Camera | undefined;
  private particleList: Dictionary<Particle> = {};
  private lastEmissionTime: number = 0;
  private lastUpdateTime: number = 0;
  private numParticles: number = 0;
  public emit: boolean = true;
  private id: number = Math.floor(Math.random() * 10);

  private MAX_SYSTEM_PARTICLES: number = 10000;

  private attributeArray: Array<attribute> = [
    { name: "position", size: 3 },
    { name: "color", size: 3 },
    { name: "rotation", size: 1 },
    { name: "size", size: 1 },
    { name: "alpha", size: 1 },
  ];

  private bufferData: Dictionary<BufferAttribute> = {};

  private attributeArrays: Dictionary<Float32Array> = {
    position: new Float32Array(this.MAX_SYSTEM_PARTICLES * 3),
    color: new Float32Array(this.MAX_SYSTEM_PARTICLES * 3),
    rotation: new Float32Array(this.MAX_SYSTEM_PARTICLES * 3),
    size: new Float32Array(this.MAX_SYSTEM_PARTICLES * 1),
    alpha: new Float32Array(this.MAX_SYSTEM_PARTICLES * 1),
  };

  constructor(config?: Partial<ParticleConfig>, camera?: Camera) {
    //let q = null;

    if (config) {
      for (const key in config) {
        (this.config as any)[key] = (config as any)[key];
      }
    }
    this.camera = camera;

    let startTexture = new TextureLoader().load(this.config.src);
    startTexture.flipY = false;
    this.material = new ShaderMaterial({
      uniforms: {
        color: { value: new Color(1.0, 1.0, 1.0) },
        pointTexture: { value: startTexture },
      },
      vertexShader: this.vertexShader(),
      fragmentShader: this.fragmentShader(),
      blending: AdditiveBlending,
      transparent: true,
      depthWrite: false,
      //depthTest: false,
    });

    this.geometry = new BufferGeometry();
    for (let key in this.attributeArray) {
      let attribute = this.attributeArray[key];
      this.bufferData[attribute.name] = new BufferAttribute(
        new Float32Array(this.MAX_SYSTEM_PARTICLES * attribute.size),
        attribute.size
      );
      this.geometry.setAttribute(
        attribute.name,
        this.bufferData[attribute.name]
      );
    }
    this.geometry.setDrawRange(0, 0);

    this.object = new Points(this.geometry, this.material);
    this.object.frustumCulled = false;

    this.setConfig(this.config);
  }

  fragmentShader(): string {
    let fragment = `
      //uniform vec3 color;
      uniform sampler2D pointTexture;
      varying vec3 v_color;
      varying float v_alpha;
      varying float v_rotation;

      //varying vec3 vColor;
      

      vec2 rotateUV(vec2 uv, vec2 pivot, float rotation) {
        float cosa = cos(rotation);
        float sina = sin(rotation);
        uv -= pivot;
        vec2 result = vec2(
          cosa * uv.x - sina * uv.y,
          cosa * uv.y + sina * uv.x 
        ) + pivot;
        result = clamp(result, 0.0, 1.0);
        return result;
      }

			void main() {
        //gl_FragColor = vec4(1.0,1.0,1.0,1.0);

        // gl_FragColor = vec4( color * vColor, 1.0 );

        
      
        // vec2 rotatedUV = rotateUV(gl_PointCoord, vec2(0.5, 0.5), v_rotation);
        // vec4 texColor = texture2D(pointTexture, rotatedUV);


        vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        
        // if(texColor.a < 0.9){
        //   discard;
        // }
        
        //vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        gl_FragColor = vec4(texColor.xyz*v_color, v_alpha*texColor.a);

				// gl_FragColor = texture2D( pointTexture, gl_PointCoord );

				// //if ( gl_FragColor.a < ALPHATEST ) discard;

			}
    `;
    return fragment;
  }

  vertexShader(): string {
    let vertex = `      
      attribute float size;
      attribute float alpha;
      attribute float rotation;
      attribute vec3 color;
      
      varying float v_size;
      varying float v_alpha;
      varying float v_rotation;
      varying vec3 v_color;

      varying vec2 v_rotated_uv;

      vec2 rotateUV(vec2 uv, vec2 pivot, float rotation) {
        float cosa = cos(rotation);
        float sina = sin(rotation);
        uv -= pivot;
        return vec2(
            cosa * uv.x - sina * uv.y,
            cosa * uv.y + sina * uv.x 
        ) + pivot;
      }

		void main() {
        v_size = size;
        v_alpha = alpha;
        v_rotation = rotation;
        v_color = color;




        //vColor = color;
				// vColor = customColor;

        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
        


        //float size = 1.0;
        //gl_PointSize = 100.0;
        gl_PointSize = size;
        
				//gl_PointSize = size * ( 300.0 / -mvPosition.z );

				gl_Position = projectionMatrix * mvPosition;

      }
      `;
    return vertex;
  }

  update(timestamp: number) {
    //console.log("update particle generator", this.playing);
    if (!this.playing) {
      return;
    }

    if (!this.config) {
      return;
    }

    let delta = timestamp - this.lastUpdateTime;
    this.lastUpdateTime = timestamp;

    this.pruneParticleList(timestamp);

    if (this.emit) {
      let numSpawn = 0;
      let elapsed = timestamp / 1000 - this.lastEmissionTime;
      numSpawn = Math.floor(elapsed / (1 / this.config.spawnFrequency));
      if (numSpawn > 0) {
        this.lastEmissionTime = timestamp / 1000;
        for (let i = 0; i < numSpawn; i++) {
          if (this.numParticles < this.config.maxParticles) {
            this.makeNewParticle();
          }
        }
      }
    }

    // console.log("updating id: " + this.id + " num " + this.numParticles);

    for (let key in this.particleList) {
      this.updateParticle(this.particleList[key], timestamp, delta);
    }

    // console.log(
    //   "updating id: " + this.id + " num " + this.numParticles,
    //   this.particleList
    // );

    this.updateVertices();
  }

  pruneParticleList(timestamp: number) {
    //prune:
    for (let key in this.particleList) {
      let particle = this.particleList[key];
      if (timestamp / 1000 - particle.creationTime > particle.lifetime) {
        //console.log("deleting particle", key);
        delete this.particleList[key];
        this.numParticles--;
      }
    }
  }

  updateVertices() {
    let counter = 0;
    for (let key in this.particleList) {
      let particle = this.particleList[key];
      let currentPosition = this.object.position.clone();
      let worldPosition = particle.position.clone();
      let offset = new Vector3(0, 0, 0);
      if (this.config.worldSpace) {
        offset = particle.creationSystemPosition.clone().sub(currentPosition);
      }
      worldPosition.add(offset);
      let vertex = new Vector3();
      vertex.copy(worldPosition);

      vertex.toArray(this.bufferData["position"].array, counter * 3);
      particle.color.toArray(this.bufferData["color"].array, counter * 3);

      let scaleMultiplier = 1;
      if (
        this.material.uniforms.pointTexture &&
        this.material.uniforms.pointTexture.value &&
        this.material.uniforms.pointTexture.value.image
      ) {
        scaleMultiplier =
          scaleMultiplier *
          this.material.uniforms.pointTexture.value.image.width;
      }
      if (this.camera) {
        const world = new Vector3();
        world.copy(particle.position);
        world.add(particle.creationSystemPosition);

        const dist = world.distanceTo(this.camera.position);
        //const distMultiplier = Math.min(1, 1 / dist);
        const distMultiplier = 1 / dist;
        scaleMultiplier = distMultiplier * scaleMultiplier;
        // if (!(window as any).lastPrintTime) {
        //   (window as any).lastPrintTime = performance.now();
        // }
        // if (performance.now() - (window as any).lastPrintTime > 500) {
        //   (window as any).lastPrintTime = performance.now();
        //   console.log("dist", dist, distMultiplier, scaleMultiplier);
        // }
      }

      (this.bufferData["size"].array as Float32Array)[counter] =
        particle.size * scaleMultiplier;
      (this.bufferData["rotation"].array as Float32Array)[counter] =
        particle.rotation;
      (this.bufferData["alpha"].array as Float32Array)[counter] =
        particle.alpha;

      counter++;
    }
    //console.log("update vertices", counter);

    for (let key in this.bufferData) {
      this.geometry.setAttribute(key, this.bufferData[key]);
      (this.geometry.attributes[key] as BufferAttribute).needsUpdate = true;
    }

    this.geometry.setDrawRange(0, counter);
  }

  play() {
    //this.playing = true;
    this.emit = true;
  }

  stop() {
    //this.playing = false;
    this.emit = false;
  }

  getInitialPosition(config: any): Vector3 {
    if (this.config.spawnType == "point") {
      let spawn = new Vector3(0, 0, 0);
      spawn.x = this.config.spawnX;
      spawn.z = this.config.spawnY;
      return spawn;
    }
    if (this.config.spawnType == "rectangle") {
      let spawn = new Vector3(0, 0, 0);
      spawn.x = this.config.spawnX + Math.random() * this.config.spawnWidth;
      spawn.z = this.config.spawnY + Math.random() * this.config.spawnHeight;
      return spawn;
    }
    if (this.config.spawnType == "circle") {
      let spawn = new Vector3(0, 0, 0);
      let randomR = Math.random() * this.config.spawnRadius;
      let randomTheta = Math.random() * Math.PI * 2;
      spawn.x = this.config.spawnX + randomR * Math.cos(randomTheta);
      spawn.z = this.config.spawnY + randomR * Math.sin(randomTheta);
      return spawn;
    }
    return new Vector3();
  }

  updateParticle(particle: Particle, timestamp: number, delta: number) {
    let fraction =
      (timestamp / 1000 - particle.creationTime) / particle.lifetime;

    let minSpeed = this.config.startSpeed * particle.speedRandomizer;
    let maxSpeed = this.config.stopSpeed * particle.speedRandomizer;
    let speed = minSpeed + (maxSpeed - minSpeed) * fraction;
    particle.velocity.x = this.config.directionX * speed;
    particle.velocity.y = this.config.directionY * speed;
    particle.velocity.z = this.config.directionZ * speed;

    let newPosition = particle.position.clone();
    newPosition.add(particle.velocity.clone().multiplyScalar(delta / 1000));
    particle.position.copy(newPosition);

    particle.rotation =
      particle.rotation +
      ((delta / 1000) * this.config.rotationSpeed * Math.PI) / 180;

    let maxScale = this.config.stopScale * particle.scaleRandomizer;
    let minScale = this.config.startScale * particle.scaleRandomizer;

    particle.size = this.config.startScale + fraction * (maxScale - minScale);
    particle.alpha =
      this.config.alphaStart +
      fraction * (this.config.alphaStop - this.config.alphaStart);

    let startColor = new Color(this.config.startColor);
    let stopColor = new Color(this.config.stopColor);
    let startColorV = new Vector3(startColor.r, startColor.g, startColor.b);
    let stopColorV = new Vector3(stopColor.r, stopColor.g, stopColor.b);
    let fractionColorV = stopColorV
      .sub(startColorV)
      .multiplyScalar(fraction)
      .add(startColorV);
    particle.color = new Color(
      fractionColorV.x,
      fractionColorV.y,
      fractionColorV.z
    );
  }

  makeNewParticle() {
    if (!this.config || !this.src) {
      return;
    }
    let newParticle = {} as Particle;
    newParticle.position = this.getInitialPosition(this.config);
    //newParticle.color = new Color(this.config.startColor);
    newParticle.color = new Color(1.0, 1, 1);

    newParticle.speedRandomizer =
      Math.random() * (1 - this.config.speedRandomizer) +
      this.config.speedRandomizer;
    newParticle.velocity = new Vector3(
      this.config.directionX *
        this.config.startSpeed *
        newParticle.speedRandomizer,
      this.config.directionY *
        this.config.startSpeed *
        newParticle.speedRandomizer,
      this.config.directionZ *
        this.config.startSpeed *
        newParticle.speedRandomizer
    );

    newParticle.creationSystemPosition = this.object.position.clone();
    newParticle.creationTime = performance.now() / 1000;
    newParticle.lifetime =
      Math.random() * (this.config.maxLifetime - this.config.minLifetime) +
      this.config.minLifetime;
    newParticle.size = this.config.startScale;
    newParticle.rotation = (this.config.startRotation * Math.PI) / 180;
    newParticle.alpha = this.config.alphaStart;

    newParticle.scaleRandomizer =
      Math.random() * (1 - this.config.scaleRandomizer) +
      this.config.scaleRandomizer;

    let id = randomId();
    this.particleList[id] = newParticle;
    this.numParticles++;
    //.log("adding particle", id);
  }

  setSrc(src: string) {
    //console.log("updating with src", src);
    let q = 5;

    if (this.src != src) {
      this.src = src;
      let texture = new TextureLoader().load(this.src);
      texture.flipY = false;
      this.material.uniforms.pointTexture.value = texture;
    }
    // this.material.map = texture;
    // this.material.needsUpdate = true;

    //   this.material.map = new Texture(this.src);
  }

  setConfig(config: ParticleConfig) {
    if (!config) {
      return;
    }
    this.stop();

    this.particleList = {};
    this.numParticles = 0;
    this.updateVertices();

    this.config = config;
    if (this.config.src) {
      this.setSrc(this.config.src);
    }
    if (this.config.blendMode) {
      if (this.config.blendMode == "regular") {
        if (this.material.blending != NormalBlending) {
          this.material.blending = NormalBlending;
          this.material.needsUpdate = true;
        }
      }
      if (this.config.blendMode == "additive") {
        if (this.material.blending != AdditiveBlending) {
          this.material.blending = AdditiveBlending;
          this.material.needsUpdate = true;
        }
      }
    }

    this.play();
  }
}

export default ParticleSystem;
