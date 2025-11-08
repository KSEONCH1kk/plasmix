"use client";

import { useState, useEffect } from 'react';
import { gameModesAPI, GameMode, GameModeCreate, GameModeUpdate } from '@/app/lib/api';

export default function GameModesManager() {
  const [gameModes, setGameModes] = useState<GameMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [editingMode, setEditingMode] = useState<GameMode | null>(null);
  const [formData, setFormData] = useState<GameModeCreate>({
    title: '',
    description: '',
    features: [],
    image: '',
    status: 'Работает',
    video_url: '',
    order: 0,
    active: true,
  });
  const [currentFeature, setCurrentFeature] = useState('');

  useEffect(() => {
    fetchGameModes();
  }, []);

  const fetchGameModes = async () => {
    try {
      setLoading(true);
      const modes = await gameModesAPI.getAll(true);
      console.log('Loaded game modes:', modes);
      setGameModes(modes);
    } catch (error) {
      console.error('Error fetching game modes:', error);
      alert('Ошибка загрузки режимов: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (mode?: GameMode) => {
    if (mode) {
      setEditingMode(mode);
      setFormData({
        title: mode.title,
        description: mode.description,
        features: mode.features || [],
        image: mode.image || '',
        status: mode.status,
        video_url: mode.video_url || '',
        order: mode.order,
        active: mode.active,
      });
    } else {
      setEditingMode(null);
      setFormData({
        title: '',
        description: '',
        features: [],
        image: '',
        status: 'Работает',
        video_url: '',
        order: gameModes.length,
        active: true,
      });
    }
    setCurrentFeature('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalOpen(false);
      setIsClosing(false);
      setEditingMode(null);
    }, 300);
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData({
        ...formData,
        features: [...(formData.features || []), currentFeature.trim()]
      });
      setCurrentFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMode) {
        await gameModesAPI.update(editingMode.id, formData);
        alert('Режим успешно обновлён');
      } else {
        await gameModesAPI.create(formData);
        alert('Режим успешно создан');
      }
      closeModal();
      fetchGameModes();
    } catch (error) {
      console.error('Error saving game mode:', error);
      alert('Ошибка сохранения режима');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот режим?')) return;
    
    try {
      await gameModesAPI.delete(id);
      alert('Режим успешно удалён');
      fetchGameModes();
    } catch (error) {
      console.error('Error deleting game mode:', error);
      alert('Ошибка удаления режима');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'order') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-black">Игровые режимы</h2>
        <button
          onClick={() => openModal()}
          className="px-6 py-3 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
        >
          <i className="fas fa-plus mr-2"></i>
          Добавить режим
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : gameModes.length === 0 ? (
        <div className="text-center py-20">
          <i className="fas fa-gamepad text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">Режимы не найдены. Добавьте новый режим.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gameModes.map((mode) => (
            <div key={mode.id} className="bg-white rounded-2xl shadow-md overflow-hidden border-2 border-gray-200 hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={mode.image || 'https://placehold.co/600x400/2F4F4F/FFFFFF?text=No+Image'} 
                  alt={mode.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 flex gap-2">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    mode.status === "Работает" 
                      ? "bg-green-500 text-white" 
                      : "bg-orange-500 text-white"
                  }`}>
                    {mode.status}
                  </span>
                  {!mode.active && (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-500 text-white">
                      Неактивен
                    </span>
                  )}
                </div>
                <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                  #{mode.order}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold text-black mb-2">{mode.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{mode.description}</p>
                
                <div className="flex items-center gap-3 mb-4 text-sm text-gray-600 flex-wrap">
                  {mode.video_url ? (
                    <span className="flex items-center gap-1 text-green-600">
                      <i className="fas fa-video"></i>
                      Видео есть
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400">
                      <i className="fas fa-video-slash"></i>
                      Без видео
                    </span>
                  )}
                  {mode.features && mode.features.length > 0 && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <i className="fas fa-list-check"></i>
                      {mode.features.length} {mode.features.length === 1 ? 'особенность' : mode.features.length < 5 ? 'особенности' : 'особенностей'}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(mode)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
                  >
                    <i className="fas fa-edit mr-2"></i>
                    Изменить
                  </button>
                  <button
                    onClick={() => handleDelete(mode.id)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors"
                  >
                    <i className="fas fa-trash mr-2"></i>
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {isModalOpen && (
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
            className={`bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${
              isClosing ? 'animate-slideDown' : 'animate-slideUp'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-black">
                  {editingMode ? 'Редактировать режим' : 'Добавить режим'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Название *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    placeholder="Отряды"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Описание *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black resize-none"
                    placeholder="Создай собственный отряд и сокруши всех врагов"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Особенности
                  </label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={currentFeature}
                        onChange={(e) => setCurrentFeature(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                        placeholder="Введите особенность и нажмите +"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                    </div>
                    
                    {formData.features && formData.features.length > 0 && (
                      <div className="space-y-2 mt-3">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                            <i className="fas fa-check text-green-500"></i>
                            <span className="flex-1 text-black">{feature}</span>
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="text-red-500 hover:text-red-700 transition-colors"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    URL изображения
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    placeholder="https://example.com/image.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    Статус *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                  >
                    <option value="Работает">Работает</option>
                    <option value="В разработке">В разработке</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-black mb-2">
                    URL видео (YouTube embed)
                  </label>
                  <input
                    type="text"
                    name="video_url"
                    value={formData.video_url}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-black mb-2">
                      Порядок отображения
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="active"
                        checked={formData.active}
                        onChange={handleChange}
                        className="w-5 h-5 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm font-semibold text-black">Режим активен</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
                    style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                  >
                    {editingMode ? 'Сохранить' : 'Создать'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Отмена
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

