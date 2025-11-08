"use client";

import { useState, useEffect } from "react";
import { adminsAPI, Admin, AdminPermissions } from "@/app/lib/api";

export default function AdminsManager({ currentAdmin }: { currentAdmin: Admin | null }) {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isClosingAdd, setIsClosingAdd] = useState(false);
  const [isClosingEdit, setIsClosingEdit] = useState(false);
  const [currentEditAdmin, setCurrentEditAdmin] = useState<Admin | null>(null);
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "moderator",
    permissions: {
      view_stats: false,
      manage_promo: false,
      manage_donations: false,
      manage_items: false,
      manage_orders: false,
      manage_categories: false,
      manage_modes: false,
      manage_game_modes: false,
      manage_settings: false,
      manage_admins: false,
    }
  });
  const [editPermissions, setEditPermissions] = useState<AdminPermissions>({});
  const [editRole, setEditRole] = useState<string>("moderator");
  const [editActive, setEditActive] = useState<boolean>(true);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await adminsAPI.getAll();
      setAdmins(data);
    } catch (error) {
      alert("Ошибка загрузки админов");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const closeAddModal = () => {
    setIsClosingAdd(true);
    setTimeout(() => {
      setShowAddModal(false);
      setIsClosingAdd(false);
    }, 300);
  };

  const closeEditModal = () => {
    setIsClosingEdit(true);
    setTimeout(() => {
      setShowEditModal(false);
      setIsClosingEdit(false);
      setCurrentEditAdmin(null);
    }, 300);
  };

  const handleAddAdmin = async () => {
    if (!newAdmin.username || !newAdmin.password) {
      alert("Заполните все обязательные поля");
      return;
    }

    try {
      setLoading(true);
      await adminsAPI.create({
        username: newAdmin.username,
        password: newAdmin.password,
        role: newAdmin.role,
        permissions: newAdmin.role === "moderator" ? newAdmin.permissions : undefined
      });
      
      closeAddModal();
      setNewAdmin({
        username: "",
        password: "",
        role: "moderator",
        permissions: {
          view_stats: false,
          manage_promo: false,
          manage_donations: false,
          manage_items: false,
          manage_orders: false,
          manage_categories: false,
          manage_modes: false,
          manage_game_modes: false,
          manage_settings: false,
          manage_admins: false,
        }
      });
      
      setTimeout(() => fetchAdmins(), 300);
    } catch (error: any) {
      alert(error.message || "Ошибка создания админа");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAdmin = async () => {
    if (!currentEditAdmin) return;

    try {
      setLoading(true);
      await adminsAPI.update(currentEditAdmin.id, {
        is_active: editActive,
        role: editRole,
        permissions: editRole === "moderator" ? editPermissions : undefined
      });
      
      closeEditModal();
      setTimeout(() => fetchAdmins(), 300);
    } catch (error: any) {
      alert(error.message || "Ошибка обновления админа");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этого админа?")) return;

    try {
      setLoading(true);
      await adminsAPI.delete(id);
      fetchAdmins();
    } catch (error: any) {
      alert(error.message || "Ошибка удаления админа");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (admin: Admin) => {
    setCurrentEditAdmin(admin);
    setEditRole(admin.role);
    setEditActive(admin.is_active);
    setEditPermissions(admin.permissions || {
      view_stats: false,
      manage_promo: false,
      manage_donations: false,
      manage_items: false,
      manage_orders: false,
      manage_categories: false,
      manage_modes: false,
      manage_game_modes: false,
      manage_settings: false,
      manage_admins: false,
    });
    setShowEditModal(true);
  };

  const permissionLabels: { [key: string]: string } = {
    view_stats: "Просмотр статистики",
    manage_promo: "Управление промокодами",
    manage_donations: "Управление донатами",
    manage_items: "Управление предметами",
    manage_orders: "Управление заказами",
    manage_categories: "Управление категориями",
    manage_modes: "Управление режимами (серверы)",
    manage_game_modes: "Управление игровыми режимами",
    manage_settings: "Управление настройками",
    manage_admins: "Управление админами",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black">Управление админами</h2>
          <p className="text-gray-600 mt-1">Добавляйте модераторов с разными правами доступа</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить админа
        </button>
      </div>
      <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl">
        <div className="flex items-center gap-3">
          <i className="fas fa-user-shield text-2xl text-blue-600"></i>
          <div>
            <p className="font-semibold text-blue-900">Вы вошли как: {currentAdmin?.username}</p>
            <p className="text-sm text-blue-700">
              Роль: {currentAdmin?.role === 'super_admin' ? 'Супер-администратор' : 'Модератор'}
            </p>
          </div>
        </div>
      </div>
      {loading && admins.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        </div>
      ) : (
        <div className="grid gap-4">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="p-6 border-2 border-gray-200 rounded-xl hover:border-orange-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 w-full">
                  <div className="flex items-center gap-3">
                    <i className={`fas ${admin.role === 'super_admin' ? 'fa-crown' : 'fa-user'} text-2xl ${admin.role === 'super_admin' ? 'text-yellow-500' : 'text-gray-500'}`}></i>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-black">{admin.username}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          admin.role === 'super_admin' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {admin.role === 'super_admin' ? 'Супер-администратор' : 'Модератор'}
                        </span>
                        <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                          admin.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.is_active ? 'Активен' : 'Заблокирован'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {admin.role === 'moderator' && admin.permissions && Object.values(admin.permissions).some(v => v) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(admin.permissions).map(([key, value]) => (
                        value && (
                          <span key={key} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            <i className="fas fa-check text-green-600 mr-1"></i>
                            {permissionLabels[key]}
                          </span>
                        )
                      ))}
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-500 mt-2">
                    Создан: {new Date(admin.created_at).toLocaleString('ru-RU')}
                  </p>
                </div>
                {currentAdmin?.id !== admin.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(admin)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                      title="Редактировать"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteAdmin(admin.id)}
                      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
                      title="Удалить"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {showAddModal && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
            isClosingAdd ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onClick={closeAddModal}
        >
          <div 
            className={`bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
              isClosingAdd ? 'animate-slideDown' : 'animate-slideUp'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-black mb-6">Добавить нового админа</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Имя пользователя *
                </label>
                <input
                  type="text"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-black"
                  placeholder="admin_username"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Пароль *
                </label>
                <input
                  type="password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-black"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Роль *
                </label>
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-black"
                >
                  <option value="moderator">Модератор</option>
                  <option value="super_admin">Супер-администратор</option>
                </select>
              </div>
              {newAdmin.role === "moderator" && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">
                    Права доступа
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(permissionLabels).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={newAdmin.permissions[key as keyof AdminPermissions] || false}
                          onChange={(e) => setNewAdmin({
                            ...newAdmin,
                            permissions: {
                              ...newAdmin.permissions,
                              [key]: e.target.checked
                            }
                          })}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-black">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleAddAdmin}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Создание...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Создать админа
                  </>
                )}
              </button>
              <button
                onClick={closeAddModal}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && currentEditAdmin && (
        <div 
          className={`fixed inset-0 flex items-center justify-center z-50 p-4 ${
            isClosingEdit ? 'animate-fadeOut' : 'animate-fadeIn'
          }`}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}
          onClick={closeEditModal}
        >
          <div 
            className={`bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
              isClosingEdit ? 'animate-slideDown' : 'animate-slideUp'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-black mb-6">
              Редактировать: {currentEditAdmin.username}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl cursor-pointer hover:border-orange-300 transition-colors">
                  <input
                    type="checkbox"
                    checked={editActive}
                    onChange={(e) => setEditActive(e.target.checked)}
                    className="w-6 h-6 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-black font-semibold">
                    {editActive ? (
                      <span className="text-green-600">
                        <i className="fas fa-check-circle mr-2"></i>
                        Аккаунт активен
                      </span>
                    ) : (
                      <span className="text-red-600">
                        <i className="fas fa-times-circle mr-2"></i>
                        Аккаунт заблокирован
                      </span>
                    )}
                  </span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">
                  Роль *
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-orange-500 focus:outline-none text-black"
                >
                  <option value="moderator">Модератор</option>
                  <option value="super_admin">Супер-администратор</option>
                </select>
              </div>
              {editRole === "moderator" && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-3">
                    Права доступа
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(permissionLabels).map(([key, label]) => (
                      <label key={key} className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-300 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={editPermissions[key as keyof AdminPermissions] || false}
                          onChange={(e) => setEditPermissions({
                            ...editPermissions,
                            [key]: e.target.checked
                          })}
                          className="w-5 h-5 rounded border-2 border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-black">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={handleEditAdmin}
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-xl text-white font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
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
                    Сохранить изменения
                  </>
                )}
              </button>
              <button
                onClick={closeEditModal}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
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

