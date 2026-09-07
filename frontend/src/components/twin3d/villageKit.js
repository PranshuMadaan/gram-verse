/**
 * villageKit.js - GramVerse 3D Digital Twin
 * High-fidelity geometry + material factories.
 * All dimensions in metres (1 THREE unit = 1 m).
 */
import * as THREE from "three";

// 1. PALETTE
export const PALETTE = {
  plaster:     0xe8dfc8,
  brick:       0xb0633c,
  brickDark:   0x7e3e22,
  concrete:    0xc2b89a,
  roofTile:    0x8a3820,
  roofLight:   0xa84830,
  soil:        0x9b7855,
  grassGreen:  0x5a8c38,
  grassDry:    0x9caa62,
  roadTarmac:  0x42403a,
  roadDirt:    0xb89a72,
  water:       0x2e7db5,
  waterDeep:   0x1a5280,
  treeCanopy1: 0x3a6c25,
  treeCanopy2: 0x5a9438,
  treeCanopy3: 0x7ab85a,
  trunkBark:   0x5c3d1e,
  stone:       0x9e907a,
  mud:         0x7a5a3a,
};

// 2. CANVAS TEXTURE HELPERS
function mkCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return [c, c.getContext("2d")];
}
function canvasTex(canvas, repX, repY) {
  repX = repX || 1; repY = repY || 1;
  const t = new THREE.CanvasTexture(canvas);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repX, repY);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Kiln-variation terracotta brick
export function makeBrickTex() {
  const [c, ctx] = mkCanvas(512, 512);
  ctx.fillStyle = "#cbbea8"; ctx.fillRect(0, 0, 512, 512);
  var bW=56, bH=26, mg=5;
  for (var row=0; row*(bH+mg)<512; row++) {
    var off=(row%2)*((bW+mg)/2), y0=row*(bH+mg)+mg;
    for (var col=-1; col*(bW+mg)<512+bW; col++) {
      var v=(Math.random()-0.5)*40;
      var r=Math.min(220,Math.max(130,Math.round(176+v)));
      var g=Math.min(130,Math.max(60, Math.round(99+v*0.6)));
      var b=Math.min(80, Math.max(30, Math.round(60+v*0.4)));
      ctx.fillStyle="rgb("+r+","+g+","+b+")";
      ctx.fillRect(off+col*(bW+mg),y0,bW,bH);
      ctx.fillStyle="rgba(0,0,0,0.05)";
      for(var k=0;k<6;k++) ctx.fillRect(off+col*(bW+mg)+Math.random()*bW,y0+Math.random()*bH,2,2);
    }
  }
  return canvasTex(c, 3, 3);
}

// Lime-wash plaster
export function makePlasterTex(baseHex) {
  baseHex = baseHex || "#e8dfc8";
  const [c, ctx] = mkCanvas(256, 256);
  ctx.fillStyle = baseHex; ctx.fillRect(0,0,256,256);
  for(var i=0;i<4000;i++){
    var x=Math.random()*256, y=Math.random()*256, v=(Math.random()-.5)*22;
    var cc=Math.round(210+v);
    ctx.fillStyle="rgba("+cc+","+(cc-6)+","+(cc-14)+",0.28)";
    ctx.beginPath(); ctx.arc(x,y,Math.random()*2.2,0,Math.PI*2); ctx.fill();
  }
  return canvasTex(c, 2, 2);
}

// Mangalore clay roof tiles
export function makeRoofTileTex() {
  const [c, ctx] = mkCanvas(256, 128);
  ctx.fillStyle="#8a3820"; ctx.fillRect(0,0,256,128);
  var tH=14;
  for(var y=0;y<128;y+=tH){
    ctx.fillStyle="rgba(0,0,0,0.30)"; ctx.fillRect(0,y,256,2);
    ctx.fillStyle="rgba(255,255,255,0.10)"; ctx.fillRect(0,y+2,256,3);
  }
  ctx.strokeStyle="rgba(0,0,0,0.15)"; ctx.lineWidth=1.5;
  for(var x=0;x<256;x+=18){
    ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,128); ctx.stroke();
  }
  return canvasTex(c, 3, 2);
}

