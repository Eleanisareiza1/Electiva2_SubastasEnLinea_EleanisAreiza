"use strict";
//Estamos configurando el servidor de express y las rutas de la API
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const subastaRoutes_1 = __importDefault(require("./infrastructure/routes/subastaRoutes"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/api/v1", subastaRoutes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map