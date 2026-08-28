export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewsCount: number;
  image: string;
  additionalImages?: string[];
  description: string;
  specs: { [key: string]: string };
  inStock: boolean;
  modelNumber: string;
  brand: string;
  isFeatured?: boolean;
  isTrending?: boolean;
  isFreeDelivery?: boolean;
  deliveryTag?: string;
  badge?: string;
  warranty?: string;
  emiAvailable?: boolean;
  emiStartPrice?: number;
  colors?: string[];
}

export interface Category {
  id: string;
  name: string;
  shortName: string;
  iconName: string;
  image: string;
  itemCount: number;
  accentColor?: string;
}

export interface BannerAd {
  id: string;
  title: string;
  subtitle: string;
  offerTag: string;
  priceTag?: string;
  category: string;
  categoryId: string;
  badge: string;
  bgColor: string;
  textColor: string;
  image: string;
  actionText: string;
  features: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface LocationInfo {
  division: string;
  district: string;
  plazaBranch: string;
  deliveryTimeDays: string;
  deliveryFee: number;
}

export interface Order {
  id: string;
  userId?: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    district: string;
    division: string;
  };
  paymentMethod: string;
}

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount';

