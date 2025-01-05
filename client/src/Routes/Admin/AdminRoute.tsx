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
import ScheduleLivestream from "./ScheduleLive.tsx";
import CompletedLive from "./CompletedLive.tsx";

export default function AdminRoute({ className }) {
	const [isLoggedIn, setIsLoggedIn] = useState(true);
	const [openModal, setOpenModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [users, setUsers] = useState<any>([]);

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
							<Route
								path="/scheduled-stream"
								element={<ScheduleLivestream />}
							/>
							<Route
								path="/completed-stream"
								element={<CompletedLive />}
							/>
							<Route
								path="/users"
								element={
									<Users
										setOpenModal={setOpenModal}
										setSelectedUser={setSelectedUser}
									/>
								}
							/>
							<Route
								path="/orders"
								element={
									<Orders
										setOpenModal={setOpenModal}
										setSelectedUser={setSelectedUser}
									/>
								}
							/>
							<Route
								path="/delievered-orders"
								element={
									<DelieveredOrders
										setOpenModal={setOpenModal}
										setSelectedUser={setSelectedUser}
									/>
								}
							/>
							<Route
								path="/complete-orders"
								element={
									<CompletedOrders
										setOpenModal={setOpenModal}
										setSelectedUser={setSelectedUser}
									/>
								}
							/>
							<Route
								path="/product-list"
								element={<ProductList />}
							/>
						</Routes>
						<Chats
							setOpenModal={setOpenModal}
							setSelectedUser={setSelectedUser}
							openModal={openModal}
							selectedUser={selectedUser}
							setUsers={setUsers}
							users={users}
						/>
					</div>
					<ToastContainer />
				</div>
			)}
		</>
	);
}
