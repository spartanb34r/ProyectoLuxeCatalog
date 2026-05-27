import {
  Injectable,
  signal,
  PLATFORM_ID,
  inject
} from '@angular/core';

import {
  isPlatformBrowser
} from '@angular/common';

import {
  Producto
} from '../models/producto.model';

@Injectable({
  providedIn: 'root'
})

export class CarritoService {

  private platformId =
    inject(PLATFORM_ID);

  mensajeStock =
    signal(false);

  private productosSignal =
    signal<Producto[]>(
      this.cargarDesdeStorage()
    );

  productos =
    this.productosSignal.asReadonly();

  // =========================
  // CARGAR STORAGE
  // =========================

  private cargarDesdeStorage():
  Producto[] {

    try {

      if (
        typeof localStorage ===
        'undefined'
      ) {

        return [];

      }

      const data =
        localStorage.getItem(
          'carrito'
        );

      return data
        ? JSON.parse(data)
        : [];

    } catch {

      return [];

    }

  }

  // =========================
  // GUARDAR STORAGE
  // =========================

  private guardarEnStorage(
    lista: Producto[]
  ) {

    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      localStorage.setItem(

        'carrito',

        JSON.stringify(lista)

      );

    }

  }

  // =========================
  // AGREGAR PRODUCTO
  // =========================

  agregar(
    producto: Producto
  ): boolean {

    let agregado = false;

    this.productosSignal.update(
      lista => {

        const existente =
          lista.find(
            p =>
              p.id === producto.id
          );

        const cantidadAgregar =

          producto.cantidad || 1;

        const cantidadActual =

          existente
            ? existente.cantidad || 1
            : 0;

        const totalDeseado =

          cantidadActual +
          cantidadAgregar;

        // VALIDAR STOCK
        if (
          totalDeseado >
          producto.stock
        ) {

          this.mensajeStock.set(
            true
          );

          setTimeout(() => {

            this.mensajeStock.set(
              false
            );

          }, 2000);

          agregado = false;

          return lista;

        }

        // SI YA EXISTE
        if (existente) {

          existente.cantidad =
            totalDeseado;

          agregado = true;

          const nueva = [...lista];

          this.guardarEnStorage(
            nueva
          );

          return nueva;

        }

        // NUEVO PRODUCTO
        const nuevoProducto = {

          ...producto,

          cantidad:
            cantidadAgregar

        };

        agregado = true;

        const nueva = [

          ...lista,

          nuevoProducto

        ];

        this.guardarEnStorage(
          nueva
        );

        return nueva;

      }
    );

    return agregado;

  }

  // =========================
  // QUITAR CANTIDAD
  // =========================

  quitarCantidad(

    id: number,

    cantidad: number

  ) {

    this.productosSignal.update(
      lista => {

        const producto =
          lista.find(
            p => p.id === id
          );

        if (!producto) {

          return lista;

        }

        const actual =

          producto.cantidad || 1;

        // VALIDAR
        if (cantidad > actual) {

          cantidad = actual;

        }

        const nuevaCantidad =

          actual - cantidad;

        // ELIMINAR
        if (nuevaCantidad <= 0) {

          const nuevaLista =

            lista.filter(
              p => p.id !== id
            );

          this.guardarEnStorage(
            nuevaLista
          );

          return nuevaLista;

        }

        // ACTUALIZAR
        producto.cantidad =
          nuevaCantidad;

        const nuevaLista =
          [...lista];

        this.guardarEnStorage(
          nuevaLista
        );

        return nuevaLista;

      }
    );

  }

  // =========================
  // VACIAR
  // =========================

  vaciar() {

    this.productosSignal.set([]);

    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      localStorage.removeItem(
        'carrito'
      );

    }

  }

  // =========================
  // TOTAL
  // =========================

  total(): number {

    return this
      .productosSignal()
      .reduce(

        (acc, p) =>

          acc +

          (
            p.price *
            (p.cantidad || 1)
          ),

        0

      );

  }

  // =========================
  // EXPORTAR XML
  // =========================

  exportarXML() {

    const productos =
      this.productosSignal();

    const subtotal =
      this.total();

    const ivaPorcentaje = 16;

    const ivaInformativo =

      (subtotal *
      ivaPorcentaje) / 100;

    const fecha =
      new Date()
      .toLocaleString('es-MX');

    let xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n`;

    xml += `<factura>\n`;

    xml += `  <empresa>\n`;
    xml += `    <nombre>Luxe Catalog</nombre>\n`;
    xml += `    <rfc>LUX010101AAA</rfc>\n`;
    xml += `    <direccion>Guadalajara, Jalisco, México</direccion>\n`;
    xml += `  </empresa>\n`;

    xml += `  <cliente>\n`;
    xml += `    <nombre>Cliente General</nombre>\n`;
    xml += `    <rfc>XAXX010101000</rfc>\n`;
    xml += `  </cliente>\n`;

    xml += `  <compra>\n`;

    xml += `    <fecha>${fecha}</fecha>\n`;

    xml += `    <moneda>MXN</moneda>\n`;

    xml += `    <ivaPorcentaje>${ivaPorcentaje}%</ivaPorcentaje>\n`;

    xml += `    <productos>\n`;

    for (const p of productos) {

      xml += `      <producto>\n`;

      xml += `        <id>${p.id}</id>\n`;

      xml += `        <nombre>${this.escapeXml(p.name)}</nombre>\n`;

      xml += `        <precio>${p.price}</precio>\n`;

      xml += `        <cantidad>${p.cantidad || 1}</cantidad>\n`;

      if (p.description) {

        xml += `        <descripcion>${this.escapeXml(p.description)}</descripcion>\n`;

      }

      xml += `      </producto>\n`;

    }

    xml += `    </productos>\n`;

    xml += `    <subtotal>${subtotal.toFixed(2)}</subtotal>\n`;

    xml += `    <ivaInformativo>${ivaInformativo.toFixed(2)}</ivaInformativo>\n`;

    xml += `    <total>${subtotal.toFixed(2)}</total>\n`;

    xml += `  </compra>\n`;

    xml += `</factura>`;

    const blob = new Blob(
      [xml],
      { type: 'application/xml' }
    );

    const url =
      URL.createObjectURL(blob);

    const a =
      document.createElement('a');

    a.href = url;

    a.download =
      'factura-luxe-catalog.xml';

    a.click();

    URL.revokeObjectURL(url);

  }

  // =========================
  // ESCAPE XML
  // =========================

  private escapeXml(
    value: string
  ): string {

    return value

      .replaceAll('&', '&amp;')

      .replaceAll('<', '&lt;')

      .replaceAll('>', '&gt;')

      .replaceAll('"', '&quot;')

      .replaceAll("'", '&apos;');

  }

}