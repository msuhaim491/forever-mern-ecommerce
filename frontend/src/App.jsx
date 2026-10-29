import { BrowserRouter, Routes,Route,Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { StoreProvider } from './context/StoreContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Collection from './pages/Collection';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Auth from './pages/Auth';
import PaymentResult from './pages/PaymentResult';
import {About,Contact} from './pages/Info';
export default function App(){return <BrowserRouter><StoreProvider><Toaster position="top-center" toastOptions={{style:{fontFamily:'DM Sans',fontSize:14}}}/><Routes><Route element={<Layout/>}><Route index element={<Home/>}/><Route path="collection" element={<Collection/>}/><Route path="product/:id" element={<Product/>}/><Route path="cart" element={<Cart/>}/><Route path="checkout" element={<Checkout/>}/><Route path="orders" element={<Orders/>}/><Route path="login" element={<Auth/>}/><Route path="payment-result" element={<PaymentResult/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes></StoreProvider></BrowserRouter>}