// Monsoon grass ground — rich, deep organic meadow with soil patches
export function makeGroundTex() {
  const [c, ctx] = mkCanvas(512, 512);
  ctx.fillStyle = "#3a5b24"; ctx.fillRect(0, 0, 512, 512);
  for (var i = 0; i < 22000; i++) {
    var x = Math.random() * 512, y = Math.random() * 512;
    var v = (Math.random() - 0.5) * 60;
    var rr = Math.min(100, Math.max(32, Math.round(50 + v * 0.4)));
    var gg = Math.min(145, Math.max(62, Math.round(98 + v)));
    var bb = Math.min(58, Math.max(18, Math.round(36 + v * 0.3)));
    ctx.fillStyle = "rgb(" + rr + "," + gg + "," + bb + ")";
    ctx.fillRect(x, y, 1.2 + Math.random(), 3.5 + Math.random() * 4);
  }
  for (var i = 0; i < 90; i++) {
    ctx.fillStyle = "rgba(75, 52, 28, " + (0.08 + Math.random() * 0.12) + ")";
    ctx.beginPath();
    ctx.ellipse(Math.random() * 512, Math.random() * 512, 14 + Math.random() * 26, 10 + Math.random() * 18, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  return canvasTex(c, 24, 24);
}

// Crystalline Silicon Solar Panel Texture
export function makeSolarPanelTex() {
  const [c, ctx] = mkCanvas(256, 512);
  ctx.fillStyle = "#0c1a30"; ctx.fillRect(0, 0, 256, 512);
  ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 5;
  ctx.strokeRect(3, 3, 250, 506);
  const cellRows = 10, cellCols = 5;
  const cw = (256 - 16) / cellCols;
  const ch = (512 - 16) / cellRows;
  for (let r = 0; r < cellRows; r++) {
    for (let col = 0; col < cellCols; col++) {
      const cx = 8 + col * cw;
      const cy = 8 + r * ch;
      const grad = ctx.createLinearGradient(cx, cy, cx + cw, cy + ch);
      grad.addColorStop(0, "#0f2347");
      grad.addColorStop(0.5, "#183664");
      grad.addColorStop(1, "#0a1830");
      ctx.fillStyle = grad;
      ctx.fillRect(cx + 1, cy + 1, cw - 2, ch - 2);
      ctx.strokeStyle = "rgba(180, 215, 255, 0.28)";
      ctx.lineWidth = 0.8;
      for (let gy = cy + 4; gy < cy + ch - 2; gy += 4) {
        ctx.beginPath(); ctx.moveTo(cx + 2, gy); ctx.lineTo(cx + cw - 2, gy); ctx.stroke();
      }
      ctx.strokeStyle = "rgba(230, 240, 255, 0.85)";
      ctx.lineWidth = 1.2;
      [0.3, 0.5, 0.7].forEach(p => {
        ctx.beginPath();
        ctx.moveTo(cx + cw * p, cy + 1);
        ctx.lineTo(cx + cw * p, cy + ch - 1);
        ctx.stroke();
      });
    }
  }
  return canvasTex(c, 1, 1);
}

// Farmland Crop Furrows Texture
export function makeFarmlandTex() {
  const [c, ctx] = mkCanvas(256, 256);
  ctx.fillStyle = "#63472c"; ctx.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 16) {
    ctx.fillStyle = "#432f1b"; ctx.fillRect(0, y, 256, 6);
    ctx.fillStyle = "#5c8a32"; ctx.fillRect(0, y + 6, 256, 10);
    for (let x = 0; x < 256; x += 6) {
      ctx.fillStyle = Math.random() > 0.4 ? "#7cb342" : "#9ccc65";
      ctx.fillRect(x + Math.random() * 2, y + 7, 3, 7);
    }
  }
  return canvasTex(c, 4, 4);
}

// Road texture
export function makeRoadTex(paved) {
  paved = paved || false;
  const [c, ctx] = mkCanvas(128, 256);
  if(paved){
    ctx.fillStyle="#3a3832"; ctx.fillRect(0,0,128,256);
    for(var i=0;i<2500;i++){
      ctx.fillStyle="rgba(255,255,255,"+(Math.random()*0.06)+")";
      ctx.fillRect(Math.random()*128,Math.random()*256,1.5,1.5);
    }
    ctx.fillStyle="#f0ece4"; ctx.fillRect(3,0,4,256); ctx.fillRect(121,0,4,256);
    for(var y=0;y<256;y+=44) ctx.fillRect(62,y+8,4,28);
  } else {
    ctx.fillStyle="#b89a72"; ctx.fillRect(0,0,128,256);
    ctx.fillStyle="rgba(100,75,50,0.4)"; ctx.fillRect(16,0,20,256); ctx.fillRect(92,0,20,256);
    ctx.fillStyle="rgba(180,155,120,0.25)"; ctx.fillRect(44,0,40,256);
    for(var i=0;i<2000;i++){
      var g=110+Math.random()*40;
      ctx.fillStyle="rgba("+Math.round(g)+","+(Math.round(g)-8)+","+(Math.round(g)-18)+",0.18)";
      ctx.fillRect(Math.random()*128,Math.random()*256,2,2);
    }
  }
  return canvasTex(c, 1, 8);
}

// Animated water
export function makeWaterTex() {
  const [c, ctx] = mkCanvas(256, 256);
  var grd=ctx.createLinearGradient(0,0,256,256);
  grd.addColorStop(0,"#155d96"); grd.addColorStop(0.5,"#237dbf"); grd.addColorStop(1,"#124874");
  ctx.fillStyle=grd; ctx.fillRect(0,0,256,256);
  ctx.strokeStyle="rgba(140,220,255,0.45)"; ctx.lineWidth=2;
  for(var y=0;y<256;y+=16){
    ctx.beginPath();
    for(var x=0;x<256;x+=8){
      var py=y+Math.sin(x*0.18)*4;
      if(x===0) ctx.moveTo(x,py); else ctx.lineTo(x,py);
    }
    ctx.stroke();
  }
  ctx.fillStyle="rgba(215,245,255,0.18)";
  for(var i=0;i<35;i++) ctx.fillRect(Math.random()*256,Math.random()*256,14+Math.random()*32,2);
  return canvasTex(c, 2, 2);
}

// 3. MATERIAL FACTORIES
var _matCache = new Map();
function cachedLambert(color) {
  if(!_matCache.has(color)) _matCache.set(color, new THREE.MeshLambertMaterial({ color: color }));
  return _matCache.get(color);
}

export function makeWallMat(type) {
  type = type || "brick";
  if(type==="brick")     return new THREE.MeshLambertMaterial({ map: makeBrickTex() });
  if(type==="concrete")  return new THREE.MeshLambertMaterial({ map: makePlasterTex("#c2b89a") });
  return new THREE.MeshLambertMaterial({ map: makePlasterTex() });
}
export function makeRoofMat() { return new THREE.MeshLambertMaterial({ map: makeRoofTileTex() }); }
export function makeGroundMat() { return new THREE.MeshLambertMaterial({ map: makeGroundTex() }); }
export function makeFarmlandMat() { return new THREE.MeshLambertMaterial({ map: makeFarmlandTex() }); }
export function makeRoadMat(paved) { return new THREE.MeshLambertMaterial({ map: makeRoadTex(paved) }); }
export function makeWaterMat() {
  return new THREE.MeshLambertMaterial({ map: makeWaterTex(), transparent: true, opacity: 0.88 });
}
export function makeSolarPanelMat() {
  return new THREE.MeshStandardMaterial({
    map: makeSolarPanelTex(),
    metalness: 0.85,
    roughness: 0.18,
  });
}

// 4. HIP ROOF GEOMETRY (true 4-slope, NOT ConeGeometry)
export function createHipRoof(w, d, h, eave, mat) {
  eave = eave || 0.4;
  var mat_ = mat || makeRoofMat();
  var W=w+eave*2, D=d+eave*2;
  var ridgeLen = Math.max(W - D*1.0, W*0.18);
  var rx = ridgeLen/2;
  var verts = new Float32Array([
    -W/2, 0,  D/2,
     W/2, 0,  D/2,
     W/2, 0, -D/2,
    -W/2, 0, -D/2,
    -rx,  h,  0,
     rx,  h,  0,
  ]);
  var idx = new Uint16Array([
    0,1,5,  0,5,4,
    1,2,5,
    2,3,4,  2,4,5,
    3,0,4,
  ]);
  var geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  var uvArr = [];
  for(var i=0;i<verts.length/3;i++)
    uvArr.push((verts[i*3]+W/2)/W, (verts[i*3+2]+D/2)/D);
  geo.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(uvArr), 2));
  geo.computeVertexNormals();
  var mesh = new THREE.Mesh(geo, mat_);
  mesh.castShadow = true;
  return mesh;
}

