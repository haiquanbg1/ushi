import { useState } from 'react';

export default function Navbar({ user, onLogin, onRegister, onLogout }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="bg-white shadow-lg fixed w-full z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <h1 className="text-2xl font-bold text-orange-600">Delicious</h1>
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#home" className="text-gray-700 hover:text-orange-600 px-3 py-2 transition-colors">
                            Trang chủ
                        </a>
                        <a href="#menu" className="text-gray-700 hover:text-orange-600 px-3 py-2 transition-colors">
                            Thực đơn
                        </a>
                        <a href="#services" className="text-gray-700 hover:text-orange-600 px-3 py-2 transition-colors">
                            Dịch vụ
                        </a>
                        <a href="#contact" className="text-gray-700 hover:text-orange-600 px-3 py-2 transition-colors">
                            Liên hệ
                        </a>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700">Xin chào, {user.username}</span>
                                <button
                                    onClick={onLogout}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    Đăng xuất
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={onLogin}
                                    className="text-orange-600 hover:text-orange-700 px-3 py-2 transition-colors"
                                >
                                    Đăng nhập
                                </button>
                                <button
                                    onClick={onRegister}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    Đăng ký
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-700 hover:text-orange-600 focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                            <a href="#home" className="block px-3 py-2 text-gray-700 hover:text-orange-600">
                                Trang chủ
                            </a>
                            <a href="#menu" className="block px-3 py-2 text-gray-700 hover:text-orange-600">
                                Thực đơn
                            </a>
                            <a href="#services" className="block px-3 py-2 text-gray-700 hover:text-orange-600">
                                Dịch vụ
                            </a>
                            <a href="#contact" className="block px-3 py-2 text-gray-700 hover:text-orange-600">
                                Liên hệ
                            </a>

                            {user ? (
                                <div className="px-3 py-2">
                                    <p className="text-gray-700 mb-2">Xin chào, {user.username}</p>
                                    <button
                                        onClick={onLogout}
                                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md w-full"
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            ) : (
                                <div className="px-3 py-2 space-y-2">
                                    <button
                                        onClick={onLogin}
                                        className="text-orange-600 hover:text-orange-700 px-3 py-2 w-full text-left"
                                    >
                                        Đăng nhập
                                    </button>
                                    <button
                                        onClick={onRegister}
                                        className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md w-full"
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
