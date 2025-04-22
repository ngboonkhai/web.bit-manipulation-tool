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

const bitLabels = document.getElementById("bitLabels");
const bitInputs = document.getElementById("bitInputs");

function createBitField() {
  for (let i = 31; i >= 0; i--) { // MSB on the left
    const label = document.createElement("div");
    label.textContent = i;
    bitLabels.appendChild(label);

    const input = document.createElement("input");
    input.type = "text";
    input.maxLength = 1;
    input.value = "0";
    input.dataset.index = i;
    input.oninput = handleInputChange;
    bitInputs.appendChild(input);
  }
}

function getBitArray() {
  return Array.from(bitInputs.children).map(input => input.value === "1" ? "1" : "0");
}

function updateBitFieldFromBinary(binaryStr) {
  for (let i = 0; i < 32; i++) {
    bitInputs.children[i].value = binaryStr[i]; // no reverse needed now
  }
  updateLabels();
}

function updateLabels() {
  const inputs = Array.from(bitInputs.children).filter(node => node.tagName === "INPUT");
  const bits = inputs.map(input => {
    if (input.value === "1") {
      input.classList.add("bit-1");
    } else {
      input.classList.remove("bit-1");
    }
    return input.value === "1" ? "1" : "0";
  });

  const bitStr = bits.join("");
  const dec = parseInt(bitStr, 2) >>> 0;
  const hex = "0x" + dec.toString(16).toUpperCase().padStart(8, '0');
  document.getElementById("hexValue").textContent = hex;
  document.getElementById("decValue").textContent = dec.toString();
}

function handleInputChange(e) {
  e.target.value = e.target.value === "1" ? "1" : "0";
  updateLabels();
}

function rotateLeft() {
  const bits = getBitArray();
  bits.push(bits.shift());
  updateBitFieldFromBinary(bits.join(""));
}

function rotateRight() {
  const bits = getBitArray();
  bits.unshift(bits.pop()); // move last bit to front
  updateBitFieldFromBinary(bits.join("")); // no reverse needed
}

function shiftLeft() {
  const bits = getBitArray();
  bits.shift();          // remove MSB (first bit)
  bits.push("0");        // add 0 at LSB (end)
  updateBitFieldFromBinary(bits.join(""));
}

function shiftRight() {
  const bits = getBitArray();
  bits.pop();            // remove LSB (last bit)
  bits.unshift("0");     // add 0 at MSB (start)
  updateBitFieldFromBinary(bits.join(""));
}

function onesComplement() {
  const bits = getBitArray().map(bit => bit === "1" ? "0" : "1");
  updateBitFieldFromBinary(bits.reverse().join(""));
}

function zeroBits() {
  updateBitFieldFromBinary("0".repeat(32));
}

function fillFromHex() {
  const hex = document.getElementById("hexInput").value.trim();
  let value = parseInt(hex, 16);
  if (isNaN(value)) return alert("Invalid hex input");
  const bin = value.toString(2).padStart(32, '0');
  updateBitFieldFromBinary(bin);
}

function fillFromDec() {
  const dec = document.getElementById("decInput").value.trim();
  let value = parseInt(dec, 10);
  if (isNaN(value)) return alert("Invalid decimal input");
  value = value >>> 0;
  const bin = value.toString(2).padStart(32, '0');
  updateBitFieldFromBinary(bin);
}

createBitField();
updateLabels();
