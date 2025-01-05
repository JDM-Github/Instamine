import React, { useEffect, useState } from "react";
// import "./SCSS/Chats.scss";
import { toast } from "react-toastify";
import RequestHandler from "../../Functions/RequestHandler";

function Modal({ user, setSelectedUser }) {
	const [message, setMessage] = useState("");
	const [chatHistory, setChatHistory] = useState<any>([]);

	const getChatHistory = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"chats/retrieve-chat",
				{ userId: "1", partnerId: user.partnerId }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				setChatHistory(data.messages);
			}
		} catch (error) {
			toast.error(`An error occurred while archiving data. ${error}`);
		}
	};

	useEffect(() => {
		getChatHistory();
	}, []);

	const sendChats = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"chats/message",
				{
					userId: "1",
					partnerId: user.partnerId,
					message: message,
				}
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				getChatHistory();
			}
		} catch (error) {
			toast.error(`An error occurred while archiving data. ${error}`);
		}
	};

	const handleSendMessage = () => {
		if (message.trim()) {
			sendChats();
			setMessage("");
		}
	};

	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
			<div className="bg-white w-full max-w-3xl rounded-lg shadow-lg h-[85vh] flex flex-col">
				{/* Header Section */}
				<div className="flex justify-between items-center p-6 border-b border-gray-200">
					<h3 className="text-2xl font-semibold text-gray-800">
						Chat with {user.username}
					</h3>
					<button
						onClick={() => setSelectedUser(null)}
						className="text-gray-600 hover:text-gray-800"
					>
						✕
					</button>
				</div>

				{/* Chat Messages Section */}
				<div className="flex-1 p-6 overflow-y-auto space-y-4">
					{chatHistory.map((chat, index) => (
						<div
							key={index}
							className={`${
								chat.sender === "1"
									? "flex justify-end"
									: "flex justify-start"
							}`}
						>
							<div
								className={`${
									chat.sender === "1"
										? "bg-pink-500 text-white"
										: "bg-gray-200 text-gray-800"
								} max-w-[75%] px-5 py-3 rounded-lg shadow-md`}
							>
								<span className="text-sm break-words whitespace-pre-wrap">
									{chat.message}
								</span>
							</div>
						</div>
					))}
				</div>

				{/* Message Input Section */}
				<div className="p-6 bg-gray-100 border-t border-gray-200 flex items-center space-x-4">
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type a message..."
						className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
					/>
					<button
						onClick={handleSendMessage}
						className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-r-lg hover:bg-pink-600 transition"
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);

}



export default function Chats({
	openModal,
	setOpenModal,
	selectedUser,
	setSelectedUser,
	users,
	setUsers,
}) {
	const getAllUsersChat = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"chats/get-chats",
				{ userId: "1" }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				setUsers(data.chats);
			}
		} catch (error) {
			toast.error(`An error occurred while archiving data. ${error}`);
		}
	};

	useEffect(() => {
		getAllUsersChat();
	}, []);

	const handleSelectUser = (user) => {
		setSelectedUser(user);
	};

	return (
		<>
			<div
				className="fixed bottom-10 right-10 bg-pink-500 p-4 rounded-full shadow-lg cursor-pointer z-50 transition-all duration-300 hover:bg-pink-600"
				onClick={() => setOpenModal(true)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					strokeWidth={2}
					stroke="currentColor"
					className="w-8 h-8 text-white"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M21 11.5V6a2 2 0 00-2-2h-4a2 2 0 00-2 2v5.5M15 12h5l-7 7-7-7h5M12 7.5v5"
					/>
				</svg>
			</div>
			{openModal && (
				<>
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-50"
						onClick={() => setOpenModal(false)}
					></div>

					<div
						className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden z-100"
						style={{ zIndex: "9999" }}
					>
						<div className="flex justify-between items-center p-2 ps-3 bg-gray-100 border-b border-gray-200">
							<h2 className="text-2xl font-semibold text-gray-800">
								USERS
							</h2>
							<button
								className="text-gray-500 hover:text-gray-800 transition"
								onClick={() => setOpenModal(false)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="currentColor"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>

						<div className="w-full h-full p-6 overflow-y-auto">
							{users.length > 0 ? (
								users.map((user) => (
									<div
										key={user.partnerId}
										className="flex items-center p-3 mb-4 bg-white rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 border border-gray-100 hover:border-pink-500"
										onClick={() => handleSelectUser(user)}
									>
										<div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg">
											{user.username[0].toUpperCase()}
										</div>
										<div className="ml-4 flex-1">
											<p className="font-semibold text-gray-900 text-lg truncate">
												{user.username}
											</p>
											<p className="text-sm text-gray-600 truncate">
												{user.lastMessage
													? user.lastMessage?.message.slice(
															0,
															30
													  ) +
													  (user.lastMessage?.message
															.length > 30
															? "..."
															: "")
													: "No recent messages"}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-gray-500 text-center mt-10">
									No users available to chat.
								</p>
							)}

							{selectedUser ? (
								<Modal
									user={selectedUser}
									setSelectedUser={setSelectedUser}
								/>
							) : null}
						</div>
					</div>
				</>
			)}
		</>
	);
}
