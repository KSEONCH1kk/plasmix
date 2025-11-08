"use client";

import { useState, useEffect } from "react";
import { useProducts } from "@/app/hooks/useProducts";
import { usePromocode } from "@/app/hooks/usePromocode";
import { useOrder } from "@/app/hooks/useOrder";
import { useCategories } from "@/app/hooks/useCategories";
import { useModes } from "@/app/hooks/useModes";
import { bannersAPI, Banner } from "@/app/lib/api";

export default function Home() {
  const [selectedServer, setSelectedServer] = useState<"lite" | "classic">("lite");
  const [selectedCategory, setSelectedCategory] = useState<string>("privileges");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactsModalOpen, setIsContactsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [purchaseStep, setPurchaseStep] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState<"1month" | "3months" | "forever">("3months");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "coins">("card");
  const [quantity, setQuantity] = useState(1);
  const [showPromoCode, setShowPromoCode] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");


  const [siteSettings, setSiteSettings] = useState({
    cashback: 5,
    online_max: 5000,
    test_mode: false,
  });

 
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);


  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000); 

      return () => clearInterval(interval);
    }
  }, [banners.length]);


  const [serverOnline, setServerOnline] = useState({
    online: 0,
    max: 5000,
  });


  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await fetch('http://77.90.33.66:8000/api/settings').then(r => r.json());
        setSiteSettings(settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };

    const fetchBanners = async () => {
      try {
        const bannersData = await bannersAPI.getAll(true);
        setBanners(bannersData);
      } catch (error) {
        console.error('Error loading banners:', error);
      }
    };

    fetchSettings();
    fetchBanners();
  }, []);
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
  const { modes, loading: modesLoading } = useModes();
  const { products: apiProducts, loading: productsLoading } = useProducts(selectedServer, selectedCategory);
  const { categories: apiCategories, loading: categoriesLoading } = useCategories(selectedServer);
  const { validatePromocode, loading: promoLoading } = usePromocode();
  const { createOrder, loading: orderLoading } = useOrder();
  useEffect(() => {
    if (modes.length === 1) {
      setSelectedServer(modes[0].slug as "lite" | "classic");
    }
  }, [modes]);

  const durationPrices = {
    "1month": { multiplier: 1, bonus: "+2400 Коинов" },
    "3months": { multiplier: 3, bonus: "+6000 Коинов" },
    "forever": { multiplier: 6, bonus: "+12000 Коинов" }
  };

  const openModal = (product: any) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
    setPurchaseStep(1);
    setQuantity(1);
    setSelectedDuration("3months");
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPurchaseStep(1);
    setUsername("");
    setEmail("");
    setQuantity(1);
    setSelectedDuration("3months");
    setShowPromoCode(false);
    setPromoCode("");
    setPromoApplied(false);
    setPromoDiscount(0);
  };

  const getProductPrice = (product: any) => {
    if (typeof product.price === 'number') {
      return product.price;
    }
    return parseInt(product.price.replace(/\s/g, '').replace('₽', ''));
  };

  const validateUsername = (value: string): boolean => {
    setUsernameError("");
    
    if (!value || value.length < 3) {
      setUsernameError("Никнейм должен быть не менее 3 символов");
      return false;
    }
    
    if (value.length > 16) {
      setUsernameError("Никнейм должен быть не более 16 символов");
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      setUsernameError("Никнейм может содержать только английские буквы, цифры и _");
      return false;
    }
    
    return true;
  };

  const validateEmail = (value: string): boolean => {
    setEmailError("");
    
    if (!value) {
      setEmailError("Email обязателен");
      return false;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      setEmailError("Введите корректный email");
      return false;
    }
    
    return true;
  };

  const applyPromoCode = async () => {
    const result = await validatePromocode(promoCode, username);
    if (result && result.valid) {
      setPromoApplied(true);
      setPromoDiscount(result.discount);
    } else {
      alert("Промокод не найден или недействителен");
      setPromoApplied(false);
      setPromoDiscount(0);
    }
  };

  const calculateFinalPrice = () => {
    let basePrice = selectedProduct.features && selectedProduct.features.length > 0 
      ? getProductPrice(selectedProduct) * durationPrices[selectedDuration].multiplier 
      : getProductPrice(selectedProduct) * quantity;
    
    if (promoApplied && promoDiscount > 0) {
      basePrice = Math.round(basePrice * (1 - promoDiscount / 100));
    }
    
    return basePrice;
  };

  const copyIPToClipboard = () => {
    navigator.clipboard.writeText("plasmix.su");
    alert("IP скопирован в буфер обмена!");
  };
  const currentProducts = apiProducts;
  const categories = apiCategories;

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
                  <span className="absolute bottom-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, #FFD700 0%, #FFA500 100%)" }}></span>
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
            <a href="/" className="text-sm font-medium text-black pb-1 whitespace-nowrap" style={{ borderBottom: '2px solid transparent', borderImage: 'linear-gradient(90deg, #FFD700 0%, #FFA500 100%) 1' }}>
              Главная
            </a>
            <a href="/tops" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
              Топы
            </a>
            <a href="/games" className="text-sm font-medium text-gray-600 hover:text-black transition-colors whitespace-nowrap">
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
      <main className="flex-1 mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 w-full">
        {banners.length > 0 && (
          <div className="mb-8 relative">
            <div className="rounded-3xl overflow-hidden shadow-lg">
              {banners[currentBannerIndex].link ? (
                <a
                  href={banners[currentBannerIndex].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block cursor-pointer"
                >
                  <img
                    src={banners[currentBannerIndex].image_url}
                    alt={`Banner ${currentBannerIndex + 1}`}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/1400x300";
                    }}
                  />
                </a>
              ) : (
                <div
                  className="cursor-pointer"
                  onClick={() => {
                    if (banners.length > 1) {
                      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
                    }
                  }}
                >
                  <img
                    src={banners[currentBannerIndex].image_url}
                    alt={`Banner ${currentBannerIndex + 1}`}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://placehold.co/1400x300";
                    }}
                  />
                </div>
              )}
            </div>
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentBannerIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentBannerIndex
                        ? "bg-orange-500 w-8"
                        : "bg-white bg-opacity-50 hover:bg-opacity-75"
                    }`}
                    aria-label={`Go to banner ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-64 flex-shrink-0 space-y-6">
            {modes.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-3">Выберите режим</h3>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedServer(mode.slug as "lite" | "classic")}
                      className={`w-full flex flex-col lg:flex-row items-center justify-center gap-3 lg:gap-6 px-3 lg:px-4 py-3 rounded-2xl font-semibold transition-all shadow-md ${
                        selectedServer === mode.slug
                          ? "text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      style={selectedServer === mode.slug ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
                    >
                      {mode.image && (
                        <img src={mode.image} alt={mode.name} className="w-12 h-9 lg:w-16 lg:h-12 rounded object-cover" />
                      )}
                      <div className="flex flex-col items-center text-center">
                        <span className="text-sm lg:text-base">{mode.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Категории</h3>
              <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex space-x-2 min-w-max">
                  {categoriesLoading ? (
                    <div className="flex items-center justify-center py-4 w-full">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  ) : (
                    categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.category_id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all shadow-sm whitespace-nowrap ${
                          selectedCategory === category.category_id
                            ? "text-white shadow-md"
                            : "bg-orange-50 text-gray-700"
                        }`}
                        style={selectedCategory === category.category_id ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
                      >
                        <i className={`fas ${category.icon} text-sm`}></i>
                        <span className="text-sm">{category.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="hidden lg:block space-y-2">
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.category_id)}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-semibold transition-all shadow-sm ${
                        selectedCategory === category.category_id
                          ? "text-white shadow-md"
                          : "bg-orange-50 text-gray-700 hover:bg-orange-100"
                      }`}
                      style={selectedCategory === category.category_id ? { background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" } : {}}
                    >
                      <span className="text-sm">{category.name}</span>
                      <i className={`fas ${category.icon}`}></i>
                    </button>
                  ))
                )}
              </div>
            </div>
          </aside>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black">
                {categories.find((c) => c.category_id === selectedCategory)?.name || "Привилегии"}
              </h2>
            </div>
            {productsLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : (
            <>
            {selectedCategory === "privileges" ? (
              <div className="rounded-3xl overflow-hidden" style={{
                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                padding: "3px"
              }}>
                <div className="bg-white rounded-3xl overflow-hidden p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {currentProducts.length === 0 && (
                      <div className="col-span-full text-center py-10 text-gray-500">
                        Нет доступных привилегий для этого режима
                      </div>
                    )}
                    {currentProducts.map((product) => {
                      return (
                          <div key={product.id} className="flex flex-col">
                            <div className="flex items-center justify-center py-8 px-4">
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-40 h-40 object-contain"
                              />
                            </div>
                            <div className="text-center px-4 pb-4">
                              <h3 className="text-2xl font-bold text-black mb-2">{product.name}</h3>
                              <p className="text-gray-500 text-sm mb-4">{product.chat_prefix}</p>
                            </div>
                            <div className="text-center px-4 pb-4">
                              {product.old_price && (
                                <p className="text-red-500 line-through text-lg">{product.old_price} ₽</p>
                              )}
                              <p className="text-black text-3xl font-bold">{product.price} ₽</p>
                            </div>
                            <div className="px-4 pb-4">
                              <button 
                                onClick={() => openModal(product)}
                                className="w-full py-3 rounded-xl font-bold text-white transition-all"
                                style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                              >
                                <i className="fas fa-shopping-cart mr-2"></i>
                                КУПИТЬ
                              </button>
                            </div>
                            {product.features && product.features.length > 0 && (
                              <div className="px-4 pb-6 flex-grow">
                                <div className="border-t border-gray-300 pt-4 space-y-3">
                                  {product.features.map((feature, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-sm py-2 border-b border-gray-200">
                                      <span className="text-gray-700 flex-1">{feature.name}</span>
                                      <span className="ml-4">
                                        {feature.enabled ? (
                                          <i className="fas fa-check-circle text-green-500 text-lg"></i>
                                        ) : feature.disabled ? (
                                          <i className="fas fa-times-circle text-red-500 text-lg"></i>
                                        ) : feature.value ? (
                                          <span className="text-black font-semibold">{feature.value}</span>
                                        ) : null}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="px-4 pb-4 mt-auto">
                              <button 
                                onClick={() => openModal(product)}
                                className="w-full py-3 rounded-xl font-bold text-white transition-all"
                                style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                              >
                                <i className="fas fa-shopping-cart mr-2"></i>
                                КУПИТЬ
                              </button>
                            </div>
                          </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {currentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden"
                  >
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center aspect-square">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-black mb-3">{product.name}</h3>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs text-gray-400 mb-1">От</p>
                          <p className="text-xl font-bold text-black">{product.price} ₽</p>
                        </div>
                        <button 
                          onClick={() => openModal(product)}
                          className="px-3 py-1.5 text-white rounded-lg font-semibold transition-colors text-xs whitespace-nowrap" 
                          style={{ backgroundColor: "#FFA500" }}
                        >
                          Купить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </>
            )}
          </div>
        </div>
      </main>
      {isModalOpen && selectedProduct && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fadeIn"
          style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            backdropFilter: "blur(8px)"
          }}
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative animate-slideUp shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl z-10 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              <div className="bg-orange-50 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-24 h-24 object-contain rounded-xl"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-black mb-1">
                      {selectedProduct.features && selectedProduct.features.length > 0 
                        ? `${selectedProduct.name}:` 
                        : selectedProduct.name}
                    </h2>
                    {selectedProduct.features && selectedProduct.features.length > 0 && (
                      <p className="text-xl font-semibold text-orange-900">
                        {selectedDuration === "1month" && "1 месяц"}
                        {selectedDuration === "3months" && "3 месяца"}
                        {selectedDuration === "forever" && "Навсегда"}
                      </p>
                    )}
                  </div>
                </div>

                {selectedProduct.features && selectedProduct.features.length > 0 ? (
                  <>
                    <div className="bg-white rounded-xl p-4 mb-4">
                      <h3 className="font-bold text-orange-900 mb-3">Важно:</h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>Привилегия {selectedProduct.name} активируется автоматически после оплаты</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>Убедитесь, что указали правильный никнейм игрока</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-orange-600 mt-1">•</span>
                          <span>При возникновении проблем обратитесь в поддержку сервера</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                      <h3 className="font-bold text-orange-900 mb-3">Описание:</h3>
                      <p className="text-sm text-gray-700 mb-3">
                        Привилегия {selectedProduct.name} дает вам следующие возможности:
                      </p>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {selectedProduct.features.slice(0, 5).map((feature: any, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <i className="fas fa-check text-green-500 mt-1"></i>
                            <span>{feature.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-xl p-4">
                    <h3 className="font-bold text-orange-900 mb-3">Важно:</h3>
                    <ul className="space-y-2 text-sm text-gray-700 mb-4">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Товар будет доставлен автоматически после оплаты</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>Убедитесь, что указали правильный никнейм игрока</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>При возникновении проблем обратитесь в поддержку</span>
                      </li>
                    </ul>
                    <h3 className="font-bold text-orange-900 mb-3">Описание:</h3>
                    <p className="text-sm text-gray-700">
                      {selectedProduct.name} - отличный выбор для улучшения вашего игрового опыта на сервере Plasmix!
                    </p>
                  </div>
                )}
              </div>
              <div>
                {siteSettings.test_mode && (
                  <div className="mb-4 p-2 sm:p-3 bg-orange-100 border-2 border-orange-400 rounded-xl">
                    <p className="text-xs sm:text-sm text-orange-800 font-semibold text-center">
                      <i className="fas fa-flask mr-1 sm:mr-2"></i>
                      ТЕСТОВЫЙ РЕЖИМ - Оплата не требуется
                    </p>
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-orange-900 mb-2">
                  Шаг {purchaseStep}
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  {purchaseStep === 1 && "Выберите позицию"}
                  {purchaseStep === 2 && "Заполните поля"}
                  {purchaseStep === 3 && "Выберите способ оплаты"}
                </p>
                {purchaseStep === 1 && (
                  <div className="space-y-4">
                    {(!selectedProduct.features || selectedProduct.features.length === 0) && (
                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-black mb-3">Количество</label>
                        <div className="flex items-center gap-2 sm:gap-4">
                          <button
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors font-bold text-lg sm:text-xl text-black flex items-center justify-center"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="flex-1 text-center px-2 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none font-bold text-lg sm:text-xl text-black"
                            min="1"
                          />
                          <button
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-200 hover:bg-gray-300 transition-colors font-bold text-lg sm:text-xl text-black flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm text-black text-center">
                            Итого: <span className="font-bold text-black">{getProductPrice(selectedProduct) * quantity} ₽</span>
                          </p>
                          <div className="p-3 bg-orange-50 border-2 border-orange-200 rounded-xl">
                            <p className="text-xs sm:text-sm text-orange-800 text-center">
                              <i className="fas fa-gift mr-1 sm:mr-2"></i>
                              <strong>Кэшбек:</strong> {Math.round(getProductPrice(selectedProduct) * quantity * siteSettings.cashback / 100)} коинов ({siteSettings.cashback}%)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    {selectedProduct.features && selectedProduct.features.length > 0 && (
                      <>
                    <button
                      onClick={() => setSelectedDuration("1month")}
                      className={`w-full p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                        selectedDuration === "1month"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedDuration === "1month" ? "border-orange-500" : "border-gray-300"
                          }`}>
                            {selectedDuration === "1month" && (
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-black text-sm sm:text-base">1 месяц</p>
                            <p className="text-xs sm:text-sm text-gray-600">{getProductPrice(selectedProduct) * durationPrices["1month"].multiplier} ₽</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-semibold text-orange-600">
                            <i className="fas fa-gift mr-1"></i>
                            {Math.round(getProductPrice(selectedProduct) * durationPrices["1month"].multiplier * siteSettings.cashback / 100)}
                          </p>
                          <p className="text-xs text-gray-600 hidden sm:block">коинов ({siteSettings.cashback}%)</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedDuration("3months")}
                      className={`w-full p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                        selectedDuration === "3months"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedDuration === "3months" ? "border-orange-500" : "border-gray-300"
                          }`}>
                            {selectedDuration === "3months" && (
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-black text-sm sm:text-base">3 месяца</p>
                            <p className="text-xs sm:text-sm text-gray-600">{getProductPrice(selectedProduct) * durationPrices["3months"].multiplier} ₽</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-semibold text-orange-600">
                            <i className="fas fa-gift mr-1"></i>
                            {Math.round(getProductPrice(selectedProduct) * durationPrices["3months"].multiplier * siteSettings.cashback / 100)}
                          </p>
                          <p className="text-xs text-gray-600 hidden sm:block">коинов ({siteSettings.cashback}%)</p>
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setSelectedDuration("forever")}
                      className={`w-full p-3 sm:p-4 rounded-2xl border-2 transition-all ${
                        selectedDuration === "forever"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                            selectedDuration === "forever" ? "border-orange-500" : "border-gray-300"
                          }`}>
                            {selectedDuration === "forever" && (
                              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-orange-500"></div>
                            )}
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-black text-sm sm:text-base">Навсегда</p>
                            <p className="text-xs sm:text-sm text-gray-600">{getProductPrice(selectedProduct) * durationPrices["forever"].multiplier} ₽</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm font-semibold text-orange-600">
                            <i className="fas fa-gift mr-1"></i>
                            {Math.round(getProductPrice(selectedProduct) * durationPrices["forever"].multiplier * siteSettings.cashback / 100)}
                          </p>
                          <p className="text-xs text-gray-600 hidden sm:block">коинов ({siteSettings.cashback}%)</p>
                        </div>
                      </div>
                    </button>

                      </>
                    )}

                    <button
                      onClick={() => setPurchaseStep(2)}
                      className="w-full py-4 rounded-xl font-bold text-white transition-all mt-6"
                      style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                    >
                      Продолжить
                    </button>
                  </div>
                )}
                {purchaseStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Никнейм <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (e.target.value) validateUsername(e.target.value);
                        }}
                        onBlur={(e) => validateUsername(e.target.value)}
                        placeholder="nick"
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-black ${
                          usernameError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                        }`}
                      />
                      {usernameError && (
                        <p className="text-red-500 text-sm mt-1">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {usernameError}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Только английские буквы, цифры и _ (3-16 символов)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Электронная почта <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (e.target.value) validateEmail(e.target.value);
                        }}
                        onBlur={(e) => validateEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className={`w-full px-4 py-3 rounded-xl border-2 focus:outline-none text-black ${
                          emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-orange-500'
                        }`}
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1">
                          <i className="fas fa-exclamation-circle mr-1"></i>
                          {emailError}
                        </p>
                      )}
                    </div>

                    <button 
                      onClick={() => setShowPromoCode(!showPromoCode)}
                      className="text-sm text-orange-600 hover:underline inline-block"
                    >
                      У меня есть промокод
                    </button>

                    {showPromoCode && (
                      <div className="mt-4 p-3 sm:p-4 bg-orange-50 rounded-xl border-2 border-orange-200">
                        <label className="block text-sm font-semibold text-black mb-2">Промокод</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            placeholder="Введите промокод"
                            className="flex-1 min-w-0 px-3 sm:px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-orange-500 focus:outline-none text-black text-sm sm:text-base"
                            disabled={promoApplied}
                          />
                          {!promoApplied ? (
                            <button
                              onClick={applyPromoCode}
                              disabled={promoLoading}
                              className="flex-shrink-0 w-10 sm:w-auto sm:px-4 py-2 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                              style={{ backgroundColor: "#FFA500" }}
                            >
                              {promoLoading ? (
                                <i className="fas fa-spinner fa-spin"></i>
                              ) : (
                                <>
                                  <i className="fas fa-check"></i>
                                  <span className="hidden sm:inline sm:ml-2">Применить</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setPromoApplied(false);
                                setPromoDiscount(0);
                                setPromoCode("");
                              }}
                              className="flex-shrink-0 w-10 sm:w-auto sm:px-4 py-2 rounded-xl font-semibold text-white bg-red-500 hover:bg-red-600 transition-all shadow-md hover:shadow-lg"
                            >
                              <i className="fas fa-times"></i>
                              <span className="hidden sm:inline sm:ml-2">Удалить</span>
                            </button>
                          )}
                        </div>
                        {promoApplied && (
                          <p className="text-xs sm:text-sm text-green-600 font-semibold mt-2">
                            <i className="fas fa-check-circle mr-1"></i>
                            Промокод применен! Скидка {promoDiscount}%
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setPurchaseStep(1)}
                        className="flex-1 py-4 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all"
                      >
                        Назад
                      </button>
                      <button
                        onClick={() => {
                          const isUsernameValid = validateUsername(username);
                          const isEmailValid = validateEmail(email);
                          
                          if (isUsernameValid && isEmailValid) {
                            setPurchaseStep(3);
                          }
                        }}
                        disabled={!username || !email}
                        className="flex-1 py-4 rounded-xl font-bold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                      >
                        Продолжить
                      </button>
                    </div>
                  </div>
                )}
                {purchaseStep === 3 && (
                  <div className="space-y-4">
                    <button
                      onClick={() => setPaymentMethod("card")}
                      className={`w-full p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === "card"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "card" ? "border-orange-500" : "border-gray-300"
                        }`}>
                          {paymentMethod === "card" && (
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          )}
                        </div>
                        <i className="fas fa-credit-card text-2xl text-orange-600"></i>
                        <span className="font-bold text-black">Банковская карта</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setPaymentMethod("coins")}
                      className={`w-full p-4 rounded-2xl border-2 transition-all ${
                        paymentMethod === "coins"
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 bg-white hover:border-orange-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "coins" ? "border-orange-500" : "border-gray-300"
                        }`}>
                          {paymentMethod === "coins" && (
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          )}
                        </div>
                        <i className="fas fa-coins text-2xl text-orange-600"></i>
                        <span className="font-bold text-black">Оплата Коинами</span>
                      </div>
                    </button>

                    <button
                      onClick={async () => {
                        const finalPrice = calculateFinalPrice();
                        const cashbackAmount = Math.round(finalPrice * siteSettings.cashback / 100);
                        
                        const orderData = {
                          username,
                          email: email || undefined,
                          product_type: selectedProduct.features && selectedProduct.features.length > 0 ? 'donation' : 'item',
                          product_id: selectedProduct.id,
                          product_name: selectedProduct.name,
                          quantity: selectedProduct.features && selectedProduct.features.length > 0 ? 1 : quantity,
                          duration: selectedProduct.features && selectedProduct.features.length > 0 ? selectedDuration : undefined,
                          price: getProductPrice(selectedProduct),
                          final_price: finalPrice,
                          promocode: promoApplied ? promoCode : undefined,
                          discount_amount: promoApplied ? (getProductPrice(selectedProduct) * (selectedProduct.features && selectedProduct.features.length > 0 ? durationPrices[selectedDuration].multiplier : quantity) - finalPrice) : 0,
                          payment_method: paymentMethod,
                          mode: selectedServer,
                          cashback_amount: cashbackAmount,
                          cashback_percent: siteSettings.cashback,
                          test_mode: siteSettings.test_mode,
                          command: selectedProduct.command || undefined,
                        };

                        const order = await createOrder(orderData);
                        if (order) {
                          if (paymentMethod === 'card') {
                            try {
                              const response = await fetch('http://77.90.33.66:8000/api/robokassa/generate-payment-link', {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ order_id: order.id }),
                              });
                              
                              if (response.ok) {
                                const data = await response.json();
                                window.location.href = data.payment_url;
                              } else {
                                alert("Ошибка при создании ссылки на оплату. Попробуйте снова.");
                              }
                            } catch (error) {
                              console.error('Error generating payment link:', error);
                              alert("Ошибка при создании ссылки на оплату. Попробуйте снова.");
                            }
                          } else {
                            if (siteSettings.test_mode) {
                              alert(`[ТЕСТ] Покупка оформлена! Номер заказа: ${order.id}\nЭто тестовый заказ без оплаты.\nВы получили ${cashbackAmount} коинов кэшбека!`);
                            } else {
                              alert(`Покупка оформлена! Номер заказа: ${order.id}\nВы получили ${cashbackAmount} коинов кэшбека!`);
                            }
                            closeModal();
                          }
                        } else {
                          alert("Ошибка при оформлении заказа. Попробуйте снова.");
                        }
                      }}
                      disabled={orderLoading || !username}
                      className="w-full py-4 rounded-xl font-bold text-white transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)" }}
                    >
                      {orderLoading ? (
                        <span>
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                          Оформление...
                        </span>
                      ) : promoApplied && promoDiscount > 0 ? (
                        <span>
                          Купить за <span className="line-through opacity-70">{selectedProduct.features && selectedProduct.features.length > 0 
                            ? getProductPrice(selectedProduct) * durationPrices[selectedDuration].multiplier 
                            : getProductPrice(selectedProduct) * quantity} ₽</span> {calculateFinalPrice()} ₽
                        </span>
                      ) : (
                        <span>Купить за {calculateFinalPrice()} ₽</span>
                      )}
                    </button>
                    <div className="mt-4 p-3 bg-orange-50 border-2 border-orange-200 rounded-xl">
                      <p className="text-sm text-orange-800 text-center">
                        <i className="fas fa-gift mr-2"></i>
                        <strong>Кэшбек {siteSettings.cashback}%:</strong> Вы получите {Math.round(calculateFinalPrice() * siteSettings.cashback / 100)} коинов на баланс!
                      </p>
                    </div>

                    <p className="text-xs text-center text-gray-500 mt-4">
                      Продолжая Вы автоматически соглашаетесь с{" "}
                      <a href="#" className="text-orange-600 hover:underline">пользовательским соглашением</a>,{" "}
                      <a href="#" className="text-orange-600 hover:underline">лицензионным договором</a>,{" "}
                      <a href="#" className="text-orange-600 hover:underline">политикой конфиденциальности</a>
                    </p>

                    <button
                      onClick={() => setPurchaseStep(2)}
                      className="w-full py-3 rounded-xl font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all mt-4"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Назад
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
                  <div className="font-bold text-black">ВКонтакте</div>
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