// 5. HOUSE (ExtrudeGeometry walls + proper hip roof)
export function createHouse(opts) {
  opts = opts || {};
  var w=opts.w||8, d=opts.d||6, h=opts.h||3.8, roofH=opts.roofH||2.2, type=opts.type||"brick";
  var group = new THREE.Group();

  // Plinth
  var plinth = new THREE.Mesh(
    new THREE.BoxGeometry(w+0.6, 0.35, d+0.6),
    new THREE.MeshLambertMaterial({ color: PALETTE.stone })
  );
  plinth.position.y = 0.175;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Walls via ExtrudeGeometry
  var shape = new THREE.Shape();
  shape.moveTo(-w/2,-d/2); shape.lineTo(w/2,-d/2);
  shape.lineTo(w/2,d/2);   shape.lineTo(-w/2,d/2);
  shape.closePath();
  var wallGeo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
  wallGeo.rotateX(-Math.PI/2);
  wallGeo.translate(0, 0.35, 0);
  var walls = new THREE.Mesh(wallGeo, makeWallMat(type));
  walls.castShadow = walls.receiveShadow = true;
  group.add(walls);

  // Hip roof
  var roof = createHipRoof(w, d, roofH, 0.45);
  roof.position.y = h+0.35;
  group.add(roof);

  // Door
  var door = new THREE.Mesh(
    new THREE.PlaneGeometry(1.1, 2.2),
    new THREE.MeshLambertMaterial({ color: 0x2a1508 })
  );
  door.position.set(0, 1.1+0.35, d/2+0.02);
  group.add(door);

  // Windows
  var winMat = new THREE.MeshLambertMaterial({ color: 0xfff8e8, emissive: 0x554422, emissiveIntensity: 0.4 });
  [-w*0.28, w*0.28].forEach(function(wx) {
    var win = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.0), winMat);
    win.position.set(wx, h*0.55+0.35, d/2+0.02);
    group.add(win);
  });

  return group;
}

