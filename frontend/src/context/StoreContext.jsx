import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, errText } from '../api';
import toast from 'react-hot-toast';
const StoreContext = createContext(null);
const read = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const keyOf = item => `${item.product}:${item.size}`;
const mergeCart = (...carts) => {
  const result = new Map();
  for (const cart of carts) for (const item of cart || []) {
    if (!item.product || !item.size) continue;
    const key = keyOf(item); result.set(key, {product:item.product, size:item.size, quantity:Math.min(30, Math.max(1,(result.get(key)?.quantity || 0) + item.quantity))});
  }
  return [...result.values()].slice(0,50);
};
// Merge a previously synced server cart with local browser state without doubling quantities after a refresh.
const reconcileCart = (serverCart, localCart) => {
  const byKey = new Map();
  for (const item of [...(serverCart || []), ...(localCart || [])]) {
    if (!item.product || !item.size) continue;
    const key = keyOf(item);
    byKey.set(key, { product: item.product, size: item.size, quantity: Math.min(30, Math.max(Number(item.quantity) || 1, byKey.get(key)?.quantity || 0)) });
  }
  return [...byKey.values()].slice(0, 50);
};
export function StoreProvider({ children }) {
  const [products,setProducts] = useState([]);
  const [loading,setLoading] = useState(true);
  const [cart,setCart] = useState(()=>read('forever_cart', []));
  const [user,setUser] = useState(()=>read('forever_user', null));
  const [token,setToken] = useState(()=>localStorage.getItem('forever_token'));
  const [cartReady,setCartReady] = useState(false);
  const refreshProducts = useCallback(async () => {
    try { const {data} = await api.get('/products'); setProducts(data.products); }
    catch (e) { toast.error('Could not load products: ' + errText(e)); }
    finally { setLoading(false); }
  },[]);
  useEffect(()=>{ refreshProducts(); },[refreshProducts]);
  useEffect(()=>{
    let live=true;
    async function load() {
      if (!token) { setCartReady(true); return; }
      setCartReady(false);
      try {
        const [auth, saved] = await Promise.all([api.get('/auth/me'),api.get('/cart')]);
        if (!live) return;
        setUser(auth.data.user);localStorage.setItem('forever_user',JSON.stringify(auth.data.user));
        setCart(prev=>reconcileCart(saved.data.items, prev));
      } catch {
        if (!live) return;
        localStorage.removeItem('forever_token');localStorage.removeItem('forever_user');setToken(null);setUser(null);
      } finally {if(live)setCartReady(true);}
    } load(); return ()=>{live=false;};
  },[token]);
  useEffect(()=>{ localStorage.setItem('forever_cart',JSON.stringify(cart)); if(token && cartReady) { const timer=setTimeout(()=>api.put('/cart',{items:cart}).catch(()=>{}),450); return ()=>clearTimeout(timer); } },[cart,token,cartReady]);
  const authenticate=(data)=>{ localStorage.setItem('forever_token',data.token);localStorage.setItem('forever_user',JSON.stringify(data.user));setCartReady(false);setToken(data.token);setUser(data.user); };
  const logout=()=>{ localStorage.removeItem('forever_token');localStorage.removeItem('forever_user');setToken(null);setUser(null);setCart([]); };
  const addToCart=(product,size,quantity=1)=>{
    if(!size){toast.error('Please select a size');return false;}
    setCart(prev=>mergeCart(prev,[{product,size,quantity}]));toast.success('Added to cart');return true;
  };
  const updateCart=(product,size,quantity)=>setCart(prev=> quantity<=0 ? prev.filter(i=>!(i.product===product&&i.size===size)) : prev.map(i=>i.product===product&&i.size===size?{...i,quantity:Math.min(30,quantity)}:i));
  const clearCart=()=>setCart([]);
  const cartCount=useMemo(()=>cart.reduce((sum,i)=>sum+i.quantity,0),[cart]);
  const subtotal=useMemo(()=>cart.reduce((sum,i)=>sum+(products.find(p=>p._id===i.product)?.price||0)*i.quantity,0),[cart,products]);
  return <StoreContext.Provider value={{products,loading,refreshProducts,cart,cartCount,subtotal,addToCart,updateCart,clearCart,user,token,authenticate,logout}}>{children}</StoreContext.Provider>;
}
export const useStore=()=>useContext(StoreContext);
