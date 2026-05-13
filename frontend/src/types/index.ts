export interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  avatarUrl: string | null;
  emailVerified: boolean;
}

export interface Category {
  id: number;
  name: string;
}

export interface Food {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  categoryId: number;
  category: Category;
  avgRating: number | null;
  reviewCount: number;
}

export interface Review {
  id: number;
  userId: number;
  foodId: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface OrderItem {
  id: number;
  foodId: number;
  quantity: number;
  price: string;
  food?: Food;
}

export interface Order {
  id: number;
  userId: number;
  totalPrice: string;
  status: string;
  deliveryAddress: string | null;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  user?: { id: number; name: string; email: string };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface CartItem {
  food: Food;
  quantity: number;
}
