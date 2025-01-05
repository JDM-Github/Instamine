import React, { useEffect, useState } from "react";
// import "./SCSS/ProductList.scss";
import RequestHandler from "../../Functions/RequestHandler";
import { toast, ToastContainer } from "react-toastify";

type Product = {
	id: number;
	name: string;
	userId: number;
	product_image: string | null;
	product_images: string[] | null;
	price: number;
	number_of_stock: number;
	number_of_sold: number;
	specification: string;
	active: boolean | null;
	category: string;
};

type AddData = {
	name: string;
	price: number;
	number_of_stock: number;
	specification: string;
	category: string;
};

const ProductList: React.FC = () => {
	const [loading, setloading] = useState(false);
	const [isArchived, setIsArchived] = useState(false);
	const [productsData, setProductsData] = useState<Product[]>([]);
	const [allReview, setReview] = useState<any>(null);

	const loadRequestData = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/getAllProduct",
				{ isArchived }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please	check your credentials."
				);
			} else {
				setProductsData(data.products);

				// alert(JSON.stringify(data.products));
				for (const product of data.products)
				{
					if (product.number_of_stock <= 50)
					{
						toast.info(`Low stock product ${product.name}`);
					}
				}
			}
		} catch (error) {
			toast.error(`An	error occurred while requesting	data. ${error}`);
		}
	};
	useEffect(() => {
		loadRequestData();
	}, [isArchived]);

	const handleArchiveChange = () => {
		setProductsData([]);
		setIsArchived(!isArchived);
	};

	const [selectedProduct, setSelectedProduct] = useState<Product | null>(
		null
	);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editData, setEditData] = useState<Product | null>(null);
	const [addData, setAddData] = useState<AddData | null>(null);
	const [mainImagePreview, setMainImagePreview] = useState<any>(null);
	const [additionalImagesPreview, setAdditionalImagesPreview] = useState<any>(
		[]
	);

	const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		setMainImagePreview(file);
	};

	const handleAdditionalImagesChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 5) {
			alert("You can only	upload up to 5 images.");
			return;
		}
		const newImages = files.slice(0, 5 - additionalImagesPreview.length);
		setAdditionalImagesPreview((prevImages) => [
			...prevImages,
			...newImages,
		]);
	};

	const handleRemoveImage = (index: number) => {
		const updatedImages = [...additionalImagesPreview];
		updatedImages.splice(index, 1);
		setAdditionalImagesPreview(updatedImages);
	};

	const handleProductClick = async (product: Product) => {
		setloading(true);
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/getAllReview",
				{ productId: product.id }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please	check your credentials."
				);
			} else {
				setReview(data.allRate);
			}
		} catch (error) {
			toast.error(`An	error occurred while requesting	data. ${error}`);
		}

		setSelectedProduct(product);
		setAddData(null);
		setEditData(product);
		setMainImagePreview(
			product.product_image
				? product.product_image
				: "https://via.placeholder.com/200"
		);
		if (product.product_images && product.product_images.length > 0)
			setAdditionalImagesPreview(product.product_images.slice(0, 5));
		else setAdditionalImagesPreview([]);
		setIsModalOpen(true);
		setloading(false);
	};

	const handleAddProductClick = () => {
		setEditData(null);
		setAddData({
			name: "NEW PRODUCT",
			price: 1,
			number_of_stock: 1,
			specification: "Specification",
			category: "CATEGORY",
		});
		setMainImagePreview(null);
		setAdditionalImagesPreview([]);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setSelectedProduct(null);
		setEditData(null);
		setMainImagePreview(null);
		setIsModalOpen(false);
	};

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		if (editData) {
			setEditData({ ...editData, [e.target.name]: e.target.value });
		} else if (addData) {
			setAddData({ ...addData, [e.target.name]: e.target.value });
		}
	};

	const saveProduct = async (productData) => {
		setloading(true);
		let imageUrls: any = [];
		const uploadImagePromises = additionalImagesPreview.map(
			async (image) => {
				if (!(image instanceof File)) {
					imageUrls.push(image);
					return;
				}
				const formData = new FormData();
				formData.append("file", image);

				try {
					const imageUploadData: any =
						await RequestHandler.handleRequest(
							"post",
							"file/upload-image",
							formData,
							{
								headers: {
									"Content-Type": "multipart/form-data",
								},
							}
						);
					if (imageUploadData.success) {
						imageUrls.push(imageUploadData.uploadedDocument);
					} else {
						toast.error(
							imageUploadData.message || "Image upload failed"
						);
					}
				} catch (error) {
					console.error("Error uploading the image:", error);
					toast.error("Error uploading one or more images.");
				}
			}
		);

		let imageUrl = "";
		if (mainImagePreview instanceof File) {
			const formData = new FormData();
			formData.append("file", mainImagePreview);
			try {
				const imageUploadData: any = await RequestHandler.handleRequest(
					"post",
					"file/upload-image",
					formData,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);
				if (imageUploadData.success) {
					imageUrl = imageUploadData.uploadedDocument;
				} else {
					toast.error(
						imageUploadData.message || "Image upload failed"
					);
				}
			} catch (error) {
				console.error("Error uploading the image:", error);
				toast.error("Error uploading one or more images.");
			}
		} else {
			imageUrl = mainImagePreview;
		}
		await Promise.all(uploadImagePromises);
		productData.product_images = imageUrls;
		productData.product_image = imageUrl;

		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/editCreateProduct",
				{ productData }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please	check your credentials."
				);
			} else {
				setEditData(null);
				setAddData(null);
				toast.success("Successfully	create/edit	a product.");
				await loadRequestData();
			}
		} catch (error) {
			toast.error(`An	error occurred while saving	data. ${error}`);
		}
		setloading(false);
	};

	const handleSaveChanges = () => {
		if (editData) {
			saveProduct(editData);
			handleCloseModal();
		} else if (addData) {
			saveProduct(addData);
			handleCloseModal();
		}
	};

	const handleArchiveProducts = async () => {
		if (editData) {
			try {
				const data = await RequestHandler.handleRequest(
					"post",
					"product/archiveProduct",
					{ id: editData.id }
				);
				if (data.success === false) {
					toast.error(
						data.message ||
							"Error occurred. Please	check your credentials."
					);
				} else {
					setEditData(null);
					setAddData(null);
					toast.success("Successfully	archive	a product.");
					await loadRequestData();
				}
			} catch (error) {
				toast.error(`An	error occurred while saving	data. ${error}`);
			}
		}
		handleCloseModal();
	};

	const calculateAverageRating = (allReview) => {
		if (!allReview || allReview.length === 0) return 0;
		const totalRating = allReview.reduce(
			(sum, review) => sum + review.rating,
			0
		);
		return (totalRating / allReview.length).toFixed(1); // Average rating rounded to 1 decimal
	};

	const renderStars = (rating) => {
		const filledStars = Math.floor(rating);
		const halfStar = rating - filledStars >= 0.5;
		const emptyStars = 5 - filledStars - (halfStar ? 1 : 0);

		return (
			<span>
				{"★".repeat(filledStars)}
				{halfStar && "☆"}
				{"☆".repeat(emptyStars)}
			</span>
		);
	};
	const averageRating = calculateAverageRating(allReview);

	return (
		<>
			{loading && (
				<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center	justify-center">
					<div className="text-white">Loading...</div>
				</div>
			)}

			<button
				className={`fixed top-4	left-[320px] z-50 px-8 py-2	rounded-md text-white font-semibold	${
					isArchived ? "bg-gray-500" : "bg-pink-600"
				} hover:bg-pink-700	transition duration-300`}
				onClick={handleArchiveChange}
			>
				{isArchived ? "ARCHIVED" : "ACTIVE"}
			</button>

			<div className="product-list mt-4 absolute top-[60px] left-[320px]">
				<div className="product-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-[calc(100vw-340px)] min-w-[calc(100vw-340px)]">
					{!isArchived && (
						<div className="fixed top-4 right-4 z-50">
							<div
								className="w-12 h-12 bg-gray-500 rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-gray-600 transition-transform hover:scale-110 duration-300"
								onClick={handleAddProductClick}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									strokeWidth={2}
									stroke="white"
									className="w-6 h-6"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M12 4.5v15m7.5-7.5h-15"
									/>
								</svg>
							</div>
						</div>
					)}

					{productsData.map((product) => (
						<div
							className="product-card bg-white rounded-md shadow p-3 cursor-pointer hover:shadow-lg transition-shadow duration-200"
							key={product.id}
							onClick={() => handleProductClick(product)}
						>
							<img
								src={
									product.product_image ||
									"https://via.placeholder.com/200"
								}
								alt={product.name}
								className="product-image w-full h-48 object-cover rounded"
							/>
							<div className="product-info mt-3">
								<h3 className="product-name text-sm font-medium text-gray-700 truncate">
									{product.name}
								</h3>
								<div className="flex justify-between">
									<p className="product-price text-sm text-pink-500">
										₱{product.price}
									</p>
								</div>
								<p className="product-price text-sm text-black">
									<b>STOCKS: {product.number_of_stock}</b>
								</p>
							</div>
						</div>
					))}
				</div>

				{isModalOpen && editData && (
					<div className="modal-overlay fixed	inset-0	bg-black bg-opacity-50 z-50	flex items-center justify-center">
						<div
							className="modal-test p-1 w-auto py-4"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								className="close-button	text-2xl font-semibold text-white absolute top-4 right-4"
								onClick={handleCloseModal}
							>
								&times;
							</button>

							<div className="modal-content flex flex-row	gap-2 justify-center">
								<div className="edit-product card bg-white rounded-lg shadow-md	p-4	w-full sm:w-1/4	flex-shrink-0">
									<h3 className="text-xl font-semibold text-gray-800 mb-4">
										{isArchived
											? "Product Overview"
											: "Edit	Product"}
									</h3>
									<div className="modal-form space-y-4">
										<label className="block	text-sm	text-gray-700">
											Product Name
										</label>
										<input
											type="text"
											name="name"
											value={editData.name}
											onChange={handleInputChange}
											className="modal-input w-full px-4 py-2	border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
											disabled={isArchived}
										/>

										<label className="block	text-sm	text-gray-700">
											Price
										</label>
										<input
											type="number"
											name="price"
											value={editData.price}
											onChange={handleInputChange}
											className="modal-input w-full px-4 py-2	border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
											disabled={isArchived}
										/>

										<label className="block	text-sm	text-gray-700">
											Stock
										</label>
										<input
											type="number"
											name="number_of_stock"
											value={editData.number_of_stock}
											onChange={handleInputChange}
											className="modal-input w-full px-4 py-2	border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
											disabled={isArchived}
										/>

										<label className="block	text-sm	text-gray-700">
											Specification
										</label>
										<textarea
											name="specification"
											value={editData.specification}
											onChange={handleInputChange}
											className="modal-textarea w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none	focus:ring-2 focus:ring-pink-500"
											disabled={isArchived}
										/>

										{!isArchived ? (
											<>
												<button
													className="save-button w-full py-2 px-4	bg-pink-600	text-white font-semibold rounded-md	hover:bg-pink-700 transition duration-300"
													onClick={handleSaveChanges}
												>
													Save Changes
												</button>
												<button
													className="archive-button w-full py-2 px-4 bg-gray-500 text-white font-semibold	rounded-md hover:bg-gray-600 transition	duration-300 mt-4"
													onClick={
														handleArchiveProducts
													}
												>
													Archive Product
												</button>
											</>
										) : (
											<button
												className="restore-button w-full py-2 px-4 bg-green-600	text-white font-semibold rounded-md	hover:bg-green-700 transition duration-300"
												onClick={handleArchiveProducts}
											>
												Restore Product
											</button>
										)}
									</div>
								</div>

								{/*	Column 2: Product Images */}
								<div className="product-images card	bg-white rounded-lg	shadow-md p-4 w-full sm:w-1/4 flex-shrink-0">
									<h3 className="text-xl font-semibold text-gray-800 mb-4">
										Product Images
									</h3>
									<div className="modal-form space-y-4">
										<label className="block	text-sm	text-gray-700">
											Change Product Image (Main)
										</label>
										<input
											type="file"
											accept="image/*"
											onChange={handleMainImageChange}
											className="modal-input w-full px-4 py-2	border border-gray-300 rounded-md"
											disabled={isArchived}
										/>
										{mainImagePreview && (
											<img
												src={
													mainImagePreview instanceof
													File
														? URL.createObjectURL(
																mainImagePreview
														  )
														: mainImagePreview
												}
												alt="Main Preview"
												className="image-preview w-full mt-4 rounded-md"
											/>
										)}

										<label className="block	text-sm	text-gray-700 mt-6">
											Change Additional Product Images
											(Max 5)
										</label>
										<input
											type="file"
											accept="image/*"
											multiple
											onChange={
												handleAdditionalImagesChange
											}
											className="modal-input w-full px-4 py-2	border border-gray-300 rounded-md"
											disabled={isArchived}
										/>
										<div className="additional-images-preview grid grid-cols-2 gap-4 mt-4">
											{additionalImagesPreview.map(
												(image, index) => (
													<div
														key={index}
														className="image-wrapper relative"
													>
														<img
															src={
																image instanceof
																File
																	? URL.createObjectURL(
																			image
																	  )
																	: image
															}
															alt={`Preview ${
																index + 1
															}`}
															className="image-preview w-full	h-24 object-cover rounded-md"
														/>
														<button
															type="button"
															className="remove-button absolute top-1	right-1	text-white bg-black	bg-opacity-50 rounded-full"
															onClick={() =>
																handleRemoveImage(
																	index
																)
															}
															disabled={
																isArchived
															}
														>
															✕
														</button>
													</div>
												)
											)}
										</div>
									</div>
								</div>

								{/*	Column 3: All Ratings */}
								<div className="all-ratings	card bg-white rounded-lg shadow-md p-4 w-full sm:w-1/4 flex-shrink-0">
									<h3 className="text-xl font-semibold text-gray-800 mb-4">
										All Reviews
									</h3>
									<div className="average-rating text-sm text-gray-600 mb-4">
										<strong>Overall Rating:</strong>{" "}
										{averageRating}{" "}
										<span className="text-yellow-400">
											{renderStars(averageRating)}
										</span>
									</div>
									<div className="review-list	space-y-4">
										{allReview &&
											allReview.map((review) => (
												<div
													key={review.id}
													className="review-item bg-gray-100 p-4 rounded-md shadow-sm"
												>
													<p>
														<strong>Rating:</strong>{" "}
														{review.rating}
													</p>
													<p>
														<strong>Review:</strong>{" "}
														{review.review}
													</p>
													<p>
														<strong>
															User ID:
														</strong>
														{"	"}
														{review.userId}
													</p>
													<p>
														<strong>
															Created At:
														</strong>
														{"	"}
														{new Date(
															review.createdAt
														).toLocaleString()}
													</p>
												</div>
											))}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{isModalOpen && addData && (
					<div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
						<div
							className="modal-test bg-white rounded-lg shadow-lg p-6 w-full max-w-full sm:max-w-[40vw]"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								className="close-button absolute text-white top-4 right-4 text-2xl font-semibold"
								onClick={handleCloseModal}
							>
								&times;
							</button>
							<h2 className="modal-title text-2xl font-semibold text-pink-600 mb-4">
								Add Product
							</h2>

							<div className="modal-content grid grid-cols-1 sm:grid-cols-2 gap-8">
								<div className="modal-form space-y-4">
									<label className="block text-sm text-gray-700">
										Product Name
									</label>
									<input
										type="text"
										name="name"
										value={addData.name}
										onChange={handleInputChange}
										className="modal-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
									/>

									<label className="block text-sm text-gray-700">
										Category
									</label>
									<input
										type="text"
										name="category"
										value={addData.category}
										onChange={handleInputChange}
										className="modal-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
									/>

									<label className="block text-sm text-gray-700">
										Price
									</label>
									<input
										type="number"
										name="price"
										value={addData.price}
										onChange={handleInputChange}
										className="modal-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
									/>

									<label className="block text-sm text-gray-700">
										Stock
									</label>
									<input
										type="number"
										name="number_of_stock"
										value={addData.number_of_stock}
										onChange={handleInputChange}
										className="modal-input w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
									/>

									<label className="block text-sm text-gray-700">
										Specification
									</label>
									<textarea
										name="specification"
										value={addData.specification}
										onChange={handleInputChange}
										className="modal-textarea w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
									/>

									<button
										className="save-button w-full py-2 px-4 bg-pink-600 text-white font-semibold rounded-md hover:bg-pink-700 transition duration-300"
										onClick={handleSaveChanges}
									>
										Add New Product
									</button>
								</div>

								{/* Right Column: Image Upload */}
								<div className="modal-images space-y-4">
									<div className="modal-form">
										<label className="block text-sm text-gray-700">
											Product Image (Main)
										</label>
										<input
											type="file"
											accept="image/*"
											onChange={handleMainImageChange}
											className="modal-input w-full px-4 py-2 border border-gray-300 rounded-md"
										/>

										<label className="block text-sm text-gray-700 mt-6">
											Additional Product Images (Max 5)
										</label>
										<input
											type="file"
											accept="image/*"
											multiple
											onChange={
												handleAdditionalImagesChange
											}
											className="modal-input w-full px-4 py-2 border border-gray-300 rounded-md"
										/>
										<div className="additional-images-preview grid grid-cols-2 gap-4 mt-4">
											{additionalImagesPreview.map(
												(image, index) => (
													<div
														key={index}
														className="image-wrapper relative"
													>
														<img
															src={image}
															alt={`Preview ${
																index + 1
															}`}
															className="image-preview w-full h-24 object-cover rounded-md"
														/>
														<button
															type="button"
															className="remove-button absolute top-1 right-1 text-white bg-black bg-opacity-50 rounded-full"
															onClick={() =>
																handleRemoveImage(
																	index
																)
															}
														>
															✕
														</button>
													</div>
												)
											)}
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
};

export default ProductList;