// 6. SCHOOL (L-shaped with veranda pillars)
export function createSchool() {
  var group = new THREE.Group();
  var main = createHouse({ w:20, d:8, h:4.5, roofH:2.0, type:"concrete" });
  group.add(main);
  var wing = createHouse({ w:8, d:10, h:4.5, roofH:2.0, type:"concrete" });
  wing.position.set(-14,0,9);
  group.add(wing);
  var pillarMat = new THREE.MeshLambertMaterial({ color: 0xe0d8c8 });
  [-8,-4,0,4,8].forEach(function(px) {
    var pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.22,4.5,8), pillarMat);
    pillar.position.set(px, 2.25+0.35, 4.2);
    pillar.castShadow = true;
    group.add(pillar);
  });
  var pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06,0.06,8,7),
    new THREE.MeshLambertMaterial({ color: 0xd8d8d8 })
  );
  pole.position.set(12, 4+0.35, -3);
  pole.castShadow = true;
  group.add(pole);
  return group;
}

// 7. WATER TOWER
export function createWaterTower() {
  var group = new THREE.Group();
  var legMat = new THREE.MeshLambertMaterial({ color: 0x7c7c78 });
  [[-1.2,-1.0],[1.2,-1.0],[1.2,1.0],[-1.2,1.0]].forEach(function(pos) {
    var leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.12,8,6), legMat);
    leg.position.set(pos[0],4,pos[1]);
    group.add(leg);
  });
  var tank = new THREE.Mesh(
    new THREE.CylinderGeometry(1.8,1.8,3.0,14),
    new THREE.MeshLambertMaterial({ color: 0x6a9fbf })
  );
  tank.position.y=9.5; tank.castShadow=true; group.add(tank);
  var lid = new THREE.Mesh(
    new THREE.ConeGeometry(1.85,1.0,14),
    new THREE.MeshLambertMaterial({ color: PALETTE.roofTile })
  );
  lid.position.y=11.5; lid.castShadow=true; group.add(lid);
  return group;
}

