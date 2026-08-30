import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryBar } from './components/CategoryBar';
import { HeroBannerSlider } from './components/HeroBannerSlider';
import { TrustBadges } from './components/TrustBadges';
import { FreeDeliverySection } from './components/FreeDeliverySection';
import { ProductCard } from './components/ProductCard';
import { CategoryView } from './components/CategoryView';
import { BottomNav } from './components/BottomNav';
import { FloatingSupport } from './components/FloatingSupport';
import { LocationModal } from './components/LocationModal';
import { OffersModal } from './components/OffersModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AccountModal } from './components/AccountModal';
import { Footer } from './components/Footer';

import { categories } from './data/categories';
import { bannerAds } from './data/banners';
import { products } from './data/products';
import { LocationInfo, CartItem, Product, Order } from './types';
import { useAuth } from './context/AuthContext';
import { 
  saveUserProfileToDb, 
  saveUserCartToDb, 
  getUserCartFromDb, 
  saveUserWishlistToDb, 
  getUserWishlistFromDb, 
  saveUserOrderToDb, 
  getUserOrdersFromDb,
  deleteUserOrderFromDb
} from './services/dbService';
import { 
  Wind, 
  Snowflake, 
  Tv, 
  Smartphone, 
  Laptop, 
  Waves, 
  Microwave, 
  Utensils, 
  Fan, 
  Refrigerator,
  Sparkles, 
  ChevronRight, 
  CheckCircle,
  Search 
} from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeMobileTab, setActiveMobileTab] = useState<'home' | 'category' | 'cart' | 'account'>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Drawers
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountInitialTab, setAccountInitialTab] = useState<'profile' | 'orders' | 'wishlist'>('profile');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Firebase Auth integration
  const { user: firebaseUser, isVerified, checkIsSignInWithEmailLink } = useAuth();

  // Auto-open AccountModal if user opens the page with an email sign-in link or auth action code
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isEmailLink = checkIsSignInWithEmailLink();
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthCode = urlParams.has('oobCode') || urlParams.has('apiKey') || isEmailLink;
    if (hasAuthCode) {
      setIsAccountModalOpen(true);
    }
  }, [checkIsSignInWithEmailLink]);

  const currentUser = React.useMemo(() => {
    if (!firebaseUser) return null;
    return {
      name:
        firebaseUser.displayName ||
        (firebaseUser.phoneNumber ? firebaseUser.phoneNumber : firebaseUser.email?.split('@')[0]) ||
        'Customer',
      email: firebaseUser.email || (firebaseUser.phoneNumber ? `${firebaseUser.phoneNumber}` : ''),
      phone: firebaseUser.phoneNumber || '',
      isLoggedIn: true,
    };
  }, [firebaseUser]);

  // Storage helpers for user-scoped data
  const getUserStorageKey = (prefix: string, uid?: string | null) => {
    if (!uid) return null;
    return `walton_${prefix}_${uid}`;
  };

  const loadUserCart = (uid?: string | null): CartItem[] => {
    if (!uid) return [];
    try {
      const key = getUserStorageKey('cart', uid);
      if (!key) return [];
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            ...item,
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1
          }));
        }
      }
    } catch (e) {
      console.warn('Failed to load user cart:', e);
    }
    return [];
  };

  const loadUserWishlist = (uid?: string | null): Product[] => {
    if (!uid) return [];
    try {
      const key = getUserStorageKey('wishlist', uid);
      if (!key) return [];
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load user wishlist:', e);
    }
    return [];
  };

  const loadUserOrders = (uid?: string | null): Order[] => {
    if (!uid) return [];
    try {
      const key = getUserStorageKey('orders', uid);
      if (!key) return [];
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Exclude any legacy dummy orders
          return parsed.filter((ord: any) => ord && ord.id && ord.id !== 'WP-918342' && ord.id !== 'WP-849201');
        }
      }
    } catch (e) {
      console.warn('Failed to load user orders:', e);
    }
    return [];
  };

  // Location State
  const [location, setLocation] = useState<LocationInfo>(() => {
    try {
      const saved = localStorage.getItem('walton_location');
      return saved ? JSON.parse(saved) : {
        division: 'Dhaka',
        district: 'Dhaka City',
        plazaBranch: 'DEMO COMPANY Mirpur 10',
        deliveryTimeDays: '24 Hours',
        deliveryFee: 0
      };
    } catch {
      return {
        division: 'Dhaka',
        district: 'Dhaka City',
        plazaBranch: 'DEMO COMPANY Mirpur 10',
        deliveryTimeDays: '24 Hours',
        deliveryFee: 0
      };
    }
  });

  // Cart, Wishlist, Orders State - strictly user-scoped
  const [cartItems, setCartItems] = useState<CartItem[]>(() => loadUserCart(firebaseUser?.uid));
  const [wishlist, setWishlist] = useState<Product[]>(() => loadUserWishlist(firebaseUser?.uid));
  const [orders, setOrders] = useState<Order[]>(() => loadUserOrders(firebaseUser?.uid));

  // No automatic coupon application - manual entry only
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync user-scoped data whenever logged-in user changes (login, logout, account switch)
  useEffect(() => {
    // Purge any global un-scoped legacy dummy keys from storage
    try {
      localStorage.removeItem('walton_orders');
    } catch {}

    const uid = firebaseUser?.uid;
    if (uid) {
      // 1. Sync User Profile in Firestore
      saveUserProfileToDb({
        uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        phoneNumber: firebaseUser.phoneNumber,
      });

      // 2. Load immediate cached local state
      setCartItems(loadUserCart(uid));
      setWishlist(loadUserWishlist(uid));
      setOrders(loadUserOrders(uid));

      // 3. Load latest state from Firestore Database
      getUserCartFromDb(uid).then((dbCart) => {
        if (dbCart && dbCart.length > 0) {
          setCartItems(dbCart);
        }
      });
      getUserWishlistFromDb(uid).then((dbWishlist) => {
        if (dbWishlist && dbWishlist.length > 0) {
          setWishlist(dbWishlist);
        }
      });
      getUserOrdersFromDb(uid).then((dbOrders) => {
        if (dbOrders && dbOrders.length > 0) {
          setOrders(dbOrders);
        }
      });
    } else {
      setCartItems([]);
      setWishlist([]);
      setOrders([]);
    }
  }, [firebaseUser?.uid, firebaseUser?.displayName, firebaseUser?.email, firebaseUser?.phoneNumber]);

  // Scroll to top on page/category/search changes
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore
    }
  }, [selectedCategoryId, searchQuery, activeMobileTab]);

  // Lock background scroll and hide outer scrollbars when any modal or drawer is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      isLocationModalOpen ||
      isOffersModalOpen ||
      isAccountModalOpen ||
      isCartDrawerOpen ||
      isCheckoutModalOpen ||
      selectedProductForDetail
    );

    if (isAnyModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [
    isLocationModalOpen,
    isOffersModalOpen,
    isAccountModalOpen,
    isCartDrawerOpen,
    isCheckoutModalOpen,
    selectedProductForDetail
  ]);

  // Persistence effects - saved specifically to current user's key and Firestore
  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) return;
    try {
      const key = getUserStorageKey('cart', uid);
      if (key) {
        if (cartItems.length > 0) {
          const serializableCart = cartItems.map(item => ({
            product: item.product,
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
            selectedColor: item.selectedColor
          }));
          localStorage.setItem(key, JSON.stringify(serializableCart));
        } else {
          localStorage.removeItem(key);
        }
      }
      saveUserCartToDb(uid, cartItems);
    } catch (e) {
      console.warn('Could not save cart:', e);
    }
  }, [cartItems, firebaseUser?.uid]);

  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) return;
    try {
      const key = getUserStorageKey('wishlist', uid);
      if (key) {
        if (wishlist.length > 0) {
          localStorage.setItem(key, JSON.stringify(wishlist));
        } else {
          localStorage.removeItem(key);
        }
      }
      saveUserWishlistToDb(uid, wishlist);
    } catch (e) {
      console.warn('Could not save wishlist:', e);
    }
  }, [wishlist, firebaseUser?.uid]);

  useEffect(() => {
    const uid = firebaseUser?.uid;
    if (!uid) return;
    try {
      const key = getUserStorageKey('orders', uid);
      if (key) {
        if (orders.length > 0) {
          localStorage.setItem(key, JSON.stringify(orders));
        } else {
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('Could not save orders to localStorage:', e);
    }
  }, [orders, firebaseUser?.uid]);

  useEffect(() => {
    try {
      localStorage.setItem('walton_location', JSON.stringify(location));
    } catch (e) {
      console.warn('Could not save location to localStorage:', e);
    }
  }, [location]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Cart operations
  const handleAddToCart = (
    product: Product,
    quantityOrEvent: number | React.MouseEvent = 1,
    selectedColor?: string,
    e?: React.MouseEvent
  ) => {
    let quantity = 1;
    if (typeof quantityOrEvent === 'number' && Number.isFinite(quantityOrEvent) && quantityOrEvent > 0) {
      quantity = quantityOrEvent;
    } else if (quantityOrEvent && typeof quantityOrEvent === 'object' && 'stopPropagation' in quantityOrEvent) {
      (quantityOrEvent as React.MouseEvent).stopPropagation();
    }
    if (e && typeof e === 'object' && 'stopPropagation' in e) {
      e.stopPropagation();
    }

    if (!firebaseUser) {
      setIsAccountModalOpen(true);
      showToast('Please log in to add items to your cart.');
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedColor === selectedColor);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedColor: selectedColor || (product.colors ? product.colors[0] : undefined)
        }
      ];
    });
    showToast(`Added "${product.name.slice(0, 24)}..." to cart!`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems(prev => prev.map(item => item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    showToast('Item removed from cart');
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    if (e && typeof e === 'object' && 'stopPropagation' in e) {
      e.stopPropagation();
    }
    if (!product || !product.id) return;

    if (!firebaseUser) {
      setIsAccountModalOpen(true);
      showToast('Please log in to manage your wishlist.');
      return;
    }

    setWishlist(prev => {
      const exists = prev.some(p => p.id === product.id);
      if (exists) {
        showToast(`Removed from wishlist`);
        return prev.filter(p => p.id !== product.id);
      } else {
        showToast(`Added to wishlist!`);
        return [...prev, product];
      }
    });
  };

  const wishlistIds = new Set(wishlist.map(p => p.id));

  // Coupon handling
  const handleApplyCoupon = (code: string) => {
    if (code === 'WALTON10' || code === 'PLAZAFREE') {
      setAppliedCoupon(code);
      showToast(`Coupon ${code} applied successfully!`);
      return true;
    }
    return false;
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed');
  };

  const handleOrderPlaced = (order: Order) => {
    const userOrder: Order = {
      ...order,
      userId: firebaseUser?.uid || ''
    };
    setOrders(prev => [userOrder, ...prev]);
    saveUserOrderToDb(userOrder);
    setCartItems([]);
    if (firebaseUser?.uid) {
      saveUserCartToDb(firebaseUser.uid, []);
    }
    showToast(`Order ${order.id} placed successfully!`);
  };

  const handleCancelOrder = (orderId: string) => {
    setOrders(prev => {
      const updated = prev.filter(ord => ord.id !== orderId);
      const uid = firebaseUser?.uid;
      const key = getUserStorageKey('orders', uid);
      try {
        if (updated.length > 0) {
          localStorage.setItem(key, JSON.stringify(updated));
        } else {
          localStorage.removeItem(key);
        }
      } catch (e) {
        console.warn('Could not update orders in localStorage:', e);
      }
      return updated;
    });
    deleteUserOrderFromDb(orderId);
    showToast(`Order #${orderId} cancelled and removed`);
  };

  // Switch mobile tab handler
  const handleMobileTabChange = (tab: 'home' | 'category' | 'cart' | 'account') => {
    setActiveMobileTab(tab);
    if (tab === 'cart') {
      setIsCartDrawerOpen(true);
    } else if (tab === 'account') {
      setIsAccountModalOpen(true);
    }
  };

  // Search matching products & category grouping
  const isSearching = searchQuery.trim() !== '';
  const searchMatchingProducts = isSearching
    ? products.filter((prod) => {
        const q = searchQuery.toLowerCase().trim();
        return (
          prod.name.toLowerCase().includes(q) ||
          prod.category.toLowerCase().includes(q) ||
          prod.modelNumber.toLowerCase().includes(q) ||
          prod.description.toLowerCase().includes(q)
        );
      })
    : [];

  const searchMatchingCategories = categories
    .filter((cat) => cat.id !== 'all')
    .map((cat) => ({
      category: cat,
      items: searchMatchingProducts.filter((p) => p.categoryId === cat.id),
    }))
    .filter((group) => group.items.length > 0);

  // Categorized products for homepage sections
  const freeDeliveryProducts = products.filter(p => p.isFreeDelivery);
  const fridgeProducts = products.filter(p => p.categoryId === 'refrigerator');
  const acProducts = products.filter(p => p.categoryId === 'air-conditioner');
  const tvProducts = products.filter(p => p.categoryId === 'television');
  const washingMachineProducts = products.filter(p => p.categoryId === 'washing-machine');
  const homeApplianceProducts = products.filter(p => p.categoryId === 'home-appliances');
  const smartphoneProducts = products.filter(p => p.categoryId === 'smartphones');
  const laptopProducts = products.filter(p => p.categoryId === 'laptops');
  const kitchenProducts = products.filter(p => p.categoryId === 'kitchen-appliances');
  const fanProducts = products.filter(p => p.categoryId === 'fans-electrical');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-[#003893] selection:text-white font-sans antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs sm:text-sm font-semibold py-2 px-4 rounded-xl shadow-xl flex items-center space-x-2 backdrop-blur-xs border border-white/20 animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Sticky Header */}
      <Header
        location={location}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenOffersModal={() => setIsOffersModalOpen(true)}
        onOpenAccountModal={() => {
          setAccountInitialTab('profile');
          setIsAccountModalOpen(true);
        }}
        onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
        onOpenWishlistModal={() => {
          setAccountInitialTab('wishlist');
          setIsAccountModalOpen(true);
        }}
        cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)}
        wishlistCount={wishlist.length}
        user={currentUser}
        onSearch={(query) => {
          setSearchQuery(query);
          if (query) setSelectedCategoryId('all');
        }}
        searchQuery={searchQuery}
        allProducts={products}
        onSelectProduct={(p) => setSelectedProductForDetail(p)}
        activeCategory={selectedCategoryId}
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
          setSearchQuery('');
          setActiveMobileTab(catId === 'all' ? 'home' : 'category');
        }}
      />

      {/* Top Category Icons Bar (Matching Screenshot) */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategoryId}
        onSelectCategory={(id) => {
          setSelectedCategoryId(id);
          setSearchQuery('');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16 md:pb-8">
        
        {/* 1. Live Search Results (Category-wise grouping or No Product Found after ALL product box) */}
        {isSearching ? (
          <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-4 space-y-5">
            {/* Search Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {searchMatchingProducts.length > 0
                    ? `Found ${searchMatchingProducts.length} product${searchMatchingProducts.length !== 1 ? 's' : ''} across ${searchMatchingCategories.length} categor${searchMatchingCategories.length !== 1 ? 'ies' : 'y'}`
                    : 'No matching items found'}
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId('all');
                }}
                className="self-start sm:self-auto text-xs font-bold text-[#003893] hover:text-[#002663] bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>

            {/* If products match: render category-wise */}
            {searchMatchingCategories.length > 0 ? (
              <div className="space-y-6">
                {searchMatchingCategories.map(({ category, items }) => (
                  <section
                    key={category.id}
                    className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 p-1 flex items-center justify-center">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-black text-slate-900">
                            {category.name}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-semibold">
                            {items.length} matching product{items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCategoryId(category.id);
                          setSearchQuery('');
                        }}
                        className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                      {items.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onSelect={(p) => setSelectedProductForDetail(p)}
                          onAddToCart={handleAddToCart}
                          onToggleWishlist={handleToggleWishlist}
                          isWishlisted={wishlistIds.has(product.id)}
                        />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              /* If no match: render No Product Found after the all product box */
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-3 shadow-2xs">
                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                  <Search className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-lg sm:text-xl text-slate-800">
                    No Product Found
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                    We couldn't find any products matching "{searchQuery}". Please check the spelling or try searching for another appliance or model.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategoryId('all');
                  }}
                  className="mt-2 bg-[#003893] hover:bg-[#002663] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Browse All Products
                </button>
              </div>
            )}
          </div>
        ) : selectedCategoryId !== 'all' || activeMobileTab === 'category' ? (
          <CategoryView
            categories={categories}
            products={products}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={(id) => setSelectedCategoryId(id)}
            onSelectProduct={(p) => setSelectedProductForDetail(p)}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
          />
        ) : (
          /* Homepage View matching Walton Plaza Screenshot layout */
          <div className="space-y-4 sm:space-y-6">
            
            {/* 1. Hero Promotional Banner Slider ("মেগা কুল" AC Ad) */}
            <HeroBannerSlider
              banners={bannerAds}
              onBannerClick={(catId) => {
                setSelectedCategoryId(catId);
              }}
            />

            {/* 2. Safe Payments & Nationwide Delivery Badges Bar */}
            <TrustBadges />

            {/* 3. "Free Delivery" Section in Sky Blue Box (Exact match with screenshot) */}
            <FreeDeliverySection
              products={freeDeliveryProducts}
              onSelectProduct={(p) => setSelectedProductForDetail(p)}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              wishlistIds={wishlistIds}
              onViewAllCategory={(catId) => setSelectedCategoryId(catId)}
            />

            {/* 1. Refrigerator & Freezer Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-sky-100 text-[#0088cc] rounded-xl">
                      <Refrigerator className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Refrigerator & Freezer
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('refrigerator')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {fridgeProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 2. Air Conditioner Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                      <Wind className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Air Conditioner
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('air-conditioner')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {acProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 3. Television Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
                      <Tv className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Television
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('television')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {tvProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 4. Washing Machine Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-cyan-100 text-cyan-700 rounded-xl">
                      <Waves className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Washing Machine
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('washing-machine')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {washingMachineProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 5. Home Appliances Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                      <Microwave className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Home Appliances
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('home-appliances')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {homeApplianceProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 6. Smartphones & Tablets Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Smartphones & Tablets
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('smartphones')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {smartphoneProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 7. Computers & Laptops Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Computers & Laptops
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('laptops')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {laptopProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 8. Kitchen Appliances Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 text-red-700 rounded-xl">
                      <Utensils className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Kitchen Appliances
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('kitchen-appliances')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {kitchenProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 9. Fans & Electrical Section */}
            <section className="max-w-6xl mx-auto px-3.5 sm:px-6">
              <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                      <Fan className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900">
                        Fans & Electrical
                      </h3>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedCategoryId('fans-electrical')}
                    className="text-xs sm:text-sm font-bold text-[#003893] hover:text-[#002663] flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4">
                  {fanProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelect={(p) => setSelectedProductForDetail(p)}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={wishlistIds.has(product.id)}
                    />
                  ))}
                </div>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenOffersModal={() => setIsOffersModalOpen(true)}
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Floating Dark Help Center Button matching Screenshot "?" */}
      <FloatingSupport
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
      />

      {/* Bottom Navigation App Bar for Mobile matching Screenshot */}
      <BottomNav
        activeTab={activeMobileTab}
        onChangeTab={handleMobileTabChange}
        cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)}
      />

      {/* Location Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={(loc) => {
          setLocation(loc);
          showToast(`Location set to ${loc.district}`);
        }}
      />

      {/* Offers Modal */}
      <OffersModal
        isOpen={isOffersModalOpen}
        onClose={() => setIsOffersModalOpen(false)}
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
          setIsOffersModalOpen(false);
        }}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        isWishlisted={selectedProductForDetail ? wishlistIds.has(selectedProductForDetail.id) : false}
        location={location}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          if (!firebaseUser) {
            setIsAccountModalOpen(true);
            showToast('Please log in to proceed to checkout.');
            return;
          }
          if (!isVerified) {
            setIsAccountModalOpen(true);
            showToast('Please verify your email address to proceed to checkout.');
            return;
          }
          setIsCheckoutModalOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        appliedCoupon={appliedCoupon}
        location={location}
        onOrderPlaced={handleOrderPlaced}
        currentUser={currentUser}
        userId={firebaseUser?.uid}
      />

      {/* Account / Login Modal */}
      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        orders={orders}
        wishlist={wishlist}
        onSelectProduct={(p) => setSelectedProductForDetail(p)}
        onRemoveFromWishlist={(p) => handleToggleWishlist(p)}
        onCancelOrder={handleCancelOrder}
        initialTab={accountInitialTab}
      />

    </div>
  );
}
