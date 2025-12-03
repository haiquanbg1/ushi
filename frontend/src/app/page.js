'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';

// ==== Reusable horizontal Carousel with arrows ====
function Carousel({ children, ariaLabel, itemGap = 'gap-4', className = '' }) {
	const trackRef = useRef(null);
	const [hasPrev, setHasPrev] = useState(false);
	const [hasNext, setHasNext] = useState(false);

	const updateButtons = useCallback(() => {
		const el = trackRef.current;
		if (!el) return;
		const { scrollLeft, scrollWidth, clientWidth } = el;
		setHasPrev(scrollLeft > 4);
		setHasNext(scrollLeft + clientWidth < scrollWidth - 4);
	}, []);

	useEffect(() => {
		updateButtons();
		const el = trackRef.current;
		if (!el) return;
		const onScroll = () => updateButtons();
		el.addEventListener('scroll', onScroll, { passive: true });
		const onResize = () => updateButtons();
		window.addEventListener('resize', onResize);
		const ro = new ResizeObserver(updateButtons);
		ro.observe(el);
		return () => {
			el.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onResize);
			ro.disconnect();
		};
	}, [updateButtons]);

	const scrollByAmount = (dir) => {
		const el = trackRef.current;
		if (!el) return;
		const amount = Math.round(el.clientWidth * 0.9);
		el.scrollBy({ left: dir * amount, behavior: 'smooth' });
	};

	// Keyboard support on container
	const onKeyDown = (e) => {
		if (e.key === 'ArrowRight') scrollByAmount(1);
		if (e.key === 'ArrowLeft') scrollByAmount(-1);
	};

	return (
		<div className={`relative ${className}`}>
			{/* Left arrow */}
			<button
				type="button"
				aria-label="Cuộn sang trái"
				disabled={!hasPrev}
				onClick={() => scrollByAmount(-1)}
				className={`absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow
          backdrop-blur bg-white/80 hover:bg-white disabled:opacity-0 disabled:pointer-events-none
          border border-gray-200`}
			>
				<svg width="22" height="22" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
			</button>

			{/* Right arrow */}
			<button
				type="button"
				aria-label="Cuộn sang phải"
				disabled={!hasNext}
				onClick={() => scrollByAmount(1)}
				className={`absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 shadow
          backdrop-blur bg-white/80 hover:bg-white disabled:opacity-0 disabled:pointer-events-none
          border border-gray-200`}
			>
				<svg width="22" height="22" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
			</button>

			{/* Gradient edges for nicer fade */}
			<div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent dark:from-gray-900" />
			<div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-900" />

			{/* Scroll track */}
			<div
				ref={trackRef}
				role="region"
				aria-label={ariaLabel}
				tabIndex={0}
				onKeyDown={onKeyDown}
				className={`no-scrollbar overflow-x-auto scroll-smooth snap-x snap-mandatory ${itemGap} pr-2 pl-2`}
			>
				<div className={`flex ${itemGap}`}>
					{children}
				</div>
			</div>
		</div>
	);
}

