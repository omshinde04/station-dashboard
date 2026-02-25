import axios from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

/* ==============================
   REQUEST INTERCEPTOR
============================== */
instance.interceptors.request.use(
    (config) => {

        const token = localStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

/* ==============================
   RESPONSE INTERCEPTOR
============================== */
instance.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response?.status === 401) {

            console.warn("Session expired or unauthorized.");

            const currentPath = window.location.pathname;

            localStorage.removeItem("token");

            // ✅ Prevent infinite refresh loop
            if (currentPath !== "/") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default instance;