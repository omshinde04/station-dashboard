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
    (error) => {
        return Promise.reject(error);
    }
);

/* ==============================
   RESPONSE INTERCEPTOR
============================== */
instance.interceptors.response.use(
    (response) => response,
    (error) => {

        if (error.response) {

            // 🔥 If token expired or invalid → force logout
            if (error.response.status === 401) {
                console.warn("Session expired. Logging out...");
                localStorage.removeItem("token");

                // Optional: redirect to login
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default instance;