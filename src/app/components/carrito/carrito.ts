import { Component, computed, Signal} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto.model';

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
  mensajeStock: Signal<boolean>;

  total = computed(() =>
    this.carritoService.total()
  );

  constructor(
    public carritoService: CarritoService
  ) {

    this.carrito = this.carritoService.productos;

    // 👇 aquí YA existe el service
    this.mensajeStock = this.carritoService.mensajeStock;

  }

  vaciar() {
    this.carritoService.vaciar();
  }

  exportarXML() {
    this.carritoService.exportarXML();
  }

  aumentar(producto: Producto) {
    this.carritoService.actualizarCantidad(producto.id, 1);
  }

  disminuir(producto: Producto) {
    this.carritoService.actualizarCantidad(producto.id, -1);
  }
}