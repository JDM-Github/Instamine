import React, { useEffect, useState } from "react";
import "./SCSS/Chats.scss";
import { toast } from "react-toastify";
import RequestHandler from "../../Functions/RequestHandler";

function Modal({ user, setSelectedUser }) {
	const [message, setMessage] = useState("");
	const [chatHistory, setChatHistory] = useState([]);

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
		<div className="chat-modal">
			<div className="modal-header">
				<button onClick={() => setSelectedUser(null)}>Close</button>
				<h3>Chat with {user.username}</h3>
			</div>

			<div className="modal-body">
				<div className="chat-history">
					{chatHistory.map((chat, index) => (
						<div
							key={index}
							className={
								chat.sender === "1"
									? "message-sent"
									: "message-received"
							}
						>
							<strong>
								{chat.sender === "1" ? "You" : user.username}:
							</strong>{" "}
							{chat.message}
						</div>
					))}
				</div>
				<div className="chat-input">
					<input
						type="text"
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						placeholder="Type a message..."
					/>
					<button onClick={handleSendMessage}>Send</button>
				</div>
			</div>
		</div>
	);
}

export default function Chats() {
	const [openModal, setOpenModal] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [users, setUsers] = useState([]);

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
				className="fixed bottom-5 right-5 bg-pink-500 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg cursor-pointer hover:bg-pink-600"
				onClick={() => setOpenModal(true)}
			>
				💬
			</div>
			{openModal && (
				<>
					{/* Background Overlay */}
					<div
						className="fixed inset-0 bg-black bg-opacity-50 z-150"
						onClick={() => setOpenModal(false)}
					></div>

					{/* Chats Container */}
					<div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white w-full max-w-4xl h-96 rounded-lg shadow-lg flex overflow-hidden z-100">
						{/* Users List */}
						<div className="w-1/3 bg-gray-100 p-4 overflow-y-auto">
							<h2 className="text-xl font-semibold mb-4">
								Users
							</h2>
							{users.map((user) => (
								<div
									key={user.partnerId}
									className="p-3 mb-2 bg-white rounded-lg shadow-sm hover:bg-gray-200 cursor-pointer transition"
									onClick={() => handleSelectUser(user)}
								>
									<p className="font-medium">
										{user.username}
									</p>
									<p className="text-sm text-gray-600 truncate">
										{user.lastMessage.message}
									</p>
								</div>
							))}
						</div>

						{/* Selected User Chat */}
						<div className="w-2/3 bg-white p-4">
							{selectedUser ? (
								<Modal
									user={selectedUser}
									setSelectedUser={setSelectedUser}
								/>
							) : (
								<div className="flex items-center justify-center h-full text-gray-500">
									<p>Select a user to view chat</p>
								</div>
							)}
						</div>
					</div>
				</>
			)}
		</>
	);
}
