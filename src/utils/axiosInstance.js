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

        if (token && config.url?.startsWith("/api")) {
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

        const originalUrl = error.config?.url || "";

        // 🔥 Only react to API routes
        if (originalUrl.startsWith("/api") && error.response?.status === 401) {

            console.warn("Session expired or unauthorized.");

            localStorage.removeItem("token");

            if (window.location.pathname !== "/") {
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default instance;