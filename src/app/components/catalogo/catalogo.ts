import { Component, OnInit, inject, signal } from '@angular/core';
import { ProductosService } from '../../services/productos.service'; 
import { CarritoService } from '../../services/carrito.service';
import { Producto } from '../../models/producto.model'; 
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-catalogo',       
  standalone: true,               
  imports: [CommonModule, FormsModule],        
  templateUrl: './catalogo.html',
  styleUrls: ['./catalogo.css'],  
})



export class CatalogoComponent implements OnInit {
  private productosService = inject(ProductosService);
  private carritoService = inject(CarritoService);
  productos: Producto[] = [];
  mensaje = signal(false);
  mensajeStock = this.carritoService.mensajeStock;
  busqueda = '';
  categoriaSeleccionada = 'Todas';
  soloDisponibles = false;
  cantidades: { [key: number]: number } = {};

  get categorias(): string[] {

  const categoriasUnicas =
    this.productos.map(p => p.category);

  return [
    'Todas',
    ...new Set(categoriasUnicas)
  ];

}

  get productosFiltrados() {

  return this.productos.filter(producto => {

    const coincideBusqueda =

      producto.name
        .toLowerCase()
        .includes(
          this.busqueda.toLowerCase()
        );

    const coincideCategoria =

      this.categoriaSeleccionada === 'Todas'

      ||

      producto.category ===
      this.categoriaSeleccionada;

    const coincideStock =

      !this.soloDisponibles

      ||

      producto.stock > 0;

    return (

      coincideBusqueda
      &&
      coincideCategoria
      &&
      coincideStock

    );

  });

}

  get productosEnStock(): number {
    return this.productos.filter(p => p.stock).reduce((sum, p) => sum + (p.cantidad || 0), 0);
  }

  ngOnInit(): void {
    
    
    this.productosService.getProductos().subscribe({
      next: (data: Producto[]) => {  
  this.productos = data.map((p: any) => ({
  ...p,
  inStock: p.inStock === 'true'
})); 
        console.log('Productos recibidos: ', data);
      },
      error: (err: unknown) => {     
        console.error('Error al obtener productos: ', err);
      }
    });
  }

  agregar(producto: any) {

  const cantidadSeleccionada =
    this.cantidades[producto.id] || 1;

  const cantidadEnCarrito =
    this.carritoService.productos()
      .find(p => p.id === producto.id)
      ?.cantidad || 0;

  const totalDeseado =
    cantidadEnCarrito + cantidadSeleccionada;

  if (totalDeseado > producto.stock) {

    this.mensajeStock.set(true);

    setTimeout(() => {

      this.mensajeStock.set(false);

    }, 2000);

    return;
  }

  this.carritoService.agregar({

    ...producto,

    cantidad: cantidadSeleccionada

  });

  this.mensaje.set(true);

  setTimeout(() => {

    this.mensaje.set(false);

  }, 2000);

}

  aumentarCantidad(producto: any) {

  const actual =
    this.cantidades[producto.id] || 1;

  if (actual < producto.stock) {

    this.cantidades[producto.id] =
      actual + 1;

  }

}

disminuirCantidad(producto: any) {

  const actual =
    this.cantidades[producto.id] || 1;

  if (actual > 1) {

    this.cantidades[producto.id] =
      actual - 1;

  }

}
}