import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})

export class RegistroComponent {

  private authService = inject(AuthService);
  private router = inject(Router);

  usuario = '';
  correo = '';
  contrasena = '';

  mensaje = '';

  registrar() {

    this.authService.register({

      usuario: this.usuario,
      correo: this.correo,
      contrasena: this.contrasena

    }).subscribe({

      next: () => {

        this.mensaje =
          'Usuario registrado correctamente';

        setTimeout(() => {

          this.router.navigate(['/login']);

        }, 1500);

      },

      error: (err) => {

        this.mensaje = err.error.mensaje;

      }

    });

  }

}