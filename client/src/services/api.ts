import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5161/api',
});

export default api;
