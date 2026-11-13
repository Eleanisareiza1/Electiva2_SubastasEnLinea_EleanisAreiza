import request from "supertest";
import { Subasta } from "../../domain/Subasta";
import { Dinero } from "../../domain/valueObjects/Dinero";
import { CABECERA_FIRMA, firmarCuerpo } from "../../infrastructure/auth/FirmaPasarela";
import { articuloDePrueba } from "../fabricas";
import { EntornoPrueba, SECRETO_WEBHOOK, crearEntornoPrueba } from "../entornoPrueba";

async function registrarYEntrar(e: EntornoPrueba, nombre: string, correo: string) {
    await request(e.app).post("/api/v1/auth/register").send({ nombre, correo, password: "clave-segura" }).expect(201);
    const res = await request(e.app).post("/api/v1/auth/login").send({ correo, password: "clave-segura" }).expect(200);
    return { token: res.body.data.token as string, id: res.body.data.usuario.id as string };
}

const enDosDias = () => new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString();

function publicacion(extra: Record<string, unknown> = {}) {
    return {
        nombre: "Consola de videojuegos",
        descripcion: "Consola con dos controles y juegos",
        estadoConservacion: "USADO",
        categoriaId: "tecnologia",
        precioBase: 100000,
        incrementoMinimo: 10000,
        fechaCierre: enDosDias(),
        ...extra
    };
}

function enviarWebhook(e: EntornoPrueba, cuerpo: object, firma?: string) {
    const json = JSON.stringify(cuerpo);
    return request(e.app)
        .post("/api/v1/webhooks/pagos")
        .set("Content-Type", "application/json")
        .set(CABECERA_FIRMA, firma ?? firmarCuerpo(json, SECRETO_WEBHOOK))
        .send(json);
}

