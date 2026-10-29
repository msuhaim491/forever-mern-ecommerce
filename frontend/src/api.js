import axios from 'axios';
export const api = axios.create({ baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api', timeout: 20000 });
api.interceptors.request.use(config => { const token = localStorage.getItem('forever_token'); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
export const errText = err => err?.response?.data?.message || err.message || 'Something went wrong';
export const money = n => '$' + Number(n || 0).toFixed(2);
