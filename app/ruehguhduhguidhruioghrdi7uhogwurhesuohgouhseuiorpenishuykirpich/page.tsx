"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/app/lib/api";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const response = await authAPI.login(username, password);
      document.cookie = `access_token=${response.access_token}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 дней
      localStorage.setItem("adminAuth", "true");
      
      router.push("/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich/dashboard");
    } catch (err: any) {
      setError(err.message || "Неверный логин или пароль");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}>
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">PLASMIX</h1>
          <p className="text-gray-600">Панель администратора</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Логин
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Введите логин"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-black mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Введите пароль"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-sm text-orange-600 hover:underline">
            ← Вернуться на главную
          </a>
        </div>
      </div>
    </div>
  );
}

