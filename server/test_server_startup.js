console.log("Start testing all imports...");
try {
    console.log("Loading express...");
    require('express');
    console.log("express loaded.");

    console.log("Loading cors...");
    require('cors');
    console.log("cors loaded.");

    console.log("Loading multer...");
    require('multer');
    console.log("multer loaded.");

    console.log("Loading dotenv...");
    require('dotenv').config();
    console.log("dotenv loaded.");

    console.log("Loading database.js...");
    const db = require('./database');
    console.log("database.js loaded.");

    console.log("Loading better-sqlite3 check...");
    const Database = require('better-sqlite3');
    console.log("better-sqlite3 direct load ok.");

} catch (e) {
    console.error("CRITICAL IMPORT ERROR:", e);
    process.exit(1);
}
console.log("All imports successful.");
