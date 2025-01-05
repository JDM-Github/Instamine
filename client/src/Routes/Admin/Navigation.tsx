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
			<div className="nav-title text-2xl font-bold text-pink-600 mb-6 text-center">
				INSTAMINE
			</div>
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/"
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
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
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
				}`}
				data-label="START LIVE"
			>
				<Link to="/stream" className="flex items-center gap-2">
					<FontAwesomeIcon icon={faCheckSquare} className="text-lg" />
					<div>START LIVE</div>
				</Link>
			</div>

			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/scheduled-stream"
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
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
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
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

			<hr className="my-4 border-pink-300" />
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/users"
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
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
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
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
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
				}`}
				data-label="DELIVERED ORDERS"
			>
				<Link
					to="/delievered-orders"
					className="flex items-center gap-2"
				>
					<FontAwesomeIcon
						icon={faShoppingCart}
						className="text-lg"
					/>
					<div>DELIVERED ORDERS</div>
				</Link>
			</div>
			<div
				className={`nav-items mb-2 p-1 px-3 rounded-lg ${
					location.pathname === "/complete-orders"
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
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
						? "bg-white text-pink-600"
						: "text-white hover:bg-pink-600"
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
