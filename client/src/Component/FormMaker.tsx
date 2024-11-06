import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./FormMaker.scss";
import RequestHandler from "../Functions/RequestHandler";

export function FormInput({
	label,
	onChange,
	value = "",
	type = "text",
	name = "name",
	id = "name",
	placeholder = "",
	required = false,
}) {
	const today = new Date().toISOString().split("T")[0];
	return (
		<div className="form-group">
			<label htmlFor={id}>{label}</label>
			<input
				type={type}
				id={id}
				name={name}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				required={required}
				min={type === "date" ? today : undefined}
			/>
		</div>
	);
}

export function FormTextArea({
	label,
	onChange,
	value = "",
	name = "name",
	id = "name",
	placeholder = "",
	required = false,
}) {
	return (
		<div className="form-group">
			<label htmlFor={id}>{label}</label>
			<textarea
				id={id}
				name={name}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				required={required}
			/>
		</div>
	);
}

export function FormSelect({
	label,
	onChange,
	value = "",
	name = "name",
	id = "name",
	required = false,
	children,
}) {
	return (
		<div className="form-group">
			<label htmlFor={id}>{label}</label>
			<select
				id={id}
				name={name}
				value={value}
				onChange={onChange}
				required={required}
			>
				{children}
			</select>
		</div>
	);
}

export default function FormMaker({
	removeForm,
	formComp,
	formName,
	serviceId = "1",
	formLink = "",
}) {
	const user = JSON.parse(localStorage.getItem("users") || "{}");

	const [uploadedFile, setUploadedFile] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [fileType, setFileType] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();

		const formData = new FormData(e.target);
		const formValues: string[] = [];

		for (let [name, value] of formData.entries()) {
			formValues.push(`${name}: ${value}`);
		}
		removeForm();
	};

	const submitDocument = async () => {
		if (!uploadedFile) {
			toast.error("Please select a file!");
			return;
		}
		const formData = new FormData();
		formData.append("serviceFile", uploadedFile);
		formData.append("userId", user.id);
		formData.append("serviceId", serviceId);
		formData.append("serviceName", formName);

		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"request/request-document",
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);
			if (data.success) {
				toast.success(data.message);
			} else {
				toast.error(data.message);
			}
		} catch (error) {
			console.error("Error submitting the document:", error);
			toast.error("Error submitting the document");
		}
		setUploadedFile(null);
		setFileType("");
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setUploadedFile(file);
			setFileType(file.type);
		}
	};

	const openModal = () => {
		if (formLink === "") {
			toast.error("No Image Provided.");
		} else setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	return (
		<div className="form-maker">
			{formComp && (
				<div className="form-card">
					<div className="design"></div>
					<h2 className="form-title">{formName} FORM</h2>
					<form onSubmit={handleSubmit} className="generated-form">
						{formComp}
						<button type="submit" className="submit-btn">
							TAKE THIS SERVICE
						</button>
						<button
							type="button"
							onClick={removeForm}
							className="cancel-btn"
						>
							CANCEL
						</button>
					</form>
				</div>
			)}

			<div className="form-card right-card">
				<div className="design"></div>
				<h2 className="form-title">{formName} DOCUMENT</h2>
				<button onClick={openModal} className="show-form-btn">
					SHOW {formName} FORM
				</button>
				<div className="upload-form">
					<label className="upload-label">
						<input
							type="file"
							accept=".pdf,.jpg,.jpeg,.png"
							onChange={handleFileChange}
							required
						/>
						<span>Upload Document</span>
					</label>
					{uploadedFile && fileType.startsWith("image/") && (
						<img
							src={URL.createObjectURL(uploadedFile)}
							className="uploaded-img"
							alt="Uploaded Preview"
						/>
					)}
					{uploadedFile && fileType === "application/pdf" && (
						<iframe
							src={URL.createObjectURL(uploadedFile)}
							className="uploaded-img"
							title="Uploaded PDF Preview"
						/>
					)}
					<button
						type="submit"
						className="show-form-btn submit-btn"
						onClick={submitDocument}
					>
						SUBMIT DOCUMENT
					</button>
					<button
						type="button"
						onClick={removeForm}
						className="cancel-btn"
					>
						CANCEL
					</button>
				</div>

				{isModalOpen && (
					<div className="modal">
						<div className="modal-content">
							<span className="close" onClick={closeModal}>
								&times;
							</span>
							<img
								src={formLink}
								alt="DTI Registration Form"
								style={{
									position: "relative",
									width: "auto",
									height: "90vh",
								}}
							/>
							<a
								target="_blank"
								href={formLink}
								download
								className="download-btn"
							>
								DOWNLOAD
							</a>
						</div>
					</div>
				)}
			</div>
			<ToastContainer />
		</div>
	);
}