// 8. TREE (IcosahedronGeometry multi-layer canopy)
export function createTree(scale, seed) {
  scale = scale || 1.0; seed = seed || 0;
  var group = new THREE.Group();
  var s = (seed >>> 0) || 1;
  var rng = function() { s=((s*1664525+1013904223)>>>0); return s/0xffffffff; };

  var trunkH=(5.0+rng()*2.5)*scale;
  var trunkR=(0.22+rng()*0.10)*scale;
  var trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR*0.65, trunkR, trunkH, 7),
    new THREE.MeshLambertMaterial({ color: PALETTE.trunkBark })
  );
  trunk.position.y=trunkH/2; trunk.castShadow=true; group.add(trunk);

  var cols=[PALETTE.treeCanopy1, PALETTE.treeCanopy2, PALETTE.treeCanopy3];
  [
    { r:(3.2+rng()*1.2)*scale, y:trunkH+1.5*scale, d:1 },
    { r:(2.0+rng()*0.8)*scale, y:trunkH+3.5*scale, d:1 },
  ].forEach(function(layer, li) {
    var geo = new THREE.IcosahedronGeometry(layer.r, layer.d);
    geo.scale(1.0, 0.72, 1.05);
    var mesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ color: cols[li%cols.length] }));
    mesh.position.y=layer.y; mesh.rotation.y=rng()*Math.PI*2;
    mesh.castShadow=mesh.receiveShadow=true; group.add(mesh);
  });
  return group;
}

// 9. ROAD SEGMENT
export function createRoadSegment(x1,z1,x2,z2,width,yOff,paved) {
  width=width||5.0; yOff=yOff||0.04; paved=paved||false;
  var dx=x2-x1, dz=z2-z1, len=Math.sqrt(dx*dx+dz*dz);
  var geo=new THREE.PlaneGeometry(width,len);
  geo.rotateX(-Math.PI/2);
  var mesh=new THREE.Mesh(geo, makeRoadMat(paved));
  mesh.receiveShadow=true;
  mesh.position.set((x1+x2)/2, yOff, (z1+z2)/2);
  mesh.rotation.y=-Math.atan2(dz,dx)+Math.PI/2;
  var edgeMat=new THREE.MeshLambertMaterial({ color: 0xd0c8b0 });
  [-width/2, width/2].forEach(function(ex) {
    var edgeGeo=new THREE.PlaneGeometry(0.5,len);
    edgeGeo.rotateX(-Math.PI/2);
    var edge=new THREE.Mesh(edgeGeo,edgeMat);
    edge.position.set(ex,0.01,0);
    mesh.add(edge);
  });
  return mesh;
}

// 10. POND
export function createPond(radiusX, radiusZ) {
  radiusX=radiusX||22; radiusZ=radiusZ||18;
  var group=new THREE.Group();
  var shape=new THREE.Shape();
  shape.absellipse(0,0,radiusX,radiusZ,0,Math.PI*2,false,0);
  var waterGeo=new THREE.ShapeGeometry(shape,48);
  waterGeo.rotateX(-Math.PI/2);
  var waterMesh=new THREE.Mesh(waterGeo, makeWaterMat());
  waterMesh.position.y=0.05; waterMesh.receiveShadow=true; group.add(waterMesh);
  var bankShape=new THREE.Shape();
  bankShape.absellipse(0,0,radiusX+4,radiusZ+4,0,Math.PI*2);
  var hole=new THREE.Path();
  hole.absellipse(0,0,radiusX,radiusZ,0,Math.PI*2);
  bankShape.holes.push(hole);
  var bankGeo=new THREE.ShapeGeometry(bankShape,48);
  bankGeo.rotateX(-Math.PI/2);
  var bankMesh=new THREE.Mesh(bankGeo, new THREE.MeshLambertMaterial({ color: 0x7a5a32 }));
  bankMesh.position.y=0.0; bankMesh.receiveShadow=true; group.add(bankMesh);
  var dam=new THREE.Mesh(
    new THREE.BoxGeometry(radiusX*1.6,1.6,1.4),
    new THREE.MeshLambertMaterial({ color: PALETTE.stone })
  );
  dam.position.set(0,0.8,radiusZ+2.5); dam.castShadow=true; group.add(dam);
  return group;
}

