import {
  Component,
  computed,
  Signal
} from '@angular/core';

import {
  CurrencyPipe
} from '@angular/common';

import {
  RouterLink
} from '@angular/router';

import {
  FormsModule
} from '@angular/forms';

import {
  CarritoService
} from '../../services/carrito.service';

import {
  Producto
} from '../../models/producto.model';

@Component({
  selector: 'app-carrito',

  standalone: true,

  imports: [
    CurrencyPipe,
    RouterLink,
    FormsModule
  ],

  templateUrl: './carrito.html',

  styleUrls: ['./carrito.css'],
})

export class CarritoComponent {

  carrito: Signal<Producto[]>;

  total =
    computed(() =>
      this.carritoService.total()
    );

  // CANTIDADES A ELIMINAR
  cantidadesEliminar: {
    [key: number]: number
  } = {};

  constructor(
    public carritoService:
    CarritoService
  ) {

    this.carrito =
      this.carritoService.productos;

  }

  vaciar() {

    this.carritoService.vaciar();

  }

  exportarXML() {

    this.carritoService.exportarXML();

  }

  // =========================
  // AUMENTAR CANTIDAD
  // A ELIMINAR
  // =========================

  incrementarEliminar(
    producto: Producto
  ) {

    const actual =

      this.cantidadesEliminar[
        producto.id
      ] || 1;

    const maximo =
      producto.cantidad || 1;

    // NO PASAR DEL TOTAL
    if (actual < maximo) {

      this.cantidadesEliminar[
        producto.id
      ] = actual + 1;

    }

  }

  // =========================
  // DISMINUIR CANTIDAD
  // A ELIMINAR
  // =========================

  decrementarEliminar(
    producto: Producto
  ) {

    const actual =

      this.cantidadesEliminar[
        producto.id
      ] || 1;

    // NO BAJAR DE 1
    if (actual > 1) {

      this.cantidadesEliminar[
        producto.id
      ] = actual - 1;

    }

  }

  // =========================
  // ELIMINAR PRODUCTOS
  // =========================

  eliminarSeleccionados(
    producto: Producto
  ) {

    const cantidad =

      this.cantidadesEliminar[
        producto.id
      ] || 1;

    this.carritoService
      .quitarCantidad(

        producto.id,

        cantidad

      );

    // RESETEAR
    this.cantidadesEliminar[
      producto.id
    ] = 1;

  }

}