import {useState,useEffect} from 'react';
import {BrowserRouter,Routes,Route,Navigate} from 'react-router-dom';
import {Toaster} from 'react-hot-toast';
import {api} from './api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import {ProductForm,ProductList} from './pages/Products';
import Orders from './pages/Orders';
export default function App(){const [user,setUser]=useState(()=>{try{return JSON.parse(localStorage.getItem('forever_admin_user'))}catch{return null}});const [ready,setReady]=useState(!localStorage.getItem('forever_admin_token'));
 function logout(){localStorage.removeItem('forever_admin_token');localStorage.removeItem('forever_admin_user');setUser(null)}
 function login(data){localStorage.setItem('forever_admin_token',data.token);localStorage.setItem('forever_admin_user',JSON.stringify(data.user));setUser(data.user)}
 useEffect(()=>{if(!localStorage.getItem('forever_admin_token'))return;api.get('/auth/me').then(r=>{if(r.data.user.role==='admin')setUser(r.data.user);else logout()}).catch(logout).finally(()=>setReady(true))},[]);
 if(!ready)return <div className="screen-loading">Loading admin session…</div>;
 return <BrowserRouter basename={import.meta.env.VITE_ADMIN_BASE === '/admin/' ? '/admin' : '/'}><Toaster position="top-right"/><Routes>{!user||user.role!=='admin'?<><Route path="*" element={<Login onLogin={login}/>}/></>:<><Route element={<Layout logout={logout} user={user}/>}><Route index element={<Dashboard/>}/><Route path="add" element={<ProductForm/>}/><Route path="edit/:id" element={<ProductForm/>}/><Route path="products" element={<ProductList/>}/><Route path="orders" element={<Orders/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></>}</Routes></BrowserRouter>}
