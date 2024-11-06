const express = require("express");
const bcrypt = require("bcrypt");

// const jwt = require("jsonwebtoken");
const { User, Product, Chat, ChatMessage, Order, Cart } = require("./models");
const { isSeller } = require("./middleware");

const router = express.Router();
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const expressAsyncHandler = require("express-async-handler");

// const JWT_SECRET = process.env.JWT_SECRET || "instamine";

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
		this.router = router;
		this.initRoutes();
	}

	initRoutes() {
		this.router.post("/get-chats", expressAsyncHandler(this.getAllChats));
		this.router.post(
			"/retrieve-chat",
			expressAsyncHandler(this.retrieveChats)
		);
		this.router.post("/message", expressAsyncHandler(this.messagePartner));
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
						};
					}
					return null;
				})
			);

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
		this.router = router;
		this.initRoutes();
	}

	initRoutes() {
		this.router.post("/", asyncHandler(this.test));
		this.router.post("/create", asyncHandler(this.createUser));
		this.router.post("/verify", asyncHandler(this.verifyAccount));
		this.router.post("/seller", asyncHandler(this.becomeSeller));

		this.router.get("/login", asyncHandler(this.loginUser));
		this.router.post(
			"/startStreaming",
			expressAsyncHandler(this.startStreaming)
		);
	}

	async createUser(req, res) {
		const {
			firstName,
			lastName,
			username,
			birthdate,
			email,
			password,
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
		this.router = router;
		this.initRoutes();
	}

	initRoutes() {
		this.router.get("/", asyncHandler(this.test));
		this.router.post("/create", isSeller, asyncHandler(this.createProduct));
		this.router.post(
			"/deactive:id",
			isSeller,
			asyncHandler(this.deactivateProduct)
		);
		this.router.get("/products", asyncHandler(this.getAllProducts));
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

	async getAllProducts(req, res) {
		const { category, search, email } = req.query;

		try {
			let query = {
				where: {},
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

			const products = await Product.findAll(query);

			return res.send({
				success: true,
				message: "Products fetched successfully",
				products,
			});
		} catch (error) {
			return res.send({
				success: false,
				message: "Product fetched unsuccessfully",
				error: error.message,
			});
		}
	}
}

class OrderRouter {
	constructor() {
		this.router = router;
		this.initRoutes();
	}

	initRoutes() {
		this.router.get("/allOrders", expressAsyncHandler(this.getAllOrders));
		this.router.post("/createOrder", expressAsyncHandler(this.createOrder));
		this.router.post("/bulkOrder", expressAsyncHandler(this.bulkOrder));
		this.router.post("/cancelOrder", expressAsyncHandler(this.cancelOrder));
		this.router.post("/shipOrder", expressAsyncHandler(this.shipOrder));
		this.router.get(
			"/getAllOrderFromUsers",
			expressAsyncHandler(this.getAllOrderFromUsers)
		);
		this.router.get(
			"/getAllOrderById",
			expressAsyncHandler(this.getAllOrderById)
		);
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
			res.send({ sucess: true, newOrder });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async createOrder(req, res) {
		try {
			const { productId, numberOfProduct, userId, sellerId } = req.body;
			const newOrder = await Order.create({
				productId,
				numberOfProduct,
				userId,
				sellerId,
				toPay: true,
			});
			res.send({ success: true, newOrder });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async bulkOrder(req, res) {
		try {
			const { products, userId } = req.body;
			const orders = await Promise.all(
				products.map(async (product) => {
					return await Order.create({
						productId: product.productId,
						numberOfProduct: product.numberOfProduct,
						userId,
						sellerId: product.sellerId,
						toPay: true,
					});
				})
			);
			const cartItems = await Cart.findAll({ where: { userId } });
			await Promise.all(cartItems.map((item) => item.destroy()));

			res.send({ success: true, orders });
		} catch (error) {
			res.send({ success: false, message: error.message });
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
			} else if (toReceive !== undefined) {
				whereClause["toRecieve"] = toReceive;
				whereClause["isComplete"] = false;
			} else if (isComplete !== undefined)
				whereClause["isComplete"] = isComplete;

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
			await order.update({ toShip: true });
			res.send({ success: true });
		} catch (error) {
			res.send({ success: false, message: error.message });
		}
	}

	async cancelOrder(req, res) {
		try {
			const { id } = req.body;

			const order = await Order.findByPk(id);
			await order.destroy();
			res.send({ success: true });
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
		this.router = router;
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
	// 		res.send({ sucess: true, newOrder });
	// 	} catch (error) {
	// 		res.send({ success: false, message: error.message });
	// 	}
	// }

	async createCart(req, res) {
		try {
			const { productId, userId } = req.body;
			let cart = await Cart.findOne({
				where: { productId, userId },
			});
			if (cart) {
				res.send({
					success: false,
					message: "The product is already in the cart.",
				});
				return;
			}
			const newCart = await Cart.create({
				productId,
				userId,
			});
			res.send({ success: true, newCart });
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
module.exports = {
	userRouter,
	productRouter,
	chatRouter,
	orderRouter,
	cartRouter,
};
