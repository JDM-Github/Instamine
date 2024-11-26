import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard.tsx";
import Navigation from "./Navigation.tsx";

import "./AdminRoute.scss";
import AdminLogin from "./LoginPage.tsx";
import Users from "./Users.tsx";
import Copyright from "../../Component/Copyright.tsx";
import Orders from "./Orders.tsx";
import ProductList from "./Products.tsx";
import TopBar from "../../Component/TopBar.tsx";
import Chats from "./Chats.tsx";
import { ToastContainer } from "react-toastify";
import AdminLivestream from "./StartStream.tsx";
import DelieveredOrders from "./DelieveredOrder.tsx";
import CompletedOrders from "./CompleteOrder.tsx";
import Login from "./Login.tsx";

export default function AdminRoute({ className }) {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	return (
		<>
			{!isLoggedIn ? (
				<Login onLogin={() => setIsLoggedIn(true)} />
			) : (
				<div className="admin">
					<Navigation />
					<div className="admin-content">
						<TopBar clickHandler={undefined} />
						<Routes>
							<Route index path="/" element={<Dashboard />} />
							<Route path="/login" element={<AdminLogin />} />
							<Route
								path="/stream"
								element={<AdminLivestream />}
							/>
							<Route path="/users" element={<Users />} />
							<Route path="/orders" element={<Orders />} />
							<Route
								path="/delievered-orders"
								element={<DelieveredOrders />}
							/>
							<Route
								path="/complete-orders"
								element={<CompletedOrders />}
							/>
							<Route
								path="/product-list"
								element={<ProductList />}
							/>
						</Routes>
						<Copyright />
						<Chats />
					</div>
					<ToastContainer />
				</div>
			)}
		</>
	);
}