describe("API REST de punta a punta", () => {

    let e: EntornoPrueba;
    beforeEach(async () => { e = await crearEntornoPrueba(); });
    afterEach(() => jest.restoreAllMocks());

    test("RN-22 y RNF-13: correo duplicado responde 409 con formato uniforme", async () => {
        await registrarYEntrar(e, "Ana", "ana@correo.com");
        const res = await request(e.app).post("/api/v1/auth/register")
            .send({ nombre: "Otra", correo: "ANA@correo.com", password: "clave-segura" });
        expect(res.status).toBe(409);
        expect(res.body).toEqual({ ok: false, error: { codigo: "RN-22", mensaje: expect.any(String) } });
    });

    test("credenciales inválidas responden 401", async () => {
        const res = await request(e.app).post("/api/v1/auth/login").send({ correo: "x@y.com", password: "nada-nada" });
        expect(res.status).toBe(401);
    });

    test("publicar exige sesión y el vendedor sale del token", async () => {
        await request(e.app).post("/api/v1/subastas").send(publicacion()).expect(401);
        const vendedor = await registrarYEntrar(e, "Vale", "vale@correo.com");
        const res = await request(e.app).post("/api/v1/subastas")
            .set("Authorization", `Bearer ${vendedor.token}`)
            .send(publicacion({ vendedorId: "otro-usuario" }))
            .expect(201);
        expect(res.body.data.vendedorId).toBe(vendedor.id);
    });

    test("formato inválido responde 400 y una regla de publicación 422", async () => {
        const vendedor = await registrarYEntrar(e, "Vale", "vale@correo.com");
        const auth = { Authorization: `Bearer ${vendedor.token}` };
        const formato = await request(e.app).post("/api/v1/subastas").set(auth).send(publicacion({ precioBase: "mil" }));
        expect(formato.status).toBe(400);
        expect(formato.body.error.codigo).toBe("FORMATO_INVALIDO");
        const regla = await request(e.app).post("/api/v1/subastas").set(auth).send(publicacion({ precioBase: 0 }));
        expect(regla.status).toBe(422);
        expect(regla.body.error.codigo).toBe("RN-01");
    });

    test("RNF-12: una puja rechazada no responde con éxito y queda auditada", async () => {
        const vendedor = await registrarYEntrar(e, "Vale", "vale@correo.com");
        const ana = await registrarYEntrar(e, "Ana", "ana@correo.com");
        const luis = await registrarYEntrar(e, "Luis", "luis@correo.com");

        const pub = await request(e.app).post("/api/v1/subastas")
            .set("Authorization", `Bearer ${vendedor.token}`).send(publicacion()).expect(201);
        const id = pub.body.data.id as string;

        await request(e.app).post(`/api/v1/subastas/${id}/pujas`)
            .set("Authorization", `Bearer ${ana.token}`).send({ valor: 100000 }).expect(201);

        const rechazada = await request(e.app).post(`/api/v1/subastas/${id}/pujas`)
            .set("Authorization", `Bearer ${luis.token}`).send({ valor: 105000 });
        expect(rechazada.status).toBe(422);
        expect(rechazada.body.error.codigo).toBe("RN-09");

        await request(e.app).post(`/api/v1/subastas/${id}/pujas`)
            .set("Authorization", `Bearer ${luis.token}`).send({ valor: 110000 }).expect(201);

        // Tiempo real: dos pujas difundidas y aviso personal a Ana (RF-13, RF-14).
        expect(e.espia.pujas.map((p) => p.valor)).toEqual([100000, 110000]);
        expect(e.espia.personales.some((p) => p.usuarioId === ana.id && p.notificacion.tipo === "PUJA_SUPERADA")).toBe(true);

        // RN-12 persistido y visible para el vendedor.
        const intentos = await request(e.app).get(`/api/v1/subastas/${id}/intentos-fallidos`)
            .set("Authorization", `Bearer ${vendedor.token}`).expect(200);
        expect(intentos.body.data[0]).toMatchObject({ codigo: "RN-09", valorOfrecido: 105000, postorNombre: "Luis" });

        // RN-23: el historial no expone correos.
        const detalle = await request(e.app).get(`/api/v1/subastas/${id}`)
            .set("Authorization", `Bearer ${ana.token}`).expect(200);
        expect(JSON.stringify(detalle.body)).not.toContain("@correo.com");
        expect(detalle.body.data.historial[0]).toMatchObject({ postorNombre: "Luis", valor: 110000 });
    });

    test("filtros y paginación del listado (RF-05)", async () => {
        const vendedor = await registrarYEntrar(e, "Vale", "vale@correo.com");
        const auth = { Authorization: `Bearer ${vendedor.token}` };
        await request(e.app).post("/api/v1/subastas").set(auth).send(publicacion()).expect(201);
        await request(e.app).post("/api/v1/subastas").set(auth).send(publicacion({ nombre: "Sofá de cuero", categoriaId: "hogar" })).expect(201);
        await request(e.app).post("/api/v1/subastas").set(auth).send(publicacion({ nombre: "Lámpara", categoriaId: "hogar" })).expect(201);

        const res = await request(e.app).get("/api/v1/subastas?categoria=hogar&estado=ABIERTA&tamano=1&pagina=2").expect(200);
        expect(res.body.data.total).toBe(2);
        expect(res.body.data.totalPaginas).toBe(2);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.conteoPorEstado.ABIERTA).toBe(2);
    });

    test("cierre perezoso, orden de pago y webhook idempotente (RN-13, RN-17, RN-18, RN-19)", async () => {
        const vendedor = await registrarYEntrar(e, "Vale", "vale@correo.com");
        const ana = await registrarYEntrar(e, "Ana", "ana@correo.com");

        // Subasta publicada hace 2 horas con cierre hace 1 minuto.
        const hace2h = new Date(Date.now() - 2 * 3600 * 1000);
        const subasta = Subasta.publicar({
            id: "s-cerrada",
            vendedorId: vendedor.id,
            articulo: articuloDePrueba(),
            precioBase: new Dinero(1000),
            incrementoMinimo: new Dinero(100),
            fechaCierre: new Date(Date.now() - 60 * 1000)
        }, hace2h);
        subasta.registrarPuja(ana.id, 1500, new Date(hace2h.getTime() + 60 * 1000));
        await e.repos.subastas.guardar(subasta);

        // Consultar la subasta la cierra (sección 4.4).
        const detalle = await request(e.app).get("/api/v1/subastas/s-cerrada")
            .set("Authorization", `Bearer ${ana.token}`).expect(200);
        expect(detalle.body.data.estado).toBe("CERRADA");
        expect(detalle.body.data.ordenPago.estado).toBe("PENDIENTE");
        expect(e.espia.estados.at(-1)?.estado).toBe("CERRADA");

        const ordenes = await request(e.app).get("/api/v1/ordenes").set("Authorization", `Bearer ${ana.token}`).expect(200);
        const ordenId = ordenes.body.data[0].id as string;

        // RN-18: firma inválida no cambia nada.
        const evento = { eventoId: "evt-1", ordenId, resultado: "APROBADO" };
        await enviarWebhook(e, evento, "sha256=falsa").expect(401);
        expect((await e.repos.subastas.buscarPorId("s-cerrada"))?.obtenerEstado()).toBe("CERRADA");

        // RN-19: el mismo evento dos veces -> misma respuesta, un solo cambio.
        const primera = await enviarWebhook(e, evento).expect(200);
        const segunda = await enviarWebhook(e, evento).expect(200);
        expect(segunda.body).toEqual(primera.body);
        expect(primera.body.data.estadoOrden).toBe("PAGADA");
        expect((await e.repos.subastas.buscarPorId("s-cerrada"))?.obtenerEstado()).toBe("PAGADA");
        const confirmaciones = e.espia.personales.filter((p) => p.notificacion.tipo === "PAGO_CONFIRMADO");
        expect(confirmaciones).toHaveLength(2); // ganador y vendedor, una sola vez
    });

    test("rutas inexistentes responden 404 uniforme", async () => {
        const res = await request(e.app).get("/api/v1/no-existe");
        expect(res.status).toBe(404);
        expect(res.body.error.codigo).toBe("RUTA_NO_ENCONTRADA");
    });

});
