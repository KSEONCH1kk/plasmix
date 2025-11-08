"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [serverOnline, setServerOnline] = useState({ online: 0, max: 5000 });

  const invId = searchParams.get("InvId");
  const outSum = searchParams.get("OutSum");
  const signature = searchParams.get("SignatureValue");
  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://77.90.33.66:8000';
        const status = await fetch(`${API_URL}/api/server-status`).then(r => r.json());
        setServerOnline({
          online: status.online,
          max: status.max,
        });
      } catch (error) {
        console.error('Error loading server status:', error);
      }
    };
    
    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const verifyOrder = async () => {
      if (!invId || !outSum || !signature) {
        setError("Отсутствуют необходимые параметры");
        setLoading(false);
        return;
      }

      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://77.90.33.66:8000';
        const params = new URLSearchParams();
        params.append('InvId', invId || '');
        params.append('OutSum', outSum || '');
        params.append('SignatureValue', signature || '');
        searchParams.forEach((value, key) => {
          if (key !== 'InvId' && key !== 'OutSum' && key !== 'SignatureValue') {
            params.append(key, value);
          }
        });
        
        const response = await fetch(
          `${API_URL}/api/robokassa/verify-success?${params.toString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOrderData(data);
          } else {
            setError(data.message || "Ошибка проверки заказа");
          }
        } else {
          setError("Ошибка при проверке заказа");
        }
      } catch (err) {
        setError("Ошибка соединения с сервером");
      } finally {
        setLoading(false);
      }
    };

    verifyOrder();
  }, [invId, outSum, signature]);

  const copyIPToClipboard = () => {
    navigator.clipboard.writeText("plasmix.su");
    alert("IP скопирован в буфер обмена!");
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: "#f5f4f1" }}>
      <header className="pt-6 sm:pt-12" style={{ backgroundColor: "#f5f4f1" }}>
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-16">
            <div className="flex items-center space-x-4 sm:space-x-12">
              <Link href="/">
                <h1 className="text-2xl sm:text-3xl font-bold text-black cursor-pointer hover:opacity-80 transition-opacity">
                  PLASMIX
                </h1>
              </Link>
              <nav className="hidden md:flex space-x-8">
                <Link href="/" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Главная
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </Link>
                <Link href="/tops" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Топы
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </Link>
                <Link href="/games" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Режимы
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </Link>
                <Link href="/banlist" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Банлист
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </Link>
                <a href="#" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Правила
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-6">
              <div className="hidden lg:block">
                <p className="text-sm font-semibold text-black mb-2">
                  Онлайн: <span style={{ color: "#FFA500" }}>{serverOnline.online}</span> / <span className="text-gray-600">{serverOnline.max}</span>
                </p>
                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${Math.min((serverOnline.online / serverOnline.max) * 100, 100)}%`, 
                      background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" 
                    }}
                  ></div>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 hidden sm:block">IP</p>
                <button 
                  onClick={copyIPToClipboard}
                  className="flex items-center space-x-1 sm:space-x-2 hover:opacity-80 transition-opacity cursor-pointer"
                  title="Нажмите, чтобы скопировать IP"
                >
                  <i className="fas fa-fire text-orange-500 text-sm sm:text-lg"></i>
                  <span className="text-xs sm:text-sm font-bold text-black uppercase">plasmix.su</span>
                  <i className="fas fa-fire text-orange-500 text-sm sm:text-lg"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:py-20">
        <div className="max-w-2xl w-full">
          {loading ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center animate-slideUp">
              <div className="mb-6">
                <i className="fas fa-spinner fa-spin text-4xl text-orange-500"></i>
              </div>
              <p className="text-lg text-gray-600">Проверка заказа...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 text-center animate-slideUp">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                  <i className="fas fa-exclamation-triangle text-4xl text-red-500"></i>
                </div>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4">Ошибка</h2>
              <p className="text-gray-600 mb-8">{error}</p>
              <Link
                href="/"
                className="inline-block px-6 py-2 rounded-xl font-bold text-white transition-all hover:shadow-lg"
                style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
              >
                Вернуться на главную
              </Link>
            </div>
          ) : orderData ? (
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-12 animate-slideUp">
              <div className="text-center mb-8">
                <div className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <i className="fas fa-check-circle text-5xl text-green-500"></i>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">
                  Оплата прошла успешно!
                </h1>
                <p className="text-gray-600">
                  Ваш заказ был успешно оплачен и обработан
                </p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-black mb-4">Детали заказа</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Номер заказа:</span>
                    <span className="font-bold text-black">#{orderData.order_id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Товар:</span>
                    <span className="font-bold text-black">{orderData.product_name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Сумма оплаты:</span>
                    <span className="font-bold text-black text-xl">{orderData.amount} ₽</span>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-8">
                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <i className="fas fa-info-circle"></i>
                  Важная информация
                </h4>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Товар будет доставлен автоматически в течение нескольких минут</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>При возникновении проблем обратитесь в поддержку сервера</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Проверьте, что указали правильный никнейм игрока</span>
                  </li>
                </ul>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="flex-1 px-6 py-2 rounded-xl font-bold text-white text-center transition-all hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                >
                  <i className="fas fa-home mr-2"></i>
                  Вернуться на главную
                </Link>
                <a
                  href="https://t.me/px_su"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-2 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 text-center transition-all"
                >
                  <i className="fas fa-headset mr-2"></i>
                  Связаться с поддержкой
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <footer className="text-white mt-auto" style={{ background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-2xl font-bold mb-2 text-white">PLASMIX</h3>
              <p className="text-sm text-gray-400 mb-3">Сервер 1.21.4</p>
              <p className="text-xs text-gray-500">© 2025 Plasmix — Все права защищены.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen items-center justify-center" style={{ backgroundColor: "#f5f4f1" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

