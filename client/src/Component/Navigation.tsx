import React, { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

import "./Navigation.scss";
import { useNavigate } from "react-router-dom";

function SearchInput() {
	return (
		<div className="search-container">
			<input
				type="text"
				placeholder="Search..."
				className="search-input"
			/>
			<button className="search-btn">
				<FontAwesomeIcon icon={faSearch} />
			</button>
		</div>
	);
}

export default function Navigation({ status, Nav, setIsOpen }) {
	const navigate = useNavigate();
	useEffect(() => {
		if (localStorage.getItem("users") === null) {
			sessionStorage.setItem("error-message", "Invalid User Token");
			navigate("/");
		}
		sessionStorage.removeItem("error-message");
	}, []);
	const user = JSON.parse(localStorage.getItem("users") || "{}");
	return (
		<div className={`admin-navigation`}>
			<div className="logo-text">
				<div className="logo"></div>
				<div className="text">DE BAHRA</div>
			</div>

			<div className="user-account">
				<div className="logo"></div>
				<div className="texts">
					<div className={`name`}>
						{user.firstname
							? user.firstname + " " + user.lastname
							: user.username}
					</div>
					<div className="position">{status}</div>
				</div>
			</div>

			<>
				{setIsOpen && (
					<div
						className={`subscribe ${user.membership}`}
						onClick={() => setIsOpen(true)}
					>
						{user.membership === "MEMBER"
							? "SUBSCRIBE"
							: user.membership}
					</div>
				)}
			</>

			<hr
				style={{
					color: "#76B349",
					backgroundColor: "#76B349",
					border: "none",
					height: 2,
				}}
			/>

			<SearchInput />
			<>{Nav}</>
		</div>
	);
}
