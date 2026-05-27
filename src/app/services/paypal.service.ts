import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { enviroment } from '../../environments/enviroment';

@Injectable({
  providedIn: 'root'
})

export class PaypalService {

  private http = inject(HttpClient);

  private apiUrl =
    `${enviroment.apiUrl}/paypal`;

  crearOrden(payload: {
    items: any[];
    total: number
  }) {

    return this.http.post<{
      id: string,
      status: string
    }>(
      `${this.apiUrl}/create-order`,
      payload
    );

  }

  capturarOrden(
    orderId: string,
    items: any[],
    total: number,
    usuario: any
  ) {

    return this.http.post<any>(
      `${this.apiUrl}/capture-order`,
      {
        orderId,
        items,
        total,
        usuario
      }
    );

  }

}