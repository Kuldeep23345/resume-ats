const { analyzeFile } = require("./src/lib/services/file-analyzer");
const fs = require("fs");

// We need to polyfill DOMMatrix here too if we are running in plain node
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    constructor() {}
  };
}

async function test() {
  try {
    console.log("Starting test...");
    // Assuming there's some PDF file to test with? 
    // If not, just checking if imports work is already something.
    console.log("Imports successful.");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

test();