// 10.1 SOLAR PANEL TABLE (modular ground-mounted solar rack)
export function createSolarTable(panelCount, tiltDeg) {
  panelCount = panelCount || 8;
  tiltDeg = tiltDeg || 23;
  const tiltRad = (tiltDeg * Math.PI) / 180;
  const group = new THREE.Group();

  const panelW = 1.2, panelH = 2.0, panelD = 0.04;
  const spacingX = 1.25;
  const totalW = panelCount * spacingX;

  const postMat = new THREE.MeshStandardMaterial({ color: 0x8894a0, metalness: 0.8, roughness: 0.3 });
  const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.8, 8);
  const numPosts = Math.max(2, Math.ceil(panelCount / 3) + 1);

  for (let i = 0; i < numPosts; i++) {
    const px = -totalW / 2 + (i / (numPosts - 1)) * totalW;
    const pFront = new THREE.Mesh(postGeo, postMat);
    pFront.scale.y = 0.7;
    pFront.position.set(px, 0.63, 0.6);
    pFront.castShadow = true;
    group.add(pFront);

    const pRear = new THREE.Mesh(postGeo, postMat);
    pRear.scale.y = 1.35;
    pRear.position.set(px, 1.21, -0.6);
    pRear.castShadow = true;
    group.add(pRear);

    const strut = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 1.6), postMat);
    strut.position.set(px, 0.95, 0);
    strut.rotation.x = tiltRad;
    group.add(strut);
  }

  const railMat = new THREE.MeshStandardMaterial({ color: 0xa0acb8, metalness: 0.7, roughness: 0.4 });
  [-0.4, 0.4].forEach((rz) => {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(totalW + 0.4, 0.05, 0.05), railMat);
    rail.position.set(0, 1.1 + rz * Math.sin(tiltRad), rz * Math.cos(tiltRad));
    rail.rotation.x = tiltRad;
    group.add(rail);
  });

  const pMat = makeSolarPanelMat();
  const panelGeo = new THREE.BoxGeometry(panelW, panelH, panelD);

  for (let i = 0; i < panelCount; i++) {
    const px = -totalW / 2 + i * spacingX + spacingX / 2;
    const panel = new THREE.Mesh(panelGeo, pMat);
    panel.position.set(px, 1.15, 0);
    panel.rotation.x = tiltRad;
    panel.castShadow = true;
    panel.receiveShadow = true;
    group.add(panel);
  }

  return group;
}

// 10.2 COMPLETE VILLAGE SOLAR MICROGRID FARM (25 Panels, 10 kWp, 50 kWh/day)
export function createSolarFarm(totalPanels) {
  totalPanels = totalPanels || 25;
  const group = new THREE.Group();

  const padMat = new THREE.MeshLambertMaterial({ color: 0x5a626a });
  const pad = new THREE.Mesh(new THREE.BoxGeometry(16, 0.15, 14), padMat);
  pad.position.set(0, 0.075, 0);
  pad.receiveShadow = true;
  group.add(pad);

  // 3 Rows of Solar Tables: 9 + 8 + 8 = 25 panels!
  const rows = [
    { count: 9, z: -4.0 },
    { count: 8, z: 0.0 },
    { count: 8, z: 4.0 },
  ];

  rows.forEach((r) => {
    const table = createSolarTable(r.count, 23);
    table.position.set(0, 0.1, r.z);
    group.add(table);
  });

  // Central Inverter & Combiner Unit
  const invGrp = new THREE.Group();
  invGrp.position.set(6.5, 0.1, -4.0);
  const invBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 1.4, 0.5),
    new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.6, roughness: 0.3 })
  );
  invBox.position.y = 0.7;
  invBox.castShadow = true;
  invGrp.add(invBox);

  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0x22c55e })
  );
  led.position.set(0, 1.2, 0.27);
  invGrp.add(led);
  group.add(invGrp);

  // Safety perimeter fence poles
  const fMat = new THREE.MeshStandardMaterial({ color: 0x71717a, metalness: 0.7, roughness: 0.4 });
  const fCoords = [
    [-8, -7], [8, -7], [8, 7], [-8, 7],
    [-8, 0], [8, 0], [0, -7], [0, 7]
  ];
  fCoords.forEach(([fx, fz]) => {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), fMat);
    pole.position.set(fx, 0.75, fz);
    pole.castShadow = true;
    group.add(pole);
  });

  return group;
}

