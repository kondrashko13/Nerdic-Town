import {Boardgame} from '../boardgame/boardgame';

export interface CartItem {
  productId: Boardgame;
  quantity: number;
}

export interface User {
  _id?: string;
  id?: string;
  email: string;
  role: 'client' | 'admin';
  cart: CartItem[];
}
