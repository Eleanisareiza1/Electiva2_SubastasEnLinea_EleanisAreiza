"use strict";
//Definimos el recurso, la ruta y el método HTTP para crear una subasta
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const SubastaController_1 = require("../controllers/SubastaController");
const subastaRoutes = express_1.default.Router();
subastaRoutes.post("/subastas", SubastaController_1.crearSubasta);
exports.default = subastaRoutes;
//# sourceMappingURL=subastaRoutes.js.map