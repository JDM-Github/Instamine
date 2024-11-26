import React, { useEffect, useState } from "react";
import "./SCSS/ProductList.scss";
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
	const [allReview, setReview] = useState(null);

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
						"Error occurred. Please check your credentials."
				);
			} else {
				setProductsData(data.products);
			}
		} catch (error) {
			toast.error(`An error occurred while requesting data. ${error}`);
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
	const [mainImagePreview, setMainImagePreview] = useState<string | null>(
		null
	);
	const [additionalImagesPreview, setAdditionalImagesPreview] = useState<
		string[]
	>([]);

	const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () =>
				setMainImagePreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleAdditionalImagesChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const files = Array.from(e.target.files || []);
		if (files.length > 5) {
			alert("You can only upload up to 5 images.");
			return;
		}

		const newImages = files.slice(0, 5 - additionalImagesPreview.length);
		const updatedImages = [...additionalImagesPreview];

		newImages.forEach((file) => {
			const reader = new FileReader();
			reader.onloadend = () => {
				if (updatedImages.length < 5) {
					updatedImages.push(reader.result as string);
					setAdditionalImagesPreview([...updatedImages]);
				}
			};
			reader.readAsDataURL(file);
		});
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
						"Error occurred. Please check your credentials."
				);
			} else {
				setReview(data.allRate);
			}
		} catch (error) {
			toast.error(`An error occurred while requesting data. ${error}`);
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
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"product/editCreateProduct",
				{ productData }
			);
			if (data.success === false) {
				toast.error(
					data.message ||
						"Error occurred. Please check your credentials."
				);
			} else {
				setEditData(null);
				setAddData(null);
				toast.success("Successfully create/edit a product.");
				await loadRequestData();
			}
		} catch (error) {
			toast.error(`An error occurred while saving data. ${error}`);
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
							"Error occurred. Please check your credentials."
					);
				} else {
					setEditData(null);
					setAddData(null);
					toast.success("Successfully archive a product.");
					await loadRequestData();
				}
			} catch (error) {
				toast.error(`An error occurred while saving data. ${error}`);
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
				<div style={{ backgroundColor: "black", zIndex: 9999 }}> </div>
			)}
			<button className="status-button" onClick={handleArchiveChange}>
				{isArchived ? "ARCHIVED" : "ACTIVE"}
			</button>
			<div className="product-list">
				<div className="product-grid">
					{!isArchived && (
						<img
							src="https://cdn-icons-png.flaticon.com/512/7387/7387315.png"
							className="add-product"
							onClick={handleAddProductClick}
						/>
					)}

					{productsData.map((product) => (
						<div
							className="product-card"
							key={product.id}
							onClick={() => handleProductClick(product)}
						>
							<img
								src={
									product.product_image
										? product.product_image
										: "https://via.placeholder.com/200"
								}
								alt={product.name}
								className="product-image"
							/>
							<div className="product-info">
								<h3 className="product-name">{product.name}</h3>
								<p className="product-price">
									₱{product.price}
								</p>
							</div>
						</div>
					))}
				</div>

				{isModalOpen && editData && (
					<div className="modal-overlay">
						<div
							className="modal-test"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								className="close-button"
								onClick={handleCloseModal}
							>
								&times;
							</button>
							<h2 className="modal-title">
								{isArchived
									? "Product Overview"
									: "Edit Product"}
							</h2>

							<div className="modal-form">
								<label>Product Name</label>
								<input
									type="text"
									name="name"
									value={editData.name}
									onChange={handleInputChange}
									className="modal-input"
									disabled={isArchived}
								/>

								<label>Price</label>
								<input
									type="number"
									name="price"
									value={editData.price}
									onChange={handleInputChange}
									className="modal-input"
									disabled={isArchived}
								/>

								<label>Stock</label>
								<input
									type="number"
									name="number_of_stock"
									value={editData.number_of_stock}
									onChange={handleInputChange}
									className="modal-input"
									disabled={isArchived}
								/>

								<label>Specification</label>
								<textarea
									name="specification"
									value={editData.specification}
									onChange={handleInputChange}
									className="modal-textarea"
									disabled={isArchived}
								/>
								{!isArchived ? (
									<>
										<button
											className="save-button"
											onClick={handleSaveChanges}
										>
											Save Changes
										</button>
										<button
											style={{ marginTop: "10px" }}
											className="save-button"
											onClick={handleArchiveProducts}
										>
											Archive Product
										</button>
									</>
								) : (
									<>
										<button
											className="save-button"
											onClick={handleArchiveProducts}
										>
											Restore Product
										</button>
									</>
								)}
							</div>
						</div>
						<div className="modal-images">
							<div className="modal-form">
								<label>Change Product Image (Main)</label>
								<input
									type="file"
									accept="image/*"
									onChange={handleMainImageChange}
									className="modal-input"
									disabled={isArchived}
								/>
								{mainImagePreview && (
									<img
										src={mainImagePreview}
										alt="Main Preview"
										className="image-preview"
									/>
								)}

								<label>
									Change Additional Product Images (Max 5)
								</label>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleAdditionalImagesChange}
									className="modal-input"
									disabled={isArchived}
								/>
								<div className="additional-images-preview">
									{additionalImagesPreview.map(
										(image, index) => (
											<div
												key={index}
												className="image-wrapper"
											>
												<img
													src={image}
													alt={`Preview ${index + 1}`}
													className="image-preview"
												/>
												<button
													type="button"
													className="remove-button"
													onClick={() =>
														handleRemoveImage(index)
													}
													disabled={isArchived}
												>
													✕
												</button>
											</div>
										)
									)}
								</div>
							</div>
						</div>

						<div className="modal-images">
							<div className="modal-form">
								<label
									style={{
										fontSize: "18px",
										fontWeight: "bold",
										color: "#333",
									}}
								>
									All Reviews
								</label>
								<div
									className="average-rating"
									style={{
										marginBottom: "10px",
										fontSize: "16px",
									}}
								>
									<strong>Overall Rating:</strong>{" "}
									{averageRating}{" "}
									<span
										style={{
											color: "#f4b400",
											fontSize: "18px",
										}}
									>
										{renderStars(averageRating)}
									</span>
								</div>
								<div className="review-list">
									{allReview &&
										allReview.map((review, index) => (
											<div
												key={review.id}
												className="review-item"
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
													<strong>User ID:</strong>{" "}
													{review.userId}
												</p>
												<p>
													<strong>Created At:</strong>{" "}
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
				)}

				{isModalOpen && addData && (
					<div className="modal-overlay">
						<div
							className="modal-test"
							onClick={(e) => e.stopPropagation()}
						>
							<button
								className="close-button"
								onClick={handleCloseModal}
							>
								&times;
							</button>
							<h2 className="modal-title">Add Product</h2>

							<div className="modal-form">
								<label>Product Name</label>
								<input
									type="text"
									name="name"
									value={addData.name}
									onChange={handleInputChange}
									className="modal-input"
								/>

								<label>Category</label>
								<input
									type="text"
									name="category"
									value={addData.category}
									onChange={handleInputChange}
									className="modal-input"
								/>

								<label>Price</label>
								<input
									type="number"
									name="price"
									value={addData.price}
									onChange={handleInputChange}
									className="modal-input"
								/>

								<label>Stock</label>
								<input
									type="number"
									name="number_of_stock"
									value={addData.number_of_stock}
									onChange={handleInputChange}
									className="modal-input"
								/>

								<label>Specification</label>
								<textarea
									name="specification"
									value={addData.specification}
									onChange={handleInputChange}
									className="modal-textarea"
								/>

								<button
									className="save-button"
									onClick={handleSaveChanges}
								>
									Add New Product
								</button>
							</div>
						</div>
						<div className="modal-images">
							<div className="modal-form">
								<label>Product Image (Main)</label>
								<input
									type="file"
									accept="image/*"
									onChange={handleMainImageChange}
									className="modal-input"
								/>
								{mainImagePreview && (
									<img
										src={mainImagePreview}
										alt="Main Preview"
										className="image-preview"
									/>
								)}

								<label>Additional Product Images (Max 5)</label>
								<input
									type="file"
									accept="image/*"
									multiple
									onChange={handleAdditionalImagesChange}
									className="modal-input"
								/>
								<div className="additional-images-preview">
									{additionalImagesPreview.map(
										(image, index) => (
											<div
												key={index}
												className="image-wrapper"
											>
												<img
													src={image}
													alt={`Preview ${index + 1}`}
													className="image-preview"
												/>
												<button
													type="button"
													className="remove-button"
													onClick={() =>
														handleRemoveImage(index)
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
				)}
			</div>
		</>
	);
};

export default ProductList;
