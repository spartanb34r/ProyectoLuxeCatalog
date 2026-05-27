import { Component, inject } from '@angular/core';

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

  protected readonly title = 'miproyecto';

  mostrarHeader = true;

  authService = inject(AuthService);

  carritoService = inject(CarritoService);

  usuario: any = null;

  constructor(private router: Router) {

    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {

        const hiddenRoutes = [
          '/login',
          '/registro'
        ];

        this.mostrarHeader = !hiddenRoutes.includes(
          this.router.url
        );

        const user = localStorage.getItem('usuario');

        if (user) {
          this.usuario = JSON.parse(user);
        } else {
          this.usuario = null;
        }

      });

  }

  get cantidadCarrito(): number {

  return this.carritoService.productos()
    .reduce((total, producto) => {

      return total + (producto.cantidad || 1);

    }, 0);

}

  logout() {
    localStorage.removeItem('usuario');

    this.authService.logout();

    this.router.navigate(['/login']);

  }

}