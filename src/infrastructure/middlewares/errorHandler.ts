import { Request, Response, NextFunction} from "express";

export function errorHandler(
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
) {

    return response.status(400).json({
        ok: false,
        message: error.message
    });

}