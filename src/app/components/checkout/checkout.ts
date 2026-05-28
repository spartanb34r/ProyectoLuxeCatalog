import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  inject,
  PLATFORM_ID,
  OnInit,
  computed
} from '@angular/core';

import {
  CommonModule,
  CurrencyPipe,
  isPlatformBrowser
} from '@angular/common';

import { RouterLink } from '@angular/router';

import { firstValueFrom } from 'rxjs';

import { CarritoService }
from '../../services/carrito.service';

import { PaypalService }
from '../../services/paypal.service';

declare const paypal: any;

@Component({
  selector: 'app-checkout',

  standalone: true,

  imports: [
    CurrencyPipe,
    RouterLink,
    CommonModule
  ],

  templateUrl: './checkout.html',

  styleUrl: './checkout.css'
})

export class CheckoutComponent
implements AfterViewInit, OnInit {

  private platformId =
    inject(PLATFORM_ID);

  @ViewChild('paypalButtonContainer')

  paypalButtonContainer!:
    ElementRef<HTMLDivElement>;

  private carritoService =
    inject(CarritoService);

  private paypalService =
    inject(PaypalService);

  carrito =
    this.carritoService.productos;

  total = computed(() =>
    this.carritoService.total()
  );

  mensaje = '';

  mostrarMensaje = false;

  tipoMensaje: 'success' | 'error' =
    'success';

  usuario: any = null;

  procesandoPago = false;

  constructor() {

    console.log(
      'Checkout cargado'
    );

  }

  ngOnInit() {

    console.log(
      this.carrito()
    );

    const user =
      localStorage.getItem(
        'usuario'
      );

    if (user) {

      this.usuario =
        JSON.parse(user);

      console.log(
        'USUARIO:',
        this.usuario
      );

    }

  }

  ngAfterViewInit(): void {

    if (
      isPlatformBrowser(
        this.platformId
      )
    ) {

      this.renderPaypalButton();

    }

  }

  mostrarAlerta(
    mensaje: string,
    tipo: 'success' | 'error'
  ) {

    this.mensaje = mensaje;

    this.tipoMensaje = tipo;

    this.mostrarMensaje = true;

    setTimeout(() => {

      this.mostrarMensaje = false;

    }, 3500);

  }

  private renderPaypalButton(): void {

    if (
      this.carrito().length === 0
    ) {
      return;
    }

    if (
      typeof paypal === 'undefined'
    ) {

      this.mostrarAlerta(
        'No se cargó el SDK de PayPal.',
        'error'
      );

      return;
    }

    if (
      !this.paypalButtonContainer
    ) {
      return;
    }

    this.paypalButtonContainer
      .nativeElement.innerHTML = '';

    paypal.Buttons({

      createOrder: async () => {

        try {

          const response =
            await firstValueFrom(

              this.paypalService
                .crearOrden({

                  items:
                    this.carrito(),

                  total:
                    this.total()

                })

            );

          return response.id;

        } catch (error) {

          console.error(
            'Error al crear la orden:',
            error
          );

          this.mostrarAlerta(
            'No se pudo crear la orden.',
            'error'
          );

          throw error;

        }

      },

      onApprove: async (
        data: any
      ) => {

        if (
          this.procesandoPago
        ) {
          return;
        }

        this.procesandoPago =
          true;

        try {

          const capture =
            await firstValueFrom(

              this.paypalService
                .capturarOrden(

                  data.orderID,

                  this.carrito(),

                  this.total(),

                  this.usuario

                )

            );

          console.log(
            'Pago capturado:',
            capture
          );

          this.mostrarAlerta(
            'Factura enviada correctamente a tu correo',
            'success'
          );

          setTimeout(() => {

  this.carritoService.vaciar();

}, 1000);

        } catch (error) {

          console.error(
            'Error al capturar el pago:',
            error
          );

          this.mostrarAlerta(
            'Ocurrió un error al procesar el pago.',
            'error'
          );

        }

      },

      onCancel: () => {

        this.mostrarAlerta(
          'El usuario canceló el pago.',
          'error'
        );

      },

      onError: (
        error: any
      ) => {

        console.error(
          'Error PayPal:',
          error
        );

        this.mostrarAlerta(
          'Error en el proceso de PayPal.',
          'error'
        );

      }

    }).render(
      this.paypalButtonContainer
        .nativeElement
    );

  }

}