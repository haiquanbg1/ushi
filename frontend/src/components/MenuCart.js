import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';

const MenuCard = ({ item, onAdd }) => {
    const [isAdding, setIsAdding] = useState(false);

    const handleAdd = () => {
        setIsAdding(true);
        onAdd(item);
        setTimeout(() => setIsAdding(false), 300);
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="relative h-48 bg-gradient-to-br from-orange-100 to-red-100 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl opacity-20">🍽️</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <h3 className="text-white font-bold text-lg">{item.name}</h3>
                </div>
            </div>
            <div className="p-4">
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-orange-600">
                        {item.price.toLocaleString('vi-VN')}₫
                    </span>
                    <button
                        onClick={handleAdd}
                        className={`bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${isAdding ? 'scale-95' : 'hover:scale-105'
                            }`}
                    >
                        <ShoppingCart size={18} />
                        Thêm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MenuCard;