import {
  AmbientLight,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Camera,
  Color,
  Fog,
  LoadingManager,
  Material,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  PointLight,
  RepeatWrapping,
  Scene,
  SphereBufferGeometry,
  TextureLoader,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import { FBXLoader } from './jsm/loaders/FBXLoader.js';
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Water } from "three/examples/jsm/objects/Water.js";
import { Sky } from "three/examples/jsm/objects/Sky.js";
import { time } from "console";
import LookControls from "./LookControls";

class Experience {
  canvas: HTMLCanvasElement;
  scene: Scene;
  camera: Camera;
  renderer: WebGLRenderer;
  orbitControls: OrbitControls;
  lookControls: LookControls;

  testCube: Mesh = new Mesh();
  water: Mesh = new Mesh();
  sky: Mesh = new Mesh();
  allChai: Mesh = new Mesh();
  allChaiPositions: Float32Array = new Float32Array();
  allChaiNormals: Float32Array = new Float32Array();
  sun: Vector3 = new Vector3(0, 1000, 0);
  lastWaterUpdate: number = 0;

  up: boolean = false;
  down: boolean = false;
  left: boolean = false;
  right: boolean = false;

  chaiSources: string[] = [
    "chai copy.jpg",
    "chai party copy.jpg",
    "chai party copy.png",
    "Chai party.jpeg",
    "infographic chai copy.png",
  ];

  isFirstPerson: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.scene.add(this.camera);

    const fogColor = new Color(0xffffff);

    this.scene.background = fogColor;
    this.scene.fog = new Fog(0xffffff, 0.0025, 2000);

    this.addTestCube();

    this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(new Color("#eeeeff"));

    const pointLight = new PointLight(0xffffff, 1, 10000);

    // pointLight.position.set(50, 50, 50);
    this.scene.add(pointLight);
    this.camera.add(pointLight);

    // const light = new AmbientLight(0x404040); // soft white light
    // this.scene.add(light);

    const pmremGenerator = new PMREMGenerator(this.renderer);
    this.addWater();
    this.addAllChai();
    // this.addSky();
    // this.scene.environment = pmremGenerator.fromScene(this.scene).texture;

    this.addPosters();

    (window as any).renderer = this.renderer;
    (window as any).scene = this.scene;

    // // Observe a scene or a renderer
    // if (typeof __THREE_DEVTOOLS__ !== "undefined") {
    //   __THREE_DEVTOOLS__.dispatchEvent(
    //     new CustomEvent("observe", { detail: scene })
    //   );
    //   __THREE_DEVTOOLS__.dispatchEvent(
    //     new CustomEvent("observe", { detail: renderer })
    //   );
    // }

    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.orbitControls.update();

    this.lookControls = new LookControls(this.camera, this.renderer.domElement);
    this.lookControls.disabled = true;

