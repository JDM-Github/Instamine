const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();
const sendEmail = require("./emailSender");
const { sequelize } = require("./models");
const {
	userRouter,
	productRouter,
	chatRouter,
	orderRouter,
	cartRouter,
} = require("./routers");
const { youtubeRouter } = require("./stream.js");

DEVELOPMENT = true;
if (DEVELOPMENT) {
	app.use(
		cors({
			origin: "http://localhost:3000",
			credentials: true,
			optionSuccessStatus: 200,
		})
	);
	router.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "../client/build"), "index.html");
	});
} else {
	app.use(cors());
}

router.use("/user", userRouter);
router.use("/chats", chatRouter);
router.use("/product", productRouter);
router.use("/orders", orderRouter);
router.use("/cart", cartRouter);
router.use("/youtube", youtubeRouter);

router.get("/reset", async (req, res) => {
	await sequelize.sync({ force: true });
	res.send("RESETED");
});

router.post("/send-email", (req, res) => {
	const { email, verificationCode } = req.body;

	if (!email || !verificationCode) {
		return res.status(400).json({
			success: false,
			message: "Recipient email and verification code are required.",
		});
	}

	const emailSubject = "Verify Your InstaMine Account";
	const emailText = `Please verify your account using the code: ${verificationCode}`;

	const emailHtml = `
    <html>
    <body>
        <div style="text-align: center;">
            <h1>Welcome to InstaMine!</h1>
            <p>Use this code to verify your account: <strong>${verificationCode}</strong></p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    </body>
    </html>`;

	sendEmail(email, emailSubject, emailText, emailHtml, (error, info) => {
		if (error) {
			console.log("Error sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Failed to send email.",
				error: error.message,
			});
		}

		console.log("Email sent successfully:", info);
		return res.status(200).json({
			success: true,
			message: "Verification email sent successfully.",
			info: info.messageId,
		});
	});
});

const PAYMONGO_API_KEY = "sk_test_PoK58FtMrQaHHc2EyguAKYwj";
router.post("/create-payment", async (req, res) => {
	const { amount, description } = req.body;
	try {
		const sourceResponse = await axios.post(
			"https://api.paymongo.com/v1/sources",
			{
				data: {
					attributes: {
						amount: amount * 100,
						currency: "PHP",
						type: "gcash",
						redirect: {
							success: "https://yourdomain.com/payment-success",
							failed: "https://yourdomain.com/payment-failed",
						},
					},
				},
			},
			{
				headers: {
					Authorization: `Basic ${Buffer.from(
						PAYMONGO_API_KEY
					).toString("base64")}`,
					"Content-Type": "application/json",
				},
			}
		);
		const gcashSource = sourceResponse.data.data;
		res.json({ redirectUrl: gcashSource.attributes.redirect.checkout_url });
	} catch (error) {
		console.error("Error creating payment:", error);
		res.status(500).json({ error: "Failed to create GCash payment" });
	}
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
