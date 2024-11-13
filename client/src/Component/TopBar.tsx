import React, { useState } from "react";
import "./TopBar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faUser,
	faQuestionCircle,
	faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

export default function TopBar({ clickHandler }) {
	const [menuOpen, setMenuOpen] = useState(false);

	const handleProfileClick = () => {
		setMenuOpen(!menuOpen);
	};

	return (
		<div className="topbar">
			<div
				className="profile-container"
				onClick={handleProfileClick}
			></div>
		</div>
	);
}
