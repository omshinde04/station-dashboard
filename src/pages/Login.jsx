import { useState } from "react";
import axios from "../utils/axiosInstance"; // ✅ Use same axios instance
import RailtailLogo from "../assets/images/railtail.png";

export default function Login({ onLogin }) {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {

            if (!email || !password) {
                alert("Please enter email and password");
                return;
            }

            setLoading(true);

            const res = await axios.post("/api/dashboard/login", {
                email,
                password
            });

            if (!res.data?.token) {
                alert("Invalid login response from server");
                return;
            }

            // ✅ Save token
            localStorage.setItem("token", res.data.token);

            // ✅ Update auth state
            onLogin();

        } catch (err) {

            console.error("Login error:", err.response?.data || err.message);

            alert(
                err.response?.data?.message ||
                "Login failed. Check credentials."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-white">
            <div className="w-[380px] bg-white rounded-2xl shadow-xl p-8 ring-1 ring-slate-200">

                <div className="flex flex-col items-center mb-6">
                    <img src={RailtailLogo} alt="Railtail" className="h-12 mb-4" />
                    <h2 className="text-xl font-bold text-slate-800">
                        Railtail Command Center
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                        Authorized Access Only
                    </p>
                </div>

                <input
                    type="email"
                    placeholder="Email"
                    className="w-full mb-4 p-3 rounded-xl bg-slate-100 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 p-3 rounded-xl bg-slate-100 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                    {loading ? "Authenticating..." : "Secure Login"}
                </button>

            </div>
        </div>
    );
}