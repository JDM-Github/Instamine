import React from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard.tsx";
import Navigation from "./Navigation.tsx";

import "./AdminRoute.scss";
import AdminLogin from "./LoginPage.tsx";
import Users from "./Users.tsx";
import Copyright from "../../Component/Copyright.tsx";
import Orders from "./Orders.tsx";
import ProductList from "./Products.tsx";
import CompleteOrders from "./CompleteOrder.tsx";
import TopBar from "../../Component/TopBar.tsx";
import Chats from "./Chats.tsx";
import { ToastContainer } from "react-toastify";

export default function AdminRoute({ className }) {
	return (
		<div className="admin">
			<Navigation />
			<div className="admin-content">
				<TopBar clickHandler={undefined} />
				<Routes>
					<Route index path="/" element={<Dashboard />} />
					<Route index path="/login" element={<AdminLogin />} />
					<Route index path="/users" element={<Users />} />
					<Route index path="/orders" element={<Orders />} />
					<Route
						index
						path="/complete-orders"
						element={<CompleteOrders />}
					/>
					<Route
						index
						path="/product-list"
						element={<ProductList />}
					/>
				</Routes>
				<Copyright />
				<Chats />
			</div>
			<ToastContainer />
		</div>
	);
}
