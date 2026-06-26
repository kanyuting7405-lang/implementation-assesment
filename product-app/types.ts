

export interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string; 
}


export interface NewProductInput {
  name: string;
  price: number;
}


export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
