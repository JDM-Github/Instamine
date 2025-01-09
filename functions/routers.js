const express = require("express");
const bcrypt = require("bcryptjs");

const {
	User,
	Product,
	Chat,
	OrderBatch,
	ChatMessage,
	Order,
	Cart,
	Rate,
	Notification,
} = require("./models");
const { isSeller } = require("./middleware");
const sendEmail = require("./emailSender");

const asyncHandler = require("express-async-handler");
const { Op, where } = require("sequelize");
const expressAsyncHandler = require("express-async-handler");


const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
	cloud_name: "djheiqm47",
	api_key: "692765673474153",
	api_secret: "kT7k8hvxo-bqMWL0aHB2o3k90dA",
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadToCloudinary(buffer) {
	return new Promise((resolve, reject) => {
		cloudinary.uploader
			.upload_stream({ resource_type: "auto" }, (error, result) => {
				if (error) reject(error);
				else resolve(result.secure_url);
			})
			.end(buffer);
	});
}

class ImageHandler {
	constructor() {
		this.router = express.Router();
		this.initializeRoutes();
	}

	initializeRoutes() {
		this.router.post(
			"/upload-image",
			upload.single("file"),
			expressAsyncHandler(this.uploadImageToCloudinary)
		);
	}

	async uploadImageToCloudinary(req, res) {
		const serviceFile = req.file;

		try {
			const uploadedUrl = await uploadToCloudinary(serviceFile.buffer);
			console.log(uploadedUrl);
			res.send({
				success: true,
				uploadedDocument: uploadedUrl,
			});
		} catch (error) {
			res.send({
				success: false,
				message: `An error occurred while creating the request. ${error.message}`,
			});
		}
	}
}

async function sendNotification(email, notificationMessage) {
	if (!email || !notificationMessage) {
		return false;
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
			return false;
		}
		console.log("Notification sent successfully:", info);
		return true;
	});
	return true;
}

async function addChatPartner(userId, partnerId) {
	try {
		const chatMessage = await ChatMessage.create();

		let chat1 = await Chat.findOne({ where: { userId } });
		if (chat1) {
			chat1.chatPartner = {
				...chat1.chatPartner,
				[partnerId]: chatMessage.id,
			};
			await chat1.save();
		} else {
			chat1 = await Chat.create({
				userId,
				chatPartner: { [partnerId]: chatMessage.id },
			});
		}

		let chat2 = await Chat.findOne({ where: { userId: partnerId } });
		if (chat2) {
			chat2.chatPartner = {
				...chat2.chatPartner,
				[userId]: chatMessage.id,
			};
			await chat2.save();
		} else {
			chat2 = await Chat.create({
				userId: partnerId,
				chatPartner: { [userId]: chatMessage.id },
			});
		}
		return { success: true, chat: chat1, chatMessage };
	} catch (error) {
		return {
			success: false,
			message: "Could not initiate chat",
			details: error,
		};
	}
}

class ChatRouter {
	constructor() {
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
		this.router.post("/get-chats", expressAsyncHandler(this.getAllChats));
		this.router.post(
			"/get-user-chat",
			expressAsyncHandler(this.getUserChat)
		);
		this.router.post(
			"/retrieve-chat",
			expressAsyncHandler(this.retrieveChats)
		);
		this.router.post("/message", expressAsyncHandler(this.messagePartner));
	}

	async getUserChat(req, res) {
		const { userId, partnerId } = req.body;

		try {
			const chat = await Chat.findOne({ where: { userId } });
			if (!chat) {
				await Chat.create({
					userId,
					chatPartner: {},
				});
				res.send({ success: true, chat: {} });
				return;
			}

			const partner = await User.findOne({
				where: { id: partnerId },
				attributes: ["id", "username", "profileImage"],
			});

			if (!partner) {
				return res.send({ message: "Partner not found" });
			}

			const chatMessageId = chat.chatPartner[partnerId];
			let chatMessage = await ChatMessage.findByPk(chatMessageId);

			if (!chatMessage) {
				const result = await addChatPartner(userId, partnerId);
				if (!result.success) return res.send(result);
				chatMessage = result.chatMessage;
			}

			const lastMessage = chatMessage.messages?.length
				? chatMessage.messages[chatMessage.messages.length - 1]
				: null;

			res.send({
				success: true,
				chat: {
					partnerId,
					username: partner.username,
					profileImage: partner.profileImage,
					chatMessageId,
					lastMessage,
					createdAt: chatMessage.createdAt,
				},
			});
		} catch (error) {
			res.send({
				message: "Could not retrieve chat",
				details: error,
			});
		}
	}

	async getAllChats(req, res) {
		const { userId } = req.body;

		try {
			const chat = await Chat.findOne({ where: { userId } });
			if (!chat) {
				await Chat.create({
					userId,
					chatPartner: {},
				});
				res.send({ success: true, chats: {} });
				return;
			}

			const partnerIds = Object.keys(chat.chatPartner);
			const partners = await User.findAll({
				where: { id: partnerIds },
				attributes: ["id", "username", "profileImage"],
			});

			const chats = await Promise.all(
				partnerIds.map(async (partnerId) => {
					const partner = partners.find(
						(p) => p.id.toString() === partnerId
					);

					if (partner) {
						const chatMessageId = chat.chatPartner[partnerId];
						const chatMessage = await ChatMessage.findByPk(
							chatMessageId
						);
						if (!chatMessage) {
							const result = await addChatPartner(
								userId,
								chatMessageId
							);
							if (!result.success) res.send(result);
							chatMessage = result.chatMessage;
						}

						const lastMessage = chatMessage.messages?.length
							? chatMessage.messages[
									chatMessage.messages.length - 1
							  ]
							: null;

						return {
							partnerId,
							username: partner.username,
							profileImage: partner.profileImage,
							chatMessageId,
							lastMessage,
							createdAt: chatMessage.createdAt,
						};
					}
					return null;
				})
			);
			console.log(chats);

			res.send({
				success: true,
				chats: chats.filter((chat) => chat !== null),
			});
		} catch (error) {
			res.send({
				message: "Could not save message",
				details: error,
			});
		}
	}

