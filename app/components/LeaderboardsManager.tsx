"use client";

import { useState, useEffect } from "react";
import { modesAPI } from "@/app/lib/api";
import type { Mode } from "@/app/lib/api";

interface Leaderboard {
  id: number;
  mode_id: number;
  title: string;
  icon: string | null;
  gradient: string | null;
  color: string | null;
  bg_light: string | null;
  order: number;
  db_table: string;
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;
  db_password: string;
  player_name_column: string;
  score_column: string;
  active: boolean;
}

interface LeaderboardFormData {
  mode_id: number | null;
  title: string;
  icon: string;
  gradient: string;
  color: string;
  bg_light: string;
  order: number;
  db_table: string;
  db_host: string;
  db_port: number;
  db_name: string;
  db_user: string;
  db_password: string;
  player_name_column: string;
  score_column: string;
  active: boolean;
}

export default function LeaderboardsManager() {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [modes, setModes] = useState<Mode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLeaderboard, setEditingLeaderboard] = useState<Leaderboard | null>(null);
  const [formData, setFormData] = useState<LeaderboardFormData>({
    mode_id: null,
    title: "",
    icon: "fa-crown",
    gradient: "linear-gradient(135deg, #90EE90 0%, #32CD32 100%)",
    color: "green",
    bg_light: "#f0f9ff",
    order: 0,
    db_table: "",
    db_host: "127.0.0.1",
    db_port: 3306,
    db_name: "",
    db_user: "",
    db_password: "",
    player_name_column: "player_name",
    score_column: "value",
    active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const modesData = await modesAPI.getAll();
      setModes(Array.isArray(modesData) ? modesData : []);
      const token = localStorage.getItem("access_token");
      const leaderboardsRes = await fetch("http://77.90.33.66:8000/api/leaderboards/admin/", {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      if (!leaderboardsRes.ok) {
        const errorText = await leaderboardsRes.text();
        console.error("Failed to fetch leaderboards:", errorText);
        throw new Error("Failed to fetch leaderboards");
      }
      const leaderboardsData = await leaderboardsRes.json();
      setLeaderboards(Array.isArray(leaderboardsData) ? leaderboardsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLeaderboards([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (leaderboard?: Leaderboard) => {
    if (leaderboard) {
      setEditingLeaderboard(leaderboard);
      setFormData({
        mode_id: leaderboard.mode_id,
        title: leaderboard.title,
        icon: leaderboard.icon || "fa-crown",
        gradient: leaderboard.gradient || "linear-gradient(135deg, #90EE90 0%, #32CD32 100%)",
        color: leaderboard.color || "green",
        bg_light: leaderboard.bg_light || "#f0f9ff",
        order: leaderboard.order,
        db_table: leaderboard.db_table,
        db_host: leaderboard.db_host,
        db_port: leaderboard.db_port,
        db_name: leaderboard.db_name,
        db_user: leaderboard.db_user,
        db_password: leaderboard.db_password,
        player_name_column: leaderboard.player_name_column,
        score_column: leaderboard.score_column,
        active: leaderboard.active,
      });
    } else {
      setEditingLeaderboard(null);
      setFormData({
        mode_id: modes[0]?.id || null,
        title: "",
        icon: "fa-crown",
        gradient: "linear-gradient(135deg, #90EE90 0%, #32CD32 100%)",
        color: "green",
        bg_light: "#f0f9ff",
        order: 0,
        db_table: "",
        db_host: "127.0.0.1",
        db_port: 3306,
        db_name: "",
        db_user: "",
        db_password: "",
        player_name_column: "namecache",
        score_column: "value",
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingLeaderboard(null);
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const url = editingLeaderboard
        ? `http://77.90.33.66:8000/api/leaderboards/admin/${editingLeaderboard.id}`
        : "http://77.90.33.66:8000/api/leaderboards/admin/";
      
      const response = await fetch(url, {
        method: editingLeaderboard ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchData();
        closeModal();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.detail || "Не удалось сохранить топ"}`);
      }
    } catch (error) {
      console.error("Error saving leaderboard:", error);
      alert("Ошибка при сохранении топа");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот топ?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://77.90.33.66:8000/api/leaderboards/admin/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        await fetchData();
      } else {
        alert("Ошибка при удалении топа");
      }
    } catch (error) {
      console.error("Error deleting leaderboard:", error);
      alert("Ошибка при удалении топа");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const getModeNameById = (modeId: number) => {
    return modes.find(m => m.id === modeId)?.name || "Неизвестный режим";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">Управление топами</h2>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить топ
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {leaderboards.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <i className="fas fa-trophy text-6xl mb-4 opacity-20"></i>
            <p>Топы еще не созданы. Нажмите "Добавить топ" чтобы начать.</p>
          </div>
        ) : leaderboards.map((leaderboard) => (
          <div
            key={leaderboard.id}
            className="border-2 border-gray-200 rounded-xl p-4 bg-white"
          >
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: leaderboard.gradient || undefined }}
              >
                <i className={`fas ${leaderboard.icon} text-white text-lg`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-black truncate">{leaderboard.title}</h3>
                <p className="text-xs text-gray-600">{getModeNameById(leaderboard.mode_id)}</p>
              </div>
            </div>

            <div className="space-y-1 mb-3 text-xs text-gray-600">
              <p>
                <i className="fas fa-database mr-1"></i>
                {leaderboard.db_table}
              </p>
              <p>
                <i className="fas fa-server mr-1"></i>
                {leaderboard.db_host}:{leaderboard.db_port}
              </p>
              <p>
                <i className="fas fa-sort mr-1"></i>
                Порядок: {leaderboard.order}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => openModal(leaderboard)}
                className="flex-1 px-3 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-edit mr-1"></i>
                Изменить
              </button>
              <button
                onClick={() => handleDelete(leaderboard.id)}
                className="flex-1 px-3 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
              >
                <i className="fas fa-trash mr-1"></i>
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(8px)" }}
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-black mb-6">
              {editingLeaderboard ? "Редактировать топ" : "Новый топ"}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Режим</label>
                <select
                  value={formData.mode_id || ""}
                  onChange={(e) => setFormData({ ...formData, mode_id: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                >
                  {modes.map((mode) => (
                    <option key={mode.id} value={mode.id}>
                      {mode.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Название топа</label>
                <input
                  type="text"
                  placeholder="Топ по убийствам"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Иконка (FontAwesome)</label>
                  <input
                    type="text"
                    placeholder="fa-crown"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Порядок</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Gradient (CSS)</label>
                <input
                  type="text"
                  placeholder="linear-gradient(135deg, #90EE90 0%, #32CD32 100%)"
                  value={formData.gradient}
                  onChange={(e) => setFormData({ ...formData, gradient: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Цвет</label>
                  <input
                    type="text"
                    placeholder="green"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">BG Light</label>
                  <input
                    type="text"
                    placeholder="#f0f9ff"
                    value={formData.bg_light}
                    onChange={(e) => setFormData({ ...formData, bg_light: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  />
                </div>
              </div>

              <hr className="my-4" />

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Таблица в БД</label>
                <input
                  type="text"
                  placeholder="ajlb_statistic_player_kills"
                  value={formData.db_table}
                  onChange={(e) => setFormData({ ...formData, db_table: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Хост БД</label>
                  <input
                    type="text"
                    placeholder="127.0.0.1"
                    value={formData.db_host}
                    onChange={(e) => setFormData({ ...formData, db_host: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Порт БД</label>
                  <input
                    type="number"
                    value={formData.db_port}
                    onChange={(e) => setFormData({ ...formData, db_port: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black mb-2">Имя БД</label>
                <input
                  type="text"
                  placeholder="aj"
                  value={formData.db_name}
                  onChange={(e) => setFormData({ ...formData, db_name: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Пользователь БД</label>
                  <input
                    type="text"
                    value={formData.db_user}
                    onChange={(e) => setFormData({ ...formData, db_user: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Пароль БД</label>
                  <input
                    type="password"
                    value={formData.db_password}
                    onChange={(e) => setFormData({ ...formData, db_password: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Колонка с именем игрока
                  </label>
                  <input
                    type="text"
                    value={formData.player_name_column}
                    onChange={(e) => setFormData({ ...formData, player_name_column: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    placeholder="namecache"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Колонка с очками
                  </label>
                  <input
                    type="text"
                    value={formData.score_column}
                    onChange={(e) => setFormData({ ...formData, score_column: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    placeholder="value"
                  />
                </div>
              </div>

              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 mr-3 accent-orange-500"
                />
                <span className="text-black font-semibold">Активен</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
              >
                Сохранить
              </button>
              <button
                onClick={closeModal}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-500 hover:bg-gray-600 text-white font-semibold transition-colors"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

