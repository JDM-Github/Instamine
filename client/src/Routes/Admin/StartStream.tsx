import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
// import "./SCSS/StartStream.scss";
import RequestHandler from "../../Functions/RequestHandler";
import { toast } from "react-toastify";

const timeToMinutes = (timeString) => {
	const [hours, minutes] = timeString.split(":").map(Number);
	return hours * 60 + minutes;
};

const isProductScheduled = (startTime, endTime) => {
	const currentTime = new Date();
	const currentMinutes =
		currentTime.getHours() * 60 + currentTime.getMinutes();
	const startMinutes = timeToMinutes(startTime);
	const endMinutes = timeToMinutes(endTime);
	return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

interface Schedule {
	id: string;
	image: string;
	name: string;
	startTime: string;
}
const AdminLivestream = () => {
	interface Chat {
		id: string;
		userProfile: string;
		user: string;
		message: string;
	}
	const { state } = useLocation();
	const startStream = state?.startStream || false;
	const streamUrl = state?.streamUrl || "";
	const isStream = state?.isStream || false;
	const products = state?.products || [];

	const [isStreaming, setIsStreaming] = useState(isStream);
	const [livestreamUrl, setLivestreamUrl] = useState(streamUrl);
	const [chatMessages, setChatMessages] = useState<Chat[]>([]);
	const [scheduledProducts, setScheduledProducts] = useState<Schedule[]>([]);
	const [allProducts, setAllProducts] = useState(products);

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
				// toast.error("Error fetching chat messages:", error);
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
					setAllProducts(data.products);
				}
			} else {
				toast.error("Failed to fetch chat messages:", data.message);
			}
		} catch (error) {
			toast.error("Error fetching chat messages:", error);
		}
	};
	const [interval, setIntervalState] = useState<any>(null);

	useEffect(() => {
		if (!startStream && !isStreaming) fetchYTUrl();

		if (isStreaming) {
			fetchChatMessages();

			if (!interval) {
				const id = setInterval(fetchChatMessages, 8000);
				setIntervalState(id);
			}

			return () => clearInterval(interval);
		}
	}, [isStreaming, startStream]);

	useEffect(() => {
		if (
			isStreaming &&
			allProducts !== undefined &&
			allProducts.length !== 0
		) {
			const activeProducts = allProducts.filter((product) =>
				isProductScheduled(product.startTime, product.endTime)
			);
			setScheduledProducts(activeProducts);

			const intervalId = setInterval(() => {
				const activeProducts = allProducts.filter((product) =>
					isProductScheduled(product.startTime, product.endTime)
				);
				setScheduledProducts(activeProducts);
			}, 1000);
			return () => clearInterval(intervalId);
		}
	}, [allProducts, isStreaming]);

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
			// toast.error(`An error occurred while ending stream. ${error}`);
		}
	};

	const handleStartStream = async () => {
		if (livestreamUrl.trim() === "") {
			alert("Please enter a livestream URL.");
			return;
		}
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"youtube/start-stream",
				{
					url: livestreamUrl.trim(),
					products: allProducts,
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
			// toast.error(`An error occurred while start streaming. ${error}`);
		}
	};

	const getYouTubeVideoId = (url) => {
		const regex =
			/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|\S+\?v=|(?:v|e(?:mbed)?)\/|\S+\/[\w-]+\/))([\w-]{11})/;
		const match = url.match(regex);
		return match ? match[1] : "";
	};

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

	const scheduledProduct = {
		// name: "Pink Summer Dress",
		// image: "https://via.placeholder.com/150",
		// time: "2:00 PM",
		// price: 49.99,
		// description: "A beautiful summer dress perfect for any occasion.",
	};

	return (
		<div
			className="admin-livestream top-[50px] left-[310px] absolute bg-pink-50 min-h-screen p-6"
			style={{ width: "calc(100vw - 340px)" }}
		>
			<div className="livestream-container flex flex-col lg:flex-row gap-6 items-stretch h-[80vh]">
				{/* Video Section */}
				<div className="video-section bg-white shadow-lg rounded-lg p-6 w-full lg:w-2/3 flex flex-col">
					<h2 className="text-2xl font-bold text-pink-600 mb-4">
						Livestream
					</h2>
					{isStreaming && livestreamUrl ? (
						getSrc(livestreamUrl)
					) : (
						<div className="live-placeholder border-2 border-pink-300 border-dashed rounded-lg p-4 text-pink-500 flex-grow">
							<p>Enter a Livestream URL to start streaming.</p>
						</div>
					)}
					<div className="url-input-container flex mt-4 gap-4">
						<input
							type="text"
							className="url-input flex-grow px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 disabled:bg-gray-100"
							placeholder="Enter Livestream URL"
							value={livestreamUrl}
							disabled={isStreaming}
							onChange={(e) => setLivestreamUrl(e.target.value)}
						/>
						<button
							className={`start-button px-4 py-2 text-white font-bold rounded-lg ${
								isStreaming
									? "bg-pink-600 hover:bg-pink-700"
									: "bg-pink-400 hover:bg-pink-500"
							}`}
							onClick={
								isStreaming
									? handleEndStream
									: handleStartStream
							}
						>
							{isStreaming ? "End Stream" : "Start Stream"}
						</button>
					</div>
				</div>

				{/* Chat Section */}
				<div className="chat-section bg-white shadow-lg rounded-lg p-6 lg:w-1/3 flex flex-col">
					{/* Live Chat Section */}
					<h2 className="text-2xl font-bold text-pink-600 mb-4">
						Live Chat
					</h2>
					<div className="chat-box h-full overflow-y-auto space-y-4 flex-grow">
						{chatMessages.map((msg) => (
							<div
								key={msg.id}
								className="flex items-start gap-4"
							>
								<img
									src={
										msg.userProfile || "default-avatar.png"
									}
									alt={`${msg.user}'s profile`}
									className="w-10 h-10 rounded-full"
								/>
								<div>
									<strong className="text-pink-600">
										{msg.user}:
									</strong>
									<p className="text-gray-700">
										{msg.message}
									</p>
								</div>
							</div>
						))}
					</div>

					{/* Scheduled Product Section */}
					<div className="scheduled-product mt-6">
						<h2 className="text-xl font-semibold text-pink-500 mb-4">
							Current Products Scheduled
						</h2>
						{scheduledProducts.length > 0 ? (
							scheduledProducts.map((scheduledProduct) => (
								<div
									key={scheduledProduct.id}
									className="product-details flex items-start gap-4 bg-gray-50 shadow-md rounded-lg p-4"
								>
									<img
										src={scheduledProduct.image}
										alt={scheduledProduct.name}
										className="w-24 h-24 rounded-lg object-cover"
									/>
									<div>
										<h3 className="text-lg font-bold text-gray-800">
											{scheduledProduct.name}
										</h3>
										<p className="text-gray-600">
											Scheduled Time:{" "}
											<span className="text-gray-800 font-semibold">
												{scheduledProduct.startTime}
											</span>
										</p>
									</div>
								</div>
							))
						) : (
							<p className="text-gray-500">
								No product scheduled for this live.
							</p>
						)}
					</div>
				</div>
			</div>

			{/* <div className="product-display my-6  w-[80vw]">
				{showProduct && product && (
					<div className="product-info bg-white shadow-lg rounded-lg flex items-center p-6 gap-6">
						<img
							src={product.image}
							alt={product.name}
							className="product-image w-32 h-32 object-cover rounded-lg border border-pink-200"
						/>
						<div className="product-details">
							<h3 className="text-xl font-bold text-pink-600">
								{product.name}
							</h3>
							<p className="text-gray-700">
								{product.description}
							</p>
							<p className="product-price text-pink-500 font-bold">
								${product.price}
							</p>
						</div>
					</div>
				)}
			</div>

			<div className="add-product-form bg-white shadow-lg rounded-lg p-6">
				<h3 className="text-2xl font-bold text-pink-600 mb-4">
					Add Product
				</h3>
				<div className="grid gap-4">
					<input
						type="text"
						placeholder="Product Name"
						className="px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
						onChange={(e) =>
							setProduct({ ...product, name: e.target.value })
						}
					/>
					<input
						type="text"
						placeholder="Product Description"
						className="px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
						onChange={(e) =>
							setProduct({
								...product,
								description: e.target.value,
							})
						}
					/>
					<input
						type="number"
						placeholder="Product Price"
						className="px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
						onChange={(e) =>
							setProduct({ ...product, price: e.target.value })
						}
					/>
					<input
						type="text"
						placeholder="Product Image URL"
						className="px-4 py-2 border border-pink-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
						onChange={(e) =>
							setProduct({ ...product, image: e.target.value })
						}
					/>
					<button
						className="px-4 py-2 bg-pink-400 text-white font-bold rounded-lg hover:bg-pink-500"
						onClick={() => {
							if (product.name && product.price) {
								alert("Product Added");
							} else {
								alert("Please fill all fields");
							}
						}}
					>
						Add Product
					</button>
				</div>
			</div>

			<div className="action-section text-center mt-6">
				<button
					className="action-button px-6 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700"
					onClick={handleShowProduct}
				>
					{showProduct ? "Hide Product" : "Show Product"}
				</button>
			</div> */}
		</div>
	);
};

export default AdminLivestream;
