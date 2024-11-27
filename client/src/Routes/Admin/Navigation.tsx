import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faChartLine,
	faUsers,
	faShoppingCart,
	faBoxOpen,
	faSignOutAlt,
	faCheckSquare,
} from "@fortawesome/free-solid-svg-icons";
import "./Navigation.scss";

export default function Navigation() {
	const location = useLocation();

	return (
		<div className="admin-navigation bg-pink-100 h-full min-h-screen w-64 flex flex-col p-4 z-50">
			{/* Title */}
			<div className="nav-title text-2xl font-bold text-pink-600 mb-6 text-center">
				INSTAMINE
			</div>
			{/* Navigation Items */}
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="DASHBOARD"
			>
				<Link to="/" className="flex items-center gap-2">
					<FontAwesomeIcon icon={faChartLine} className="text-lg" />
					<div>DASHBOARD</div>
				</Link>
			</div>
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/stream"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="START LIVE"
			>
				<Link to="/stream" className="flex items-center gap-2">
					<FontAwesomeIcon icon={faCheckSquare} className="text-lg" />
					<div>START LIVE</div>
				</Link>
			</div>

			{/* CompletedLive */}
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/scheduled-stream"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="SCHEDULED LIVE"
			>
				<Link
					to="/scheduled-stream"
					className="flex items-center gap-2"
				>
					<FontAwesomeIcon icon={faCheckSquare} className="text-lg" />
					<div>SCHEDULED LIVE</div>
				</Link>
			</div>
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/completed-stream"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="COMPLETED LIVE"
			>
				<Link
					to="/completed-stream"
					className="flex items-center gap-2"
				>
					<FontAwesomeIcon icon={faCheckSquare} className="text-lg" />
					<div>COMPLETED LIVE</div>
				</Link>
			</div>

			{/* Divider */}
			<hr className="my-4 border-pink-300" />
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/users"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="USERS"
			>
				<Link to="/users" className="flex items-center gap-2">
					<FontAwesomeIcon icon={faUsers} className="text-lg" />
					<div>USERS</div>
				</Link>
			</div>
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/orders"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="ORDERS"
			>
				<Link to="/orders" className="flex items-center gap-2">
					<FontAwesomeIcon
						icon={faShoppingCart}
						className="text-lg"
					/>
					<div>ORDERS</div>
				</Link>
			</div>
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/delievered-orders"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="DELIEVERED ORDERS"
			>
				<Link
					to="/delievered-orders"
					className="flex items-center gap-2"
				>
					<FontAwesomeIcon
						icon={faShoppingCart}
						className="text-lg"
					/>
					<div>DELIEVERED ORDERS</div>
				</Link>
			</div>
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/complete-orders"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="COMPLETED ORDERS"
			>
				<Link to="/complete-orders" className="flex items-center gap-2">
					<FontAwesomeIcon icon={faCheckSquare} className="text-lg" />
					<div>COMPLETED ORDERS</div>
				</Link>
			</div>
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/product-list"
						? "bg-pink-500 text-white"
						: "hover:bg-pink-200"
				}`}
				data-label="PRODUCTS"
			>
				<Link to="/product-list" className="flex items-center gap-2">
					<FontAwesomeIcon icon={faBoxOpen} className="text-lg" />
					<div>PRODUCTS</div>
				</Link>
			</div>
		</div>
	);
}
