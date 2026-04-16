import { Mat4 } from './math.js';
import { Parser } from './parser.js';
import { Scene } from './scene.js';
import { Renderer } from './renderer.js';
import { TriangleMesh } from './trianglemesh.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement createCube, createSphere, computeTransformation, and shaders
////////////////////////////////////////////////////////////////////////////////

// Example two triangle quad
const quad = {
  positions: [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1, 1,  1, -1, -1,  1, -1],
  normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  uvCoords: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]
}

TriangleMesh.prototype.createCube = function() 
{
  // TODO: populate unit cube vertex positions, normals, and uv coordinates
  this.positions = [];
  this.normals = [];
  this.uvCoords = [];
  this.indices = [];

  const addFace = (a, b, c, d, n, uvA, uvB, uvC, uvD) => 
  {
    this.positions.push(...a, ...b, ...c);
    this.normals.push(...n, ...n, ...n);
    this.uvCoords.push(...uvA, ...uvB, ...uvC);

    this.positions.push(...a, ...c, ...d);
    this.normals.push(...n, ...n, ...n);
    this.uvCoords.push(...uvA, ...uvC, ...uvD);
  };

  const cell = (col, row) => 
  {
    const u0 = col / 2;
    const u1 = u0 + (1/2);
    const v0 = row / 3;
    const v1 = v0 + (1/3);
    return {bl: [u0, v0], br: [u1, v0], tr: [u1, v1], tl: [u0, v1],};
  };

  const uv1 = cell(0, 2); // front
  const uv2 = cell(0, 1); // right
  const uv3 = cell(0, 0); // top
  const uv4 = cell(1, 2); // bottom
  const uv5 = cell(1, 1); // left
  const uv6 = cell(1, 0); // back

  addFace([-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1], [0, 0, 1], uv1.bl, uv1.br, uv1.tr, uv1.tl);
  addFace([ 1, -1,  1], [ 1, -1, -1], [ 1,  1, -1], [ 1,  1,  1], [1, 0, 0], uv2.bl, uv2.br, uv2.tr, uv2.tl);
  addFace([-1,  1,  1], [ 1,  1,  1], [ 1,  1, -1], [-1,  1, -1], [0, 1, 0], uv3.bl, uv3.br, uv3.tr, uv3.tl);
  addFace([-1, -1, -1], [ 1, -1, -1], [ 1, -1,  1], [-1, -1,  1], [0,-1, 0], uv4.bl, uv4.br, uv4.tr, uv4.tl);
  addFace([-1, -1, -1], [-1, -1,  1], [-1,  1,  1], [-1,  1, -1], [-1,0, 0], uv5.bl, uv5.br, uv5.tr, uv5.tl);
  addFace([ 1, -1, -1], [-1, -1, -1], [-1,  1, -1], [ 1,  1, -1], [0, 0,-1], uv6.bl, uv6.br, uv6.tr, uv6.tl);
}

TriangleMesh.prototype.createSphere = function(numStacks, numSectors) 
{
  const radius = 1.0;

  this.positions = [];
  this.normals = [];
  this.uvCoords = [];
  this.indices = [];

  let x, y, z, xy;
  let nx, ny, nz;
  let s, t;

  const lengthInv = 1.0 / radius;
  const sectorStep = 2 * Math.PI / numSectors;
  const stackStep = Math.PI / numStacks;

  let sectorAngle, stackAngle;

  for (let i = 0; i <= numStacks; ++i)
  {
    stackAngle = Math.PI / 2 - i * stackStep;
    xy = radius * Math.cos(stackAngle);
    z = radius * Math.sin(stackAngle);

    for (let j = 0; j <= numSectors; ++j)
    {
      sectorAngle = j * sectorStep;

      // vertex position (x, y, z)
      x = xy * Math.cos(sectorAngle);
      y = xy * Math.sin(sectorAngle);

      this.positions.push(x, y, z);

      nx = x * lengthInv;
      ny = y * lengthInv;
      nz = z * lengthInv;
      this.normals.push(nx, ny, nz);

      s = 1 - j / numSectors;
      t = i / numStacks;
      this.uvCoords.push(s, t);
    }
  }

  let k1, k2;

  for (let i = 0; i < numStacks; ++i)
  {
    k1 = i * (numSectors + 1);
    k2 = k1 + numSectors + 1;

    for (let j = 0; j < numSectors; ++j, ++k1, ++k2)
    {
      if (i !== 0)
      {
        this.indices.push(k1);
        this.indices.push(k2);
        this.indices.push(k1 + 1);
      }

      if (i !== (numStacks - 1))
      {
        this.indices.push(k1 + 1);
        this.indices.push(k2);
        this.indices.push(k2 + 1);
      }
    }
  }
}

