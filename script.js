/*
  MIT License
  Copyright (c) 2025 ngboonkhai
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

const instancesEl = document.getElementById("instances");
const addBtn = document.getElementById("addInstance");
const compareBtn = document.getElementById("toggleCompare");
const comparePanel = document.getElementById("comparePanel");
const cmpA = document.getElementById("cmpA");
const cmpB = document.getElementById("cmpB");
const cmpOp = document.getElementById("cmpOp");

const instances = [];
let nextId = 1;
let compareOn = false;

const formatHex = dec => "0x" + dec.toString(16).toUpperCase().padStart(8, '0');

function buildBitGrid(labelsEl, fieldEl, readOnly) {
  for (let i = 31; i >= 0; i--) { // MSB on the left
    const label = document.createElement("div");
    label.textContent = i;
    labelsEl.appendChild(label);

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.value = "0";
    input.dataset.index = i;
    if (readOnly) input.readOnly = true;
    fieldEl.appendChild(input);
  }
}

// Each instance owns its own DOM and bit state, so instances never affect each other.
function createInstance() {
  const id = nextId++;
  const isFirst = instances.length === 0;

  const el = document.createElement("section");
  el.className = "bit-instance";
  el.innerHTML = `
    <div class="instance-header">
      <input type="text" class="instance-name" maxlength="30" placeholder="Name" aria-label="Instance name">
      ${isFirst ? "" : '<button type="button" class="remove-btn" title="Remove this instance" aria-label="Remove this instance">✕</button>'}
    </div>
    <div class="grid-wrapper">
      <div>
        <div class="bit-labels"></div>
        <div class="bit-field"></div>
      </div>
    </div>
    <div class="controls">
      <button data-op="rotateLeft">Rotate Left</button>
      <button data-op="rotateRight">Rotate Right</button>
      <button data-op="shiftLeft">Shift Left</button>
      <button data-op="shiftRight">Shift Right</button>
      <button data-op="onesComplement">1's Complement</button>
      <button data-op="zeroBits">Zero Bits</button>
    </div>
    <div class="label-display">
      <p><strong>Hex:</strong> <span class="hex-value" data-value>0x00000000</span>
        <button type="button" class="copy-btn">Copy</button></p>
      <p><strong>Decimal:</strong> <span class="dec-value" data-value>0</span>
        <button type="button" class="copy-btn">Copy</button></p>
    </div>
    <div class="inputs">
      <div>
        <input type="text" class="hex-input" placeholder="Enter hex (e.g. 0xAABBCCDD)">
        <button data-op="fillFromHex">Fill from Hex</button>
      </div>
      <div>
        <input type="text" class="dec-input" placeholder="Enter decimal">
        <button data-op="fillFromDec">Fill from Decimal</button>
      </div>
    </div>`;

  const q = sel => el.querySelector(sel);
  const bitInputs = q(".bit-field");
  const nameInput = q(".instance-name");
  nameInput.value = "Value " + id;
  buildBitGrid(q(".bit-labels"), bitInputs, false);

  const getBitArray = () =>
    Array.from(bitInputs.children).map(input => input.value === "1" ? "1" : "0");

  const getValue = () => parseInt(getBitArray().join(""), 2) >>> 0;

  function render() {
    Array.from(bitInputs.children).forEach(input => {
      input.classList.toggle("bit-1", input.value === "1");
    });
    const dec = getValue();
    q(".hex-value").textContent = formatHex(dec);
    q(".dec-value").textContent = dec.toString();
  }

  function updateBitFieldFromBinary(binaryStr) {
    for (let i = 0; i < 32; i++) {
      bitInputs.children[i].value = binaryStr[i]; // no reverse needed now
    }
    render();
    refreshCompare();
  }

  const ops = {
    rotateLeft() {
      const bits = getBitArray();
      bits.push(bits.shift());
      updateBitFieldFromBinary(bits.join(""));
    },
    rotateRight() {
      const bits = getBitArray();
      bits.unshift(bits.pop()); // move last bit to front
      updateBitFieldFromBinary(bits.join("")); // no reverse needed
    },
    shiftLeft() {
      const bits = getBitArray();
      bits.shift();          // remove MSB (first bit)
      bits.push("0");        // add 0 at LSB (end)
      updateBitFieldFromBinary(bits.join(""));
    },
    shiftRight() {
      const bits = getBitArray();
      bits.pop();            // remove LSB (last bit)
      bits.unshift("0");     // add 0 at MSB (start)
      updateBitFieldFromBinary(bits.join(""));
    },
    onesComplement() {
      const bits = getBitArray().map(bit => bit === "1" ? "0" : "1");
      updateBitFieldFromBinary(bits.reverse().join(""));
    },
    zeroBits() {
      updateBitFieldFromBinary("0".repeat(32));
    },
    fillFromHex() {
      const hex = q(".hex-input").value.trim();
      let value = parseInt(hex, 16);
      if (isNaN(value)) return alert("Invalid hex input");
      const bin = value.toString(2).padStart(32, '0');
      updateBitFieldFromBinary(bin);
    },
    fillFromDec() {
      const dec = q(".dec-input").value.trim();
      let value = parseInt(dec, 10);
      if (isNaN(value)) return alert("Invalid decimal input");
      value = value >>> 0;
      const bin = value.toString(2).padStart(32, '0');
      updateBitFieldFromBinary(bin);
    }
  };

  el.addEventListener("click", e => {
    const opBtn = e.target.closest("button[data-op]");
    if (opBtn) ops[opBtn.dataset.op]();
  });

  bitInputs.addEventListener("input", e => {
    e.target.value = e.target.value === "1" ? "1" : "0";
    render();
    refreshCompare();
  });

  nameInput.addEventListener("input", updateCompareOptions);

  const inst = {
    id,
    el,
    bitInputs,
    getBitArray,
    getValue,
    label: () => nameInput.value.trim() || "Value " + id
  };

  const removeBtn = q(".remove-btn");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => {
      instances.splice(instances.indexOf(inst), 1);
      el.remove();
      updateCompareOptions();
      refreshCompare();
    });
  }

  instances.push(inst);
  instancesEl.appendChild(el);
  render();
  updateCompareOptions();
  refreshCompare();
  return inst;
}

// ── Compare (opt-in) ────────────────────────────────────────────
function updateCompareOptions() {
  [cmpA, cmpB].forEach((sel, n) => {
    const prev = sel.value;
    sel.innerHTML = "";
    instances.forEach(inst => {
      const opt = document.createElement("option");
      opt.value = String(inst.id);
      opt.textContent = inst.label();
      sel.appendChild(opt);
    });
    const ids = instances.map(inst => String(inst.id));
    // Keep the user's own pick; otherwise default A to the 1st and B to the 2nd instance.
    const keep = sel.dataset.touched && ids.includes(prev);
    sel.value = keep ? prev : ids[Math.min(n, ids.length - 1)];
  });
  if (compareOn) renderResult();
}

function refreshCompare() {
  const ref = instances[0].getBitArray();
  instances.forEach((inst, idx) => {
    Array.from(inst.bitInputs.children).forEach((input, k) => {
      const differs = (input.value === "1" ? "1" : "0") !== ref[k];
      input.classList.toggle("bit-diff", compareOn && idx > 0 && differs);
    });
  });
  if (compareOn) renderResult();
}

function renderResult() {
  const a = instances.find(inst => String(inst.id) === cmpA.value);
  const b = instances.find(inst => String(inst.id) === cmpB.value);
  if (!a || !b) return;

  const x = a.getValue(), y = b.getValue();
  const res = (cmpOp.value === "AND" ? x & y : cmpOp.value === "OR" ? x | y : x ^ y) >>> 0;
  const bin = res.toString(2).padStart(32, '0');
  const fields = document.getElementById("resBits").children;
  for (let i = 0; i < 32; i++) {
    fields[i].value = bin[i];
    fields[i].classList.toggle("bit-1", bin[i] === "1");
  }
  document.getElementById("resHex").textContent = formatHex(res);
  document.getElementById("resDec").textContent = res.toString();
}

function setCompare(on) {
  compareOn = on;
  compareBtn.classList.toggle("active", on);
  compareBtn.setAttribute("aria-pressed", String(on));
  comparePanel.hidden = !on;
  refreshCompare();
}

// ── Copy buttons (instances and compare result) ─────────────────
async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
  const old = btn.textContent;
  btn.textContent = "Copied ✓";
  setTimeout(() => { btn.textContent = old; }, 1200);
}

document.addEventListener("click", e => {
  const btn = e.target.closest(".copy-btn");
  if (!btn) return;
  const span = btn.parentElement.querySelector("[data-value]");
  if (span) copyText(span.textContent, btn);
});

// ── Wiring ──────────────────────────────────────────────────────
addBtn.addEventListener("click", () => {
  const inst = createInstance();
  inst.el.scrollIntoView({ behavior: "smooth", block: "nearest" });
});
compareBtn.addEventListener("click", () => setCompare(!compareOn));
[cmpA, cmpB].forEach(sel => sel.addEventListener("change", () => { sel.dataset.touched = "1"; }));
[cmpA, cmpB, cmpOp].forEach(sel => sel.addEventListener("change", renderResult));

buildBitGrid(document.getElementById("resLabels"), document.getElementById("resBits"), true);
createInstance();
