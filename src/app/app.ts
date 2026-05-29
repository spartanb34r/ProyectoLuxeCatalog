import { Component, inject, HostListener } from '@angular/core';
import { CarritoService } from './services/carrito.service';
import {
  Router,
  NavigationEnd,
  RouterOutlet,
  RouterLink,
  RouterLinkActive
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  mostrarHeader = true;

  authService = inject(AuthService);
  carritoService = inject(CarritoService);

  usuario: any = null;
  mostrarPerfilMenu = false;

  constructor(private router: Router) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {

        const hiddenRoutes = ['/login', '/registro'];

        this.mostrarHeader = !hiddenRoutes.includes(this.router.url);

        const user = localStorage.getItem('usuario');

        this.usuario = user ? JSON.parse(user) : null;

      });

  }

  get cantidadCarrito(): number {
    return this.carritoService.productos()
      .reduce((total, producto) => total + (producto.cantidad || 1), 0);
  }

  logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');

    this.authService.logout();

    this.router.navigate(['/login']);
  }

  togglePerfilMenu() {
    this.mostrarPerfilMenu = !this.mostrarPerfilMenu;
  }

  irPerfil() {
    this.mostrarPerfilMenu = false;
    this.router.navigate(['/perfil-usuario']);
  }

  // 🔴 CERRAR MENU AL DAR CLICK FUERA
  @HostListener('document:click')
  cerrarMenu() {
    this.mostrarPerfilMenu = false;
  }
}