	async retrieveChats(req, res) {
		const { userId, partnerId } = req.body;

		try {
			let chat = await Chat.findOne({ where: { userId } });
			if (!chat) {
				const result = await addChatPartner(userId, partnerId);
				if (!result.success) res.send(result);
				chat = result.chat;
			}

			let chatMessage = await ChatMessage.findByPk(
				chat.chatPartner[partnerId]
			);
			if (!chatMessage) {
				const result = await addChatPartner(userId, partnerId);
				if (!result.success) res.send(result);
				chatMessage = result.chatMessage;
			}
			res.send({
				success: true,
				message: "Load successfully",
				messages: chatMessage.messages,
			});
		} catch (error) {
			console.log(error);
			res.send({
				success: false,
				message: "Could not save message",
				details: error,
			});
		}
	}

	async messagePartner(req, res) {
		const { userId, partnerId, message } = req.body;

		try {
			let chat = await Chat.findOne({ where: { userId } });
			if (!chat) {
				const result = await addChatPartner(userId, partnerId);
				if (!result.success) res.send(result);
				chat = result.chat;
			}
			const chatMessage = await ChatMessage.findByPk(
				chat.chatPartner[partnerId]
			);
			if (!chatMessage) {
				const result = await addChatPartner(userId, partnerId);
				if (!result.success) res.send(result);
				chatMessage = result.chatMessage;
			}

			const messagesArray = chatMessage.messages
				? [...chatMessage.messages, { sender: userId, message }]
				: [{ sender: userId, message }];
			await chatMessage.update({ messages: messagesArray });

			res.send({
				success: true,
				message: "Send successfully",
				messages: chatMessage.messages,
			});
		} catch (error) {
			res.send({
				success: false,
				message: "Could not save message",
				details: error,
			});
		}
	}
}
class UserRoute {
	constructor() {
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
		this.router.post("/", asyncHandler(this.test));
		this.router.post("/create", asyncHandler(this.createUser));
		this.router.post("/verify", asyncHandler(this.verifyAccount));
		this.router.post("/seller", asyncHandler(this.becomeSeller));
		this.router.post("/get_accounts", asyncHandler(this.getAllAccounts));
		this.router.post("/updateUser", asyncHandler(this.updateUser));
		this.router.post(
			"/updateNotification",
			asyncHandler(this.updateNotification)
		);
		this.router.get("/login", asyncHandler(this.loginUser));
		this.router.post("/login", asyncHandler(this.loginUser));
		this.router.post(
			"/startStreaming",
			expressAsyncHandler(this.startStreaming)
		);
		this.router.post(
			"/set_archived",
			expressAsyncHandler(this.setArchived)
		);
		this.router.post(
			"/getAllNotification",
			expressAsyncHandler(this.getAllNotification)
		);
	}

	async getAllNotification(req, res) {
		try {
			const { id } = req.body;

			const notification = await Notification.findAll({
				where: { userId: id },
			});

			if (!notification) {
				return res.status(404).json({
					success: false,
					message: "User not found",
				});
			}
			res.send({
				success: true,
				notification: notification,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				success: false,
				message: "An error occurred while fetching notification",
			});
		}
	}

	async setArchived(req, res) {
		try {
			const { id } = req.body;

			const account = await User.findOne({
				where: { id },
			});

			if (!account) {
				return res.status(404).json({
					success: false,
					message: "User not found",
				});
			}
			const isArchived = account.isArchived;
			await account.update({ isArchived: !account.isArchived });
			res.send({
				success: true,
				message: !isArchived ? "The account has been locked successfully" : "The account has been unlocked successfully",
				data: account,
			});
		} catch (error) {
			console.error(error);
			res.status(500).json({
				success: false,
				message:
					"An error occurred while updating the account archive status",
			});
		}
	}

	async getAllAccounts(req, res) {
		try {
			const { currPage, limit, isArchived } = req.body;

			if (!currPage || !limit) {
				return res.status(400).json({
					success: false,
					message: "Pagination parameters are required",
				});
			}

			const offset = (currPage - 1) * limit;
			const requests = await User.findAndCountAll({
				where: { isSeller: false, isArchived },
				limit: limit,
				offset: offset,
				order: [["createdAt", "DESC"]],
			});

			res.json({
				success: true,
				data: requests.rows,
				total: requests.count,
				currentPage: currPage,
				totalPages: Math.ceil(requests.count / limit),
			});
		} catch (error) {
			console.error("Error fetching account requests:", error);
			res.status(500).json({
				success: false,
				message: "An error occurred while fetching requests",
			});
		}
	}

	async updateNotification(req, res) {
		const { notificationId } = req.body;
		try {
			const notif = await Notification.findByPk(notificationId);
			if (!notif) {
				return res.send({
					success: true,
					message: "Notification does not exists.",
				});
			}
			await notif.update({
				isRead: true,
			});
			return res.send({ success: true });
		} catch (error) {
			console.error(error);
			return res.send({
				message: "Error updating notification",
				success: false,
				error: error.message,
			});
		}
	}

