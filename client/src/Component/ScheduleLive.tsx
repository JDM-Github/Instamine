import React, { useState } from "react";
import RequestHandler from "../Functions/RequestHandler";
import { toast } from "react-toastify";

const ScheduleLiveModal = ({ isOpen, onClose, products, reset }) => {
	const [liveData, setLiveData] = useState({
		url: "",
		startTime: "",
		productSchedules: {},
	});

	const saveSchedule = async () => {
		if (
			!liveData.url ||
			!liveData.startTime ||
			Object.keys(liveData.productSchedules).length === 0
		) {
			toast.error(
				"Please fill in all fields and schedule at least one product."
			);
			return;
		}

		try {
			const scheduledProducts = products
				.map((product) => ({
					id: product.id,
					name: product.name,
					product_image: product.product_image,
					startTime: liveData.productSchedules[product.id]?.startTime,
					endTime: liveData.productSchedules[product.id]?.endTime,
				}))
				.filter((product) => product.startTime && product.endTime);

			const data = await RequestHandler.handleRequest(
				"post",
				"youtube/set-live",
				{
					url: liveData.url,
					startTimestamp: liveData.startTime,
					products: scheduledProducts,
				}
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				onClose();
				reset();
			}
		} catch (error) {
			toast.error(`An error occurred while requesting data. ${error}`);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setLiveData((prevState) => ({
			...prevState,
			[name]: value,
		}));
	};

	const handleProductScheduleChange = (productId, field, value) => {
		setLiveData((prevState) => ({
			...prevState,
			productSchedules: {
				...prevState.productSchedules,
				[productId]: {
					...prevState.productSchedules[productId],
					[field]: value,
				},
			},
		}));
	};

	if (!isOpen) return null;
	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
				>
					&times;
				</button>
				<h2 className="text-2xl font-semibold text-pink-600 mb-6">
					Schedule Live
				</h2>

				<div className="space-y-4">
					{/* URL Input */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Live URL
						</label>
						<input
							type="url"
							name="url"
							value={liveData.url}
							onChange={handleInputChange}
							placeholder="Enter livestream URL"
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
						/>
					</div>

					{/* Start Time Input */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Start Time
						</label>
						<input
							type="datetime-local"
							name="startTime"
							value={liveData.startTime}
							onChange={handleInputChange}
							className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
						/>
					</div>

					{/* Product Scheduling */}
					<div>
						<label className="block text-gray-700 font-medium mb-2">
							Schedule Products
						</label>
						<div className="product-schedule-list max-h-64 overflow-y-auto">
							{products.map((product) => (
								<div
									key={product.id}
									className="border p-4 rounded-md"
								>
									<div className="flex justify-between items-center">
										<span className="font-medium">
											{product.name}
										</span>
									</div>
									<div className="grid grid-cols-2 gap-4 mt-2">
										{/* Start Time */}
										<div>
											<label className="block text-gray-600 text-sm">
												Start Time
											</label>
											<input
												type="time"
												value={
													liveData.productSchedules[
														product.id
													]?.startTime || ""
												}
												onChange={(e) =>
													handleProductScheduleChange(
														product.id,
														"startTime",
														e.target.value
													)
												}
												className="w-full px-2 py-1 border border-gray-300 rounded-md"
											/>
										</div>

										{/* End Time */}
										<div>
											<label className="block text-gray-600 text-sm">
												End Time
											</label>
											<input
												type="time"
												value={
													liveData.productSchedules[
														product.id
													]?.endTime || ""
												}
												onChange={(e) =>
													handleProductScheduleChange(
														product.id,
														"endTime",
														e.target.value
													)
												}
												className="w-full px-2 py-1 border border-gray-300 rounded-md"
											/>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Save Button */}
					<button
						onClick={saveSchedule}
						className="w-full py-2 px-4 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 transition duration-300"
					>
						Save Schedule
					</button>
				</div>
			</div>
		</div>
	);
};

export default ScheduleLiveModal;
