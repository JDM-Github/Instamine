const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const path = require("path");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const router = express.Router();
const sendEmail = require("./emailSender");
const { sequelize, OrderBatch } = require("./models");
const {
	userRouter,
	productRouter,
	chatRouter,
	orderRouter,
	cartRouter,
	imageRouter,
} = require("./routers");
const { youtubeRouter } = require("./stream.js");
const { INTEGER } = require("sequelize");

DEVELOPMENT = false;
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

router.use("/file", imageRouter);
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

router.post("/send-notification", (req, res) => {
	const { email, notificationMessage } = req.body;
	if (!email || !notificationMessage) {
		return res.status(400).json({
			success: false,
			message: "Recipient email and notification message are required.",
		});
	}
	const emailSubject = "Important Notification from InstaMine";
	const emailText = `You have a new notification from InstaMine: ${notificationMessage}`;
	const formattedMessage = notificationMessage.replace(/\n/g, "<br>");
	const emailHtml = `
		<html>
		<body>
			<div style="text-align: center;">
				<h1>InstaMine Business Notification</h1>
				<p><strong>${formattedMessage}</strong></p>
				<p>If you did not expect this notification, please ignore this message.</p>
			</div>
		</body>
		</html>`;
	sendEmail(email, emailSubject, emailText, emailHtml, (error, info) => {
		if (error) {
			console.log("Error sending notification:", error);
			return res.status(500).json({
				success: false,
				message: "Failed to send notification.",
				error: error.message,
			});
		}

		console.log("Notification sent successfully:", info);
		return res.status(200).json({
			success: true,
			message: "Notification sent successfully.",
			info: info.messageId,
		});
	});
});

const generateReferenceNumber = () => {
	const timestamp = Date.now().toString();
	const randomString = Math.random()
		.toString(36)
		.substring(2, 8)
		.toUpperCase();
	return `REF-${timestamp}-${randomString}`;
};

// const PAYMONGO_API_KEY = "sk_test_xQUPaznwdL8WkBfuLA5p3ihK";
// router.post("/create-payment", async (req, res) => {
// 	const { amount, description, walletType, products, users, order } =
// 		req.body;

// 	console.log(products);
// 	console.log(users);
// 	console.log(order);

// 	const adjustedLineItems = products.map((item) => {
// 		return {
// 			currency: "PHP",
// 			images: [item.productImage],
// 			amount: parseInt(item.price * 100),
// 			name: item.name,
// 			quantity: item.numberOfProduct,
// 			description: "Full payment for this product",
// 		};
// 	});

// 	const referenceNumber = generateReferenceNumber();

// 	const payload = {
// 		data: {
// 			attributes: {
// 				billing: {
// 					address: {
// 						line1: users.location,
// 						country: "PH",
// 					},
// 					name: users.firstName + " " + users.lastName + " ",
// 					email: users.email,
// 					phone: users.phoneNumber,
// 				},
// 				send_email_receipt: true,
// 				show_description: true,
// 				show_line_items: true,
// 				payment_method_types: [
// 					"gcash",
// 				],
// 				line_items: adjustedLineItems,
// 				description: "Payment for selected products",
// 				reference_number: referenceNumber,
// 				statement_descriptor: "Petal and Planes",
// 				success_url: "https://yourdomain.com/payment-success",
// 				cancel_url: "https://yourdomain.com/payment-failed",
// 			},
// 		},
// 	};

// 	const jsonPayload = JSON.stringify(payload);
// 	console.log(jsonPayload);


// 	try {
// 		const sourceResponse = await axios.post(
// 			"https://api.paymongo.com/v1/checkout_sessions",
// 			payload,
// 			{
// 				headers: {
// 					Authorization: `Basic ${Buffer.from(
// 						PAYMONGO_API_KEY
// 					).toString("base64")}`,
// 					"Content-Type": "application/json",
// 				},
// 			}
// 		);
// 		const paymentSource = sourceResponse.data.data;
// 		await OrderBatch.update(
// 			{ referenceNumber, paymentLink: paymentSource.attributes.checkout_url },
// 			{ where: { id: order.id } }
// 		);
// 		res.json({
// 			redirectUrl: paymentSource.attributes.checkout_url,
// 		});
// 	} catch (error) {
// 		console.error("Error creating payment:", error);
// 		res.status(500).json({ error: "Failed to create payment" });
// 	}
// });

const paypal = require("@paypal/checkout-server-sdk");
const PAYPAL_CLIENT_ID =
	"AacQyjvGmPHYV4DobiID0HSvyo-mnDYT9uTYkPWL-lv6xGWwk_hmcWxIL1sBjbRldvfUPcI-fPclSm3C";
const PAYPAL_CLIENT_SECRET =
	"ED0PtkNy8-VcEkTjfMtNvg4JAZskCyrlEhKZ3tSTAYDGqabedKJqUSprN79plAnS556ATl5kxxpnasx0";
const environment = new paypal.core.SandboxEnvironment(
	PAYPAL_CLIENT_ID,
	PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

router.post("/create-payment", async (req, res) => {
	const { amount, description, walletType, products, users, order } =
		req.body;

	console.log(products);
	console.log(users);
	console.log(order);

	const adjustedLineItems = products.map((item) => {
		return {
			name: item.name,
			quantity: parseInt(item.numberOfProduct),
			unit_amount: {
				currency_code: "PHP",
				value: parseFloat(item.price).toFixed(2),
			},
			description: "Full payment for this product",
		};
	});

	const referenceNumber = generateReferenceNumber();

	const orderRequest = new paypal.orders.OrdersCreateRequest();
	const total = adjustedLineItems
		.reduce(
			(total, item) =>
				total + parseFloat(item.unit_amount.value) * item.quantity,
			0
		)
		.toFixed(2);
	orderRequest.requestBody({
		intent: "CAPTURE",
		purchase_units: [
			{
				amount: {
					currency_code: "PHP",
					value: total,
					breakdown: {
						item_total: {
							currency_code: "PHP",
							value: total,
						},
					},
				},
				description: "Payment for selected products",
				items: adjustedLineItems,
			},
		],
		application_context: {
			brand_name: "Instamine",
			landing_page: "BILLING",
			user_action: "PAY_NOW",
			return_url: "https://yourdomain.com/payment-success",
			cancel_url: "https://yourdomain.com/payment-failed",
		},
	});
	try {
		const orderResponse = await client.execute(orderRequest);
		const approvalUrl = orderResponse.result.links.find(
			(link) => link.rel === "approve"
		).href;

		await OrderBatch.update(
			{ referenceNumber, paymentLink: approvalUrl },
			{ where: { id: order.id } }
		);

		res.json({
			redirectUrl: approvalUrl,
		});
	} catch (error) {
		console.error("Error creating PayPal payment:", error);
		res.status(500).json({ error: "Failed to create PayPal payment" });
	}
});

app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../client/build")));
app.use("/.netlify/functions/api", router);
module.exports.handler = serverless(app);