// 10.3 BATTERY ENERGY STORAGE SYSTEM (BESS - 25 kWh Nighttime Unit)
export function createBESSUnit() {
  const group = new THREE.Group();

  const pad = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.2, 2.4),
    new THREE.MeshLambertMaterial({ color: 0xc4c0b4 })
  );
  pad.position.y = 0.1;
  pad.receiveShadow = true;
  group.add(pad);

  const cabMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.4,
    roughness: 0.3,
  });
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(3.0, 2.2, 1.8), cabMat);
  cabinet.position.y = 1.3;
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  group.add(cabinet);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.1, 2.0),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.5, roughness: 0.3 })
  );
  roof.position.y = 2.45;
  roof.castShadow = true;
  group.add(roof);

  const hvac = new THREE.Mesh(
    new THREE.BoxGeometry(0.3, 0.9, 0.8),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.4 })
  );
  hvac.position.set(1.65, 1.5, 0);
  group.add(hvac);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.8, 0.5),
    new THREE.MeshBasicMaterial({ color: 0x0f172a })
  );
  screen.position.set(0, 1.5, 0.91);
  group.add(screen);

  const statusLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 10, 8),
    new THREE.MeshBasicMaterial({ color: 0x10b981 })
  );
  statusLight.position.set(0.25, 1.8, 0.92);
  group.add(statusLight);

  const decal = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.3),
    new THREE.MeshBasicMaterial({ color: 0xfacc15 })
  );
  decal.position.set(-0.8, 1.5, 0.91);
  group.add(decal);

  return group;
}

// 10.4 DECOMMISSIONED DIESEL GENERATOR SHED (Replaced by Clean Solar)
export function createDieselGenShed() {
  const group = new THREE.Group();

  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.25, 2.8),
    new THREE.MeshLambertMaterial({ color: 0x524840 })
  );
  plinth.position.y = 0.125;
  group.add(plinth);

  const shedWalls = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 2.0, 2.4),
    new THREE.MeshLambertMaterial({ color: 0x785340 })
  );
  shedWalls.position.y = 1.25;
  shedWalls.castShadow = true;
  group.add(shedWalls);

  const roof = new THREE.Mesh(
    new THREE.ConeGeometry(2.4, 0.8, 4),
    new THREE.MeshLambertMaterial({ color: 0x4a3b32 })
  );
  roof.position.y = 2.65;
  roof.rotation.y = Math.PI / 4;
  roof.castShadow = true;
  group.add(roof);

  const chimney = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.12, 2.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x27272a, metalness: 0.8, roughness: 0.5 })
  );
  chimney.position.set(0.8, 2.8, 0.6);
  chimney.castShadow = true;
  group.add(chimney);

  const drum = new THREE.Mesh(
    new THREE.CylinderGeometry(0.3, 0.3, 0.85, 12),
    new THREE.MeshLambertMaterial({ color: 0xd97706 })
  );
  drum.position.set(-1.8, 0.425, 0.5);
  drum.castShadow = true;
  group.add(drum);

  const sign = new THREE.Mesh(
    new THREE.PlaneGeometry(1.2, 0.4),
    new THREE.MeshBasicMaterial({ color: 0xdc2626 })
  );
  sign.position.set(0, 1.3, 1.22);
  group.add(sign);

  return group;
}

// 10.5 PALM TREE (Indian Date / Coconut Palm with authentic drooping fronds)
export function createPalmTree(scale, seed) {
  scale = scale || 1.0;
  seed = seed || 0;
  const group = new THREE.Group();
  let s = (seed >>> 0) || 42;
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };

  const height = (7.0 + rng() * 2.5) * scale;
  const leanAngle = (0.08 + rng() * 0.12);
  const leanDir = rng() * Math.PI * 2;

  const segCount = 6;
  const segH = height / segCount;
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0x6e5238 });

  let currY = 0;
  let currOffset = new THREE.Vector2(0, 0);

  for (let i = 0; i < segCount; i++) {
    const bottomR = (0.35 - i * 0.035) * scale;
    const topR = (0.32 - i * 0.035) * scale;
    const seg = new THREE.Mesh(new THREE.CylinderGeometry(topR, bottomR, segH, 8), trunkMat);
    seg.position.set(currOffset.x, currY + segH / 2, currOffset.y);
    seg.rotation.z = Math.cos(leanDir) * leanAngle * (i / segCount);
    seg.rotation.x = Math.sin(leanDir) * leanAngle * (i / segCount);
    seg.castShadow = true;
    group.add(seg);

    currY += segH;
    currOffset.x += Math.cos(leanDir) * leanAngle * 0.4;
    currOffset.y += Math.sin(leanDir) * leanAngle * 0.4;
  }

  const frondCount = 10;
  const frondMat = new THREE.MeshLambertMaterial({ color: 0x2e7d32, side: THREE.DoubleSide });

  for (let i = 0; i < frondCount; i++) {
    const ang = (i / frondCount) * Math.PI * 2 + rng() * 0.2;
    const frondLen = (3.2 + rng() * 1.0) * scale;
    const frondW = (0.7 + rng() * 0.2) * scale;

    const frondGeo = new THREE.PlaneGeometry(frondW, frondLen, 2, 4);
    const pos = frondGeo.attributes.position;
    for (let j = 0; j < pos.count; j++) {
      const y = pos.getY(j);
      if (y > 0) {
        pos.setZ(j, -Math.pow(y / frondLen, 1.8) * 1.2 * scale);
      }
    }
    frondGeo.computeVertexNormals();

    const frond = new THREE.Mesh(frondGeo, frondMat);
    frond.position.set(currOffset.x, currY, currOffset.y);
    frond.rotation.y = ang;
    frond.rotation.x = 0.65 + rng() * 0.2;
    frond.castShadow = true;
    group.add(frond);
  }

  return group;
}

