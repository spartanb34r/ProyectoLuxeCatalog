import { Component, inject } from '@angular/core';

import { FormsModule } from '@angular/forms';

import {
  Router,
  RouterLink
} from '@angular/router';

import { AuthService }
from '../../services/auth.service';

@Component({
  selector: 'app-login',

  standalone: true,

  imports: [
    FormsModule,
    RouterLink
  ],

  templateUrl: './login.html',

  styleUrls: ['./login.css']
})

export class LoginComponent {

  private authService =
    inject(AuthService);

  private router =
    inject(Router);

  correo = '';

  contrasena = '';

  mensaje = '';

  login() {

    this.authService.login({

      correo: this.correo,

      contrasena: this.contrasena

    }).subscribe({

      next: (response) => {

        // GUARDAR TOKEN
        this.authService.guardarToken(
          response.token
        );

        // GUARDAR USUARIO
        localStorage.setItem(

          'usuario',

          JSON.stringify(
            response.usuario
          )

        );

        // IR AL CATALOGO
        this.router.navigate([
          '/catalogo'
        ]);

      },

      error: (err) => {

        this.mensaje =
          err.error.mensaje;

      }

    });

  }

}