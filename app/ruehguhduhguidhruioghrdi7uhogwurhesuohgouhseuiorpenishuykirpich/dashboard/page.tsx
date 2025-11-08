"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { authAPI, donationsAPI, itemsAPI, modesAPI, categoriesAPI, promocodesAPI, ordersAPI, statisticsAPI, settingsAPI, adminsAPI, Donation, Item, Mode, Category, Promocode, Order, Admin, AdminPermissions } from "@/app/lib/api";
import AdminsManager from "@/app/components/AdminsManager";
import GameModesManager from "@/app/components/GameModesManager";
import BannersManager from "@/app/components/BannersManager";
import LeaderboardsManager from "@/app/components/LeaderboardsManager";

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"statistics" | "donations" | "items" | "modes" | "categories" | "promocodes" | "orders" | "settings" | "admins" | "game-modes" | "banners" | "leaderboards">("statistics");
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [permissions, setPermissions] = useState<AdminPermissions>({});
  useEffect(() => {
    if (isAuthenticated) {
      adminsAPI.getMe().then(admin => setCurrentAdmin(admin));
      adminsAPI.checkPermissions().then(data => setPermissions(data.permissions));
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    authAPI.logout();
    localStorage.removeItem("adminAuth");
    localStorage.removeItem("access_token");
    document.cookie = "access_token=; path=/; max-age=0";
    
    router.push("/ruehguhduhguidhruioghrdi7uhogwurhesuohgouhseuiorpenishuykirpich");
  };

  if (loading || !isAuthenticated) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Проверка авторизации...</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-black">PLASMIX</h1>
              <span className="text-sm text-gray-500">Админ-панель</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
            >
              <i className="fas fa-sign-out-alt mr-2"></i>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-md p-2 mb-8">
          <div className="flex flex-wrap gap-2">
            {(currentAdmin?.role === 'super_admin' || permissions.view_stats) && (
              <button
                onClick={() => setActiveTab("statistics")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "statistics"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "statistics" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-chart-line mr-2"></i>
                Статистика
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_donations) && (
              <button
                onClick={() => setActiveTab("donations")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "donations"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "donations" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-trophy mr-2"></i>
                Донаты
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_items) && (
              <button
                onClick={() => setActiveTab("items")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "items"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "items" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-box mr-2"></i>
                Предметы
              </button>
            )}
             {(currentAdmin?.role === 'super_admin' || permissions.manage_modes) && (
              <button
                onClick={() => setActiveTab("modes")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "modes"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "modes" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-server mr-2"></i>
                Серверы
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_categories) && (
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "categories"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "categories" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-th-large mr-2"></i>
                Категории
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_promo) && (
              <button
                onClick={() => setActiveTab("promocodes")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "promocodes"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "promocodes" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-ticket-alt mr-2"></i>
                Промокоды
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_orders) && (
              <button
                onClick={() => setActiveTab("orders")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "orders"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "orders" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-shopping-cart mr-2"></i>
                Заказы
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_game_modes) && (
              <button
                onClick={() => setActiveTab("game-modes")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "game-modes"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "game-modes" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-gamepad mr-2"></i>
                Игровые режимы
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_settings) && (
              <button
                onClick={() => setActiveTab("banners")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "banners"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "banners" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-image mr-2"></i>
                Баннеры
              </button>
            )}
            {(currentAdmin?.role === 'super_admin') && (
              <button
                onClick={() => setActiveTab("leaderboards")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "leaderboards"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "leaderboards" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-trophy mr-2"></i>
                Топы
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_admins) && (
              <button
                onClick={() => setActiveTab("admins")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "admins"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "admins" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-users-cog mr-2"></i>
                Админы
              </button>
            )}
            {(currentAdmin?.role === 'super_admin' || permissions.manage_settings) && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === "settings"
                    ? "text-white shadow-md"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                style={activeTab === "settings" ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
              >
                <i className="fas fa-cog mr-2"></i>
                Настройки
              </button>
            )}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6">
          {activeTab === "statistics" && (currentAdmin?.role === 'super_admin' || permissions.view_stats) && <StatisticsManager />}
          {activeTab === "donations" && (currentAdmin?.role === 'super_admin' || permissions.manage_donations) && <DonationsManager />}
          {activeTab === "items" && (currentAdmin?.role === 'super_admin' || permissions.manage_items) && <ItemsManager />}
          {activeTab === "modes" && (currentAdmin?.role === 'super_admin' || permissions.manage_modes) && <ModesManager />}
          {activeTab === "categories" && (currentAdmin?.role === 'super_admin' || permissions.manage_categories) && <CategoriesManager />}
          {activeTab === "promocodes" && (currentAdmin?.role === 'super_admin' || permissions.manage_promo) && <PromocodesManager />}
          {activeTab === "orders" && (currentAdmin?.role === 'super_admin' || permissions.manage_orders) && <OrdersManager />}
          {activeTab === "game-modes" && (currentAdmin?.role === 'super_admin' || permissions.manage_game_modes) && <GameModesManager />}
          {activeTab === "banners" && (currentAdmin?.role === 'super_admin' || permissions.manage_settings) && <BannersManager />}
          {activeTab === "leaderboards" && currentAdmin?.role === 'super_admin' && <LeaderboardsManager />}
          {activeTab === "admins" && (currentAdmin?.role === 'super_admin' || permissions.manage_admins) && <AdminsManager currentAdmin={currentAdmin} />}
          {activeTab === "settings" && (currentAdmin?.role === 'super_admin' || permissions.manage_settings) && <SettingsManager />}
          {activeTab === "statistics" && currentAdmin?.role !== 'super_admin' && !permissions.view_stats && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для просмотра статистики</p>
            </div>
          )}
          {activeTab === "donations" && currentAdmin?.role !== 'super_admin' && !permissions.manage_donations && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления донатами</p>
            </div>
          )}
          {activeTab === "items" && currentAdmin?.role !== 'super_admin' && !permissions.manage_items && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления предметами</p>
            </div>
          )}
          {activeTab === "modes" && currentAdmin?.role !== 'super_admin' && !permissions.manage_modes && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления режимами</p>
            </div>
          )}
          {activeTab === "categories" && currentAdmin?.role !== 'super_admin' && !permissions.manage_categories && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления категориями</p>
            </div>
          )}
          {activeTab === "promocodes" && currentAdmin?.role !== 'super_admin' && !permissions.manage_promo && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления промокодами</p>
            </div>
          )}
          {activeTab === "orders" && currentAdmin?.role !== 'super_admin' && !permissions.manage_orders && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления заказами</p>
            </div>
          )}
          {activeTab === "admins" && currentAdmin?.role !== 'super_admin' && !permissions.manage_admins && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления админами</p>
            </div>
          )}
          {activeTab === "game-modes" && currentAdmin?.role !== 'super_admin' && !permissions.manage_game_modes && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления игровыми режимами</p>
            </div>
          )}
          {activeTab === "settings" && currentAdmin?.role !== 'super_admin' && !permissions.manage_settings && (
            <div className="text-center py-12">
              <i className="fas fa-lock text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-2xl font-bold text-gray-700 mb-2">Доступ запрещен</h3>
              <p className="text-gray-500">У вас нет прав для управления настройками</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
function StatisticsManager() {
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await statisticsAPI.get();
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!statistics) {
    return <div className="text-center py-20 text-gray-600">Ошибка загрузки статистики</div>;
  }

  const ordersData = statistics.daily_orders || [];
  const promoData = statistics.promo_stats || [];
  const topProducts = statistics.top_products || [];

  const maxOrders = ordersData.length > 0 ? Math.max(...ordersData.map((d: any) => d.orders)) : 1;
  const maxRevenue = ordersData.length > 0 ? Math.max(...ordersData.map((d: any) => d.revenue)) : 1;
  const maxUses = promoData.length > 0 ? Math.max(...promoData.map((p: any) => p.uses)) : 1;

  const totalOrders = statistics.total_orders || 0;
  const totalRevenue = statistics.total_revenue || 0;
  const totalPromoUses = statistics.total_promo_uses || 0;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-black mb-6">Статистика</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Всего заказов</h3>
            <i className="fas fa-shopping-cart text-2xl text-orange-500"></i>
          </div>
          <p className="text-3xl font-bold text-black">{totalOrders}</p>
          <p className="text-sm text-gray-600 mt-1">За последние 7 дней</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border-2 border-green-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Общий доход</h3>
            <i className="fas fa-ruble-sign text-2xl text-green-500"></i>
          </div>
          <p className="text-3xl font-bold text-black">{totalRevenue.toLocaleString()} ₽</p>
          <p className="text-sm text-gray-600 mt-1">За последние 7 дней</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border-2 border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-600 uppercase">Промокоды</h3>
            <i className="fas fa-ticket-alt text-2xl text-purple-500"></i>
          </div>
          <p className="text-3xl font-bold text-black">{totalPromoUses}</p>
          <p className="text-sm text-gray-600 mt-1">Использований</p>
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-black mb-6">
          <i className="fas fa-chart-line mr-2 text-orange-500"></i>
          Заказы по дням
        </h3>
        <div className="space-y-4">
          {ordersData.map((day: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-black">{day.date}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">{day.orders} заказов</span>
                  <span className="font-bold text-green-600">{day.revenue.toLocaleString()} ₽</span>
                </div>
              </div>
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(day.orders / maxOrders) * 100}%`,
                    background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)"
                  }}
                >
                  <div className="flex items-center justify-end h-full pr-3">
                    <span className="text-xs font-bold text-white">{day.orders}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-black mb-6">
          <i className="fas fa-money-bill-wave mr-2 text-green-500"></i>
          Выручка по дням
        </h3>
        <div className="space-y-4">
          {ordersData.map((day: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-black">{day.date}</span>
                <span className="font-bold text-green-600">{day.revenue.toLocaleString()} ₽</span>
              </div>
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(day.revenue / maxRevenue) * 100}%`,
                    background: "linear-gradient(90deg, #10B981 0%, #059669 100%)"
                  }}
                >
                  <div className="flex items-center justify-end h-full pr-3">
                    <span className="text-xs font-bold text-white">{day.revenue.toLocaleString()} ₽</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-black mb-6">
          <i className="fas fa-tags mr-2 text-purple-500"></i>
          Статистика промокодов
        </h3>
        <div className="space-y-4">
          {promoData.map((promo: any, index: number) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-black">{promo.code}</span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                    -{promo.discount}%
                  </span>
                </div>
                <span className="font-semibold text-purple-600">{promo.uses} использований</span>
              </div>
              <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${(promo.uses / maxUses) * 100}%`,
                    background: "linear-gradient(90deg, #A855F7 0%, #9333EA 100%)"
                  }}
                >
                  <div className="flex items-center justify-end h-full pr-3">
                    <span className="text-xs font-bold text-white">{promo.uses}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
        <h3 className="text-xl font-bold text-black mb-6">
          <i className="fas fa-fire mr-2 text-red-500"></i>
          Топ продаж
        </h3>
        <div className="space-y-3">
          {topProducts.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: index === 0 ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" : "#6B7280" }}
                >
                  {index + 1}
                </div>
                <div>
                  <p className="font-bold text-black">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.sales} продаж</p>
                </div>
              </div>
              <p className="font-bold text-green-600 text-lg">{item.revenue.toLocaleString()} ₽</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function DonationsManager() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDonation, setCurrentDonation] = useState<any>(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const data = await donationsAPI.getAll(undefined, true); 
      setDonations(data);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const donationData = {
        name: currentDonation.name,
        price: parseFloat(currentDonation.price),
        old_price: currentDonation.old_price ? parseFloat(currentDonation.old_price) : undefined,
        discount: currentDonation.discount || undefined,
        image: currentDonation.image || undefined,
        mode: currentDonation.mode,
        chat_prefix: currentDonation.chat_prefix || undefined,
        command: currentDonation.command || undefined,
        features: currentDonation.features || undefined,
      };

      if (currentDonation.id && donations.find(d => d.id === currentDonation.id)) {
        await donationsAPI.update(currentDonation.id, donationData);
      } else {
        await donationsAPI.create(donationData);
      }
      
      await fetchDonations();
      setIsEditing(false);
      setCurrentDonation(null);
    } catch (error) {
      console.error('Error saving donation:', error);
      alert('Ошибка при сохранении доната');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот донат?')) return;
    
    try {
      await donationsAPI.delete(id);
      await fetchDonations();
    } catch (error) {
      console.error('Error deleting donation:', error);
      alert('Ошибка при удалении доната');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Управление донатами</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentDonation({ name: "", price: 0, old_price: 0, discount: "", image: "", mode: "lite", chat_prefix: "", command: "", features: [] });
          }}
          className="px-4 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить донат
        </button>
      </div>

      {isEditing && (
        <div className="mb-6 p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
          <h3 className="text-lg font-bold text-black mb-4">
            {currentDonation.name ? "Редактировать донат" : "Новый донат"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Название"
              value={currentDonation.name}
              onChange={(e) => setCurrentDonation({ ...currentDonation, name: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="number"
              placeholder="Цена (например: 599)"
              value={currentDonation.price}
              onChange={(e) => setCurrentDonation({ ...currentDonation, price: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="number"
              placeholder="Старая цена"
              value={currentDonation.old_price || ""}
              onChange={(e) => setCurrentDonation({ ...currentDonation, old_price: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="text"
              placeholder="Скидка"
              value={currentDonation.discount}
              onChange={(e) => setCurrentDonation({ ...currentDonation, discount: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="text"
              placeholder="URL изображения"
              value={currentDonation.image}
              onChange={(e) => setCurrentDonation({ ...currentDonation, image: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="text"
              placeholder="Префикс в чате (например: [VIP])"
              value={currentDonation.chat_prefix || ""}
              onChange={(e) => setCurrentDonation({ ...currentDonation, chat_prefix: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <select
              value={currentDonation.mode}
              onChange={(e) => setCurrentDonation({ ...currentDonation, mode: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            >
              <option value="lite">Лайт Анархия</option>
              <option value="classic">Классик Анархия</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-black mb-2">
              Команда выдачи
              <span className="text-xs text-gray-500 ml-2">
                (Плейсхолдеры: %player%, %duration%, %price%, %product%)
              </span>
            </label>
            <textarea
              placeholder="lp user %player% parent add vip %duration%"
              value={currentDonation.command || ""}
              onChange={(e) => setCurrentDonation({ ...currentDonation, command: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black font-mono text-sm"
              rows={3}
            />
            <p className="text-xs text-gray-600 mt-2">
              <strong>Доступные плейсхолдеры:</strong><br/>
              • <code className="bg-gray-100 px-1 rounded">%player%</code> - никнейм игрока<br/>
              • <code className="bg-gray-100 px-1 rounded">%duration%</code> - длительность (1month, 3months, forever)<br/>
              • <code className="bg-gray-100 px-1 rounded">%price%</code> - цена покупки<br/>
              • <code className="bg-gray-100 px-1 rounded">%product%</code> - название продукта
            </p>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-bold text-black">Характеристики (Features)</h4>
              <button
                onClick={() => {
                  const newFeatures = [...(currentDonation.features || []), { name: "", value: "", enabled: false }];
                  setCurrentDonation({ ...currentDonation, features: newFeatures });
                }}
                className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-plus mr-1"></i>
                Добавить
              </button>
            </div>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(currentDonation.features || []).map((feature: any, index: number) => (
                <div key={index} className="flex gap-2 items-start p-3 bg-white rounded-lg border-2 border-gray-200">
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Название (например: Повторы игр)"
                      value={feature.name}
                      onChange={(e) => {
                        const newFeatures = [...currentDonation.features];
                        newFeatures[index].name = e.target.value;
                        setCurrentDonation({ ...currentDonation, features: newFeatures });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none text-black text-sm"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Значение (например: 1.5x)"
                        value={feature.value || ""}
                        onChange={(e) => {
                          const newFeatures = [...currentDonation.features];
                          newFeatures[index].value = e.target.value;
                          setCurrentDonation({ ...currentDonation, features: newFeatures });
                        }}
                        className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:border-orange-500 focus:outline-none text-black text-sm"
                        disabled={feature.enabled || feature.disabled}
                      />
                      <label className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-lg cursor-pointer border border-green-300">
                        <input
                          type="checkbox"
                          checked={feature.enabled || false}
                          onChange={(e) => {
                            const newFeatures = [...currentDonation.features];
                            newFeatures[index].enabled = e.target.checked;
                            if (e.target.checked) {
                              newFeatures[index].value = "";
                              newFeatures[index].disabled = false;
                            }
                            setCurrentDonation({ ...currentDonation, features: newFeatures });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-xs text-green-700 whitespace-nowrap">✓</span>
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 bg-red-100 rounded-lg cursor-pointer border border-red-300">
                        <input
                          type="checkbox"
                          checked={feature.disabled || false}
                          onChange={(e) => {
                            const newFeatures = [...currentDonation.features];
                            newFeatures[index].disabled = e.target.checked;
                            if (e.target.checked) {
                              newFeatures[index].value = "";
                              newFeatures[index].enabled = false;
                            }
                            setCurrentDonation({ ...currentDonation, features: newFeatures });
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-xs text-red-700 whitespace-nowrap">✕</span>
                      </label>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newFeatures = currentDonation.features.filter((_: any, i: number) => i !== index);
                      setCurrentDonation({ ...currentDonation, features: newFeatures });
                    }}
                    className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm transition-colors"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
              {(!currentDonation.features || currentDonation.features.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Нет характеристик. Нажмите "Добавить" чтобы создать.
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentDonation(null);
              }}
              className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {donations.map((donation) => (
          <div key={donation.id} className="border-2 border-gray-200 rounded-xl p-4">
            <div className="w-full aspect-square mb-3 rounded-xl overflow-hidden">
              <img src={donation.image} alt={donation.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-bold text-black mb-2">{donation.name}</h3>
            <p className="text-sm text-gray-600 mb-1">Цена: {donation.price} ₽</p>
            {donation.old_price && <p className="text-sm text-gray-600 mb-1">Старая цена: {donation.old_price} ₽</p>}
            {donation.discount && <p className="text-sm text-orange-600 mb-1">{donation.discount}</p>}
            {donation.chat_prefix && <p className="text-sm text-gray-600 mb-1">Префикс: {donation.chat_prefix}</p>}
            {donation.command && (
              <p className="text-xs text-blue-600 mb-1 font-mono bg-blue-50 p-2 rounded">
                <i className="fas fa-terminal mr-1"></i>
                {donation.command.length > 50 ? donation.command.substring(0, 50) + '...' : donation.command}
              </p>
            )}
            <p className="text-xs text-orange-600 mb-3">
              <i className="fas fa-server mr-1"></i>
              {donation.mode === "lite" ? "Лайт Анархия" : "Классик Анархия"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setCurrentDonation(donation);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-edit mr-1"></i>
                Изменить
              </button>
              <button
                onClick={() => handleDelete(donation.id)}
                className="flex-1 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-trash mr-1"></i>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ItemsManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await itemsAPI.getAll(undefined, undefined, true); 
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const itemData = {
        name: currentItem.name,
        price: parseFloat(currentItem.price),
        category: currentItem.category,
        image: currentItem.image || undefined,
        mode: currentItem.mode,
        command: currentItem.command || undefined,
      };

      if (currentItem.id && items.find(i => i.id === currentItem.id)) {
        await itemsAPI.update(currentItem.id, itemData);
      } else {
        await itemsAPI.create(itemData);
      }
      
      await fetchItems();
      setIsEditing(false);
      setCurrentItem(null);
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Ошибка при сохранении предмета');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот предмет?')) return;
    
    try {
      await itemsAPI.delete(id);
      await fetchItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Ошибка при удалении предмета');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Управление предметами</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentItem({ name: "", price: 0, category: "currency", image: "", mode: "lite", command: "" });
          }}
          className="px-4 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить предмет
        </button>
      </div>

      {isEditing && (
        <div className="mb-6 p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
          <h3 className="text-lg font-bold text-black mb-4">
            {currentItem.name ? "Редактировать предмет" : "Новый предмет"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Название"
              value={currentItem.name}
              onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="number"
              placeholder="Цена (например: 99)"
              value={currentItem.price}
              onChange={(e) => setCurrentItem({ ...currentItem, price: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <select
              value={currentItem.category}
              onChange={(e) => setCurrentItem({ ...currentItem, category: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            >
              <option value="currency">Сапфиры и Коины</option>
              <option value="cases">Кейс с донатом</option>
              <option value="titles">Кейс с титулами</option>
              <option value="containers">Контейнеры</option>
              <option value="other">Разное</option>
            </select>
            <input
              type="text"
              placeholder="URL изображения"
              value={currentItem.image}
              onChange={(e) => setCurrentItem({ ...currentItem, image: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <select
              value={currentItem.mode}
              onChange={(e) => setCurrentItem({ ...currentItem, mode: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            >
              <option value="lite">Лайт Анархия</option>
              <option value="classic">Классик Анархия</option>
            </select>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-black mb-2">
              Команда выдачи
              <span className="text-xs text-gray-500 ml-2">
                (Плейсхолдеры: %player%, %quantity%, %price%, %product%)
              </span>
            </label>
            <textarea
              placeholder="give %player% diamond %quantity%"
              value={currentItem.command || ""}
              onChange={(e) => setCurrentItem({ ...currentItem, command: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black font-mono text-sm"
              rows={3}
            />
            <p className="text-xs text-gray-600 mt-2">
              <strong>Доступные плейсхолдеры:</strong><br/>
              • <code className="bg-gray-100 px-1 rounded">%player%</code> - никнейм игрока<br/>
              • <code className="bg-gray-100 px-1 rounded">%quantity%</code> - количество предметов<br/>
              • <code className="bg-gray-100 px-1 rounded">%price%</code> - цена покупки<br/>
              • <code className="bg-gray-100 px-1 rounded">%product%</code> - название продукта
            </p>
          </div>
          
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentItem(null);
              }}
              className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="border-2 border-gray-200 rounded-xl p-4">
            <div className="w-full aspect-square mb-3 rounded-xl overflow-hidden">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-bold text-black mb-2">{item.name}</h3>
            <p className="text-sm text-gray-600 mb-1">Цена: {item.price} ₽</p>
            <p className="text-sm text-gray-600 mb-1">Категория: {item.category}</p>
            {item.command && (
              <p className="text-xs text-blue-600 mb-1 font-mono bg-blue-50 p-2 rounded">
                <i className="fas fa-terminal mr-1"></i>
                {item.command.length > 50 ? item.command.substring(0, 50) + '...' : item.command}
              </p>
            )}
            <p className="text-xs text-orange-600 mb-3">
              <i className="fas fa-server mr-1"></i>
              {item.mode === "lite" ? "Лайт Анархия" : "Классик Анархия"}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setCurrentItem(item);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-edit mr-1"></i>
                Изменить
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-1 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-trash mr-1"></i>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function ModesManager() {
  const [modes, setModes] = useState<Mode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMode, setCurrentMode] = useState<any>(null);

  useEffect(() => {
    fetchModes();
  }, []);

  const fetchModes = async () => {
    try {
      const data = await modesAPI.getAll();
      setModes(data);
    } catch (error) {
      console.error('Error fetching modes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const modeData = {
        name: currentMode.name,
        slug: currentMode.slug || currentMode.name.toLowerCase().replace(/\s+/g, '-'),
        image: currentMode.image || undefined,
        server_id: currentMode.server_id || undefined,
        leaderboard_enabled: currentMode.leaderboard_enabled || false,
        leaderboard_table: currentMode.leaderboard_table || undefined,
        leaderboard_db_host: currentMode.leaderboard_db_host || undefined,
        leaderboard_db_port: currentMode.leaderboard_db_port || undefined,
        leaderboard_db_name: currentMode.leaderboard_db_name || undefined,
        leaderboard_db_user: currentMode.leaderboard_db_user || undefined,
        leaderboard_db_password: currentMode.leaderboard_db_password || undefined,
      };

      if (currentMode.id && modes.find(m => m.id === currentMode.id)) {
        await modesAPI.update(currentMode.id, modeData);
      } else {
        await modesAPI.create(modeData);
      }
      
      await fetchModes();
      setIsEditing(false);
      setCurrentMode(null);
    } catch (error) {
      console.error('Error saving mode:', error);
      alert('Ошибка при сохранении режима');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот режим?')) return;
    
    try {
      await modesAPI.delete(id);
      await fetchModes();
    } catch (error) {
      console.error('Error deleting mode:', error);
      alert('Ошибка при удалении режима');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Управление режимами</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentMode({ 
              name: "", 
              slug: "", 
              image: "", 
              server_id: "",
              leaderboard_enabled: false,
              leaderboard_table: "",
              leaderboard_db_host: "",
              leaderboard_db_port: 3306,
              leaderboard_db_name: "",
              leaderboard_db_user: "",
              leaderboard_db_password: ""
            });
          }}
          className="px-4 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить режим
        </button>
      </div>

      {isEditing && (
        <div className="mb-6 p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
          <h3 className="text-lg font-bold text-black mb-4">
            {currentMode.name ? "Редактировать режим" : "Новый режим"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Название режима"
              value={currentMode.name}
              onChange={(e) => setCurrentMode({ ...currentMode, name: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="text"
              placeholder="URL изображения"
              value={currentMode.image}
              onChange={(e) => setCurrentMode({ ...currentMode, image: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="text"
              placeholder="Server ID (например: lite_anarchy)"
              value={currentMode.server_id || ""}
              onChange={(e) => setCurrentMode({ ...currentMode, server_id: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
          </div>
          <p className="text-xs text-gray-600 mt-2">
            <strong>Server ID</strong> - идентификатор сервера для плагина выдачи (например: <code className="bg-gray-100 px-1 rounded">lite_anarchy</code>, <code className="bg-gray-100 px-1 rounded">classic_anarchy</code>)
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentMode(null);
              }}
              className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <div key={mode.id} className="border-2 border-gray-200 rounded-xl p-4">
            <div className="w-full aspect-square mb-3 rounded-xl overflow-hidden">
              <img src={mode.image} alt={mode.name} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-bold text-black mb-2">{mode.name}</h3>
            {mode.server_id && (
              <p className="text-xs text-gray-600 mb-3">
                <i className="fas fa-server mr-1"></i>
                Server ID: <code className="bg-gray-100 px-1 rounded">{mode.server_id}</code>
              </p>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setCurrentMode(mode);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-edit mr-1"></i>
                Изменить
              </button>
              <button
                onClick={() => handleDelete(mode.id)}
                className="flex-1 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-trash mr-1"></i>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const categoryData = {
        category_id: currentCategory.category_id,
        name: currentCategory.name,
        icon: currentCategory.icon || undefined,
        mode: currentCategory.mode,
      };

      if (currentCategory.id && categories.find(c => c.id === currentCategory.id)) {
        await categoriesAPI.update(currentCategory.id, categoryData);
      } else {
        await categoriesAPI.create(categoryData);
      }
      
      await fetchCategories();
      setIsEditing(false);
      setCurrentCategory(null);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Ошибка при сохранении категории');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) return;
    
    try {
      await categoriesAPI.delete(id);
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Ошибка при удалении категории');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Управление категориями</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentCategory({ category_id: "", name: "", icon: "fa-star", mode: "lite" });
          }}
          className="px-4 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить категорию
        </button>
      </div>

      {isEditing && (
        <div className="mb-6 p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
          <h3 className="text-lg font-bold text-black mb-4">
            {currentCategory.name ? "Редактировать категорию" : "Новая категория"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ID категории (например: privileges)"
              value={currentCategory.category_id}
              onChange={(e) => setCurrentCategory({ ...currentCategory, category_id: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="text"
              placeholder="Название"
              value={currentCategory.name}
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <input
              type="text"
              placeholder="Иконка (например: fa-trophy)"
              value={currentCategory.icon}
              onChange={(e) => setCurrentCategory({ ...currentCategory, icon: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            />
            <select
              value={currentCategory.mode}
              onChange={(e) => setCurrentCategory({ ...currentCategory, mode: e.target.value })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
            >
              <option value="lite">Лайт Анархия</option>
              <option value="classic">Классик Анархия</option>
            </select>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
            >
              Сохранить
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setCurrentCategory(null);
              }}
              className="px-6 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <i className={`fas ${category.icon} text-3xl text-orange-500`}></i>
              <div className="flex-1">
                <h3 className="font-bold text-black">{category.name}</h3>
                <p className="text-sm text-gray-600">ID: {category.category_id}</p>
                <p className="text-xs text-orange-600 mt-1">
                  <i className="fas fa-server mr-1"></i>
                  {category.mode === "lite" ? "Лайт Анархия" : "Классик Анархия"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(true);
                  setCurrentCategory(category);
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-edit mr-1"></i>
                Изменить
              </button>
              <button
                onClick={() => handleDelete(category.id)}
                className="flex-1 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-trash mr-1"></i>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
function PromocodesManager() {
  const [promocodes, setPromocodes] = useState<Promocode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"edit" | "delete" | null>(null);
  const [currentPromo, setCurrentPromo] = useState<any>(null);

  useEffect(() => {
    fetchPromocodes();
  }, []);

  const fetchPromocodes = async () => {
    try {
      const data = await promocodesAPI.getAll();
      setPromocodes(data);
    } catch (error) {
      console.error('Error fetching promocodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (promo: any) => {
    setCurrentPromo(promo);
    setModalType("edit");
    setIsModalOpen(true);
  };

  const openDeleteModal = (promo: any) => {
    setCurrentPromo(promo);
    setModalType("delete");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setCurrentPromo({ code: "", discount: 10, active: true, one_per_account: false, max_uses: null });
    setModalType("edit");
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const promoData = {
        code: currentPromo.code,
        discount: currentPromo.discount,
        active: currentPromo.active,
        one_per_account: currentPromo.one_per_account || false,
        max_uses: currentPromo.max_uses || null,
      };

      if (currentPromo.id && promocodes.find(p => p.id === currentPromo.id)) {
        await promocodesAPI.update(currentPromo.id, promoData);
      } else {
        await promocodesAPI.create(promoData);
      }
      
      await fetchPromocodes();
      setIsModalOpen(false);
      setCurrentPromo(null);
    } catch (error) {
      console.error('Error saving promocode:', error);
      alert('Ошибка при сохранении промокода');
    }
  };

  const handleDelete = async () => {
    try {
      await promocodesAPI.delete(currentPromo.id);
      await fetchPromocodes();
      setIsModalOpen(false);
      setCurrentPromo(null);
    } catch (error) {
      console.error('Error deleting promocode:', error);
      alert('Ошибка при удалении промокода');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Управление промокодами</h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить промокод
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-black">Код</th>
              <th className="text-left py-3 px-4 font-bold text-black">Скидка</th>
              <th className="text-left py-3 px-4 font-bold text-black">Использования</th>
              <th className="text-left py-3 px-4 font-bold text-black">Ограничения</th>
              <th className="text-left py-3 px-4 font-bold text-black">Статус</th>
              <th className="text-right py-3 px-4 font-bold text-black">Действия</th>
            </tr>
          </thead>
          <tbody>
            {promocodes.map((promo) => (
              <tr key={promo.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-black">{promo.code}</td>
                <td className="py-3 px-4 text-gray-700">{promo.discount}%</td>
                <td className="py-3 px-4 text-gray-700">
                  <span className="font-semibold">{promo.uses_count}</span>
                  {promo.max_uses && <span className="text-gray-500"> / {promo.max_uses}</span>}
                </td>
                <td className="py-3 px-4">
                  {promo.one_per_account && (
                    <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                      <i className="fas fa-user mr-1"></i>
                      Один раз на игрока
                    </span>
                  )}
                  {!promo.one_per_account && !promo.max_uses && (
                    <span className="text-gray-400 text-sm">Без ограничений</span>
                  )}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${promo.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {promo.active ? "Активен" : "Неактивен"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button 
                    onClick={() => openEditModal(promo)}
                    className="px-3 py-1 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors mr-2"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button 
                    onClick={() => openDeleteModal(promo)}
                    className="px-3 py-1 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && currentPromo && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn"
          style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(8px)"
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 max-w-md w-full animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {modalType === "edit" ? (
              <>
                <h3 className="text-xl font-bold text-black mb-4">
                  {currentPromo.code ? "Редактировать промокод" : "Новый промокод"}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Код промокода</label>
                    <input
                      type="text"
                      value={currentPromo.code}
                      onChange={(e) => setCurrentPromo({ ...currentPromo, code: e.target.value.toUpperCase() })}
                      placeholder="PLASMIX10"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Скидка (%)</label>
                    <input
                      type="number"
                      value={currentPromo.discount}
                      onChange={(e) => setCurrentPromo({ ...currentPromo, discount: parseInt(e.target.value) })}
                      min="1"
                      max="100"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">Макс. использований (оставьте пустым для неограниченного)</label>
                    <input
                      type="number"
                      value={currentPromo.max_uses || ""}
                      onChange={(e) => setCurrentPromo({ ...currentPromo, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                      min="1"
                      placeholder="Без ограничений"
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    />
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <input
                      type="checkbox"
                      id="active"
                      checked={currentPromo.active}
                      onChange={(e) => setCurrentPromo({ ...currentPromo, active: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="active" className="text-sm font-semibold text-black cursor-pointer">Активен</label>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
                    <input
                      type="checkbox"
                      id="one_per_account"
                      checked={currentPromo.one_per_account || false}
                      onChange={(e) => setCurrentPromo({ ...currentPromo, one_per_account: e.target.checked })}
                      className="w-5 h-5 rounded border-2 border-blue-300 text-blue-500 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <label htmlFor="one_per_account" className="text-sm font-semibold text-blue-900 cursor-pointer block">
                        Один раз на один аккаунт
                      </label>
                      <p className="text-xs text-blue-700 mt-1">
                        Каждый игрок (по нику) сможет использовать промокод только один раз
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                  >
                    Сохранить
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-black mb-4">Удалить промокод?</h3>
                <p className="text-gray-700 mb-6">
                  Вы уверены, что хотите удалить промокод <strong>{currentPromo.code}</strong>? Это действие нельзя отменить.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
                  >
                    Удалить
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
                  >
                    Отмена
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function OrdersManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await ordersAPI.getAll();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">История заказов</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 px-4 font-bold text-black">ID</th>
              <th className="text-left py-3 px-4 font-bold text-black">Игрок</th>
              <th className="text-left py-3 px-4 font-bold text-black">Товар</th>
              <th className="text-left py-3 px-4 font-bold text-black">Сумма</th>
              <th className="text-left py-3 px-4 font-bold text-black">Кэшбек</th>
              <th className="text-left py-3 px-4 font-bold text-black">Дата</th>
              <th className="text-left py-3 px-4 font-bold text-black">Статус</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">
                  #{order.id}
                  {order.test_mode && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                      <i className="fas fa-flask mr-1"></i>
                      ТЕСТ
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 font-semibold text-black">{order.username}</td>
                <td className="py-3 px-4 text-gray-700">{order.product_name}</td>
                <td className="py-3 px-4 font-semibold text-black">{order.final_price} ₽</td>
                <td className="py-3 px-4">
                  <span className="text-orange-600 font-semibold">
                    <i className="fas fa-gift mr-1"></i>
                    {order.cashback_amount || 0} коинов
                  </span>
                  {order.cashback_percent > 0 && (
                    <span className="text-xs text-gray-500 ml-1">({order.cashback_percent}%)</span>
                  )}
                </td>
                <td className="py-3 px-4 text-gray-600 text-sm">{new Date(order.created_at).toLocaleString('ru-RU')}</td>
                <td className="py-3 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${order.status === "completed" ? "bg-green-100 text-green-700" : order.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                    {order.status === "completed" ? "Завершен" : order.status === "pending" ? "Обработка" : "Отменен"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
function SettingsManager() {
  const [settings, setSettings] = useState({
    cashback: 5,
    online_max: 5000,
    test_mode: false,
    cashback_command: "eco give %player% %cashback_amount%",
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingsAPI.get();
      setSettings({
        ...data,
        cashback_command: data.cashback_command || "eco give %player% %cashback_amount%"
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsAPI.update(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-black mb-6">
        <i className="fas fa-cog mr-2"></i>
        Настройки сайта
      </h2>

      <div className="space-y-6">
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            <i className="fas fa-percentage mr-2 text-orange-500"></i>
            Кэшбек
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Процент кэшбека в коинах, который получают игроки от покупок
          </p>
          <div className="flex items-center gap-4">
            <input
              type="number"
              min="0"
              max="100"
              value={settings.cashback}
              onChange={(e) => setSettings({ ...settings, cashback: parseInt(e.target.value) || 0 })}
              className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black w-32"
            />
            <span className="text-gray-700 font-semibold">%</span>
            <div className="flex-1 bg-gray-100 rounded-xl p-3">
              <p className="text-sm text-gray-600">
                Пример: при покупке на 1000 ₽ игрок получит <span className="font-bold text-orange-500">{settings.cashback * 10} коинов</span> кэшбека
              </p>
            </div>
          </div>
        </div>
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            <i className="fas fa-users mr-2 text-orange-500"></i>
            Максимальный онлайн
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Максимальное количество игроков для отображения в шапке сайта
          </p>
          <input
            type="number"
            min="0"
            value={settings.online_max}
            onChange={(e) => setSettings({ ...settings, online_max: parseInt(e.target.value) || 0 })}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black w-48"
          />
        </div>
        <div className="border-2 border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            <i className="fas fa-terminal mr-2 text-orange-500"></i>
            Команда выдачи кэшбэка
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Команда, которая будет выполняться для начисления кэшбэка игроку после покупки
          </p>
          <textarea
            placeholder="eco give %player% %cashback_amount%"
            value={settings.cashback_command || ""}
            onChange={(e) => setSettings({ ...settings, cashback_command: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black font-mono text-sm"
            rows={3}
          />
          <p className="text-xs text-gray-600 mt-2">
            <strong>Доступные плейсхолдеры для команды кэшбека:</strong><br/>
            <strong className="text-orange-600">Основные:</strong><br/>
            • <code className="bg-gray-100 px-1 rounded">%player%</code> - никнейм игрока<br/>
            • <code className="bg-gray-100 px-1 rounded">%product_name%</code> - название товара<br/>
            • <code className="bg-gray-100 px-1 rounded">%product_type%</code> - тип товара (donation/item)<br/>
            <strong className="text-orange-600 mt-1 inline-block">Кэшбек:</strong><br/>
            • <code className="bg-gray-100 px-1 rounded">%cashback_amount%</code> - сумма кэшбэка в коинах<br/>
            • <code className="bg-gray-100 px-1 rounded">%cashback_percent%</code> - процент кэшбэка<br/>
            <strong className="text-orange-600 mt-1 inline-block">Цены:</strong><br/>
            • <code className="bg-gray-100 px-1 rounded">%order_price%</code> - итоговая сумма заказа<br/>
            • <code className="bg-gray-100 px-1 rounded">%discount_amount%</code> - сумма скидки<br/>
            <strong className="text-orange-600 mt-1 inline-block">Дополнительно:</strong><br/>
            • <code className="bg-gray-100 px-1 rounded">%order_id%</code> - ID заказа<br/>
            • <code className="bg-gray-100 px-1 rounded">%mode%</code> - режим сервера<br/>
            • <code className="bg-gray-100 px-1 rounded">%promocode%</code> - использованный промокод<br/>
            • <code className="bg-gray-100 px-1 rounded">%quantity%</code> - количество (для предметов)<br/>
            • <code className="bg-gray-100 px-1 rounded">%duration%</code> - длительность (для донатов)
          </p>
        </div>
        <div className="border-2 border-orange-300 bg-orange-50 rounded-xl p-6">
          <h3 className="text-lg font-bold text-black mb-4">
            <i className="fas fa-flask mr-2 text-orange-500"></i>
            Тестовый режим
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            В тестовом режиме покупки создаются без реальной оплаты для проверки работы плагина выдачи
          </p>
          <label className="flex items-center gap-3 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={settings.test_mode}
              onChange={(e) => setSettings({ ...settings, test_mode: e.target.checked })}
              className="w-6 h-6 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <span className="text-black font-semibold">
              {settings.test_mode ? (
                <span className="text-orange-600">
                  <i className="fas fa-check-circle mr-2"></i>
                  Тестовый режим ВКЛЮЧЕН
                </span>
              ) : (
                <span>
                  Включить тестовый режим
                </span>
              )}
            </span>
          </label>
          {settings.test_mode && (
            <div className="mt-4 p-3 bg-orange-100 border-2 border-orange-300 rounded-lg">
              <p className="text-sm text-orange-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                <strong>Внимание:</strong> В тестовом режиме все покупки на сайте будут создаваться автоматически без оплаты!
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-8 py-3 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Сохранение...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                Сохранить настройки
              </>
            )}
          </button>
          
          {saved && (
            <div className="flex items-center gap-2 text-green-600 font-semibold animate-fadeIn">
              <i className="fas fa-check-circle"></i>
              Настройки успешно сохранены!
            </div>
          )}
        </div>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <i className="fas fa-info-circle mr-2"></i>
            <strong>Важно:</strong> После изменения настроек обновите главную страницу, чтобы увидеть изменения.
          </p>
        </div>
      </div>
    </div>
  );
}

