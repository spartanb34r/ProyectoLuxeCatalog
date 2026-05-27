import { Routes } from '@angular/router';
import { CatalogoComponent } from './components/catalogo/catalogo'; 
import { CarritoComponent } from './components/carrito/carrito';
import { CheckoutComponent } from './components/checkout/checkout';
import { LoginComponent } from './components/login/login';
import { RegistroComponent } from './components/registro/registro';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login',      component: LoginComponent },
  { path: 'registro',   component: RegistroComponent },
  { path: '',           redirectTo: 'login', pathMatch: 'full' },
  { path: 'catalogo',   component: CatalogoComponent, canActivate: [authGuard] },
  { path: 'carrito',    component: CarritoComponent,  canActivate: [authGuard] },
  { path: 'checkout',   component: CheckoutComponent, canActivate: [authGuard] },
  { path: '**',         redirectTo: 'login' }
];