    const loader = new GLTFLoader();
    loader.load(
      // resource URL
      "model/lotus6.gltf",
      // called when the resource is loaded
      (gltf: any) => {
        // console.log("got gltf", gltf);
        //this.scene.add(gltf.scene);

        this.scene.add(gltf.scene);

        // gltf.animations; // Array<THREE.AnimationClip>
        // gltf.scene; // THREE.Group
        // gltf.scenes; // Array<THREE.Group>
        // gltf.cameras; // Array<THREE.Camera>
        // gltf.asset; // Object
      },
      // called while loading is progressing
      function (xhr: any) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
      },
      // called when loading has errors
      function (error: any) {
        console.log("An error happened");
      }
    );
    // const loader = new FBXLoader();
    // loader.load("model/6_ghjuytj.fbx", (object) => {
    //   //   const action = mixer.clipAction(object.animations[0]);
    //   //   action.play();
    //   console.log("loaded object", object);

    //   object.traverse(function (child) {
    //     //if (child.isMesh) {
    //     child.castShadow = true;
    //     child.receiveShadow = true;
    //     //}
    //   });

    //   this.scene.add(object);
    // });

    document.addEventListener("keydown", this.keyDownListener);

    document.addEventListener("keyup", this.keyUpListener);
  }

  setFirstPersonControls(value: boolean) {
    if (value && !this.isFirstPerson) {
      this.isFirstPerson = true;
      this.orbitControls.enabled = false;
      this.lookControls.disabled = false;
    }

    if (!value && this.isFirstPerson) {
      this.isFirstPerson = false;
      this.orbitControls.enabled = true;
      this.lookControls.disabled = true;
    }
  }

  addSky() {
    this.sky = new Sky();
    this.sky.scale.setScalar(10000);
    (this.sky.material as any).uniforms["sunPosition"].value.copy(this.sun);
    this.scene.add(this.sky);
  }

  addWater() {
    const waterGeometry = new PlaneGeometry(10000, 10000);

    this.water = new Water(waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new TextureLoader().load(
        "model/waternormals.jpg",
        (texture) => {
          texture.wrapS = texture.wrapT = RepeatWrapping;
        }
      ),
      sunDirection: new Vector3(),
      sunColor: 0xffffff,
      //   waterColor: 0x001e0f,
      waterColor: 0x964b00,
      distortionScale: 3.7,
      fog: this.scene.fog !== undefined,
    });

    this.water.rotation.x = -Math.PI / 2;
    this.water.position.set(0, -50, 0);
    (this.water.material as any).uniforms["sunDirection"].value
      .copy(this.sun)
      .normalize();
    //(this.water.material as any).uniforms["size"].value = 1;

    this.scene.add(this.water);
  }

  addPosters() {
    const posters = [];
    const loader = new TextureLoader();

    while (posters.length < 9) {
      const chai: string =
        this.chaiSources[posters.length % this.chaiSources.length];
      posters.push("model/" + chai);
    }

    const radius = 300;
    const center = new Vector3(15, -20, -15);
    for (let i = 0; i < posters.length; i++) {
      const tex = loader.load(posters[i]);
      const geometry = new BoxGeometry();
      const material = new MeshBasicMaterial({
        map: tex,
        transparent: true,
      });
      const chaiCube = new Mesh(geometry, material);
      chaiCube.scale.set(100, 100, 0.1);
      this.scene.add(chaiCube);

      const theta = (i / posters.length) * 2 * Math.PI;
      const x = radius * Math.cos(theta) + center.x;
      const y = center.y;
      const z = radius * Math.sin(theta) + center.z;
      const pos = new Vector3(x, y, z);
      const out = pos.clone().sub(center).add(new Vector3(0, 300, 0));
      const dir = pos.clone().add(out.normalize());

      chaiCube.position.set(x, y, z);

      chaiCube.lookAt(dir);
      chaiCube.name = "chai cube " + i;
    }
  }

  addAllChai() {
    const textureLoader = new TextureLoader();

    const tex = textureLoader.load("model/waternormals.jpg");
    //const waterBaseColor = tex;
    const waterNormalMap = tex;
    const waterHeightMap = tex;
    const waterRoughness = tex;
    const waterAmbientOcclusion = tex;
    const waterBaseColor = textureLoader.load("model/chaiTex1.jpg");
    // const waterNormalMap = textureLoader.load(
    //   "./textures/water/Water_002_NORM.jpg"
    // );
    // const waterHeightMap = textureLoader.load(
    //   "./textures/water/Water_002_DISP.png"
    // );
    // const waterRoughness = textureLoader.load(
    //   "./textures/water/Water_002_ROUGH.jpg"
    // );
    // const waterAmbientOcclusion = textureLoader.load(
    //   "./textures/water/Water_002_OCC.jpg"
    // );

    // PLANE
    const geometry = new SphereBufferGeometry(30, 128, 128);
    this.allChai = new Mesh(
      geometry,
      new MeshStandardMaterial({
        map: waterBaseColor,
        normalMap: waterNormalMap,
        displacementMap: waterHeightMap,
        displacementScale: 0.01,
        roughnessMap: waterRoughness,
        roughness: 0,
        aoMap: waterAmbientOcclusion,
      })
    );
    this.allChai.name = "allchai!";
    this.allChai.receiveShadow = true;
    this.allChai.castShadow = true;
    // this.allChai.rotation.x = -Math.PI / 4;
    this.allChai.position.set(10, 200, -10);
    this.allChai.scale.set(1, 3, 1);

    this.allChaiPositions = new Float32Array(
      geometry.attributes.position.array
    );
    this.allChaiNormals = new Float32Array(geometry.attributes.normal.array);

    // this.allChaiPositions = JSON.parse(
    //   JSON.stringify(geometry.attributes.position.array)
    // ) as Float32Array;
    // this.allChaiNormals = JSON.parse(
    //   JSON.stringify(geometry.attributes.normal.array)
    // ) as Float32Array;

    this.scene.add(this.allChai);
  }

  addTestCube() {
    const geometry = new BoxGeometry();
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    this.testCube = new Mesh(geometry, material);
    this.scene.add(this.testCube);

    this.camera.position.set(300, 300, 300);
  }

  update(timestamp: number) {
    this.testCube.rotation.x += 0.01;
    this.testCube.rotation.y += 0.01;

    if (timestamp - this.lastWaterUpdate > 30) {
      this.lastWaterUpdate = timestamp;
      (this.water.material as any).uniforms["time"].value += 100 / 1000;
    }

    //update allchai:
    // iterate all vertices
    const now = performance.now() / 200;
    const damping = 0.9;

    const geometry = this.allChai.geometry as BufferGeometry;
    //console.log("length", this.allChaiPositions.byteLength);
    for (let i = 0; i < this.allChaiPositions.length; i++) {
      // indices
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      // use uvs to calculate wave
      const uX = geometry.attributes.uv.getX(i) * Math.PI * 16;
      const uY = geometry.attributes.uv.getY(i) * Math.PI * 16;

      // calculate current vertex wave height
      const xangle = uX + now;
      const xsin = Math.sin(xangle) * damping;
      const yangle = uY + now;
      const ycos = Math.cos(yangle) * damping;

      // set new position
      geometry.attributes.position.setX(
        i,
        this.allChaiPositions[ix] + this.allChaiNormals[ix] * (xsin + ycos)
      );
      geometry.attributes.position.setY(
        i,
        this.allChaiPositions[iy] + this.allChaiNormals[iy] * (xsin + ycos)
      );
      geometry.attributes.position.setZ(
        i,
        this.allChaiPositions[iz] + this.allChaiNormals[iz] * (xsin + ycos)
      );
    }
    geometry.computeVertexNormals();
    if (geometry.attributes.position) {
      (geometry.attributes.position as BufferAttribute).needsUpdate = true;
    }

    this.updateKeys();

    //this.orbitControls.update();

    this.renderer.render(this.scene, this.camera);
  }

  updateKeys(): void {
    if (!this.isFirstPerson) {
      return;
    }

    let forward = new Vector3();
    this.camera.getWorldDirection(forward);
    //project forward onto XZ plane:
    let up = new Vector3(0, 1, 0);

    let right = new Vector3();
    right.copy(forward);
    right.cross(up);

    let perp = new Vector3();
    perp = forward.clone().cross(right).multiplyScalar(-1);

    let directionalFactor = 4;

    const planarVelocity = new Vector3();
    if (this.up) {
      let additional = new Vector3();
      additional.copy(forward);
      additional.multiplyScalar(directionalFactor);
      planarVelocity.add(additional);
    }
    if (this.down) {
      let additional = new Vector3();
      additional.copy(forward);
      additional.multiplyScalar(directionalFactor);
      planarVelocity.sub(additional);
    }
    if (this.left) {
      let additional = new Vector3();
      additional.copy(right);
      additional.multiplyScalar(directionalFactor);
      planarVelocity.sub(additional);
    }
    if (this.right) {
      let additional = new Vector3();
      additional.copy(right);
      additional.multiplyScalar(directionalFactor);
      planarVelocity.add(additional);
    }

    this.camera.position.add(planarVelocity);
  }

  keyDownListener = (event: { code: string }) => {
    if (event.code == "KeyW") {
      this.up = true;
    }

    if (event.code == "KeyA") {
      this.left = true;
    }

    if (event.code == "KeyS") {
      this.down = true;
    }

    if (event.code == "KeyD") {
      this.right = true;
    }
  };

  keyUpListener = (event: { code: string }) => {
    if (event.code == "KeyW") {
      this.up = false;
    }

    if (event.code == "KeyA") {
      this.left = false;
    }

    if (event.code == "KeyS") {
      this.down = false;
    }

    if (event.code == "KeyD") {
      this.right = false;
    }
  };
}
export default Experience;