	async updateUser(req, res) {
		const {
			profileImage,
			firstName,
			lastName,
			email,
			phoneNumber,
			location,
		} = req.body;

		try {
			const normalizedEmail = email.toLowerCase().trim();
			const user = await User.findOne({
				where: {
					[Op.or]: [{ email: normalizedEmail }],
				},
			});
			if (!user) {
				return res.send({
					success: true,
					message: "User does not exists.",
				});
			}
			await user.update({
				profileImage,
				firstName,
				lastName,
				email,
				phoneNumber,
				location,
			});
			return res.send({ success: true });
		} catch (error) {
			console.error(error);
			return res.send({
				message: "Error updating user",
				success: false,
				error: error.message,
			});
		}
	}

	async createUser(req, res) {
		const {
			firstName,
			lastName,
			username,
			birthdate,
			email,
			password,
			phoneNumber,
			isSeller,
			organizationName,
		} = req.body;

		try {
			const normalizedEmail = email.toLowerCase().trim();
			const user = await User.findOne({
				where: {
					[Op.or]: [
						{ email: normalizedEmail },
						{ username: username },
					],
				},
			});
			if (user) {
				return res.send({
					success: true,
					message: "Email or Username is already being used.",
				});
			}

			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = await User.create({
				firstName,
				lastName,
				username,
				birthdate,
				email,
				phoneNumber,
				password: hashedPassword,
				isSeller: isSeller || false,
				organizationName: isSeller ? organizationName : null,
				isVerified: false,
			});

			return res.send({
				message: "User created successfully",
				success: true,
				user: {
					id: newUser.id,
					username: newUser.username,
					email: newUser.email,
					isSeller: newUser.isSeller,
					organizationName: newUser.organizationName,
					isVerified: newUser.isVerified,
				},
			});
		} catch (error) {
			console.error(error);
			return res.send({
				message: "Error creating user",
				success: false,
				error: error.message,
			});
		}
	}

	async becomeSeller(req, res) {
		const { email } = req.body;
		try {
			const user = await User.findOne({
				where: { email },
			});
			if (!user) {
				return res.send({
					success: false,
					message: "User does not exists.",
				});
			}

			await user.update({
				isSeller: true,
			});
			return res.send({
				message: "You become a seller!",
				success: true,
			});
		} catch (error) {
			console.error(error);
			return res.send({
				message: "There is an error on becoming seller",
				success: false,
				error: error.message,
			});
		}
	}

	async verifyAccount(req, res) {
		const { email } = req.body;
		try {
			const normalizedEmail = email.toLowerCase().trim();
			const user = await User.findOne({
				where: { email: normalizedEmail },
			});
			if (!user) {
				return res.send({
					success: false,
					message: "User does not exists.",
				});
			}

			if (user.isVerified) {
				return res.send({
					success: true,
					message: "User is already verified.",
				});
			}

			await user.update({
				isVerified: true,
			});

			return res.send({
				message: "Verification successful",
				success: true,
			});
		} catch (error) {
			console.error(error);
			return res.send({
				message: "Error verification",
				success: false,
				error: error.message,
			});
		}
	}

	async loginUser(req, res) {
		const { email, password } = req.body;

		try {
			const normalizedEmail = email.toLowerCase().trim();
			const user = await User.findOne({
				where: {
					[Op.or]: [
						{ email: normalizedEmail },
						{ username: normalizedEmail },
					],
				},
			});
			if (!user || !(await bcrypt.compare(password, user.password))) {
				return res.send({
					success: false,
					message: "Email or password is invalid.",
				});
			}

			if (!user.isVerified) {
				return res.send({
					success: false,
					message:
						"User is not verified. Please verify your account.",
				});
			}

			if (user.isArchived) {
				return res.send({
					success: false,
					message:
						"User is locked. If you think this is wrong, please contact our support team.",
				});
			}

			await user.update({
				online: true,
				logoutTime: null,
			});

			return res.send({
				message: "Login successful",
				success: true,
				user: {
					id: user.id,
					profileImage: user.profileImage,
					firstName: user.firstName,
					lastName: user.lastName,
					username: user.username,
					email: user.email,
					isSeller: user.isSeller,
					birthdate: user.birthdate,
					organizationName: user.organizationName,
					isVerified: user.isVerified,
					online: user.online,
					phoneNumber: user.phoneNumber,
					location: user.location,
					logoutTime: user.logoutTime,
					isStreaming: user.isStreaming,
					// streamId: user.streamId,
					streamUrl: user.streamUrl,
					numberProduct: user.numberProduct,
				},
			});
		} catch (error) {
			console.error(error);
			return res.send({
				message: "Error logging in",
				success: false,
				error: error.message,
			});
		}
	}

	async startStreaming(req, res) {
		try {
			const { userId, url } = req.body;
			const user = await User.findByPk(userId);
			if (!user) {
				res.send({
					success: false,
					message: "Cannot find the user.",
				});
				return;
			}
			await user.update({ isStreaming: true, streamUrl: url });
			res.send({
				success: true,
			});
		} catch (error) {
			console.error(error);
			return res.send({
				success: false,
				message: "Error starting stream",
			});
		}
	}
}

class ProductRoute {
	constructor() {
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
		this.router.get("/", asyncHandler(this.test));
		this.router.post("/create", isSeller, asyncHandler(this.createProduct));
		this.router.post("/rateProduct", expressAsyncHandler(this.rateProduct));
		this.router.post(
			"/deactive:id",
			isSeller,
			asyncHandler(this.deactivateProduct)
		);
		this.router.get("/products", asyncHandler(this.getAllProducts));
		this.router.post(
			"/getAllProduct",
			expressAsyncHandler(this.getAllProduct)
		);

		this.router.post(
			"/editCreateProduct",
			expressAsyncHandler(this.editCreateProduct)
		);
		this.router.post(
			"/archiveProduct",
			expressAsyncHandler(this.archiveProduct)
		);
		this.router.post(
			"/getAllReview",
			expressAsyncHandler(this.getAllReview)
		);
		this.router.post("/getProduct", expressAsyncHandler(this.getProduct));
	}

