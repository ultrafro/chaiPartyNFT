// import {
//   DoubleSide,
//   Mesh,
//   MeshPhongMaterial,
//   ParametricGeometry,
//   RepeatWrapping,
//   Scene,
//   ShaderMaterial,
//   TextureLoader,
// } from "three";

// class Cloth {
//   constructor(scene: Scene, src: string) {
//     const loader = new TextureLoader();
//     const clothTexture = loader.load(src);
//     // var clothTexture = new TextureLoader(
//     //   "textures/patterns/circuit_pattern.png"
//     // );
//     clothTexture.wrapS = clothTexture.wrapT = RepeatWrapping;
//     clothTexture.anisotropy = 16;

//     const clothMaterial = new MeshPhongMaterial({
//       alphaTest: 0.5,
//       color: 0xffffff,
//       specular: 0x030303,
//       emissive: 0x111111,
//       shininess: 10,
//       map: clothTexture,
//       side: DoubleSide,
//     });

//     // cloth geometry
//     const clothGeometry = new ParametricGeometry(
//       clothFunction,
//       cloth.w,
//       cloth.h,
//       true
//     );
//     clothGeometry.computeFaceNormals();

//     const fragmentShaderDepth = `uniform sampler2D texture;
//     varying vec2 vUV;

//     vec4 pack_depth( const in float depth ) {

//         const vec4 bit_shift = vec4( 256.0 * 256.0 * 256.0, 256.0 * 256.0, 256.0, 1.0 );
//         const vec4 bit_mask  = vec4( 0.0, 1.0 / 256.0, 1.0 / 256.0, 1.0 / 256.0 );
//         vec4 res = fract( depth * bit_shift );
//         res -= res.xxyz * bit_mask;
//         return res;

//     }

//     void main() {

//         vec4 pixel = texture2D( texture, vUV );

//         if ( pixel.a < 0.5 ) discard;

//         gl_FragData[ 0 ] = pack_depth( gl_FragCoord.z );

//     }`;

//     const vertexShaderDepth = `			varying vec2 vUV;

//     void main() {

//         vUV = 0.75 * uv;

//         vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

//         gl_Position = projectionMatrix * mvPosition;

//     }`;

//     var uniforms = { texture: { type: "t", value: 0, texture: clothTexture } };

//     // cloth mesh

//     const object = new Mesh(clothGeometry, clothMaterial);
//     object.position.set(0, 0, 0);
//     object.castShadow = true;
//     object.receiveShadow = true;
//     scene.add(object);

//     object.customDepthMaterial = new ShaderMaterial({
//       uniforms: uniforms,
//       vertexShader: vertexShaderDepth,
//       fragmentShader: fragmentShaderDepth,
//     });
//   }

//   update(timestamp: number) {}
// }
// export default Cloth;
export default {};
