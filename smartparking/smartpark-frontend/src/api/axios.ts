import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Port backend Anda dari base_server
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;