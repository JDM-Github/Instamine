import React, { useEffect, useState } from "react";
import "./SCSS/ProfileModal.scss";
import RequestHandler from "../Functions/RequestHandler";
import { toast, ToastContainer } from "react-toastify";

export default function ProfileModal({ id, onClose }) {
	interface User {
		profileImg: string;
		username: string;
		firstname: string;
		lastname: string;
		email: string;
		location: string;
	}
	const [user, setUser] = useState<User | null>(null);
	const getUser = async () => {
		try {
			const data = await RequestHandler.handleRequest(
				"post",
				"users/get_user",
				{ id }
			);

			if (data.success) {
				setUser(data.user);
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

	useEffect(() => {
		getUser();
	}, []);
	return (
		<>
			{user && (
				<div className="profile-modal">
					<div className="modal-overlay">
						<div className="modal-content">
							<div className="modal-info">
								<div className="img-modal">
									<img
										src={user.profileImg}
										alt="Profile"
										className="profile-img"
									/>
								</div>
								<div className="profile-details">
									<h2>User Profile</h2>
									<p>
										<strong>Username:</strong>{" "}
										{user.username}
									</p>
									<p>
										<strong>First Name:</strong>{" "}
										{user.firstname}
									</p>
									<p>
										<strong>Last Name:</strong>{" "}
										{user.lastname}
									</p>
									<p>
										<strong>Email:</strong> {user.email}
									</p>
									<p>
										<strong>Location:</strong>{" "}
										{user.location}
									</p>
									<button onClick={onClose}>CLOSE</button>
								</div>
							</div>
						</div>
					</div>
					<ToastContainer />
				</div>
			)}
		</>
	);
}
