// Pasarela de pagos SIMULADA (proceso aparte, puerto 5050 por defecto).
// Representa al tercero externo: muestra una página de cobro y, al decidir el
// resultado, envía la notificación firmada al webhook de la plataforma
// respetando el contrato (cabecera x-pasarela-firma con HMAC-SHA256).
//
// Uso: npm run pasarela

import dotenv from "dotenv";
import express from "express";
import { randomUUID } from "crypto";
import { CABECERA_FIRMA, firmarCuerpo } from "../auth/FirmaPasarela";

dotenv.config();

const PUERTO = Number(process.env.PASARELA_PUERTO ?? 5050);
const API_URL = process.env.PASARELA_API_URL ?? "http://localhost:5000/api/v1";
const SECRETO = process.env.WEBHOOK_SECRET;

if (!SECRETO) {
    console.error("Falta WEBHOOK_SECRET en el archivo .env");
    process.exit(1);
}

const secreto: string = SECRETO;

function escapar(texto: string): string {
    return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function pagina(contenido: string): string {
    return `<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>PasarelaPay · Simulador</title>
<style>
 body{margin:0;font-family:system-ui,Segoe UI,Roboto,sans-serif;background:linear-gradient(135deg,#0b1f4d,#1d3f99);min-height:100vh;display:grid;place-items:center;color:#14213d}
 .tarjeta{background:#fff;border-radius:18px;padding:32px;width:min(440px,92vw);box-shadow:0 20px 50px rgba(0,0,0,.3)}
 .marca{font-weight:800;font-size:22px;color:#1d3f99}.marca span{color:#ff7a00}
 .aviso{font-size:12px;background:#fff4e5;color:#8a4b00;padding:8px 10px;border-radius:8px;margin:12px 0}
 .monto{font-size:34px;font-weight:800;margin:6px 0 18px}
 button{width:100%;padding:14px;border:0;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;margin-top:10px}
 .ok{background:#16a34a;color:#fff}.no{background:#dc2626;color:#fff}.gris{background:#e5e7eb;color:#111}
 pre{background:#0f172a;color:#e2e8f0;padding:12px;border-radius:10px;font-size:12px;white-space:pre-wrap;word-break:break-all}
 a{color:#1d3f99;font-weight:700}
</style></head><body><div class="tarjeta">${contenido}</div></body></html>`;
}

async function enviarNotificacion(
    cuerpo: { eventoId: string; ordenId: string; resultado: string },
    firmaCorrecta: boolean
): Promise<{ estado: number; respuesta: string }> {

    const json = JSON.stringify(cuerpo);
    const firma = firmaCorrecta ? firmarCuerpo(json, secreto) : "sha256=firma-falsa";

    const respuesta = await fetch(`${API_URL}/webhooks/pagos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", [CABECERA_FIRMA]: firma },
        body: json
    });

    return { estado: respuesta.status, respuesta: await respuesta.text() };
}

const app = express();
app.use(express.urlencoded({ extended: false }));

app.get("/checkout", (request, response) => {

    const ordenId = String(request.query.ordenId ?? "");
    const valor = Number(request.query.valor ?? 0);
    const titulo = String(request.query.titulo ?? "Orden de pago");
    const retorno = String(request.query.retorno ?? "http://localhost:4200/ordenes");

    const oculto = (nombre: string, valorCampo: string) =>
        `<input type="hidden" name="${nombre}" value="${escapar(valorCampo)}">`;

    const formulario = (resultado: string, clase: string, texto: string, firma = "correcta") => `
      <form method="post" action="/checkout">
        ${oculto("ordenId", ordenId)}${oculto("retorno", retorno)}${oculto("titulo", titulo)}
        ${oculto("resultado", resultado)}${oculto("firma", firma)}
        <button class="${clase}">${texto}</button>
      </form>`;

    response.send(pagina(`
      <div class="marca">Pasarela<span>Pay</span></div>
      <div class="aviso">Simulador académico: ningún cobro es real.</div>
      <div>${escapar(titulo)}</div>
      <div class="monto">$${valor.toLocaleString("es-CO")} COP</div>
      <small>Orden: ${escapar(ordenId)}</small>
      ${formulario("APROBADO", "ok", "Aprobar pago")}
      ${formulario("RECHAZADO", "no", "Rechazar pago")}
      ${formulario("APROBADO", "gris", "Enviar con firma inválida (prueba RN-18)", "invalida")}
      <p><a href="${escapar(retorno)}">Volver a la plataforma</a></p>`));
});

app.post("/checkout", async (request, response) => {

    const cuerpoForm = request.body as Record<string, string | undefined>;
    const ordenId = cuerpoForm.ordenId ?? "";
    const retorno = cuerpoForm.retorno ?? "http://localhost:4200/ordenes";
    const resultado = cuerpoForm.resultado === "RECHAZADO" ? "RECHAZADO" : "APROBADO";
    const eventoId = cuerpoForm.eventoId || `evt_${randomUUID()}`;
    const firmaCorrecta = cuerpoForm.firma !== "invalida";

    try {
        const { estado, respuesta } = await enviarNotificacion({ eventoId, ordenId, resultado }, firmaCorrecta);

        console.log(`[pasarela] ${eventoId} ${resultado} -> HTTP ${estado}`);

        response.send(pagina(`
          <div class="marca">Pasarela<span>Pay</span></div>
          <h3>Notificación enviada al webhook</h3>
          <p>Evento <b>${escapar(eventoId)}</b> · resultado <b>${resultado}</b> · respuesta HTTP <b>${estado}</b></p>
          <pre>${escapar(respuesta)}</pre>
          <form method="post" action="/checkout">
            <input type="hidden" name="ordenId" value="${escapar(ordenId)}">
            <input type="hidden" name="retorno" value="${escapar(retorno)}">
            <input type="hidden" name="resultado" value="${resultado}">
            <input type="hidden" name="eventoId" value="${escapar(eventoId)}">
            <button class="gris">Reenviar el mismo evento (prueba RN-19)</button>
          </form>
          <p><a href="${escapar(retorno)}">Volver a la plataforma</a></p>`));
    } catch (error) {
        response.status(502).send(pagina(`<h3>No fue posible contactar la API</h3>
          <pre>${escapar(error instanceof Error ? error.message : String(error))}</pre>
          <p>Verifique que la API esté corriendo en ${escapar(API_URL)}</p>`));
    }
});

app.listen(PUERTO, () => {
    console.log(`[pasarela] Simulador de pagos en http://localhost:${PUERTO}/checkout`);
    console.log(`[pasarela] Notifica a ${API_URL}/webhooks/pagos`);
});
