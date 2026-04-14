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
  this.indices = []; // cube 用 triangle soup，不需要 index buffer

  // 向 mesh 里加一个面
  // a, b, c, d 按“从面外侧看过去”的顺时针/逆时针一致顺序给四个角
  // 这里我们按两个三角形: (a,b,c) 和 (a,c,d)
  const addFace = (a, b, c, d, n, uvA, uvB, uvC, uvD) => {
    // triangle 1
    this.positions.push(...a, ...b, ...c);
    this.normals.push(...n, ...n, ...n);
    this.uvCoords.push(...uvA, ...uvB, ...uvC);

    // triangle 2
    this.positions.push(...a, ...c, ...d);
    this.normals.push(...n, ...n, ...n);
    this.uvCoords.push(...uvA, ...uvC, ...uvD);
  };

  // dice.jpg 是 2 列 × 3 行
  // 左列: 1,2,3
  // 右列: 4,5,6
  const cell = (col, row) => {
    const u0 = col * 0.5;
    const u1 = u0 + 0.5;
    const v0 = row / 3;
    const v1 = v0 + 1 / 3;
    return {
      bl: [u0, v0],
      br: [u1, v0],
      tr: [u1, v1],
      tl: [u0, v1],
    };
  };

  // row: 0 = bottom, 1 = middle, 2 = top
  const uv1 = cell(0, 2); // front
  const uv2 = cell(0, 1); // right
  const uv3 = cell(0, 0); // top
  const uv4 = cell(1, 2); // bottom
  const uv5 = cell(1, 1); // left
  const uv6 = cell(1, 0); // back

  // Front face (z = +1), normal = (0,0,1)
  addFace(
    [-1, -1,  1],
    [ 1, -1,  1],
    [ 1,  1,  1],
    [-1,  1,  1],
    [0, 0, 1],
    uv1.bl, uv1.br, uv1.tr, uv1.tl
  );

  // Right face (x = +1), normal = (1,0,0)
  addFace(
    [ 1, -1,  1],
    [ 1, -1, -1],
    [ 1,  1, -1],
    [ 1,  1,  1],
    [1, 0, 0],
    uv2.bl, uv2.br, uv2.tr, uv2.tl
  );

  // Top face (y = +1), normal = (0,1,0)
  addFace(
    [-1,  1,  1],
    [ 1,  1,  1],
    [ 1,  1, -1],
    [-1,  1, -1],
    [0, 1, 0],
    uv3.bl, uv3.br, uv3.tr, uv3.tl
  );

  // Bottom face (y = -1), normal = (0,-1,0)
  addFace(
    [-1, -1, -1],
    [ 1, -1, -1],
    [ 1, -1,  1],
    [-1, -1,  1],
    [0, -1, 0],
    uv4.bl, uv4.br, uv4.tr, uv4.tl
  );

  // Left face (x = -1), normal = (-1,0,0)
  addFace(
    [-1, -1, -1],
    [-1, -1,  1],
    [-1,  1,  1],
    [-1,  1, -1],
    [-1, 0, 0],
    uv5.bl, uv5.br, uv5.tr, uv5.tl
  );

  // Back face (z = -1), normal = (0,0,-1)
  addFace(
    [ 1, -1, -1],
    [-1, -1, -1],
    [-1,  1, -1],
    [ 1,  1, -1],
    [0, 0, -1],
    uv6.bl, uv6.br, uv6.tr, uv6.tl
  );
}

TriangleMesh.prototype.createSphere = function(numStacks, numSectors) 
{
  this.positions = [];
  this.normals = [];
  this.uvCoords = [];
  this.indices = [];

  for (let i = 0; i <= numStacks; i++) 
  {
    const stackFrac = i / numStacks;
    const stackAngle = Math.PI / 2 - stackFrac * Math.PI;

    const xy = Math.cos(stackAngle);
    const y = Math.sin(stackAngle);

    for (let j = 0; j <= numSectors; j++) {
      const sectorFrac = j / numSectors;
      const sectorAngle = sectorFrac * 2 * Math.PI;

      const x = xy * Math.cos(sectorAngle);
      const z = xy * Math.sin(sectorAngle);

      this.positions.push(x, y, z);
      this.normals.push(x, y, z);

      // 关键：只左右翻转 u，不上下翻 v
      this.uvCoords.push(sectorFrac, stackFrac);
    }
    for (let i = 0; i < numStacks; i++) 
    {
      for (let j = 0; j < numSectors; j++) 
      {
        const k1 = i * (numSectors + 1) + j;
        const k2 = k1 + numSectors + 1;

        if (i !== 0) {
          this.indices.push(k1, k2, k1 + 1);
        }

        if (i !== numStacks - 1) {
          this.indices.push(k1 + 1, k2, k2 + 1);
        }
      }
    }
  }
}

