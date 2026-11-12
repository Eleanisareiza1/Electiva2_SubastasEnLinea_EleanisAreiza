import express from "express";

import {
    recibirPago
} from "../controllers/WebhookController";

const webhookRoutes =
    express.Router();

webhookRoutes.post(
    "/webhooks/pagos",
    recibirPago
);

export default webhookRoutes;