	async getAllProduct(req, res) {
		try {
			const { isArchived } = req.body;
			const allProducts = await Product.findAll({
				where: { userId: "1", isArchived },
			});
			console.log(allProducts);
			return res.send({
				success: true,
				products: allProducts,
			});
		} catch (error) {
			return res.send({
				success: false,
				message: "Error creating product",
				error: error.message,
			});
		}
	}

	async getProduct(req, res) {
		try {
			const { id } = req.body;
			const allProducts = await Product.findByPk(id);
			return res.send({
				success: true,
				product: allProducts,
			});
		} catch (error) {
			return res.send({
				success: false,
				message: "Error getting product",
				error: error.message,
			});
		}
	}

	async createProduct(req, res) {
		const { name, userId, specification, category } = req.body;
		try {
			const newProduct = await Product.create({
				name,
				userId,
				specification,
				category,
				active: true,
			});

			return res.send({
				success: true,
				message: "Product created successfully",
				product: newProduct,
			});
		} catch (error) {
			return res.send({
				success: false,
				message: "Error creating product",
				error: error.message,
			});
		}
	}

	async editCreateProduct(req, res) {
		try {
			const { productData } = req.body;
			console.log(productData);
			let product;
			if (productData.id) {
				product = await Product.findOne({
					where: { id: productData.id },
				});
			}

			if (product) {
				await product.update({
					name: productData.name,
					price: productData.price,
					number_of_stock: productData.number_of_stock,
					specification: productData.specification,
					product_image: productData.product_image,
					product_images: productData.product_images,
				});
				return res.send({
					success: true,
					message: "Product updated successfully.",
					product,
				});
			} else {
				product = await Product.create({
					userId: "1",
					name: productData.name,
					price: productData.price,
					number_of_stock: productData.number_of_stock,
					specification: productData.specification,
					category: productData.category,
					product_image:
						"https://cdn-icons-png.flaticon.com/512/7387/7387315.png",
					product_images: [],
				});
				return res.send({
					success: true,
					message: "Product created successfully.",
					product,
				});
			}
		} catch (error) {
			return res.send({
				success: false,
				message: "Error editing/creating product",
				error: error.message,
			});
		}
	}

	async deactivateProduct(req, res) {
		const productId = req.params.id;

		try {
			const product = await Product.findByPk(productId);

			if (!product) {
				return res.send({
					success: false,
					message: "Product not found",
				});
			}
			product.active = false;
			await product.save();

			return res.send({
				success: true,
				message: "Product deactivated successfully",
				product,
			});
		} catch (error) {
			return res.send({
				success: false,
				message: "Error deactivating product",
				error: error.message,
			});
		}
	}

	async archiveProduct(req, res) {
		const { id } = req.body;

		try {
			const product = await Product.findByPk(id);
			if (!product) {
				return res.send({
					success: false,
					message: "Product not found",
				});
			}
			await product.update({ isArchived: !product.isArchived });
			return res.send({
				success: true,
				message: "Product archived successfully",
				product,
			});
		} catch (error) {
			return res.send({
				success: false,
				message: "Error archiving product",
				error: error.message,
			});
		}
	}

	async getAllProducts(req, res) {
		const { category, search, email } = req.query;
		console.log(search);

		try {
			let query = {
				where: { isArchived: false },
				include: [
					{
						model: User,
						as: "Users",
						attributes: [
							"id",
							"username",
							"firstName",
							"lastName",
							"email",
							"organizationName",
							"profileImage",
							"numberProduct",
							"online",
							"location",
							"logoutTime",
						],
						where: {},
					},
				],
			};

			if (category) {
				query.where.category = category;
			}

			if (search) {
				query.where.name = {
					[Op.like]: `%${search}%`,
				};
				query.limit = 10;
			}

			if (email) {
				query.include[0].where.email = email;
			}

			console.log(query);

			const products = await Product.findAll(query);

			return res.send({
				success: true,
				message: "Products fetched successfully",
				products,
			});
		} catch (error) {
			console.log(error);

			return res.send({
				success: false,
				message: "Product fetched unsuccessfully",
				error: error.message,
			});
		}
	}

