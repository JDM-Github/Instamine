import React, { useState } from "react";

const ViewLiveScheduleModal = ({ isOpen, onClose, schedule }) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
			<div className="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-gray-800">
						View Live Schedule
					</h2>
					<button
						className="text-gray-500 hover:text-gray-800"
						onClick={onClose}
					>
						✕
					</button>
				</div>

				<div className="mt-4 space-y-4">
					{/* Schedule Details */}
					<div>
						<p>
							<strong>URL:</strong> {schedule?.url || "N/A"}
						</p>
						<p>
							<strong>Start Timestamp:</strong>{" "}
							{new Date(
								schedule?.startTimestamp
							).toLocaleString() || "N/A"}
						</p>
						<p>
							<strong>Created At:</strong>{" "}
							{new Date(schedule?.createdAt).toLocaleString() ||
								"N/A"}
						</p>
					</div>

					{/* Products List */}
					<div>
						<h3 className="text-lg font-semibold text-gray-800">
							Scheduled Products
						</h3>
						<div className="max-h-64 overflow-y-auto border-t border-gray-200 pt-2">
							{schedule?.products?.length > 0 ? (
								schedule.products.map((product, index) => (
									<div
										key={index}
										className="flex justify-between items-center bg-gray-100 p-2 rounded-md mb-2"
									>
										<div>
											<p>
												<strong>Name:</strong>{" "}
												{product.name}
											</p>
											<p>
												<strong>Time:</strong>{" "}
												{product.startTime} -{" "}
												{product.endTime}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="text-gray-600">
									No products scheduled.
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="mt-6 flex justify-end">
					<button
						className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
						onClick={onClose}
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default ViewLiveScheduleModal;
