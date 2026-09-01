//creamos el controlador para manejar la creación de subastas

import { Request, Response } from "express";

export const crearSubasta = (
  request: Request,
  response: Response
) => {

  return response.status(501).json({
    ok: false,
    code: "NOT_IMPLEMENTED",
    message: "Caso de uso aún no implementado"
  });

};