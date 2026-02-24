import { useState } from "react";
import axios from "axios";
import RailtailLogo from "../assets/images/railtail.png";

export default function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);

            const res = await axios.post(
                process.env.REACT_APP_API_URL + "/api/auth/login",
                { email, password }
            );

            localStorage.setItem("token", res.data.token);
            onLogin();

        } catch (err) {
            alert("Invalid credentials");
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
                    placeholder="tech.wcdrailtel@gmail.com"
                    className="w-full mb-4 p-3 rounded-xl bg-slate-100 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Password"
                    className="w-full mb-6 p-3 rounded-xl bg-slate-100 ring-1 ring-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-all"
                >
                    {loading ? "Authenticating..." : "Secure Login"}
                </button>

            </div>
        </div>
    );
}