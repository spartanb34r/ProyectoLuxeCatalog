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

  private renderPaypalButton(): void {

    if (
      this.carrito().length === 0
    ) {
      return;
    }

    if (
      typeof paypal === 'undefined'
    ) {

      this.mensaje =
        'No se cargó el SDK de PayPal.';

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

          this.mensaje =
            'No se pudo crear la orden.';

          throw error;

        }

      },

      onApprove: async (
        data: any
      ) => {

        // EVITAR DOBLE CAPTURA
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

          // DESCARGAR XML
          this.carritoService
            .exportarXML();

          this.mensaje =
            'Pago realizado correctamente. Descargando factura...';

          // VACIAR CARRITO
          this.carritoService
            .vaciar();

          // LIMPIAR BOTÓN PAYPAL
          this.paypalButtonContainer
            .nativeElement.innerHTML = '';

        } catch (error) {

          console.error(
            'Error al capturar el pago:',
            error
          );

          this.mensaje =
            'Ocurrió un error al capturar el pago.';

        }

      },

      onCancel: () => {

        this.mensaje =
          'El usuario canceló el pago.';

      },

      onError: (
        error: any
      ) => {

        console.error(
          'Error PayPal:',
          error
        );

        this.mensaje =
          'Error en el proceso de PayPal.';

      }

    }).render(
      this.paypalButtonContainer
        .nativeElement
    );

  }

}