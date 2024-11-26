import React, { useEffect, useState } from "react";
import "./SCSS/StartStream.scss";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";

const AdminLivestream = () => {
	interface Chat {
		id: string;
		userProfile: string;
		user: string;
		message: string;
	}
	const [showOverlay, setShowOverlay] = useState(true);
	const [isStreaming, setIsStreaming] = useState(false);
	const [livestreamUrl, setLivestreamUrl] = useState("");
	const [chatMessages, setChatMessages] = useState<Chat[]>([]);

	const fetchChatMessages = async () => {
		if (isStreaming)
			try {
				const data = await RequestHandler.handleRequest(
					"post",
					"youtube/process-chat",
					{}
				);

				if (data.success) {
					setChatMessages((prevMessages) => {
						const newMessages = data.messages.map((chat) => ({
							id: chat.id,
							userProfile: chat.userProfile,
							user: chat.user,
							message: chat.message,
							timestamp: chat.timestamp,
						}));

						const updatedMessages = [
							...prevMessages,
							...newMessages,
						];

						return updatedMessages.length > 30
							? updatedMessages.slice(updatedMessages.length - 30)
							: updatedMessages;
					});
				} else {
					toast.error("Failed to fetch chat messages:");
				}
			} catch (error) {
				toast.error("Error fetching chat messages:", error);
			}
	};

	const fetchYTUrl = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"get",
				"youtube/get-yt-url",
				{}
			);
			if (data.success) {
				if (data.url !== null) {
					setIsStreaming(true);
					setLivestreamUrl(data.url);
				}
			} else {
				toast.error("Failed to fetch chat messages:", data.message);
			}
		} catch (error) {
			toast.error("Error fetching chat messages:", error);
		}
	};
	const [interval, setinterval] = useState<any>(null);
	useEffect(() => {
		fetchYTUrl();
		if (isStreaming) {
			fetchChatMessages();
			setinterval(setInterval(fetchChatMessages, 8000));
			return () => clearInterval(interval);
		}
	}, [isStreaming]);

	const handleEndStream = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"youtube/end-stream",
				{}
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				const interval_id = window.setInterval(function () {},
				Number.MAX_SAFE_INTEGER);
				for (let i = 1; i < interval_id; i++) {
					window.clearInterval(i);
				}
				clearInterval(interval);
				setIsStreaming(false);
				setLivestreamUrl("");
				toast.success("You ended the stream.");
			}
		} catch (error) {
			toast.error(`An error occurred while ending stream. ${error}`);
		}
	};

	const handleStartStream = async () => {
		if (livestreamUrl.trim() === "") {
			alert("Please enter a livestream URL.");
			return;
		}
		try {
			// const metadataResponse = await fetch(
			// 	`https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=AIzaSyAPUSVvfNXEClIXf4grz6KacKiNcm-1shU`
			// );
			// const metadataData = await metadataResponse.json();
			// if (metadataData.error?.errors?.[0]?.reason === "quotaExceeded") {
			// 	toast.error(
			// 		"You have exceeded your YouTube API quota. Please try again later."
			// 	);
			// 	return;
			// }
			// if (!metadataData.items || metadataData.items.length === 0) {
			// 	toast.error("Failed to fetch metadata from YouTube API.");
			// 	return;
			// }
			// const metadata = metadataData.items[0];
			const data = await RequestHandler.handleRequest(
				"post",
				"youtube/start-stream",
				{
					url: livestreamUrl.trim(),
					// metadata,
				}
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				setIsStreaming(true);
				toast.success("You started streaming...");
			}
		} catch (error) {
			toast.error(`An error occurred while start streaming. ${error}`);
		}
	};

	const handleShowProduct = () => {
		alert("Product displayed to viewers!");
	};

	const getYouTubeVideoId = (url) => {
		const regex =
			/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S+\?v=|(?:v|e(?:mbed)?)\/|\S+\/[\w-]+\/))([\w-]{11})/;
		const match = url.match(regex);
		return match ? match[1] : "";
	};

	// Helper function to extract Instagram Post ID
	const getInstagramPostId = (url) => {
		const regex = /instagram\.com\/p\/([^\/]+)\//;
		const match = url.match(regex);
		return match ? match[1] : "";
	};

	const getSrc = (src) => {
		if (src.includes("fb.") || src.includes("facebook")) {
			return (
				<iframe
					src={`https://www.facebook.com/plugins/video.php?href=${src}&show_text=0&width=560`}
					width="100%"
					height="100%"
					frameBorder="0"
					style={{ border: "none", overflow: "hidden" }}
					allow="encrypted-media"
					allowFullScreen
				/>
			);
		} else if (src.includes("youtube.com") || src.includes("youtu.be")) {
			const videoId = getYouTubeVideoId(src);
			return (
				<iframe
					width="100%"
					height="100%"
					src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
					allow="autoplay; encrypted-media"
					allowFullScreen
				/>
			);
		} else if (src.includes("instagram.com")) {
			const postId = getInstagramPostId(src);
			return (
				<iframe
					src={`https://www.instagram.com/p/${postId}/embed`}
					width="100%"
					height="100%"
					allow="autoplay; encrypted-media"
					allowFullScreen
				/>
			);
		} else if (src.includes("twitter.com")) {
			return (
				<>
					<blockquote className="twitter-video" data-lang="en">
						<a href={src}></a>
					</blockquote>
					<script
						async
						src="https://platform.twitter.com/widgets.js"
					></script>
				</>
			);
		} else {
			return <p>Video platform not supported for embedding.</p>;
		}
	};

	return (
		<div className="admin-livestream">
			<div className="livestream-container">
				<div className="video-section">
					<h2>Livestream</h2>
					{isStreaming && livestreamUrl ? (
						getSrc(livestreamUrl)
					) : (
						<div className="live-placeholder">
							<p>
								Enter a YouTube Livestream URL to start
								streaming.
							</p>
						</div>
					)}
					<div className="url-input-container">
						<input
							type="text"
							className="url-input"
							placeholder="Enter YouTube Livestream URL"
							value={livestreamUrl}
							disabled={isStreaming}
							onChange={(e) => setLivestreamUrl(e.target.value)}
						/>
						<button
							className={`start-button ${
								isStreaming ? "red-button" : ""
							}`}
							onClick={
								isStreaming
									? handleEndStream
									: handleStartStream
							}
						>
							{isStreaming ? `End Stream` : `Start Stream`}
						</button>
					</div>
				</div>

				<div className="chat-section">
					<h2>Live Chat</h2>
					<div className="chat-box">
						{chatMessages.map((msg) => (
							<>
								<img
									src={
										msg.userProfile || "default-avatar.png"
									}
									alt={`${msg.user}'s profile`}
									className="profile-pic"
								/>
								<div key={msg.id} className="chat-message">
									<strong>{msg.user}: </strong>
									<span>{msg.message}</span>
								</div>
							</>
						))}
					</div>
				</div>
			</div>

			{/* Actions Section */}
			<div className="action-section">
				<button className="action-button" onClick={handleShowProduct}>
					Show Product
				</button>
			</div>
		</div>
	);
};

export default AdminLivestream;
