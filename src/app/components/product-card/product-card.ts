import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { Producto } from '../../models/producto.model';

@Component({
  selector: 'app-product-card',
  standalone:true,
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input({required:true}) product!:Producto
  @Output() add = new EventEmitter<Producto>();
  
  showSuccess = false;

  constructor(private cdr: ChangeDetectorRef) {}

  onAdd() {
    this.add.emit(this.product);
    this.showSuccess = true;
    this.cdr.detectChanges();
    
    // Ocultar el mensaje después de 2 segundos
    setTimeout(() => {
      this.showSuccess = false;
      this.cdr.detectChanges();
    }, 2000);
  }
}
