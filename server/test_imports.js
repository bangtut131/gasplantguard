console.log("Testing imports...");
try {
    console.log("Loading better-sqlite3...");
    const Database = require('better-sqlite3');
    console.log("better-sqlite3 loaded.");
} catch (e) { console.error("FAILED better-sqlite3:", e); }

try {
    console.log("Loading xlsx...");
    const XLSX = require('xlsx');
    console.log("xlsx loaded.");
} catch (e) { console.error("FAILED xlsx:", e); }

try {
    console.log("Loading json5...");
    const JSON5 = require('json5');
    console.log("json5 loaded.");
} catch (e) { console.error("FAILED json5:", e); }

try {
    console.log("Loading @google/generative-ai...");
    const mod = require('@google/generative-ai');
    console.log("@google/generative-ai loaded.");
} catch (e) { console.error("FAILED @google/generative-ai:", e); }

console.log("Done.");
