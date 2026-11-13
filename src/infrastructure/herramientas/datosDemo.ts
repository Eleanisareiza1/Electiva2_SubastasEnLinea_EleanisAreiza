// Datos de demostración para la sustentación (se activan con SEMBRAR_DEMO=true).
// Todo se crea a través del modelo de dominio, con fechas de publicación en el
// pasado cuando se necesita mostrar un cierre próximo o ya ocurrido.

import { CifradorContrasenas } from "../../application/ports/CifradorContrasenas";
import { GeneradorIds } from "../../application/ports/GeneradorIds";
import { Articulo } from "../../domain/Articulo";
import { Subasta } from "../../domain/Subasta";
import { Usuario } from "../../domain/Usuario";
import { Correo } from "../../domain/valueObjects/Correo";
import { Dinero } from "../../domain/valueObjects/Dinero";
import { EstadoConservacion } from "../../domain/valueObjects/EstadoConservacion";
import { Repositorios } from "../contenedor";

export const CONTRASENA_DEMO = "Demo12345";

const MINUTO = 60 * 1000;
const HORA = 60 * MINUTO;
const DIA = 24 * HORA;

interface SubastaDemo {
    vendedor: number;
    nombre: string;
    descripcion: string;
    estado: EstadoConservacion;
    categoria: string;
    base: number;
    incremento: number;
    publicadaHace: number;
    dura: number;
    pujas: Array<[number, number, number]>; // [postor, valor, minutos después de publicar]
}

const SUBASTAS: SubastaDemo[] = [
    {
        vendedor: 0, nombre: "MacBook Pro 14\" M3 Pro", categoria: "tecnologia",
        descripcion: "18 GB de RAM, 512 GB SSD, batería al 96 %. Incluye cargador original y caja.",
        estado: EstadoConservacion.COMO_NUEVO, base: 4_500_000, incremento: 100_000,
        publicadaHace: 6 * HORA, dura: 2 * DIA,
        pujas: [[1, 4_500_000, 30], [2, 4_650_000, 90], [1, 4_800_000, 200]]
    },
    {
        vendedor: 0, nombre: "Mazda 3 Touring 2019", categoria: "vehiculos",
        descripcion: "Sedán automático, 48.000 km, único dueño, mantenimientos en concesionario.",
        estado: EstadoConservacion.BUEN_ESTADO, base: 55_000_000, incremento: 500_000,
        publicadaHace: 1 * DIA, dura: 5 * DIA,
        pujas: [[2, 55_000_000, 60], [1, 56_000_000, 400]]
    },
    {
        vendedor: 2, nombre: "Bicicleta de ruta Specialized Allez", categoria: "deportes",
        descripcion: "Talla 54, grupo Shimano 105, ruedas de aluminio. Ideal para empezar en ruta.",
        estado: EstadoConservacion.USADO, base: 2_800_000, incremento: 50_000,
        publicadaHace: 57 * MINUTO, dura: 1 * HORA,
        pujas: [[1, 2_800_000, 20]]
    },
    {
        vendedor: 0, nombre: "Sofá en L de tres puestos", categoria: "hogar",
        descripcion: "Tapizado en lino gris, 2,60 m x 1,60 m. Sin manchas, desarmable para trasteo.",
        estado: EstadoConservacion.BUEN_ESTADO, base: 1_200_000, incremento: 50_000,
        publicadaHace: 2 * HORA, dura: 7 * DIA, pujas: []
    },
    {
        vendedor: 0, nombre: "Óleo «Atardecer en Guatapé»", categoria: "arte",
        descripcion: "Pintura al óleo sobre lienzo de 80 x 60 cm, firmada por el autor, con marco en madera.",
        estado: EstadoConservacion.NUEVO, base: 900_000, incremento: 50_000,
        publicadaHace: 1 * HORA + 15 * MINUTO, dura: 1 * HORA,
        pujas: [[2, 900_000, 10], [1, 1_000_000, 40]]
    },
    {
        vendedor: 2, nombre: "Chaqueta de cuero vintage", categoria: "moda",
        descripcion: "Chaqueta de cuero café talla M, estilo años 80, forro en buen estado.",
        estado: EstadoConservacion.USADO, base: 350_000, incremento: 20_000,
        publicadaHace: 3 * HORA, dura: 2 * HORA, pujas: []
    },
    {
        vendedor: 2, nombre: "PlayStation 5 + 2 controles", categoria: "tecnologia",
        descripcion: "Edición con lector de discos, dos controles DualSense y tres juegos físicos.",
        estado: EstadoConservacion.COMO_NUEVO, base: 1_900_000, incremento: 50_000,
        publicadaHace: 4 * HORA, dura: 1 * DIA,
        pujas: [[1, 1_900_000, 15], [0, 1_950_000, 50]]
    },
    {
        vendedor: 0, nombre: "Cámara Sony Alpha a6400", categoria: "tecnologia",
        descripcion: "Cuerpo más lente 16-50 mm, 8.000 disparos, dos baterías y memoria de 128 GB.",
        estado: EstadoConservacion.COMO_NUEVO, base: 3_100_000, incremento: 100_000,
        publicadaHace: 30 * MINUTO, dura: 12 * DIA, pujas: []
    }
];

export async function sembrarDatosDemo(
    repos: Repositorios,
    cifrador: CifradorContrasenas,
    ids: GeneradorIds
): Promise<void> {

    if (await repos.usuarios.buscarPorCorreo(new Correo("valentina@demo.com"))) {
        console.log("[demo] Los datos de demostración ya existen");
        return;
    }

    const hash = await cifrador.cifrar(CONTRASENA_DEMO);
    const usuarios = [
        ["Valentina Ríos", "valentina@demo.com"],
        ["Sofía Gómez", "sofia@demo.com"],
        ["Mateo Restrepo", "mateo@demo.com"]
    ].map(([nombre, correo]) =>
        Usuario.registrar({ id: ids.generar(), nombre, correo: new Correo(correo), passwordHash: hash })
    );

    for (const usuario of usuarios) {
        await repos.usuarios.guardar(usuario);
    }

    const ahora = Date.now();

    for (const datos of SUBASTAS) {

        const publicacion = new Date(ahora - datos.publicadaHace);

        const subasta = Subasta.publicar(
            {
                id: ids.generar(),
                vendedorId: usuarios[datos.vendedor].id,
                articulo: Articulo.crear({
                    id: ids.generar(),
                    nombre: datos.nombre,
                    descripcion: datos.descripcion,
                    estadoConservacion: datos.estado,
                    categoriaId: datos.categoria
                }),
                precioBase: new Dinero(datos.base),
                incrementoMinimo: new Dinero(datos.incremento),
                fechaCierre: new Date(publicacion.getTime() + datos.dura)
            },
            publicacion
        );

        for (const [postor, valor, minutos] of datos.pujas) {
            subasta.registrarPuja(
                usuarios[postor].id,
                valor,
                new Date(publicacion.getTime() + minutos * MINUTO)
            );
        }

        await repos.subastas.guardar(subasta);
    }

    console.log(`[demo] Usuarios valentina@, sofia@ y mateo@demo.com con contraseña ${CONTRASENA_DEMO}`);
}
