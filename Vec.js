// Vector Converter & Plotter (p5.js) — FIXED UI VISIBILITY
// - Toggle input type: Polar (r, θ°) or Cartesian (x, y)
// - Enter values in visible fields
// - Draw vector with dashed projections

let modeRadio;
let magInput, angInput, xInput, yInput;
let magLabel, angLabel, xLabel, yLabel;   // keep label refs
let scaleSlider;

let currentType = 'Polar'; // 'Polar' or 'Cartesian'
let vx = 0, vy = 0;        // Cartesian
let r  = 0, thetaDeg = 0;  // Polar (degrees)

function setup() {
  //createCanvas(900, 560);
  noCanvas();
  pixelDensity(1);

  // --- UI ---
  const ui = select('#ui');

  createDiv('Input Type').addClass('ui').parent(ui);
  modeRadio = createRadio();
  modeRadio.option('Polar');
  modeRadio.option('Cartesian');
  modeRadio.value('Polar');
  modeRadio.addClass('ui').parent(ui);
  modeRadio.changed(onModeChange);

  // Polar inputs (magnitude, angle)
  let row1 = createDiv().addClass('ui').parent(ui);
  magInput = createInput('5').parent(row1);
  magLabel = createSpan(' Magnitude r').parent(row1);

  let row2 = createDiv().addClass('ui').parent(ui);
  angInput = createInput('30').parent(row2);
  angLabel = createSpan(' Angle θ (deg)').parent(row2);

  // Cartesian inputs (x, y)
  let row3 = createDiv().addClass('ui').parent(ui);
  xInput = createInput('4').parent(row3);
  xLabel = createSpan(' x').parent(row3);

  let row4 = createDiv().addClass('ui').parent(ui);
  yInput = createInput('3').parent(row4);
  yLabel = createSpan(' y').parent(row4);

  createDiv('Scale (px/unit)').addClass('ui').parent(ui);
  scaleSlider = createSlider(10, 120, 40, 1).parent(ui);

  // events
  magInput.input(computeAndUpdate);
  angInput.input(computeAndUpdate);
  xInput.input(computeAndUpdate);
  yInput.input(computeAndUpdate);

  // start in Polar mode, hide Cartesian fields
  setMode('Polar');
  computeFromPolar();
}

function draw() {
  background(250);
  drawUIFrame();
  drawGraph();
  drawReadout();
}

// --- UI logic ---
function onModeChange() {
  setMode(modeRadio.value());
  computeAndUpdate();
}

function setMode(mode) {
  currentType = mode;
  const polar = (mode === 'Polar');

  // Toggle visibility properly (no boolean to show/hide)
  if (polar) {
    magInput.show(); magLabel.show();
    angInput.show(); angLabel.show();
    xInput.hide();   xLabel.hide();
    yInput.hide();   yLabel.hide();
  } else {
    magInput.hide(); magLabel.hide();
    angInput.hide(); angLabel.hide();
    xInput.show();   xLabel.show();
    yInput.show();   yLabel.show();
  }
}

function computeAndUpdate() {
  if (currentType === 'Polar') computeFromPolar();
  else computeFromCartesian();
}

function computeFromPolar() {
  const mag = parseFloatSafe(magInput.value(), 0);
  const ang = parseFloatSafe(angInput.value(), 0);
  const rad = radians(ang);
  vx = mag * cos(rad);
  vy = mag * sin(rad);
  r = mag;
  thetaDeg = normalizeDeg(ang);
}

function computeFromCartesian() {
  vx = parseFloatSafe(xInput.value(), 0);
  vy = parseFloatSafe(yInput.value(), 0);
  r = Math.sqrt(vx*vx + vy*vy);
  thetaDeg = degrees(Math.atan2(vy, vx));
  thetaDeg = normalizeDeg(thetaDeg);
}

function parseFloatSafe(str, def) {
  const v = parseFloat((str || '').trim());
  return isNaN(v) ? def : v;
}

