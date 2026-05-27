export interface Producto{
    id:number;
    name:string;
    price:number;
    imageUrl:string;
    category:string;
    description:string,
    stock:number;
    cantidad?: number;
}