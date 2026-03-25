import { Framebuffer } from './framebuffer.js';
import { Rasterizer } from './rasterizer.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement functions drawLine(v1, v2) and drawTriangle(v1, v2, v3) below.
////////////////////////////////////////////////////////////////////////////////

// take two vertices defining line and rasterize to framebuffer
Rasterizer.prototype.drawLine = function(v1, v2) 
{
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw line
  this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
  let sx1 = x1, sy1 = y1, sr1 = r1, sg1 = g1, sb1 = b1;
  let sx2 = x2, sy2 = y2, sr2 = r2, sg2 = g2, sb2 = b2;

  let dx = sx2 - sx1;
  let dy = sy2 - sy1;

  if (sx1 === sx2 && sy1 === sy2) 
  {
    this.setPixel(Math.round(sx1), Math.round(sy1), [sr1, sg1, sb1]);
    return;
  }

  if (Math.abs(dx) >= Math.abs(dy)) 
  {
    if (sx1 > sx2) 
    {
      [sx1, sx2] = [sx2, sx1];
      [sy1, sy2] = [sy2, sy1];
      [sr1, sr2] = [sr2, sr1];
      [sg1, sg2] = [sg2, sg1];
      [sb1, sb2] = [sb2, sb1];
    }

    dx = sx2 - sx1;
    dy = sy2 - sy1;

    const m = dy / dx;
    let y = sy1;

    this.setPixel(Math.round(sx1), Math.round(sy1), [sr1, sg1, sb1]);

    for (let x = sx1 + 1; x <= sx2; x++) 
    {
      y += m;
      const t = (x - sx1) / dx;
      const r = sr1 + (sr2 - sr1) * t;
      const g = sg1 + (sg2 - sg1) * t;
      const b = sb1 + (sb2 - sb1) * t;
      this.setPixel(Math.round(x), Math.round(y), [r, g, b]);
    }
  }
  else 
  {
    if (sy1 > sy2) 
    {
      [sx1, sx2] = [sx2, sx1];
      [sy1, sy2] = [sy2, sy1];
      [sr1, sr2] = [sr2, sr1];
      [sg1, sg2] = [sg2, sg1];
      [sb1, sb2] = [sb2, sb1];
    }

    dx = sx2 - sx1;
    dy = sy2 - sy1;

    const m = dx / dy;
    let x = sx1;

    this.setPixel(Math.round(sx1), Math.round(sy1), [sr1, sg1, sb1]);

    for (let y = sy1 + 1; y <= sy2; y++) 
    {
      x += m;
      const t = (y - sy1) / dy;
      const r = sr1 + (sr2 - sr1) * t;
      const g = sg1 + (sg2 - sg1) * t;
      const b = sb1 + (sb2 - sb1) * t;
      this.setPixel(Math.round(x), Math.round(y), [r, g, b]);
    }
  }
}

// take 3 vertices defining a solid triangle and rasterize to framebuffer
Rasterizer.prototype.drawTriangle = function(v1, v2, v3) 
{
  const [x1, y1, [r1, g1, b1]] = v1;
  const [x2, y2, [r2, g2, b2]] = v2;
  const [x3, y3, [r3, g3, b3]] = v3;
  // TODO/HINT: use this.setPixel(x, y, color) in this function to draw triangle
  this.setPixel(Math.floor(x1), Math.floor(y1), [r1, g1, b1]);
  this.setPixel(Math.floor(x2), Math.floor(y2), [r2, g2, b2]);
  this.setPixel(Math.floor(x3), Math.floor(y3), [r3, g3, b3]);
}


////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  "v,10,10,1.0,0.0,0.0;",
  "v,52,52,0.0,1.0,0.0;",
  "v,52,10,0.0,0.0,1.0;",
  "v,10,52,1.0,1.0,1.0;",
  "t,0,1,2;",
  "t,0,3,1;",
  "v,10,10,1.0,1.0,1.0;",
  "v,10,52,0.0,0.0,0.0;",
  "v,52,52,1.0,1.0,1.0;",
  "v,52,10,0.0,0.0,0.0;",
  "l,4,5;",
  "l,5,6;",
  "l,6,7;",
  "l,7,4;"
].join("\n");


// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT };
