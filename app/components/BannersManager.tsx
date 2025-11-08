"use client";

import { useState, useEffect } from "react";
import { bannersAPI, Banner, BannerCreate, BannerUpdate } from "@/app/lib/api";

export default function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState<BannerCreate>({
    image_url: "",
    link: "",
    order: 0,
    active: true,
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const data = await bannersAPI.getAll(false);
      setBanners(data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      alert("Ошибка загрузки баннеров");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        image_url: banner.image_url,
        link: banner.link || "",
        order: banner.order,
        active: banner.active,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        image_url: "",
        link: "",
        order: banners.length,
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setFormData({
      image_url: "",
      link: "",
      order: 0,
      active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingBanner) {
        await bannersAPI.update(editingBanner.id, formData as BannerUpdate);
        alert("Баннер успешно обновлен!");
      } else {
        await bannersAPI.create(formData);
        alert("Баннер успешно создан!");
      }
      closeModal();
      fetchBanners();
    } catch (error: any) {
      console.error("Error saving banner:", error);
      alert(error.message || "Ошибка сохранения баннера");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Вы уверены, что хотите удалить этот баннер?")) return;

    setLoading(true);
    try {
      await bannersAPI.delete(id);
      alert("Баннер успешно удален!");
      fetchBanners();
    } catch (error: any) {
      console.error("Error deleting banner:", error);
      alert(error.message || "Ошибка удаления баннера");
    } finally {
      setLoading(false);
    }
  };

  if (loading && banners.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">
          <i className="fas fa-image mr-2 text-orange-500"></i>
          Управление баннерами
        </h2>
        <button
          onClick={() => openModal()}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить баннер
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-2xl shadow-md overflow-hidden"
          >
            <div className="relative h-48">
              <img
                src={banner.image_url}
                alt="Banner"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/1400x300";
                }}
              />
              {!banner.active && (
                <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Неактивен
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="mb-3">
                <p className="text-sm text-gray-600">
                  <strong>Порядок:</strong> {banner.order}
                </p>
                {banner.link && (
                  <p className="text-sm text-gray-600 truncate">
                    <strong>Ссылка:</strong>{" "}
                    <a
                      href={banner.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:underline"
                    >
                      {banner.link}
                    </a>
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(banner)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  <i className="fas fa-edit mr-2"></i>
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(banner.id)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  <i className="fas fa-trash mr-2"></i>
                  Удалить
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && !loading && (
        <div className="text-center py-20 text-gray-500">
          <i className="fas fa-image text-6xl mb-4"></i>
          <p className="text-xl">Нет баннеров</p>
          <p className="text-sm">Добавьте первый баннер, нажав кнопку выше</p>
        </div>
      )}
      {isModalOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn"
          style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)"
          }}
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-black">
                {editingBanner ? "Редактировать баннер" : "Добавить баннер"}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-2">
                  URL изображения *
                </label>
                <input
                  type="url"
                  required
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>
              {formData.image_url && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-black mb-2">
                    Предпросмотр
                  </label>
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/1400x300";
                    }}
                  />
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-2">
                  Ссылка (необязательно)
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData({ ...formData, link: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  placeholder="https://example.com"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-black mb-2">
                  Порядок отображения
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Баннеры с меньшим номером будут показаны первыми
                </p>
              </div>
              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) =>
                      setFormData({ ...formData, active: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm font-semibold text-black">
                    Активный баннер
                  </span>
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-200 text-black rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "Сохранение..." : "Сохранить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