function normalizeDeg(a) {
  let x = a % 360;
  if (x < 0) x += 360;
  return x;
}

// --- Drawing ---
function drawUIFrame() {
  noStroke(); fill(20);
  textAlign(LEFT, TOP);
  textSize(22);
  text('Vector Converter: Polar ⇄ Cartesian', 20, 120);

  textSize(13);
  fill(70);
  text('Tip: Edit the visible fields. Scale controls pixels per unit on the graph.',
       20, 150);
}

function drawGraph() {
  push();
  const left = 20, top = 190, right = width - 20, bottom = height - 20;
  const w = right - left, h = bottom - top;
  const ox = left + w/2;
  const oy = top + h/2;
  const S = scaleSlider.value();

  // frame
  noFill(); stroke(220); rect(left, top, w, h);

  // grid
  stroke(235);
  for (let x = ox; x <= right; x += S) line(x, top, x, bottom);
  for (let x = ox; x >= left;  x -= S) line(x, top, x, bottom);
  for (let y = oy; y <= bottom; y += S) line(left, y, right, y);
  for (let y = oy; y >= top;    y -= S) line(left, y, right, y);

  // axes
  stroke(60); strokeWeight(2);
  line(left, oy, right, oy); // x
  line(ox, top, ox, bottom); // y
  drawArrow(right-10, oy, right, oy);   // +x arrowhead
  drawArrow(ox, top+10, ox, top);       // +y arrowhead

  // vector from origin
  const px = ox + vx * S;
  const py = oy - vy * S;

  stroke(0, 132, 255); strokeWeight(4);
  line(ox, oy, px, py);
  drawArrow(ox, oy, px, py);

  // dashed projections
  stroke(0, 132, 255, 120); strokeWeight(1);
  drawDashedLine(px, oy, px, py, 8, 6); // vertical
  drawDashedLine(ox, py, px, py, 8, 6); // horizontal

  // labels
  noStroke(); fill(40);
  textAlign(LEFT, CENTER);
  text('x', right-14, oy-14);
  textAlign(CENTER, TOP);
  text('y', ox+14, top+4);

  pop();
}

function drawReadout() {
  fill(20); textSize(16); textAlign(LEFT, TOP);
  text('Input Type: ' + currentType, 540, 22);

  textSize(14);
  text('Cartesian (x, y):  (' + nf(vx, 0, 2) + ', ' + nf(vy, 0, 2) + ')', 540, 52);
  text('Polar (r, θ°):      (' + nf(r, 0, 2)  + ', ' + nf(thetaDeg, 0, 2) + '°)', 540, 72);
  text('Scale: ' + int(scaleSlider.value()) + ' px/unit', 540, 92);
}

// arrow helper
function drawArrow(x1, y1, x2, y2) {
  line(x1, y1, x2, y2);
  const a = Math.atan2(y1 - y2, x1 - x2);
  const len = 12;
  const ang = radians(25);
  line(x2, y2, x2 + len*Math.cos(a + ang), y2 + len*Math.sin(a + ang));
  line(x2, y2, x2 + len*Math.cos(a - ang), y2 + len*Math.sin(a - ang));
}

// renderer-agnostic dashed line
function drawDashedLine(x1, y1, x2, y2, dash, gap) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const d  = Math.hypot(dx, dy);
  if (d === 0) return;

  const ux = dx / d;
  const uy = dy / d;

  let pos = 0;
  let drawSeg = true;
  while (pos < d) {
    const step = drawSeg ? dash : gap;
    const nx1 = x1 + ux * pos;
    const ny1 = y1 + uy * pos;
    const nx2 = x1 + ux * Math.min(d, pos + step);
    const ny2 = y1 + uy * Math.min(d, pos + step);
    if (drawSeg) line(nx1, ny1, nx2, ny2);
    drawSeg = !drawSeg;
    pos += step;
  }
}

