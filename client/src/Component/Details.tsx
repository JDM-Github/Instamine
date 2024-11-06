import React from "react";
import "./FormMaker.scss";

export default function Details({
	setShowDetails,
	formDetails,
	formName,
	detailImg,
}) {
	return (
		<div className="form-maker">
			<div className="form-card" style={{ width: "50%" }}>
				<div className="design"></div>
				<h2 className="form-title">{formName} DETAIL</h2>
				<div className="details">
					<img src={detailImg} alt="" />
					<div className="detailed">
						<div>{formDetails}</div>
						<button
							className="cancel-btn"
							onClick={() => setShowDetails(false)}
						>
							CLOSE
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
