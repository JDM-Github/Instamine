import React, { useEffect, useRef, useState } from "react";
import "./Chats.scss";

import RequestHandler from "../Functions/RequestHandler.js";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faReply,
	faHeart,
	faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function Message({
	text,
	isSent,
	replyText,
	replyTo,
	onReply,
	onDelete,
	chatPartner,
}) {
	return (
		<>
			{replyText && replyText !== "" ? (
				<>
					<div className={`reply-to ${isSent ? "sent" : "received"}`}>
						{isSent ? "You" : chatPartner} replied to {replyTo}
					</div>
					<div
						className={`reply-message ${
							isSent ? "sent" : "received"
						}`}
					>
						{replyText}
					</div>
				</>
			) : null}
			<div className={`message ${isSent ? "sent" : "received"}`}>
				{text}
				<div className="message-buttons">
					<button onClick={onReply}>
						<FontAwesomeIcon icon={faReply} />
					</button>
					<button onClick={onDelete}>
						<FontAwesomeIcon icon={faTrashAlt} />
					</button>
				</div>
			</div>
		</>
	);
}

export default function ChatWindow({ chatPartner, partnerId = "" }) {
	const navigate = useNavigate();
	useEffect(() => {
		if (localStorage.getItem("users") === null) {
			sessionStorage.setItem("error-message", "Invalid User Token");
			navigate("/");
		}
		sessionStorage.removeItem("error-message");
	}, []);
	const user = JSON.parse(localStorage.getItem("users") || "{}");

	const [newMessage, setNewMessage] = useState("");
	const [replyMessage, setReplyMessage] = useState("");
	const [replyUser, setReplyUser] = useState("");

	interface Message {
		sender: string;
		text: string;
		replyText: string;
		replyTo: string;
	}
	interface Chat {
		id: string;
		userId: string;
		messages: Message[];
	}
	const [allMessages, setAllMessages] = useState<Chat>();
	const getAllMessage = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"chats/user",
				{ id: partnerId != "" ? partnerId : user.id }
			);

			if (data.success) {
				setAllMessages(data.chat);
			} else {
				toast.error(
					data.message ||
						"Reloading chats failed, please check your credentials."
				);
			}
		} catch (error) {
			toast.error(`An error occurred. ${error}`);
		}
	};

	const updateMessage = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"chats/send-chat",
				{ oldChat: allMessages }
			);
			if (!data.success) {
				toast.error(
					data.message ||
						"Reloading chats failed, please check your credentials."
				);
			}
		} catch (error) {
			toast.error(`An error occurred while logging in. ${error}`);
		}
	};
	const messagesEndRef = useRef<HTMLDivElement | null>(null);
	const scrollDown = (behavior) => {
		if (messagesEndRef.current)
			messagesEndRef.current.scrollIntoView({ behavior: behavior });
	};

	useEffect(() => {
		if (chatPartner !== "") {
			getAllMessage();
			scrollDown("instant");
		}
	}, []);

	useEffect(() => {
		if (allMessages) {
			updateMessage();
			scrollDown("smooth");
		}
	}, [allMessages]);

	const handleSendMessage = async () => {
		if (newMessage.trim()) {
			const newMess = {
				sender: user.id,
				replyText: replyMessage,
				replyTo: replyUser,
				text: newMessage,
			};
			if (allMessages) {
				const updatedMessages = allMessages.messages
					? [...allMessages.messages, newMess]
					: [newMess];

				const newChat = {
					...allMessages,
					messages: updatedMessages,
				};
				setAllMessages(newChat);
			}

			setNewMessage("");
			setReplyMessage("");
			setReplyUser("");
		}
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") {
			handleSendMessage();
		}
	};

	const handleReply = (index) => {
		if (allMessages) {
			setReplyMessage(allMessages.messages[index].text);
			setReplyUser(allMessages.messages[index].sender);
		}
	};

	const handleDelete = (index) => {
		// setMessages(messages.filter((_, i) => i !== index));
	};

	return (
		<div className="chat-window">
			<div className="chat-header">
				<div>{chatPartner}</div>
			</div>
			<div className="message-container">
				{allMessages &&
					allMessages.messages &&
					allMessages.messages.length > 0 &&
					allMessages.messages?.map((message, index) => (
						<Message
							key={index}
							text={message.text}
							isSent={message.sender == user.id}
							replyText={message.replyText}
							replyTo={
								message.replyTo == user.id
									? message.sender == user.id
										? "yourself"
										: "himself"
									: chatPartner
							}
							onReply={() => handleReply(index)}
							onDelete={() => handleDelete(index)}
							chatPartner={chatPartner}
						/>
					))}
				<div ref={messagesEndRef} />
			</div>
			{replyMessage && replyMessage !== "" ? (
				<div className="reply-input">
					<b>
						Replying to{" "}
						{replyUser == user.id ? "yourself" : chatPartner}
					</b>
					: {replyMessage}
				</div>
			) : null}
			<div className="message-input">
				<input
					type="text"
					value={newMessage}
					onChange={(e) => setNewMessage(e.target.value)}
					placeholder="Type a message..."
					onKeyDown={handleKeyDown}
				/>
				<button onClick={handleSendMessage}>Send</button>
			</div>
		</div>
	);
}