// 10.6 BANYAN TREE (Broad canopy with aerial prop roots)
export function createBanyanTree(scale, seed) {
  scale = scale || 1.0;
  seed = seed || 0;
  const group = new THREE.Group();
  let s = (seed >>> 0) || 88;
  const rng = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 0xffffffff; };

  const trunkH = (5.5 + rng() * 1.5) * scale;
  const trunkR = (0.75 + rng() * 0.25) * scale;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(trunkR * 0.8, trunkR * 1.2, trunkH, 10),
    new THREE.MeshLambertMaterial({ color: 0x4a3622 })
  );
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  group.add(trunk);

  const rootMat = new THREE.MeshLambertMaterial({ color: 0x5a422a });
  const rootAngles = [0.4, 1.8, 3.5, 5.0];
  rootAngles.forEach((ang) => {
    const dist = (2.2 + rng() * 1.0) * scale;
    const rx = Math.cos(ang) * dist;
    const rz = Math.sin(ang) * dist;
    const root = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * scale, 0.16 * scale, trunkH * 0.9, 6), rootMat);
    root.position.set(rx, (trunkH * 0.9) / 2, rz);
    root.castShadow = true;
    group.add(root);
  });

  const canopyCols = [0x2e5c1e, 0x3d7028, 0x4e8534];
  const canopyR = (6.0 + rng() * 2.0) * scale;
  const cGeo = new THREE.IcosahedronGeometry(canopyR, 1);
  cGeo.scale(1.2, 0.55, 1.1);
  const canopy = new THREE.Mesh(cGeo, new THREE.MeshLambertMaterial({ color: canopyCols[seed % 3] }));
  canopy.position.y = trunkH + (canopyR * 0.35);
  canopy.castShadow = true;
  canopy.receiveShadow = true;
  group.add(canopy);

  return group;
}

// 11. SKY DOME
export function createSkyDome(topColor, horizColor) {
  topColor = topColor || "#1a3a6a";
  horizColor = horizColor || "#b8d8f8";
  var c=document.createElement("canvas"); c.width=2; c.height=128;
  var ctx=c.getContext("2d");
  var grd=ctx.createLinearGradient(0,0,0,128);
  grd.addColorStop(0,topColor); grd.addColorStop(1,horizColor);
  ctx.fillStyle=grd; ctx.fillRect(0,0,2,128);
  var tex=new THREE.CanvasTexture(c);
  tex.colorSpace=THREE.SRGBColorSpace;
  var geo=new THREE.SphereGeometry(480,32,16);
  geo.scale(-1,1,1);
  return new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex }));
}

// 12. GEO CONVERTER
export function makeGeoConverter(originLat, originLon) {
  var R=6371000, DEG=Math.PI/180;
  var mLat=R*DEG, mLon=R*Math.cos(originLat*DEG)*DEG;
  return {
    toXZ: function(lat,lon) { return [(lon-originLon)*mLon, -(lat-originLat)*mLat]; }
  };
}

// 13. HIGHLIGHT HELPER
export function applyHighlight(group, active) {
  group.traverse(function(obj) {
    if(!obj.isMesh || !obj.material || !obj.material.emissive) return;
    obj.material.emissive.set(active ? 0x224466 : 0x000000);
    obj.material.emissiveIntensity = active ? 0.55 : 0;
  });
}

// 14. DISPOSE HELPER
export function disposeGroup(group) {
  group.traverse(function(obj) {
    if(!obj.isMesh) return;
    if(obj.geometry) obj.geometry.dispose();
    if(Array.isArray(obj.material)) obj.material.forEach(function(m){m.dispose();});
    else if(obj.material) obj.material.dispose();
  });
}