export default function HomePage() {
	const { user, isAuthenticated, loading } = useAuth();
	const router = useRouter();
	const [mobileNavOpen, setMobileNavOpen] = useState(false);

	const featuredDishes = [
		{ id: 1, name: 'Phở Bò Đặc Biệt', image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=1000&fit=crop', price: '85,000 VNĐ', description: 'Phở truyền thống với thịt bò tươi ngon' },
		{ id: 2, name: 'Bánh Mì Thịt Nướng', image: 'https://images.unsplash.com/photo-1600454309261-3dc9b7597637?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dmlldG5hbWVzZSUyMGZvb2R8ZW58MHx8MHx8fDA%3D', price: '35,000 VNĐ', description: 'Bánh mì giòn tan với thịt nướng thơm lừng' },
		{ id: 3, name: 'Cơm Tấm Sườn Bì', image: 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=1000&fit=crop', price: '65,000 VNĐ', description: 'Cơm tấm truyền thống với sườn nướng' },
		{ id: 4, name: 'Bún Bò Huế', image: 'https://images.unsplash.com/photo-1597345637412-9fd611e758f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', price: '70,000 VNĐ', description: 'Bún bò Huế cay nồng đậm đà' },
		{ id: 5, name: 'Chả Cá Lã Vọng', image: 'https://images.unsplash.com/photo-1604908815461-8b2d29ba6670?w=1000&fit=crop', price: '120,000 VNĐ', description: 'Chả cá truyền thống Hà Nội' },
	];

	if (loading) {
		return (
			<div className="flex min-h-[100svh] items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
				<div className="text-center">
					<div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />
					<div className="text-base text-gray-700">Đang tải...</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[100svh] scroll-smooth">
			{/* Header */}
			<header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-md">
				<div className="mx-auto max-w-7xl px-4">
					<div className="relative flex h-16 items-center">
						{/* Logo bên trái */}
						<div className="flex items-center gap-2 z-10">
							<Link
								href="/"
								className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
							>
								Ushi Mania
							</Link>
						</div>

						{/* Nav luôn ở chính giữa */}
						<nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
							<a href="#hero" className="font-medium text-gray-700 hover:text-orange-600">Trang chủ</a>
							<a href="#promotions" className="font-medium text-gray-700 hover:text-orange-600">Ưu đãi</a>
							<a href="#featured" className="font-medium text-gray-700 hover:text-orange-600">Món nổi bật</a>
							<a href="#contact" className="font-medium text-gray-700 hover:text-orange-600">Liên hệ</a>
						</nav>

						{/* Đăng nhập / Đăng ký hoặc Xin chào ... bên phải */}
						<div className="hidden md:flex items-center gap-3 ml-auto z-10">
							{/* render gì thì tuỳ, hoặc để trống cũng không ảnh hưởng tới nav */}
							{/* ví dụ ẩn luôn: */}
							{/* <></> */}
						</div>

						{/* Nút menu mobile */}
						<button
							className="ml-auto rounded-md p-2 hover:bg-gray-100 md:hidden"
							onClick={() => setMobileNavOpen((v) => !v)}
							aria-label="Mở menu"
						>
							<svg className="h-6 w-6 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
								<path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
							</svg>
						</button>
					</div>

					{mobileNavOpen && (
						<div className="pb-3 md:hidden">
							<nav className="grid gap-1">
								{[
									{ href: '#hero', label: 'Trang chủ' },
									{ href: '#promotions', label: 'Ưu đãi' },
									{ href: '#featured', label: 'Món nổi bật' },
									{ href: '#contact', label: 'Liên hệ' },
								].map((i) => (
									<a key={i.href} href={i.href} className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100" onClick={() => setMobileNavOpen(false)}>
										{i.label}
									</a>
								))}
							</nav>

							<div className="mt-2 flex items-center gap-2">
								{/* {isAuthenticated && user ? (
									<>
										<span className="text-gray-700">Xin chào, <b>{user.name}</b></span>
										<button className="ml-auto rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700">Đăng xuất</button>
									</>
								) : (
									<>
										<Link href="/login" className="flex-1 rounded-md border px-3 py-2 text-center text-sm text-gray-700">Đăng nhập</Link>
										<Link href="/register" className="flex-1 rounded-md bg-gradient-to-r from-orange-600 to-red-600 px-3 py-2 text-center text-sm text-white">Đăng ký</Link>
									</>
								)} */}
							</div>
						</div>
					)}
				</div>
			</header>

			{/* Hero */}
			<section id="hero" className="relative isolate">
				<div
					className="absolute inset-0 -z-10 bg-cover bg-center"
					style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&fit=crop")' }}
					aria-hidden
				/>
				<div className="absolute inset-0 -z-10 bg-black/50" aria-hidden />
				<div className="mx-auto max-w-7xl px-4 py-16 sm:py-20 lg:py-28">
					<div className="text-center text-white">
						<h1 className="text-4xl font-extrabold leading-tight sm:text-6xl">
							Hương vị
							<span className="block bg-gradient-to-r from-orange-300 to-red-300 bg-clip-text text-transparent">Việt Nam</span>
						</h1>
						<p className="mx-auto mt-4 max-w-2xl text-base text-gray-200 sm:text-lg">
							Khám phá tinh hoa ẩm thực Việt Nam với những món ăn truyền thống từ nguyên liệu tươi ngon nhất.
						</p>
						{/* <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
							<Link href="/menu" className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-6 py-3 text-center text-white sm:w-auto">Xem Thực Đơn</Link>
						</div> */}
					</div>
				</div>
			</section>

			{/* Promotions (Carousel) */}
			<section id="promotions" className="bg-gradient-to-br from-orange-50 to-red-50">
				<div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
					<div className="text-center">
						<h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent sm:text-4xl">Ưu Đãi Đặc Biệt</h2>
						<p className="mx-auto mt-2 max-w-xl text-gray-600">Những chương trình khuyến mãi hấp dẫn dành riêng cho bạn.</p>
					</div>

					<Carousel ariaLabel="Ưu đãi nổi bật" className="mt-8">
						{[
							{
								icon: '🎉',
								title: 'Giảm 20%',
								sub: 'Khách hàng mới',
								desc: 'Giảm 20% tổng hóa đơn cho đơn đầu tiên.',
								badge: 'Mã: WELCOME20',
								bg: 'from-orange-500 to-red-500',
								badgeBg: 'bg-orange-100 text-orange-700',
							},
							{
								icon: '🍜',
								title: 'Combo Gia Đình',
								sub: 'Tiết kiệm 30%',
								desc: 'Combo 4–6 người. Giá từ 299,000 VNĐ.',
								badge: 'T2 – T6',
								bg: 'from-green-500 to-teal-500',
								badgeBg: 'bg-green-100 text-green-700',
							},
							{
								icon: '🎂',
								title: 'Sinh Nhật',
								sub: 'Miễn phí bánh',
								desc: 'Tặng bánh cho tiệc từ 8 người.',
								badge: 'Đặt trước 1 ngày',
								bg: 'from-purple-500 to-pink-500',
								badgeBg: 'bg-purple-100 text-purple-700',
							},
							{
								icon: '🥤',
								title: 'Giờ Vàng',
								sub: '15:00–17:00',
								desc: 'Mua 2 tặng 1 đồ uống.',
								badge: 'T2 – T6',
								bg: 'from-sky-500 to-blue-600',
								badgeBg: 'bg-sky-100 text-sky-700',
							},
						].map((p, idx) => (
							<div
								key={idx}
								className="snap-start shrink-0 w-[86%] sm:w-[60%] md:w-[48%] lg:w-[32%] xl:w-[28%] overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
							>
								<div className={`bg-gradient-to-r ${p.bg} p-5 text-center text-white`}>
									<div className="mb-1 text-3xl">{p.icon}</div>
									<h3 className="text-xl font-bold">{p.title}</h3>
									<p className="text-white/80">{p.sub}</p>
								</div>
								<div className="p-5">
									<p className="text-gray-600">{p.desc}</p>
									<div className="mt-3 text-center">
										<span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${p.badgeBg}`}>{p.badge}</span>
									</div>
								</div>
							</div>
						))}
					</Carousel>
				</div>
			</section>

			{/* Featured dishes (Carousel) */}
			<section id="featured" className="bg-white">
				<div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
					<div className="text-center">
						<h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent sm:text-4xl">Món Ăn Nổi Bật</h2>
						<p className="mx-auto mt-2 max-w-xl text-gray-600">Những món ăn được yêu thích nhất tại nhà hàng chúng tôi.</p>
					</div>

					<Carousel ariaLabel="Món nổi bật" className="mt-8">
						{featuredDishes.map((dish) => (
							<div
								key={dish.id}
								className="snap-start shrink-0 w-[86%] sm:w-[60%] md:w-[48%] lg:w-[32%] xl:w-[28%] overflow-hidden rounded-2xl bg-white shadow transition hover:-translate-y-1 hover:shadow-lg"
							>
								<div className="relative aspect-[4/3] overflow-hidden">
									<img
										src={dish.image}
										alt={dish.name}
										className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
										loading="lazy"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition group-hover:opacity-100" />
								</div>
								<div className="p-5">
									<h3 className="text-lg font-semibold text-gray-800 hover:text-orange-600">{dish.name}</h3>
									<p className="mt-1 line-clamp-2 text-sm text-gray-500">{dish.description}</p>
									<div className="mt-3 flex items-center justify-between">
										<p className="text-xl font-bold text-orange-600">{dish.price}</p>
										{/* <button className="rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-4 py-2 text-sm font-semibold text-white hover:from-orange-700 hover:to-red-700">
											Đặt Món
										</button> */}
									</div>
								</div>
							</div>
						))}
					</Carousel>

					{/* CTA mobile */}
					{/* <div className="mt-8 flex gap-3 sm:hidden">
						<Link href="/menu" className="flex-1 rounded-lg bg-gray-100 px-4 py-3 text-center font-medium text-gray-800">Xem thực đơn</Link>
						<Link href="/booking" className="flex-1 rounded-lg bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 text-center font-medium text-white">Đặt bàn</Link>
					</div> */}
				</div>
			</section>

			{/* Footer / Contact */}
			<footer id="contact" className="bg-gradient-to-br from-gray-900 to-gray-800 text-white">
				<div className="mx-auto max-w-7xl px-4 py-14 sm:py-16">
					<div className="text-center mb-10">
						<h2 className="text-2xl sm:text-3xl font-bold">Liên Hệ Với Chúng Tôi</h2>
						<p className="mx-auto mt-2 max-w-xl text-gray-300 text-sm sm:text-base">
							Hãy đến và trải nghiệm hương vị đặc biệt tại nhà hàng của chúng tôi.
						</p>
					</div>

					{/* 3 info items in one row */}
					<div className="flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-4">
						{/* Địa chỉ */}
						<div className="flex-1 text-center">
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-red-500">
								<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold">Địa Chỉ</h3>
							<p className="mt-1 text-gray-300 text-sm">
								123 Phố Cổ, Hoàn Kiếm<br />Hà Nội, Việt Nam<br />10000
							</p>
						</div>

						{/* Liên hệ */}
						<div className="flex-1 text-center">
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-green-500 to-teal-500">
								<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
							</div>
							<h3 className="text-lg font-semibold">Liên Hệ</h3>
							<p className="mt-1 text-gray-300 text-sm">
								Điện thoại: (024) 3826-xxxx<br />
								Email: info@nhahangviet.vn<br />
								Hotline: 1900-xxxx
							</p>
						</div>

						{/* Giờ mở cửa */}
						<div className="flex-1 text-center">
							<div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
								<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold">Giờ Mở Cửa</h3>
							<p className="mt-1 text-gray-300 text-sm">
								Thứ 2 – Chủ Nhật<br />
								10:00 – 22:00<br />
								Phục vụ cả ngày
							</p>
						</div>
					</div>

					{/* Footer bottom */}
					<div className="mt-10 border-t border-white/10 pt-6 text-center">
						<p className="text-xs text-gray-400">© 2024 Nhà Hàng Việt. Tất cả quyền được bảo lưu.</p>
					</div>
				</div>
			</footer>

			{/* Hide default scrollbar for horizontal lists */}
			<style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
		</div>
	);
}
