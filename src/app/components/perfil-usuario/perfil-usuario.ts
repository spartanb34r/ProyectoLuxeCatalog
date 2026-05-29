import { Component, OnInit } from '@angular/core';
import { ProductosService } from '../../services/productos.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './perfil-usuario.html',
  styleUrls: ['./perfil-usuario.css']
})
export class PerfilComponent implements OnInit {

  usuario: any = {};
  pedidos: any[] = [];

  constructor(private productosService: ProductosService) {}

  ngOnInit() {

    // Usuario logueado
    this.usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    // Traer pedidos
    if (this.usuario?.id_usuario) {

      this.productosService.getPedidos(this.usuario.id_usuario)
        .subscribe({
          next: (data) => {

            console.log("PEDIDOS DESDE BACKEND:", data);

            // 🔥 convertir productos string → array
            this.pedidos = data.map((pedido: any) => ({
              ...pedido,
              productosArray: pedido.productos
                ? pedido.productos.split(',')
                : []
            }));

          },
          error: (err) => {
            console.error("Error al obtener pedidos:", err);
          }
        });

    }
  }
}