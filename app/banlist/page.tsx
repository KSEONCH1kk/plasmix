"use client";

import { useState, useEffect } from "react";
import ContactsModal from "@/app/components/ContactsModal";

interface BanRecord {
  id: number;
  server: string;
  type: string;
  player: string;
  player_uuid: string;
  moderator: string;
  moderator_uuid: string;
  reason: string;
  date: string;
  expires: string | null;
}

export default function BanlistPage() {
  const [bans, setBans] = useState<BanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "bans" | "mutes" | "kicks">("bans");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [serverOnline, setServerOnline] = useState({
    online: 0,
    max: 5000,
  });
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
    fetchBans();
    setCurrentPage(1);
  }, [activeFilter]);

  const fetchBans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://77.90.33.66:8000/api/banlist?type=${activeFilter}`);
      if (!response.ok) throw new Error("Failed to fetch bans");
      const data = await response.json();
      setBans(data);
    } catch (error) {
      console.error("Error fetching bans:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBans = bans.filter((ban) =>
    ban.player.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredBans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBans = filteredBans.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAvatarUrl = (uuid: string) => {
    return `https://mc-heads.net/avatar/${uuid}/48`;
  };

  const formatDate = (dateString: string) => {
    return new Date(parseInt(dateString)).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatExpiry = (expiryString: string | null) => {
    if (!expiryString || expiryString === "0" || parseInt(expiryString) <= 0) {
      return "Навсегда";
    }
    const expiryTime = parseInt(expiryString);
    const now = Date.now();
    
    if (expiryTime < now) {
      return "Истёк";
    }
    
    return new Date(expiryTime).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
                <a href="/banlist" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Банлист
                  <span className="absolute bottom-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
                <a href="#" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
                  Правила
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
                </a>
                <a href="https://t.me/px_su" target="_blank" rel="noopener noreferrer" className="relative text-black hover:text-black font-medium transition-colors pb-1 group">
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
            <a href="/games" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Режимы
            </a>
            <a href="/banlist" className="text-sm font-medium text-black pb-1 whitespace-nowrap" style={{ borderBottom: '2px solid transparent', borderImage: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%) 1' }}>
              Банлист
            </a>
            <a href="#" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Правила
            </a>
            <a href="https://t.me/px_su" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
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

      <div className="flex-1 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full">
        <h1 className="text-4xl font-bold text-black mb-8 text-center">Банлист</h1>
        
        <p className="text-center text-gray-700 mb-8">
          Список игроков, которых администрация сервера заблокировала за нарушения{" "}
          <span className="text-orange-500 font-semibold">правил</span> или нежелательное поведение.
          Игроки, включённые в банлист, лишены возможности подключения к серверу и участия в игре или общения в чате.
        </p>
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="mb-6">
            <input
              type="text"
              placeholder="Поиск по нику"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black text-lg"
            />
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setActiveFilter("bans")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeFilter === "bans"
                  ? "text-white shadow-md"
                  : "bg-orange-50 text-gray-700 hover:bg-orange-100"
              }`}
              style={activeFilter === "bans" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
            >
              Баны
            </button>
            <button
              onClick={() => setActiveFilter("mutes")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeFilter === "mutes"
                  ? "text-white shadow-md"
                  : "bg-orange-50 text-gray-700 hover:bg-orange-100"
              }`}
              style={activeFilter === "mutes" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
            >
              Муты
            </button>
            <button
              onClick={() => setActiveFilter("kicks")}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                activeFilter === "kicks"
                  ? "text-white shadow-md"
                  : "bg-orange-50 text-gray-700 hover:bg-orange-100"
              }`}
              style={activeFilter === "kicks" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
            >
              Кики
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
          ) : filteredBans.length === 0 ? (
            <div className="text-center py-20">
              <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">Записи не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Сервер</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Тип</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Нарушитель</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Модератор</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Причина</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Дата</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-black uppercase tracking-wider">Истекает</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentBans.map((ban) => (
                    <tr key={ban.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ban.server}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          {ban.type === "ban" ? "Бан" : ban.type === "mute" ? "Мут" : "Кик"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarUrl(ban.player_uuid)}
                            alt={ban.player}
                            className="w-8 h-8 rounded"
                          />
                          <span className="text-sm font-semibold text-black">{ban.player}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img
                            src={getAvatarUrl(ban.moderator_uuid)}
                            alt={ban.moderator}
                            className="w-8 h-8 rounded"
                          />
                          <span className="text-sm font-semibold text-blue-600">{ban.moderator}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{ban.reason}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(ban.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={ban.expires && parseInt(ban.expires) > 0 ? "text-orange-600 font-semibold" : "text-red-600 font-semibold"}>
                          {formatExpiry(ban.expires)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!loading && filteredBans.length > 0 && totalPages > 1 && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-black hover:bg-orange-50 border-2 border-orange-500"
                  }`}
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Назад
                </button>

                <div className="flex gap-1 overflow-x-auto max-w-xs sm:max-w-none">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all min-w-[44px] ${
                            currentPage === page
                              ? "text-white shadow-md"
                              : "bg-white text-black hover:bg-orange-50 border-2 border-gray-200"
                          }`}
                          style={
                            currentPage === page
                              ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }
                              : {}
                          }
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white text-black hover:bg-orange-50 border-2 border-orange-500"
                  }`}
                >
                  Вперёд
                  <i className="fas fa-chevron-right ml-2"></i>
                </button>
            </div>
          </div>
        )}
        {!loading && filteredBans.length > 0 && (
          <div className="text-center mb-6 text-sm text-gray-600">
            Показано {startIndex + 1}-{Math.min(endIndex, filteredBans.length)} из {filteredBans.length} записей
          </div>
        )}
      </div>
      <footer className="text-white mt-auto" style={{ background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)" }}>
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
                  href="https://vk.com/plasmix_su" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  aria-label="VK"
                >
                  <i className="fab fa-vk text-gray-400 hover:text-white text-base"></i>
                </a>
                <a 
                  href="https://ds.p-x.su" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors"
                  aria-label="Discord"
                >
                  <i className="fab fa-discord text-gray-400 hover:text-white text-base"></i>
                </a>
                <a 
                  href="https://t.me/px_su" 
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