Scene.prototype.computeTransformation = function(transformSequence) 
{
  // TODO: go through transform sequence and compose into overallTransform
  let overallTransform = Mat4.create();  // identity matrix
  const degToRad = (deg) => deg * Math.PI / 180.0;

  const makeTranslation = (x, y, z) => {
    let m = Mat4.create();
    Mat4.set(
      m,
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    );
    return m;
  };

  const makeScale = (x, y, z) => {
    let m = Mat4.create();
    Mat4.set(
      m,
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    );
    return m;
  };

  const makeRotationX = (thetaDeg) => {
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

  const makeRotationY = (thetaDeg) => {
    const t = degToRad(thetaDeg);
    const c = Math.cos(t);
    const s = Math.sin(t);
    let m = Mat4.create();
    Mat4.set(
      m,
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    );
    return m;
  };

  const makeRotationZ = (thetaDeg) => {
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

  for (const transformDefinition of transformSequence) {
    let parts = transformDefinition;

    // 兼容 parser 可能给的不同格式
    if (typeof parts === "string") {
      parts = parts.split(",");
    }

    let op = null;
    let args = [];

    if (Array.isArray(parts)) {
      // 可能是 ["T","1","2","3"]
      // 也可能是 ["X","id","T","1","2","3"]
      const opIndex = parts.findIndex(p => p === "T" || p === "S" || p === "Rx" || p === "Ry" || p === "Rz");
      op = parts[opIndex];
      args = parts.slice(opIndex + 1).map(Number);
    } else if (typeof parts === "object" && parts !== null) {
      // 防御式写法：如果 parser 存成 object
      op = parts.type || parts.op;
      if (op === "T" || op === "S") {
        args = [Number(parts.x), Number(parts.y), Number(parts.z)];
      } else {
        args = [Number(parts.theta)];
      }
    }

    let currentTransform = Mat4.create();

    if (op === "T") {
      currentTransform = makeTranslation(args[0], args[1], args[2]);
    } else if (op === "S") {
      currentTransform = makeScale(args[0], args[1], args[2]);
    } else if (op === "Rx") {
      currentTransform = makeRotationX(args[0]);
    } else if (op === "Ry") {
      currentTransform = makeRotationY(args[0]);
    } else if (op === "Rz") {
      currentTransform = makeRotationZ(args[0]);
    }

    // 输入顺序是“先应用的先出现”
    // 对列向量来说：overall = current * overall
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
varying vec3 vLightDir;
varying vec3 vViewDir;

varying vec3 temp;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  // vertex position in view/camera space
  vec4 viewPos = viewMatrix * worldPos;

  // light position transformed into view/camera space
  vec3 lightPosView = (viewMatrix * vec4(lightPosition, 1.0)).xyz;

  // transform normal into view/camera space
  vNormal = normalize(normalMatrix * normal);

  // direction from surface point to light
  vLightDir = lightPosView - viewPos.xyz;

  // direction from surface point to camera
  // in view space, camera is at origin (0,0,0)
  vViewDir = normalize(-viewPos.xyz);

  // pass UV to fragment shader
  vTexCoord = uvCoord;

  // optional debug output
  temp = 0.5 * (vNormal + vec3(1.0));

  // final clip-space position
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
varying vec3 vLightDir;
varying vec3 vViewDir;

varying vec3 temp;

void main() {
  vec3 N = normalize(vNormal);
  vec3 Lvec = vLightDir;
  float dist2 = dot(Lvec, Lvec);
  vec3 L = normalize(Lvec);
  vec3 V = normalize(vViewDir);
  vec3 H = normalize(L + V);

  vec3 ambient = ka * lightIntensity;

  float diff = max(dot(N, L), 0.0);
  vec3 diffuse = kd * lightIntensity * diff / dist2;

  float spec = 0.0;
  if (diff > 0.0) {
    spec = pow(max(dot(N, H), 0.0), shininess);
  }
  vec3 specular = ks * lightIntensity * spec / dist2;

  vec3 color = ambient + diffuse + specular;

  if (hasTexture) {
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
  "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",
  "p,unitCube,cube;",
  "p,unitSphere,sphere,20,20;",
  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,15,dice.jpg;",
  "m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,15,dice.jpg;",
  "m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,15,dice.jpg;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,rd,unitCube,redDiceMat;",
  "o,gd,unitCube,grnDiceMat;",
  "o,bd,unitCube,bluDiceMat;",
  "o,gl,unitSphere,globeMat;",
  "X,rd,Rz,75;X,rd,Rx,90;X,rd,S,0.5,0.5,0.5;X,rd,T,-1,0,2;",
  "X,gd,Ry,45;X,gd,S,0.5,0.5,0.5;X,gd,T,2,0,2;",
  "X,bd,S,0.5,0.5,0.5;X,bd,Rx,90;X,bd,T,2,0,-1;",
  "X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;",
].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };
