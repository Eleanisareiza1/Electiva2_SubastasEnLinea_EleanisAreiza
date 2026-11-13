import { RequestHandler, Router } from "express";
import { JwtGeneradorTokens } from "../auth/JwtGeneradorTokens";
import { CasosDeUso } from "../contenedor";
import { crearAuthController } from "./controllers/AuthController";
import { crearNotificacionController } from "./controllers/NotificacionController";
import { crearOrdenController } from "./controllers/OrdenController";
import { crearSubastaController } from "./controllers/SubastaController";
import { crearWebhookController } from "./controllers/WebhookController";
import { crearMiddlewareAutenticacion } from "./middlewares/autenticacion";

// Rutas de la API REST organizadas por recurso.
export function crearRutas(casos: CasosDeUso, tokens: JwtGeneradorTokens, webhookSecret: string): Router {

    const rutas = Router();
    const autenticado: RequestHandler = crearMiddlewareAutenticacion(tokens);

    const auth = crearAuthController(casos);
    const subastas = crearSubastaController(casos);
    const ordenes = crearOrdenController(casos);
    const notificaciones = crearNotificacionController(casos);
    const webhook = crearWebhookController(casos, webhookSecret);

    rutas.get("/salud", (_req, res) => {
        res.json({ ok: true, data: { estado: "operativo", fecha: new Date().toISOString() } });
    });

    // Usuarios y sesión
    rutas.post("/auth/register", auth.registrar);
    rutas.post("/auth/login", auth.iniciarSesion);
    rutas.get("/auth/profile", autenticado, auth.perfil);

    // Categorías y subastas
    rutas.get("/categorias", subastas.listarCategorias);
    rutas.get("/subastas", subastas.listar);
    rutas.post("/subastas", autenticado, subastas.publicar);
    rutas.get("/subastas/:id", autenticado, subastas.detalle);
    rutas.patch("/subastas/:id/cancelar", autenticado, subastas.cancelar);
    rutas.get("/subastas/:id/pujas", autenticado, subastas.historial);
    rutas.post("/subastas/:id/pujas", autenticado, subastas.pujar);
    rutas.get("/subastas/:id/intentos-fallidos", autenticado, subastas.intentosFallidos);

    // Pagos y notificaciones
    rutas.get("/ordenes", autenticado, ordenes.misOrdenes);
    rutas.get("/notificaciones", autenticado, notificaciones.listar);
    rutas.patch("/notificaciones/:id/leida", autenticado, notificaciones.marcarLeida);

    // Webhook de la pasarela (sin token de usuario: se autentica con la firma)
    rutas.post("/webhooks/pagos", webhook.recibirPago);

    return rutas;
}