Scene.prototype.computeTransformation = function(transformSequence) 
{
  // TODO: go through transform sequence and compose into overallTransform
  let overallTransform = Mat4.create();  // identity matrix
  const degToRad = (deg) => deg * Math.PI / 180.0;

  const makeTranslation = (x, y, z) => 
  {
    let m = Mat4.create();
    Mat4.set(m,
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1);
    return m;
  };

  const makeScale = (x, y, z) =>
  {
    let m = Mat4.create();
    Mat4.set(m,
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    );
    return m;
  };

  const makeRotationX = (thetaDeg) =>
  {
    const t = degToRad(thetaDeg);
    const c = Math.cos(t);
    const s = Math.sin(t);
    let m = Mat4.create();
    Mat4.set(
      m,
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    );
    return m;
  };

  const makeRotationY = (thetaDeg) => 
  {
    const t = degToRad(thetaDeg);
    const c = Math.cos(t);
    const s = Math.sin(t);
    let m = Mat4.create();
    Mat4.set(m,
      c, 0, -s, 0,
      0, 1,  0, 0,
      s, 0,  c, 0,
      0, 0,  0, 1
    );
    return m;
  };

  const makeRotationZ = (thetaDeg) => 
  {
    const t = degToRad(thetaDeg);
    const c = Math.cos(t);
    const s = Math.sin(t);
    let m = Mat4.create();
    Mat4.set(
      m,
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
    return m;
  };

  for (const transformDefinition of transformSequence)
  {
    let parts = transformDefinition;
    let op = null;
    let args = [];

    const opIndex = parts.findIndex(p => p === "T" || p === "S" || p === "Rx" || p === "Ry" || p === "Rz");
    op = parts[opIndex];
    args = parts.slice(opIndex + 1).map(Number);

    let currentTransform = Mat4.create();

    if (op === "T") 
    {
      currentTransform = makeTranslation(args[0], args[1], args[2]);
    } 
    else if (op === "S") 
    {
      currentTransform = makeScale(args[0], args[1], args[2]);
    } 
    else if (op === "Rx") 
    {
      currentTransform = makeRotationX(args[0]);
    } 
    else if (op === "Ry") 
    {
      currentTransform = makeRotationY(args[0]);
    } 
    else if (op === "Rz") 
    {
      currentTransform = makeRotationZ(args[0]);
    }

    let temp = Mat4.create();
    Mat4.multiply(temp, currentTransform, overallTransform);
    overallTransform = temp;
  }
  return overallTransform;
}

Renderer.prototype.VERTEX_SHADER = `
precision mediump float;
attribute vec3 position, normal;
attribute vec2 uvCoord;
uniform vec3 lightPosition;
uniform mat4 projectionMatrix, viewMatrix, modelMatrix;
uniform mat3 normalMatrix;
varying vec2 vTexCoord;

// TODO: implement vertex shader logic below
varying vec3 vNormal;
varying vec3 vFragPos;
varying vec3 vLightPos;

void main() 
{
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 viewPos  = viewMatrix * worldPos;

  vNormal = normalize(normalMatrix * normal);

  vFragPos = viewPos.xyz;

  vLightPos = (viewMatrix * vec4(lightPosition, 1.0)).xyz;

  vTexCoord = uvCoord;

  gl_Position = projectionMatrix * viewPos;
}
`;

Renderer.prototype.FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 ka, kd, ks, lightIntensity;
uniform float shininess;
uniform sampler2D uTexture;
uniform bool hasTexture;
varying vec2 vTexCoord;

// TODO: implement fragment shader logic below
varying vec3 vNormal;
varying vec3 vFragPos;
varying vec3 vLightPos;

void main() 
{
  vec3 N = normalize(vNormal);
  vec3 Lvec = vLightPos - vFragPos;
  float dist2 = dot(Lvec, Lvec);
  vec3 L = normalize(Lvec);
  vec3 V = normalize(-vFragPos);
  vec3 H = normalize(L + V);

  vec3 ambient = ka * lightIntensity;

  float lambert = max(dot(N, L), 0.0);
  vec3 diffuse = kd * lightIntensity * lambert / dist2;

  float spec = 0.0;
  if (lambert > 0.0) 
  {
    spec = pow(max(dot(N, H), 0.0), shininess);
  }
  vec3 specular = ks * lightIntensity * spec / dist2;

  vec3 color = ambient + diffuse + specular;

  if (hasTexture) 
  {
    vec3 texColor = texture2D(uTexture, vTexCoord).rgb;
    color *= texColor;
  }

  gl_FragColor = vec4(color, 1.0);
}
`;

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////


const DEF_INPUT = [
  "c,myCamera,perspective,8,6,8,0,1,0,0,1,0;",
  "l,myLight,point,0,8,2,3,3,3;",

  "p,unitCube,cube;",
  "p,unitSphere,sphere,20,20;",

  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,20,dice.jpg;",
  "m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,20,dice.jpg;",
  "m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,20,dice.jpg;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,8,globe.jpg;",

  "o,s1,unitSphere,globeMat;",
  "o,s2,unitSphere,globeMat;",
  "o,s3,unitSphere,globeMat;",
  "o,s4,unitSphere,globeMat;",
  "o,rd,unitCube,redDiceMat;",
  "o,gd,unitCube,grnDiceMat;",
  "o,bd,unitCube,bluDiceMat;",
  "o,rd2,unitCube,redDiceMat;",
  "o,gd2,unitCube,grnDiceMat;",

  "X,s1,S,2.0,2.0,2.0;X,s1,Rx,90;X,s1,Ry,-150;X,s1,T,0,1.8,0;",

  "X,s2,S,0.45,0.45,0.45;X,s2,Rx,90;X,s2,Ry,-30;X,s2,T,3.0,2.6,0.8;",
  "X,s3,S,0.35,0.35,0.35;X,s3,Rx,90;X,s3,Ry,40;X,s3,T,-2.6,1.1,1.8;",
  "X,s4,S,0.28,0.28,0.28;X,s4,Rx,90;X,s4,Ry,120;X,s4,T,1.2,4.0,-2.0;",

  "X,rd,Rz,30;X,rd,Rx,35;X,rd,S,0.55,0.55,0.55;X,rd,T,2.8,0.2,2.4;",
  "X,gd,Ry,45;X,gd,Rx,20;X,gd,S,0.5,0.5,0.5;X,gd,T,-3.0,0.4,1.0;",
  "X,bd,Rx,75;X,bd,Rz,20;X,bd,S,0.42,0.42,0.42;X,bd,T,2.0,3.8,2.2;",
  "X,rd2,Ry,-35;X,rd2,Rx,15;X,rd2,S,0.32,0.32,0.32;X,rd2,T,-1.0,4.2,-2.6;",
  "X,gd2,Rz,60;X,gd2,Ry,15;X,gd2,S,0.26,0.26,0.26;X,gd2,T,3.6,1.7,-1.8;",
].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };
