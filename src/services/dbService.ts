import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
  type FirestoreError
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../lib/firebase';
import { CartItem, Order, Product } from '../types';

/**
 * Saves or updates a user's profile in Firestore.
 */
export async function saveUserProfileToDb(userData: {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
}): Promise<void> {
  if (!isFirebaseConfigured || !userData.uid) return;

  try {
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(
      userRef,
      {
        uid: userData.uid,
        displayName: userData.displayName || '',
        email: userData.email || '',
        phoneNumber: userData.phoneNumber || '',
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.warn('Firestore: Could not save user profile:', error);
  }
}

/**
 * Retrieves a user's profile from Firestore.
 */
export async function getUserProfileFromDb(uid: string): Promise<{
  displayName?: string;
  email?: string;
  phoneNumber?: string;
} | null> {
  if (!isFirebaseConfigured || !uid) return null;

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as any;
    }
  } catch (error) {
    console.warn('Firestore: Could not load user profile:', error);
  }
  return null;
}

/**
 * Saves the active cart for a specific user to Firestore.
 */
export async function saveUserCartToDb(uid: string, cartItems: CartItem[]): Promise<void> {
  if (!isFirebaseConfigured || !uid) return;

  try {
    const cartRef = doc(db, 'users', uid, 'data', 'cart');
    await setDoc(cartRef, {
      items: cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
      })),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Firestore: Could not save user cart:', error);
  }
}

/**
 * Retrieves the saved cart for a specific user from Firestore.
 */
export async function getUserCartFromDb(uid: string): Promise<CartItem[] | null> {
  if (!isFirebaseConfigured || !uid) return null;

  try {
    const cartRef = doc(db, 'users', uid, 'data', 'cart');
    const snap = await getDoc(cartRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.items)) {
        return data.items.map((item: any) => ({
          product: item.product,
          quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
          selectedColor: item.selectedColor || undefined,
        }));
      }
    }
  } catch (error) {
    console.warn('Firestore: Could not load user cart:', error);
  }
  return null;
}

/**
 * Saves the wishlist for a specific user to Firestore.
 */
export async function saveUserWishlistToDb(uid: string, wishlist: Product[]): Promise<void> {
  if (!isFirebaseConfigured || !uid) return;

  try {
    const wishlistRef = doc(db, 'users', uid, 'data', 'wishlist');
    await setDoc(wishlistRef, {
      items: wishlist,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Firestore: Could not save user wishlist:', error);
  }
}

/**
 * Retrieves the saved wishlist for a specific user from Firestore.
 */
export async function getUserWishlistFromDb(uid: string): Promise<Product[] | null> {
  if (!isFirebaseConfigured || !uid) return null;

  try {
    const wishlistRef = doc(db, 'users', uid, 'data', 'wishlist');
    const snap = await getDoc(wishlistRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data?.items)) {
        return data.items;
      }
    }
  } catch (error) {
    console.warn('Firestore: Could not load user wishlist:', error);
  }
  return null;
}

/**
 * Saves a placed order for a specific user to Firestore.
 */
export async function saveUserOrderToDb(order: Order): Promise<void> {
  if (!isFirebaseConfigured || !order.id) return;

  try {
    const orderRef = doc(db, 'orders', order.id);
    await setDoc(orderRef, {
      ...order,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('Firestore: Could not save order to DB:', error);
  }
}

/**
 * Retrieves all orders for a specific user from Firestore.
 */
export async function getUserOrdersFromDb(uid: string): Promise<Order[] | null> {
  if (!isFirebaseConfigured || !uid) return null;

  try {
    const ordersCol = collection(db, 'orders');
    const q = query(ordersCol, where('userId', '==', uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const ordersList: Order[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        ordersList.push({
          id: data.id || d.id,
          userId: data.userId,
          date: data.date,
          items: data.items || [],
          subtotal: data.subtotal || 0,
          discount: data.discount || 0,
          deliveryFee: data.deliveryFee || 0,
          total: data.total || 0,
          status: data.status || 'Pending',
          shippingAddress: data.shippingAddress || {
            fullName: '',
            phone: '',
            address: '',
            district: '',
            division: '',
          },
          paymentMethod: data.paymentMethod || 'CASH ON DELIVERY',
        });
      });
      return ordersList;
    }
  } catch (error) {
    console.warn('Firestore: Could not load user orders from DB:', error);
  }
  return null;
}

/**
 * Deletes a placed order from Firestore.
 */
export async function deleteUserOrderFromDb(orderId: string): Promise<void> {
  if (!isFirebaseConfigured || !orderId) return;

  try {
    const orderRef = doc(db, 'orders', orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.warn('Firestore: Could not delete order from DB:', error);
  }
}
