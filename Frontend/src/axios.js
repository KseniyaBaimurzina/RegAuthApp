import axios from "axios";

const apiUrl = "http://localhost:5000";
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