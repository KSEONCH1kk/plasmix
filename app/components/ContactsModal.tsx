"use client";

interface ContactsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactsModal({ isOpen, onClose }: ContactsModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-black">Связаться с нами</h3>
          <button
            onClick={onClose}
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
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-black font-semibold transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}

