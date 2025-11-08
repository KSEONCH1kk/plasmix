"use client";

import { useState, useEffect } from "react";
import { gameModesAPI, GameMode } from "@/app/lib/api";
import ContactsModal from "@/app/components/ContactsModal";

export default function GamesPage() {
  const [serverOnline, setServerOnline] = useState({
    online: 0,
    max: 5000,
  });

  const [selectedGame, setSelectedGame] = useState<GameMode | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [gameModes, setGameModes] = useState<GameMode[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const status = await fetch('http://77.90.33.66:8000/api/server-status').then(r => r.json());
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
    const fetchGameModes = async () => {
      try {
        setLoading(true);
        const modes = await gameModesAPI.getAll();
        setGameModes(modes);
      } catch (error) {
        console.error('Error loading game modes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGameModes();
  }, []);

  const copyIPToClipboard = () => {
    navigator.clipboard.writeText("plasmix.su");
    alert("IP скопирован в буфер обмена!");
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedGame(null);
      setIsClosing(false);
    }, 300);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f4f1" }}>
      <header className="pt-6 sm:pt-12" style={{ backgroundColor: "#f5f4f1" }}>
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 sm:gap-16">
            <div className="flex items-center space-x-4 sm:space-x-12">
              <h1 className="text-2xl sm:text-3xl font-bold text-black">
                PLASMIX
              </h1>
              <nav className="hidden md:flex space-x-8">
                <a href="/" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Главная
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
                <a href="/tops" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Топы
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
                <a href="/games" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Режимы
                  <span className="absolute bottom-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
                <a href="/banlist" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Банлист
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
                <a href="#" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Правила
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
                <a href="https://t.me/your_support" target="_blank" rel="noopener noreferrer" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Поддержка
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
          <nav className="md:hidden flex justify-center space-x-4 mt-4 pt-4 border-t border-gray-200 overflow-x-auto">
            <a href="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Главная
            </a>
            <a href="/tops" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Топы
            </a>
            <a href="/games" className="text-sm font-medium text-black pb-1 whitespace-nowrap" style={{ borderBottom: '2px solid transparent', borderImage: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%) 1' }}>
              Режимы
            </a>
            <a href="/banlist" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Банлист
            </a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Правила
            </a>
            <a href="https://t.me/your_support" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Поддержка
            </a>
          </nav>
          <div className="lg:hidden mt-4 text-center">
            <p className="text-sm font-semibold text-black">
              Онлайн: <span style={{ color: "#FFA500" }}>{serverOnline.online}</span> / <span className="text-gray-600">{serverOnline.max}</span>
            </p>
            <div className="w-full max-w-xs mx-auto mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${Math.min((serverOnline.online / serverOnline.max) * 100, 100)}%`, 
                  background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" 
                }}
              ></div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-black mb-4 text-center">Игровые режимы</h1>
        <p className="text-center text-gray-700 mb-12">
          Выбери свой любимый режим и начни играть прямо сейчас!
        </p>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {gameModes.map((game) => (
            <div
              key={game.id}
              onClick={() => setSelectedGame(game)}
              className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={game.image || 'https://placehold.co/600x400/2F4F4F/FFFFFF?text=No+Image&font=roboto'}
                  alt={game.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${
                  game.status === "Работает" 
                    ? "bg-green-500 text-white" 
                    : "bg-orange-500 text-white"
                }`}>
                  {game.status}
                </div>
                <div className="absolute bottom-4 right-4">
                  <i className="fas fa-external-link-alt text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-black mb-2">{game.title}</h3>
                <p className="text-gray-600 text-sm">{game.description}</p>
              </div>
            </div>
            ))}
          </div>
        )}
      </main>
      {selectedGame && (
        <div 
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
            isClosing ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onClick={closeModal}
        >
          <div 
            className={`bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
              isClosing ? 'animate-slideDown' : 'animate-slideUp'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={selectedGame.image || 'https://placehold.co/600x400/2F4F4F/FFFFFF?text=No+Image&font=roboto'}
                alt={selectedGame.title}
                className="w-full h-64 object-cover rounded-t-3xl"
              />
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-8">
              <h2 className="text-4xl font-bold text-black mb-4">{selectedGame.title}</h2>
              
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-6 ${ 
                selectedGame.status === "Работает" 
                  ? "bg-green-100 text-green-700" 
                  : "bg-orange-100 text-orange-700"
              }`}>
                {selectedGame.status}
              </div>

              <p className="text-gray-700 text-lg mb-6">{selectedGame.description}</p>
              {selectedGame.features && selectedGame.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-black mb-3">Особенности</h3>
                  <div className="space-y-2">
                    {selectedGame.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 bg-gradient-to-r from-orange-50 to-transparent px-4 py-3 rounded-xl">
                        <i className="fas fa-check-circle text-orange-500 mt-1"></i>
                        <span className="text-gray-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedGame.video_url && (
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-black mb-3">Видео-гайд</h3>
                  <div className="relative" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      src={selectedGame.video_url}
                      className="absolute top-0 left-0 w-full h-full rounded-2xl"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
              <button
                onClick={copyIPToClipboard}
                className="w-full mt-6 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
              >
                Играть сейчас
              </button>
            </div>
          </div>
        </div>
      )}
      <footer className="text-white mt-20" style={{ background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start">
              <h3 className="text-2xl font-bold mb-2 text-white">
                PLASMIX
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                Сервер 1.21.4
              </p>
              <div className="flex gap-2 mb-4">
                <a 
                  href="#" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  aria-label="VK"
                >
                  <i className="fab fa-vk text-gray-400 hover:text-white text-base"></i>
                </a>
                <a 
                  href="#" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  aria-label="Discord"
                >
                  <i className="fab fa-discord text-gray-400 hover:text-white text-base"></i>
                </a>
                <a 
                  href="#" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  aria-label="Telegram"
                >
                  <i className="fab fa-telegram-plane text-gray-400 hover:text-white text-base"></i>
                </a>
              </div>
              
              <p className="text-xs text-gray-500">
                © 2025 Plasmix — Все права защищены.
              </p>
              <p className="text-xs text-gray-500">
                Plasmix не связан с MojangAB, все средства
              </p>
              <p className="text-xs text-gray-500">
                идут на развитие проекта.
              </p>
              <p className="text-xs text-gray-500 mt-2">
                ИП xxx x. М.
              </p>
              <p className="text-xs text-gray-500">
                ИНН xxx ОГРНИП xxx
              </p>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-sm font-bold mb-3 text-white">Навигация</h4>
              <ul className="space-y-1 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Отмена подписки
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Соглашение (ИП)
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Политики конфиденциальности
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Оферта рекуррентных платежей (ИП)
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-400 transition-colors">
                    Оферта на заключение лицензионного договора (ИП)
                  </a>
                </li>
                <li>
                  <button onClick={() => setIsContactsModalOpen(true)} className="hover:text-orange-400 transition-colors text-left">
                    Контакты
                  </button>
                </li>
              </ul>
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-sm font-bold mb-3 text-white">Мы принимаем:</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Банковские карты (Россия)</p>
                <p className="text-sm text-gray-400">Банковские карты (Международные)</p>
                <p className="text-sm text-gray-400">Система быстрых платежей</p>
                <p className="text-sm text-gray-400">Мобильные платежи</p>
                <p className="text-sm text-gray-400">ЮМани</p>
              </div>
              <div className="mt-4">
                <img 
                  src="/methods.png" 
                  alt="Payment Methods" 
                  className="h-8 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ContactsModal isOpen={isContactsModalOpen} onClose={() => setIsContactsModalOpen(false)} />
    </div>
  );
}

