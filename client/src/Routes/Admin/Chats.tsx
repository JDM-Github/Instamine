import React, { useEffect, useState } from "react";
import "./SCSS/Chats.scss";
import { toast, ToastContainer } from "react-toastify";
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
			<div className="chats" onClick={() => setOpenModal(true)}></div>
			{openModal && (
				<>
					<div
						className="background-chat"
						onClick={() => setOpenModal(false)}
					></div>
					<div className="chats-container">
						<div className="chat-users">
							<h2>Users</h2>
							{users.map((user) => (
								<div
									key={user.partnerId}
									className="chat-user"
									onClick={() => handleSelectUser(user)}
								>
									{user.username}
									<div>{user.lastMessage.message}</div>
								</div>
							))}
						</div>

						{selectedUser && (
							<Modal
								user={selectedUser}
								setSelectedUser={setSelectedUser}
							/>
						)}
					</div>
				</>
			)}
			<ToastContainer />
		</>
	);
}
