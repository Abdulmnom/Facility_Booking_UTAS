import axios from 'axios';

const api = axios.create({
  // In dev, CRA proxies /api/* to localhost:5000 via the "proxy" field in package.json.
  // In production, set REACT_APP_API_URL to your deployed backend URL.
  baseURL: process.env.REACT_APP_API_URL === 'http://localhost:3000'
    ? ''  // use relative URLs → CRA proxy handles forwarding to backend
    : (process.env.REACT_APP_API_URL || ''),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fbk_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('fbk_token');
      localStorage.removeItem('fbk_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
