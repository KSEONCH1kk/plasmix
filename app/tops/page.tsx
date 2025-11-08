"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { modesAPI, leaderboardsAPI, type ModePublic, type LeaderboardPublic } from "@/app/lib/api";
import { useLeaderboard } from "@/app/hooks/useLeaderboard";

export default function TopsPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedPeriod, setSelectedPeriod] = useState(today.toLocaleDateString('ru-RU'));
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeTopIndex, setActiveTopIndex] = useState(1);
  const [serverOnline, setServerOnline] = useState({ online: 0, max: 5000 });
  const [isMobile, setIsMobile] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [availableModes, setAvailableModes] = useState<ModePublic[]>([]);
  const [selectedMode, setSelectedMode] = useState<string>("");
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [selectedPeriodType, setSelectedPeriodType] = useState<'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'alltime'>('daily');
  const [leaderboards, setLeaderboards] = useState<LeaderboardPublic[]>([]);
  const [loadingLeaderboards, setLoadingLeaderboards] = useState(false);
  const year = selectedDate.getFullYear();
  const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
  const day = String(selectedDate.getDate()).padStart(2, '0');
  const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD
  const activeLeaderboard = leaderboards[activeTopIndex];
  const { leaderboard, loading: leaderboardLoading, error: leaderboardError } = useLeaderboard(
    activeLeaderboard?.id || null,
    selectedPeriodType,
    formattedDate,
    100
  );

  const [visibleCount, setVisibleCount] = useState(
    leaderboards.map(() => 10)
  );
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  useEffect(() => {
    const fetchModes = async () => {
      try {
        const modes = await modesAPI.getAll();
        setAvailableModes(modes);
        if (modes.length > 0 && !selectedMode) {
          setSelectedMode(modes[0].slug);
        }
      } catch (error) {
        console.error("Failed to fetch modes:", error);
      }
    };
    fetchModes();
  }, []);
  useEffect(() => {
    const fetchLeaderboards = async () => {
      if (!selectedMode) return;
      
      try {
        setLoadingLeaderboards(true);
        const data = await leaderboardsAPI.getForMode(selectedMode);
        setLeaderboards(data);
        const middleIndex = data.length > 0 ? Math.floor(data.length / 2) : 0;
        setActiveTopIndex(middleIndex);
        setVisibleCount(data.map(() => 10));
      } catch (error) {
        console.error("Failed to fetch leaderboards:", error);
        setLeaderboards([]);
      } finally {
        setLoadingLeaderboards(false);
      }
    };
    fetchLeaderboards();
  }, [selectedMode]);
  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await fetch('http://77.90.33.66:8000/api/server-status/');
        if (response.ok) {
          const data = await response.json();
          setServerOnline({ online: data.online, max: data.max });
        }
      } catch (error) {
        console.error("Failed to fetch server status:", error);
      }
    };

    fetchServerStatus();
    const interval = setInterval(fetchServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const showMore = (topIndex: number) => {
    setVisibleCount(prev => {
      const newCounts = [...prev];
      newCounts[topIndex] = Math.min(
        newCounts[topIndex] + 5,
        leaderboard.length
      );
      return newCounts;
    });
  };

  const copyIPToClipboard = () => {
    navigator.clipboard.writeText("plasmix.su");
    alert("IP скопирован в буфер обмена!");
  };
  const formatScore = (score: number): string => {
    if (score >= 1000000000) return `${(score / 1000000000).toFixed(1)}B`;
    if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
    if (score >= 1000) return `${(score / 1000).toFixed(1)}k`;
    return score.toString();
  };

  const navigateTop = (direction: 'left' | 'right') => {
    if (direction === 'left' && activeTopIndex > 0) {
      setSlideDirection('left');
      setActiveTopIndex(activeTopIndex - 1);
      setTimeout(() => setSlideDirection(null), 500);
    } else if (direction === 'right' && activeTopIndex < leaderboards.length - 1) {
      setSlideDirection('right');
      setActiveTopIndex(activeTopIndex + 1);
      setTimeout(() => setSlideDirection(null), 500);
    }
  };
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && activeTopIndex > 0) {
        setActiveTopIndex(activeTopIndex - 1);
      } else if (e.key === 'ArrowRight' && activeTopIndex < leaderboards.length - 1) {
        setActiveTopIndex(activeTopIndex + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTopIndex, leaderboards.length]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#f5f4f1" }}>
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
                  <span className="absolute bottom-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
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
                >
                  <i className="fas fa-fire text-orange-500 text-sm sm:text-lg"></i>
                  <span className="text-xs sm:text-sm font-bold text-black uppercase">plasmix.su</span>
                  <i className="fas fa-fire text-orange-500 text-sm sm:text-lg"></i>
                </button>
              </div>
            </div>
          </div>
          <nav className="md:hidden flex justify-center space-x-4 mt-4 pt-4 border-t border-gray-200 overflow-x-auto">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Главная
            </Link>
            <Link href="/tops" className="text-sm font-medium text-black pb-1 whitespace-nowrap" style={{ borderBottom: '2px solid transparent', borderImage: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%) 1' }}>
              Топы
            </Link>
            <Link href="/games" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Режимы
            </Link>
            <Link href="/banlist" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Банлист
            </Link>
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-center mb-6 sm:mb-8 text-black">
          Топы игроков
        </h1>
        <div className="mb-8 sm:mb-12 flex flex-col gap-4 items-center px-2" style={{ position: 'relative', zIndex: 10 }}>
          <div className="flex flex-wrap gap-3 justify-center">
            {availableModes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.slug)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  selectedMode === mode.slug
                    ? "text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-orange-50"
                }`}
                style={selectedMode === mode.slug ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                {mode.name}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-2xl">
            <div 
              className="bg-white rounded-2xl shadow-lg px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 cursor-pointer hover:shadow-xl transition-all"
              style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
            >
              <i className="fas fa-calendar-alt text-white text-lg sm:text-xl"></i>
              <span className="text-white font-semibold text-xs sm:text-base text-center">Период отображения</span>
              <div className="px-3 sm:px-4 py-2 bg-white rounded-xl font-medium text-black flex items-center gap-2 text-sm sm:text-base">
                {selectedPeriod}
                <i className={`fas fa-chevron-${isDatePickerOpen ? 'up' : 'down'} text-xs sm:text-sm`}></i>
              </div>
            </div>
            {isDatePickerOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-2xl shadow-2xl p-6 w-96 z-50 border-2 border-orange-200">
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() - 1);
                      setSelectedDate(newDate);
                      setSelectedPeriod(newDate.toLocaleDateString('ru-RU'));
                    }}
                    className="w-10 h-10 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors"
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <div className="text-center">
                    <div className="text-lg font-bold text-black">
                      {selectedDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setMonth(newDate.getMonth() + 1);
                      setSelectedDate(newDate);
                      setSelectedPeriod(newDate.toLocaleDateString('ru-RU'));
                    }}
                    className="w-10 h-10 rounded-xl bg-orange-100 hover:bg-orange-200 flex items-center justify-center text-orange-600 transition-colors"
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                    <div key={day} className="text-center text-xs font-bold text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {(() => {
                    const year = selectedDate.getFullYear();
                    const month = selectedDate.getMonth();
                    const firstDay = new Date(year, month, 1);
                    const lastDay = new Date(year, month + 1, 0);
                    const daysInMonth = lastDay.getDate();
                    const startDay = firstDay.getDay() || 7; 
                    
                    const days = [];
                    for (let i = 1; i < startDay; i++) {
                      days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                    }
                    for (let day = 1; day <= daysInMonth; day++) {
                      const date = new Date(year, month, day);
                      const isSelected = date.toDateString() === selectedDate.toDateString();
                      const isToday = date.toDateString() === new Date().toDateString();
                      
                      days.push(
                        <button
                          key={day}
                          onClick={() => {
                            setSelectedDate(date);
                            setSelectedPeriod(date.toLocaleDateString('ru-RU'));
                            setIsDatePickerOpen(false);
                          }}
                          className={`aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all hover:scale-110 ${
                            isSelected
                              ? 'text-white shadow-lg'
                              : isToday
                              ? 'bg-orange-50 text-orange-600 border-2 border-orange-300'
                              : 'bg-gray-50 text-gray-700 hover:bg-orange-100'
                          }`}
                          style={
                            isSelected
                              ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }
                              : {}
                          }
                        >
                          {day}
                        </button>
                      );
                    }
                    
                    return days;
                  })()}
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      const today = new Date();
                      setSelectedDate(today);
                      setSelectedPeriod(today.toLocaleDateString('ru-RU'));
                      setIsDatePickerOpen(false);
                    }}
                    className="flex-1 py-2 px-4 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-600 font-semibold text-sm transition-colors"
                  >
                    Сегодня
                  </button>
                  <button
                    onClick={() => setIsDatePickerOpen(false)}
                    className="flex-1 py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
                  >
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="relative overflow-hidden sm:overflow-visible py-4 sm:py-8" style={isMobile ? {} : { marginTop: '60px' }}>
          <div className="absolute left-2 sm:left-8 top-1/2 -translate-y-1/2 z-20 hidden sm:block">
            <button
              onClick={() => navigateTop('left')}
              disabled={activeTopIndex === 0}
              className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
                activeTopIndex === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-white text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110'
              }`}
            >
              <i className="fas fa-chevron-left text-xl"></i>
            </button>
          </div>

          <div className="absolute right-2 sm:right-8 top-1/2 -translate-y-1/2 z-20 hidden sm:block">
            <button
              onClick={() => navigateTop('right')}
              disabled={activeTopIndex === leaderboards.length - 1}
              className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
                activeTopIndex === leaderboards.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-white text-orange-500 hover:bg-orange-500 hover:text-white hover:scale-110'
              }`}
            >
              <i className="fas fa-chevron-right text-xl"></i>
            </button>
          </div>
          <div className={`mx-auto px-2 sm:px-0 relative ${isMobile ? 'overflow-hidden' : ''}`} style={isMobile ? { minHeight: 'auto', maxWidth: '100%', zIndex: 1, width: '100%' } : { minHeight: '650px', maxWidth: '1400px', zIndex: 1 }}>
            {loadingLeaderboards ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
                <p className="ml-4 text-gray-600">Загрузка топов...</p>
              </div>
            ) : leaderboards.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-600 text-lg">Для этого режима пока нет топов</p>
              </div>
            ) : leaderboardLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
              </div>
            ) : leaderboardError ? (
              <div className="text-center py-20">
                <p className="text-red-600 text-lg">{leaderboardError}</p>
              </div>
            ) : leaderboards.map((top, index) => {
              const offset = index - activeTopIndex;
              const isActive = offset === 0;
              const isVisible = Math.abs(offset) <= 1;

              if (!isVisible) return null;

              const displayPlayers = isActive ? leaderboard.slice(0, visibleCount[index]) : [];
              const hasMore = isActive && visibleCount[index] < leaderboard.length;

              return (
                <div
                  key={top.id}
                  className={`${isMobile ? 'relative w-full' : 'absolute top-1/2'}`}
                  style={isMobile ? {
                    display: isActive ? 'block' : 'none',
                    width: '100%',
                    maxWidth: '100%',
                    margin: '0 auto',
                    animation: isActive && slideDirection 
                      ? slideDirection === 'right' 
                        ? 'slideInFromRight 0.4s ease-out' 
                        : 'slideInFromLeft 0.4s ease-out'
                      : 'none',
                  } : {
                    transform: `translateX(${offset * 320}px) translateY(-50%) scale(${isActive ? 1 : 0.75})`,
                    opacity: isActive ? 1 : 0.25,
                    filter: isActive ? 'blur(0px)' : 'blur(5px)',
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.5s ease, filter 0.5s ease',
                    width: '480px',
                    maxWidth: '480px',
                    left: '50%',
                    marginLeft: '-240px',
                    pointerEvents: isActive ? 'auto' : 'none',
                    zIndex: isActive ? 10 : 5 - Math.abs(offset),
                  }}
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-3 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-6 pb-2 sm:pb-4 border-b-4" style={{ borderColor: "#FFD700" }}>
                      <div 
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                        style={{ background: top.gradient || 'linear-gradient(135deg, #90EE90 0%, #32CD32 100%)' }}
                      >
                        <i className={`fas ${top.icon || 'fa-trophy'} text-white text-base sm:text-lg`}></i>
                      </div>
                      <h2 className="text-base sm:text-xl font-bold text-black">{top.title}</h2>
                    </div>
                    
                    <div className={`space-y-2 sm:space-y-3 pr-1 sm:pr-2 ${isMobile ? '' : 'max-h-[600px] overflow-y-auto'}`} style={{ scrollbarWidth: 'thin' }}>
                      {displayPlayers.map((player, playerIndex) => (
                        <div
                          key={player.position}
                          className="flex items-center justify-between p-1.5 sm:p-3 rounded-lg sm:rounded-xl transition-all hover:shadow-md"
                          style={{
                            backgroundColor: playerIndex < 3 ? (top.bg_light || "#f0f9ff") : "#f9fafb",
                          }}
                        >
                          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
                            <div
                              className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                              style={{
                                background: playerIndex === 0 ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" :
                                           playerIndex === 1 ? "linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)" :
                                           playerIndex === 2 ? "linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)" :
                                           "#e5e7eb",
                                color: playerIndex < 3 ? "white" : "#6b7280"
                              }}
                            >
                              #{player.position}
                            </div>
                            <span className="font-medium text-black text-xs sm:text-base truncate">{player.username}</span>
                          </div>
                          <span 
                            className={`font-bold text-xs sm:text-sm px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-md sm:rounded-lg whitespace-nowrap flex-shrink-0 ml-1 ${
                              (top.color || 'green') === 'green' ? 'text-green-600 bg-green-50' :
                              top.color === 'red' ? 'text-red-600 bg-red-50' :
                              'text-blue-600 bg-blue-50'
                            }`}
                          >
                            {formatScore(player.score)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {hasMore && (
                      <button 
                        onClick={() => showMore(index)}
                        className="w-full mt-2 sm:mt-4 py-1.5 sm:py-3 rounded-lg sm:rounded-xl border-2 border-dashed border-orange-400 text-orange-600 font-semibold hover:bg-orange-50 transition-all text-xs sm:text-base"
                      >
                        Показать больше
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex sm:hidden justify-center gap-4 mt-6">
            <button
              onClick={() => navigateTop('left')}
              disabled={activeTopIndex === 0}
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                activeTopIndex === 0
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-orange-500 active:bg-orange-500 active:text-white'
              }`}
            >
              <i className="fas fa-chevron-left text-lg"></i>
            </button>
            <button
              onClick={() => navigateTop('right')}
              disabled={activeTopIndex === leaderboards.length - 1}
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all ${
                activeTopIndex === leaderboards.length - 1
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-white text-orange-500 active:bg-orange-500 active:text-white'
              }`}
            >
              <i className="fas fa-chevron-right text-lg"></i>
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-6">
            {leaderboards.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTopIndex(index)}
                className="transition-all"
                style={{
                  width: activeTopIndex === index ? '32px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: activeTopIndex === index
                    ? 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%)'
                    : '#d1d5db',
                }}
              />
            ))}
          </div>
        </div>
      </main>
      <footer className="text-white mt-20" style={{ background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)" }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2 text-white">PLASMIX</h3>
              <p className="text-sm text-gray-400 mb-3">Сервер 1.21.4</p>
              <div className="flex gap-2 mb-4 justify-center md:justify-start">
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
              
              <p className="text-xs text-gray-500">© 2025 Plasmix — Все права защищены.</p>
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
              <div className="mt-4 flex justify-center md:justify-start">
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
      {isContactsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onClick={() => setIsContactsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">Связаться с нами</h3>
              <button
                onClick={() => setIsContactsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="space-y-4">
              <a
                href="https://vk.com/your_community"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-transparent hover:from-blue-100 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                  <i className="fab fa-vk"></i>
                </div>
                <div>
                  <div className="font-bold text-black">VKontakte</div>
                  <div className="text-sm text-gray-600">Наше сообщество</div>
                </div>
              </a>

              <a
                href="https://t.me/your_community"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-50 to-transparent hover:from-sky-100 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-sky-500 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                  <i className="fab fa-telegram"></i>
                </div>
                <div>
                  <div className="font-bold text-black">Telegram</div>
                  <div className="text-sm text-gray-600">Официальный канал</div>
                </div>
              </a>

              <a
                href="https://discord.gg/your_server"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-transparent hover:from-indigo-100 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                  <i className="fab fa-discord"></i>
                </div>
                <div>
                  <div className="font-bold text-black">Discord</div>
                  <div className="text-sm text-gray-600">Сервер сообщества</div>
                </div>
              </a>

              <a
                href="mailto:support@plasmix.su"
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-orange-50 to-transparent hover:from-orange-100 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white text-xl group-hover:scale-110 transition-transform">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <div className="font-bold text-black">Email</div>
                  <div className="text-sm text-gray-600">support@plasmix.su</div>
                </div>
              </a>
            </div>

            <button
              onClick={() => setIsContactsModalOpen(false)}
              className="w-full mt-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-black font-semibold transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

