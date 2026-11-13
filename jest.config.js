const { createDefaultPreset } = require("ts-jest");

/** @type {import("jest").Config} **/
module.exports = {
  // Solo las pruebas del backend; el frontend tiene su propia configuración.
  roots: ["<rootDir>/src"],
  testEnvironment: "node",
  transform: {
    ...createDefaultPreset().transform
  }
};