	async rateProduct(req, res) {
		try {
			const { userId, order, index, rating, review } = req.body;
			console.log(order);
			const orderBatch = await OrderBatch.findByPk(order.orderId);
			if (!orderBatch)
				res.send({ success: false, message: "Order has not found." });

			const certainProduct = order.products[index];
			const newRate = await Rate.create({
				userId,
				productId: certainProduct.productId,
				rating,
				review,
			});
			certainProduct["isRated"] = true;
			certainProduct["rating"] = rating;
			certainProduct["note"] = review;
			const products = order.products;
			products[index] = certainProduct;
			await orderBatch.update({ products: products });
			res.send({ success: true, newRate });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async getAllReview(req, res) {
		try {
			const { productId } = req.body;
			const allRate = await Rate.findAll({
				where: { productId },
				include: [
					{
						model: User,
						attributes: { exclude: [] },
					},
				],
			});
			console.log(allRate);
			res.send({ success: true, allRate });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}
}

class OrderRouter {
	constructor() {
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
		this.router.get("/allOrders", expressAsyncHandler(this.getAllOrders));
		this.router.post("/createOrder", expressAsyncHandler(this.createOrder));
		this.router.post("/bulkOrder", expressAsyncHandler(this.bulkOrder));
		this.router.post("/paidOrder", expressAsyncHandler(this.paidOrder));
		// paidOrder;
		this.router.post("/cancelOrder", expressAsyncHandler(this.cancelOrder));
		this.router.post("/declineOrder", expressAsyncHandler(this.declineOrder));
		// declineOrder;
		this.router.post("/shipOrder", expressAsyncHandler(this.shipOrder));
		this.router.post(
			"/delieverOrder",
			expressAsyncHandler(this.delieverOrder)
		);
		this.router.get(
			"/getAllOrderFromUsers",
			expressAsyncHandler(this.getAllOrderFromUsers)
		);
		this.router.post(
			"/getAllOrderFromUsersTabulator",
			expressAsyncHandler(this.getAllOrderFromUsersTabulator)
		);
		this.router.get(
			"/getAllOrderById",
			expressAsyncHandler(this.getAllOrderById)
		);

		this.router.post(
			"/getAllOrderRevenue",
			expressAsyncHandler(this.getAllOrderRevenue)
		);
		this.router.post(
			"/get-batch-orders",
			expressAsyncHandler(this.getAllBatchOrder)
		);
		this.router.post(
			"/get-batch-orders-tabulator",
			expressAsyncHandler(this.getAllBatchOrderTabulator)
		);
		this.router.post(
			"/complete-order",
			expressAsyncHandler(this.completeOrder)
		);
	}

	async completeOrder(req, res) {
		try {
			const { id } = req.body;
			const order = await OrderBatch.findByPk(id);

			if (!order) {
				return res
					.status(404)
					.send({ success: false, message: "Order not found." });
			}

			const userId = order.userId;
			const user = await User.findByPk(userId);

			if (!user || !user.email) {
				return res.status(400).send({
					success: false,
					message: "User not found or missing email.",
				});
			}

			await order.update({
				toRecieve: false,
				isComplete: true,
			});

			await Notification.create({
				userId: userId,
				title: "Order Completed",
				description: `Your order with ID ${id} has been marked as complete. Thank you for your purchase!`,
				isRead: false,
			});

			sendNotification(
				user.email,
				"Your order is complete",
				`Your order with ID ${id} has been marked as complete. Thank you for your purchase!`
			);

			res.send({
				success: true,
				message: "Order completed and notification sent.",
				order,
			});
		} catch (error) {
			res.status(500).send({ success: false, message: error.message });
		}
	}

	async getAllOrders(req, res) {
		try {
			const newOrder = await Order.findAll({
				include: [
					{
						model: Product,
						as: "Product",
						attributes: { exclude: [] },
					},
				],
			});
			res.send({ success: true, newOrder });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async createOrder(req, res) {
		try {
			const { productId, numberOfProduct, userId, sellerId } = req.body;
			const product = await Product.findOne({
				where: { id: productId },
				attributes: ["id", "name", "number_of_stock", "price"],
			});

			if (!product) {
				return res.status(404).send({
					success: false,
					message: "Product not found",
				});
			}

			if (product.number_of_stock < numberOfProduct) {
				return res.status(400).send({
					success: false,
					message: `Insufficient stock. Only ${product.stock} items left.`,
				});
			}

			await product.update({
				number_of_stock: product.number_of_stock - numberOfProduct,
			});

			const newOrder = await Order.create({
				productId,
				numberOfProduct,
				userId,
				sellerId,
				toPay: true,
			});

			await product.update({
				stock: product.stock - numberOfProduct,
			});
			res.send({ success: true, newOrder });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async bulkOrder(req, res) {
		try {
			const {
				products,
				userId,
				shoppingFee,
				discountFee,
				subTotalFee,
				isPaid,
				toShip,
				email,
				notificationMessage,
			} = req.body;

			const user = await User.findOne({
				where: { id: userId },
				attributes: ["id", "email", "location"],
			});
			if (!user) {
				return res.status(404).send({
					success: false,
					message: "User not found",
				});
			}
			if (!user.location) {
				return res.status(400).send({
					success: false,
					message: "User location must be assigned to place an order.",
				});
			}

			const totalFee = subTotalFee + shoppingFee - discountFee;
			const orderBatch = await OrderBatch.create({
				products: products,
				userId,
				orderPaid: isPaid !== undefined && isPaid !== null && isPaid,
				subTotalFee,
				shoppingFee,
				discountFee,
				totalFee,
				toShip:
					toShip !== undefined && toShip !== null ? toShip : false,
				toRecieve: false,
				isComplete: false,
			});

			const cartItems = await Cart.findAll({ where: { userId } });
			await Promise.all(
				cartItems
					.filter((item) =>
						products.some(
							(product) => product.productId === item.productId
						)
					)
					.map((item) => item.destroy())
			);
			await Notification.create({
				userId: userId,
				title: "Order Placed Successfully",
				description: `Your order has been placed successfully with a total of ₱${totalFee}.`,
			});

			res.send({ success: true, orderBatch });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async paidOrder(req, res) {
		try {
			const { id, email, notificationMessage } = req.body;

			const result = await sendNotification(email, notificationMessage);
			if (!result) {
				res.send({
					success: false,
					message: "Email sent unsuccessfully. Order is cancelled.",
				});
			}
			await OrderBatch.update(
				{ orderPaid: true, toShip: true },
				{ where: { id } }
			);
			res.send({ success: true });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async delieverOrder(req, res) {
		try {
			const { id } = req.body;
			const order = await OrderBatch.findByPk(id);

			if (!order) {
				return res
					.status(404)
					.send({ success: false, message: "Order not found." });
			}

			const userId = order.userId;
			const user = await User.findByPk(userId);

			if (!user || !user.email) {
				return res.status(400).send({
					success: false,
					message: "User not found or missing email.",
				});
			}

			await order.update({
				toShip: false,
				toRecieve: true,
				orderPaid: true,
			});

			await Notification.create({
				userId: userId,
				title: "Order Delivered",
				description: `Your order with ID ${id} has been marked as delivered and is ready for you to receive.`,
				isRead: false,
			});

			sendNotification(
				user.email,
				"Your order has been delivered",
				`Your order with ID ${id} has been marked as delivered and is ready for you to receive.`
			);

			res.send({
				success: true,
				message: "Order delivered and notification sent.",
			});
		} catch (error) {
			res.status(500).send({ success: false, message: error.message });
		}
	}

	async getAllBatchOrder(req, res) {
		try {
			const { userId, toShip, toReceive, isComplete, toProcess } =
				req.body;
			const whereClause = {};
			if (userId !== undefined && userId !== null)
				whereClause["userId"] = userId;

			const orders = await OrderBatch.findAll({
				where: {
					...whereClause,
					toShip,
					toRecieve: toReceive,
					isComplete,
				},
			});
			// console.log(orders);

			if (!orders || orders.length === 0) {
				return res.status(404).send({
					success: true,
					message: "No orders found for this user",
				});
			}
			if (!orders || orders.length === 0) {
				return res.status(404).send({
					success: false,
					orders,
				});
			}
			const formattedOrders = orders.map(async (order) => {
				const products = order.products.map((product) => ({
					productId: product.productId,
					name: product.name,
					price: product.price,
					numberOfProduct: product.numberOfProduct,
					productImage: product.productImage,
					isRated: product.isRated,
					rating: product.rating,
					note: product.note,
				}));

				let status = "Pending";
				let paymentLink = order.paymentLink;
				let reference_number = order.referenceNumber;
				if (order.toShip) {
					status = "Pending";
				} else if (order.toRecieve) {
					status = "Delivered";
				} else if (order.isComplete) {
					status = "Completed";
				} else if (toProcess) {
					if (
						order.status == "Pending" &&
						// order.status != "Expired" &&
						new Date() > new Date(order.expiryDate)
					) {
						status = "Expired";
						await OrderBatch.update(
							{ status: "Expired" },
							{ where: { id: order.id } }
						);
					} else {
						status = order.status;
					}
				}

				return {
					orderId: order.id.toString(),
					isPaid: order.orderPaid,
					status: status,
					subTotalFee: order.subTotalFee,
					discountFee: order.discountFee,
					shoppingFee: order.shoppingFee,
					totalAmount: order.totalFee,
					products: products,
					allTrack: order.allTrack,
					createdAt: order.createdAt,
					paymentLink,
					reference_number,
				};
			});
			res.send({
				success: true,
				orders: await Promise.all(formattedOrders),
			});
		} catch (error) {
			res.status(500).send({ success: false, message: error.message });
		}
	}

	async getAllOrderById(req, res) {
		try {
			const { userId, toPay, toShip, toReceive, isComplete } = req.query;
			const whereClause = { userId };
			if (toPay !== undefined) {
				whereClause["toPay"] = toPay;
				whereClause["toShip"] = false;
			} else if (toShip !== undefined) {
				whereClause["toShip"] = toShip;
				whereClause["toRecieve"] = false;
				whereClause["isComplete"] = false;
			} else if (toReceive !== undefined) {
				whereClause["toRecieve"] = toReceive;
				whereClause["isComplete"] = false;
			} else if (isComplete !== undefined)
				whereClause["isComplete"] = isComplete;

			console.log(whereClause);
			const order = await Order.findAll({
				where: whereClause,
				include: [
					{
						model: Product,
						as: "Product",
						attributes: { exclude: [] },
						include: [
							{
								model: User,
								as: "Users",
								attributes: { exclude: [] },
							},
						],
					},
				],
			});
			res.send({ success: true, order });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async shipOrder(req, res) {
		try {
			const { id } = req.body;

			const order = await Order.findByPk(id);
			if (order.toShip) {
				await order.update({ isComplete: true });
				res.send({
					message:
						"Succesfully completed the shipment of the product!",
					success: true,
				});
			} else {
				await order.update({ toShip: true });
				res.send({
					message: "Succesfully ship the product!",
					success: true,
				});
			}
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	// async cancelOrder(req, res) {
	// 	try {
	// 		const { id } = req.body;

	// 		const order = await Order.findByPk(id);
	// 		await order.destroy();
	// 		res.send({ success: true });
	// 	} catch (error) {
	// 		res.send({ success: false, message: error.message });
	// 	}
	// }

	async getAllBatchOrderTabulator(req, res) {
		try {
			const { toShip, toReceive, isComplete, currPage, limit } = req.body;
			if (!currPage || !limit) {
				return res.status(400).json({
					success: false,
					message: "Pagination parameters are required",
				});
			}
			const offset = (currPage - 1) * limit;
			const requests = await OrderBatch.findAndCountAll({
				where: {
					toShip,
					toRecieve: toReceive,
					isComplete,
				},
				include: {
					model: User,
					attributes: { exclude: [] },
				},
				limit: limit,
				offset: offset,
				order: [["createdAt", "DESC"]],
			});
			res.send({
				success: true,
				data: requests.rows,
				total: requests.count,
				currentPage: currPage,
				totalPages: Math.ceil(requests.count / limit),
			});
		} catch (error) {
			res.status(500).send({ success: false, message: error.message });
		}
	}

	async getAllOrderFromUsersTabulator(req, res) {
		try {
			const { sellerId } = req.query;
			const { currPage, limit, isComplete } = req.body;

			let checkIsComplete = isComplete ? true : false;

			if (!currPage || !limit) {
				return res.status(400).json({
					success: false,
					message: "Pagination parameters are required",
				});
			}
			const offset = (currPage - 1) * limit;
			const requests = await Order.findAndCountAll({
				where: {
					sellerId,
					isComplete: checkIsComplete,
				},
				include: [
					{
						model: Product,
						as: "Product",
						attributes: { exclude: [] },
					},
					{
						model: User,
						as: "Customer",
						attributes: { exclude: [] },
					},
				],
				limit: limit,
				offset: offset,
				order: [["createdAt", "DESC"]],
			});

			res.send({
				success: true,
				data: requests.rows,
				total: requests.count,
				currentPage: currPage,
				totalPages: Math.ceil(requests.count / limit),
			});
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async getAllUserCount(req, res) {
		try {
			const userCount = await User.count();

			res.send({
				success: true,
				totalUsers: userCount,
			});
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async getTotalProductCount(req, res) {
		try {
			const productCount = await Product.count();

			res.send({
				success: true,
				totalProducts: productCount,
			});
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async getAllOrderRevenue(req, res) {
		try {
			const allOrders = await OrderBatch.findAll({
				where: {
					orderPaid: true,
				},
			});

			let totalRevenue = 0;
			let totalOrders = allOrders.length;
			const productCountMap = {};
			const monthlySalesMap = {};

			const currentDate = new Date();
			for (let i = 0; i < 6; i++) {
				const date = new Date(
					currentDate.getFullYear(),
					currentDate.getMonth() - i,
					1
				);
				const month = `${date.getFullYear()}-${(date.getMonth() + 1)
					.toString()
					.padStart(2, "0")}`;
				monthlySalesMap[month] = { totalSales: 0, revenue: 0 };
			}

			allOrders.forEach((order) => {
				const products = order.products || [];
				const orderRevenue = parseFloat(order.totalFee || 0);
				totalRevenue += orderRevenue;

				products.forEach((product) => {
					if (!productCountMap[product.id]) {
						productCountMap[product.id] = {
							name: product.name,
							count: 0,
						};
					}
					productCountMap[product.id].count += 1;
				});

				const orderDate = new Date(order.createdAt);
				const orderMonth = `${orderDate.getFullYear()}-${(
					orderDate.getMonth() + 1
				)
					.toString()
					.padStart(2, "0")}`;
				if (monthlySalesMap[orderMonth]) {
					monthlySalesMap[orderMonth].totalSales += products.length;
					monthlySalesMap[orderMonth].revenue += orderRevenue;
				}
			});

			const topProducts = Object.values(productCountMap)
				.sort((a, b) => b.count - a.count)
				.slice(0, 5);

			const userCount = await User.count();
			const productCount = await Product.count();

			const salesOverTime = Object.keys(monthlySalesMap)
				.sort()
				.map((month) => ({
					month,
					totalSales: monthlySalesMap[month].totalSales,
					revenue: monthlySalesMap[month].revenue.toFixed(2),
				}));

			res.send({
				success: true,
				totalRevenue: totalRevenue.toFixed(2),
				totalOrders,
				topProducts,
				userCount,
				productCount,
				salesOverTime,
			});
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async getAllOrderFromUsers(req, res) {
		try {
			const { sellerId } = req.query;
			const order = await Order.findAll({
				where: {
					sellerId,
					toShip: false,
				},
				include: [
					{
						model: Product,
						as: "Product",
						attributes: { exclude: [] },
						include: [
							{
								model: User,
								as: "Users",
								attributes: { exclude: [] },
							},
						],
					},
				],
			});
			res.send({ success: true, order });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async updateOrderStatus(req, res) {
		try {
			const { toPay, toShift, toRecieve, isComplete } = req.body;
			const order = await Order.findByPk(req.params.id);
			if (order) {
				order.toPay = toPay ?? order.toPay;
				order.toShift = toShift ?? order.toShift;
				order.toRecieve = toRecieve ?? order.toRecieve;
				order.isComplete = isComplete ?? order.isComplete;
				await order.save();
				res.status(200).json(order);
				res.send({
					success: true,
					message: "Successfully changed order status.",
				});
			} else {
				res.send({ success: false, message: "Order not found" });
			}
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async cancelOrder(req, res) {
		try {
			const { orderId, user } = req.body;
			const order = await OrderBatch.findByPk(orderId);
			if (!order) {
				return res.send({
					success: false,
					message: "Order does not exist.",
				});
			}
			await order.destroy();
			const notification = await Notification.create({
				userId: user.id,
				title: "Order Canceled",
				description: `Your order with ID ${orderId} has been canceled successfully.`,
				isRead: false,
			});

			res.send({
				success: true,
				message: "Order canceled and notification sent.",
				notification: notification,
			});
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async declineOrder(req, res) {
		try {
			const { orderId, userId } = req.body;
			const order = await OrderBatch.findByPk(orderId);
			if (!order) {
				return res.send({
					success: false,
					message: "Order does not exist.",
				});
			}
			await order.destroy();
			await Notification.create({
				userId,
				title: "Your Order has been declined.",
				description: `Your order with ID ${orderId} has been declined.`,
				isRead: false,
			});

			res.send({
				success: true,
				message: "Order declined successfully.",
			});
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async addTrackingInfo(req, res) {
		try {
			const { trackInfo } = req.body;
			const order = await Order.findByPk(req.params.id);
			if (order) {
				order.allTrack.push(trackInfo);
				await order.save();
				res.send({
					success: true,
					message: "Successfully added a tracking info.",
					order,
				});
			} else {
				res.send({ success: false, message: "Order not found" });
			}
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}
}

class CartProduct {
	constructor() {
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
		// this.router.get("/allOrders", expressAsyncHandler(this.getAllOrders));
		this.router.post("/createCart", expressAsyncHandler(this.createCart));
		this.router.get(
			"/getAllOrderFromUsers",
			expressAsyncHandler(this.getAllOrderFromUsers)
		);
		this.router.get(
			"/getAllCartById",
			expressAsyncHandler(this.getAllCartById)
		);
		this.router.post("/updateCart", expressAsyncHandler(this.updateCart));
		this.router.post(
			"/updateCartQuantity",
			expressAsyncHandler(this.updateCartQuantity)
		);
	}

	// async getAllOrders(req, res) {
	// 	try {
	// 		const newOrder = await Order.findAll({
	// 			include: [
	// 				{
	// 					model: Product,
	// 					as: "Product",
	// 					attributes: { exclude: [] },
	// 				},
	// 			],
	// 		});
	// 		res.send({ success: true, newOrder });
	// 	} catch (error) {
	// 		res.send({ success: false, message: error.message });
	// 	}
	// }

	async updateCartQuantity(req, res) {
		try {
			const { cartId, quantity } = req.body;
			const cart = await Cart.findByPk(cartId);
			if (!cart) {
				res.send({
					success: false,
					message: "Cart does not exists",
				});
			}
			await cart.update({ numberOfCart: parseInt(quantity) });

			res.send({
				success: true,
				message: "Cart items successfully updated.",
			});
		} catch (error) {
			res.send({
				success: false,
				message: error.message,
			});
		}
	}

	async updateCart(req, res) {
		try {
			const { cartIds } = req.body;
			console.log(cartIds);

			if (!cartIds || !Array.isArray(cartIds)) {
				return res.status(400).send({
					success: false,
					message: "Invalid cartIds provided.",
				});
			}
			await Cart.destroy({
				where: {
					id: {
						[Op.in]: cartIds,
					},
				},
			});
			res.send({
				success: true,
				message: "Cart items successfully removed.",
			});
		} catch (error) {
			res.send({
				success: false,
				message: error.message,
			});
		}
	}

	async createCart(req, res) {
		try {
			const { productId, userId } = req.body;
			const product = await Product.findOne({ where: { id: productId } });
			if (!product) {
				return res.send({
					success: false,
					message: "Product not found.",
				});
			}

			if (product.number_of_stock <= 0) {
				return res.send({
					success: false,
					message: "Sorry, this product is out of stock.",
				});
			}
			// await product.update({number_of_stock: product.number_of_stock - 1})
			let cart = await Cart.findOne({
				where: { productId, userId },
			});
			if (cart) {
				return res.send({
					success: false,
					message: "The product is already in the cart.",
				});
			}
			const newCart = await Cart.create({
				productId,
				userId,
			});

			res.send({
				success: true,
				newCart,
				message: "Product added to the cart successfully.",
			});
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async getAllCartById(req, res) {
		try {
			const { userId } = req.query;
			const whereClause = { userId };

			const cart = await Cart.findAll({
				where: whereClause,
				include: [
					{
						model: Product,
						as: "Product",
						attributes: { exclude: [] },
						include: [
							{
								model: User,
								as: "Users",
								attributes: { exclude: [] },
							},
						],
					},
				],
			});
			res.send({ success: true, cart });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	// async getAllOrderFromUsers(req, res) {
	// 	try {
	// 		const { sellerId } = req.query;
	// 		const order = await Order.findAll({
	// 			where: {
	// 				sellerId,
	// 			},
	// 			include: [
	// 				{
	// 					model: Product,
	// 					as: "ProductOrders",
	// 					attributes: { exclude: [] },
	// 				},
	// 			],
	// 		});
	// 		res.send({ success: true, order });
	// 	} catch (error) {
	// 		res.send({ success: false, message: error.message });
	// 	}
	// }

	// async updateOrderStatus(req, res) {
	// 	try {
	// 		const { toPay, toShift, toRecieve, isComplete } = req.body;
	// 		const order = await Order.findByPk(req.params.id);
	// 		if (order) {
	// 			order.toPay = toPay ?? order.toPay;
	// 			order.toShift = toShift ?? order.toShift;
	// 			order.toRecieve = toRecieve ?? order.toRecieve;
	// 			order.isComplete = isComplete ?? order.isComplete;
	// 			await order.save();
	// 			res.status(200).json(order);
	// 			res.send({
	// 				success: true,
	// 				message: "Successfully changed order status.",
	// 			});
	// 		} else {
	// 			res.send({ success: false, message: "Order not found" });
	// 		}
	// 	} catch (error) {
	// 		res.send({ success: false, message: error.message });
	// 	}
	// }

	// async addTrackingInfo(req, res) {
	// 	try {
	// 		const { trackInfo } = req.body;
	// 		const order = await Order.findByPk(req.params.id);
	// 		if (order) {
	// 			order.allTrack.push(trackInfo);
	// 			await order.save();
	// 			res.send({
	// 				success: true,
	// 				message: "Successfully added a tracking info.",
	// 				order,
	// 			});
	// 		} else {
	// 			res.send({ success: false, message: "Order not found" });
	// 		}
	// 	} catch (error) {
	// 		res.send({ success: false, message: error.message });
	// 	}
	// }
}

const userRouter = new UserRoute().router;
const chatRouter = new ChatRouter().router;
const productRouter = new ProductRoute().router;
const orderRouter = new OrderRouter().router;
const cartRouter = new CartProduct().router;
const imageRouter = new ImageHandler().router;
module.exports = {
	userRouter,
	productRouter,
	chatRouter,
	orderRouter,
	cartRouter,
	imageRouter,
};
