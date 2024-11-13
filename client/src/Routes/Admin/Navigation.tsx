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
		<div className="admin-navigation">
			<div className="nav-title">INSTAMINE</div>

			<div
				className={`nav-items ${
					location.pathname === "/" ? "active" : ""
				}`}
				data-label="DASHBOARD"
			>
				<Link to="/">
					<FontAwesomeIcon icon={faChartLine} className="nav-icon" />
					<div>DASHBOARD</div>
				</Link>
			</div>

			<div
				className={`nav-items ${
					location.pathname === "/users" ? "active" : ""
				}`}
				data-label="USERS"
			>
				<Link to="/users">
					<FontAwesomeIcon icon={faUsers} className="nav-icon" />
					<div>USERS</div>
				</Link>
			</div>

			<div
				className={`nav-items ${
					location.pathname === "/orders" ? "active" : ""
				}`}
				data-label="ORDERS"
			>
				<Link to="/orders">
					<FontAwesomeIcon
						icon={faShoppingCart}
						className="nav-icon"
					/>
					<div>ORDERS</div>
				</Link>
			</div>

			<div
				className={`nav-items ${
					location.pathname === "/complete-orders" ? "active" : ""
				}`}
				data-label="COMPLETED ORDERS"
			>
				<Link to="/complete-orders">
					<FontAwesomeIcon
						icon={faCheckSquare}
						className="nav-icon"
					/>
					<div>COMPLETED ORDERS</div>
				</Link>
			</div>

			<div
				className={`nav-items ${
					location.pathname === "/product-list" ? "active" : ""
				}`}
				data-label="PRODUCTS"
			>
				<Link to="/product-list">
					<FontAwesomeIcon icon={faBoxOpen} className="nav-icon" />
					<div>PRODUCTS</div>
				</Link>
			</div>

			<div
				className={`nav-items ${
					location.pathname === "/logout" ? "active" : ""
				}`}
				data-label="LOGOUT"
			>
				<Link to="/logout">
					<FontAwesomeIcon icon={faSignOutAlt} className="nav-icon" />
					<div>LOGOUT</div>
				</Link>
			</div>
		</div>
	);
}
