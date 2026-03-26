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
  let sx1 = x1, sy1 = y1, sr1 = r1, sg1 = g1, sb1 = b1;
  let sx2 = x2, sy2 = y2, sr2 = r2, sg2 = g2, sb2 = b2;

  let dx = sx2 - sx1;
  let dy = sy2 - sy1;

  if (sx1 === sx2 && sy1 === sy2) 
  {
    this.setPixel(Math.floor(sx1), Math.floor(sy1), [sr1, sg1, sb1]);
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
    let y = Math.floor(sy1);

    this.setPixel(Math.floor(sx1), Math.floor(sy1), [sr1, sg1, sb1]);

    for (let x = Math.floor(sx1) + 1; x <= Math.floor(sx2); x++) 
    {
      y += m;
      const t = (x - sx1) / dx;
      const r = sr1 + (sr2 - sr1) * t;
      const g = sg1 + (sg2 - sg1) * t;
      const b = sb1 + (sb2 - sb1) * t;
      this.setPixel(Math.floor(x), Math.floor(y), [r, g, b]);
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

    this.setPixel(Math.floor(sx1), Math.floor(sy1), [sr1, sg1, sb1]);

    for (let y = Math.floor(sy1) + 1; y <= Math.floor(sy2); y++) 
    {
      x += m;
      const t = (y - sy1) / dy;
      const r = sr1 + (sr2 - sr1) * t;
      const g = sg1 + (sg2 - sg1) * t;
      const b = sb1 + (sb2 - sb1) * t;
      this.setPixel(Math.floor(x), Math.floor(y), [r, g, b]);
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

  function isClockwise(x1, y1, x2, y2, x3, y3)
  {
    let result = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1);
    return result;
  }

  function edge(x0, y0, x1, y1, x, y) 
  {
    return (y0 - y1) * x + (x1 - x0) * y + (x0 * y1 - x1 * y0);
  }

  function istopleftedge(x0, y0, x1, y1)
  {
    let dy = y1 - y0;
    let dx = x1 - x0;
    if (dy > 0)
      return true;
    else if (dy == 0)
    {
      if (dx < 0)
        return true;
      else
        return false;
    }
    else if (dy < 0)
      return false;
  }

  function pointIsInsideTriangle(x1, y1, x2, y2, x3, y3, px, py)
  {
    let e1 = edge(x1, y1, x2, y2, px, py);
    let e2 = edge(x2, y2, x3, y3, px, py);
    let e3 = edge(x3, y3, x1, y1, px, py);

    if (order < 0)
    {
      let pass1 = (e1 < 0) || (e1 == 0 && istopleftedge(x1, y1, x2, y2));
      let pass2 = (e2 < 0) || (e2 == 0 && istopleftedge(x2, y2, x3, y3));
      let pass3 = (e3 < 0) || (e3 == 0 && istopleftedge(x3, y3, x1, y1));
      return pass1 && pass2 && pass3;
    }
    else if (order > 0)
    {
      let pass1 = (e1 > 0) || (e1 == 0 && istopleftedge(x1, y1, x2, y2));
      let pass2 = (e2 > 0) || (e2 == 0 && istopleftedge(x2, y2, x3, y3));
      let pass3 = (e3 > 0) || (e3 == 0 && istopleftedge(x3, y3, x1, y1));
      return pass1 && pass2 && pass3;
    }
    else
    {
      return false;
    }
  }

  function triangleArea(x1,y1,x2,y2,x3,y3)
  {
    let result = Math.abs(isClockwise(x1, y1, x2, y2, x3, y3))
    return result / 2;
  }

  let order = isClockwise(x1, y1, x2, y2, x3, y3);
  if (order == 0)
    return;

  let minX = Math.floor(Math.min(x1, x2, x3));
  let maxX = Math.ceil(Math.max(x1, x2, x3));
  let minY = Math.floor(Math.min(y1, y2, y3));
  let maxY = Math.ceil(Math.max(y1, y2, y3));

  for (let x = minX; x <= maxX; x++)
  {
    for (let y = minY; y <= maxY; y++)
    {
      let px = x + 0.5;
      let py = y + 0.5;
      if (pointIsInsideTriangle(x1, y1, x2, y2, x3, y3, px, py))
      {
        let area = triangleArea(x1,y1,x2,y2,x3,y3);
        let a1 = triangleArea(px,py,x2,y2,x3,y3);
        let a2 = triangleArea(x1,y1,px,py,x3,y3);
        let a3 = triangleArea(x1,y1,x2,y2,px,py);
        let u = a1 / area;
        let v = a2 / area;
        let w = a3 / area;
        let pcr = u * r1 + v * r2 + w * r3;
        let pcg = u * g1 + v * g2 + w * g3;
        let pcb = u * b1 + v * b2 + w * b3;
        this.setPixel(x, y, [pcr, pcg, pcb]);
      }
    }
  }
}


////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = 
[
  "v,10,15,1.0,0.0,0.0;",
  "v,54,15,1.0,0.0,0.0;",
  "v,54,41,1.0,0.0,0.0;",
  "v,10,41,1.0,0.0,0.0;",
  "t,0,1,2;",
  "t,0,2,3;",
  "v,28,22,1.0,1.0,1.0;",
  "v,28,34,1.0,1.0,1.0;",
  "v,40,28,1.0,1.0,1.0;",
  "t,4,5,6;"
].join("\n");

// I created an youtube icon just for fun, lol


// DO NOT CHANGE ANYTHING BELOW HERE
export { Rasterizer, Framebuffer, DEF_INPUT };
