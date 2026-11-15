const fs = require('fs');
const path = require('path');

function parseRelaxedJson(text) {
  // Remove line comments
  let s = text.replace(/\/\/.*/g, '');
  // Remove block comments /* ... */
  s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  // Fix unquoted keys and unquoted string literals
  // In AoH3 files like GeographicalRegions.json or Config.json:
  // Age_of_History: Data -> "Age_of_History": "Data"
  s = s.replace(/([\{\s,])([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)([\r\n,\}])/g, '$1"$2": "$3"$4');
  s = s.replace(/([\{\s,])([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
  // Remove trailing commas before } or ]
  s = s.replace(/,\s*([\]\}])/g, '$1');
  return JSON.parse(s);
}

function parseParadoxTxt(text) {
  // Simple Paradox clausewitz script parser (key = value, key = { ... })
  // Remove comments
  const clean = text.replace(/#.*$/gm, '');
  // We can extract key-value pairs or tokens
  return clean;
}

module.exports = {
  parseRelaxedJson,
  parseParadoxTxt
};
