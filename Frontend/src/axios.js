import axios from "axios";
import * as dotenv from 'dotenv';

const config = dotenv.config(".env").parsed;

const apiUrl = config["SERVER_URL"];
const api = axios.create({
    baseURL: apiUrl,
    withCredentials: true
});

api.interceptors.request.use(config => {
    if (!config.headers.Authorization) {
        const token = localStorage.getItem("temitope");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

    }
    return config
})

export default api;