const express = require("express");
const {
	YoutubeMetadata,
	ChatSend,
	ChatReceive,
	LiveStreamSchedule,
} = require("./models");
const { Op } = require("sequelize");
const expressAsyncHandler = require("express-async-handler");

class YoutubeRouter {
	constructor() {
		this.router = express.Router();
		this.initRoutes();
	}

	initRoutes() {
		this.router.post(
			"/start-stream",
			expressAsyncHandler(async (req, res) => {
				const { url, products } = req.body;
				if (!url) {
					return res.status(400).json({
						error: "URL are required",
					});
				}
				await YoutubeMetadata.destroy({ where: {} });
				const newMetadata = await YoutubeMetadata.create({
					video_id: url,
					metadata: {},
					products: products,
				});
				console.log(newMetadata);
				await ChatSend.destroy({ where: {} });
				await ChatReceive.destroy({ where: {} });

				res.json({
					success: true,
					message: "Stream started successfully.",
					data: newMetadata,
				});
			})
		);

		this.router.post(
			"/set-live",
			expressAsyncHandler(async (req, res) => {
				const { url, startTimestamp, products } = req.body;
				try {
					await LiveStreamSchedule.create({
						url,
						startTimestamp,
						products,
					});
					res.send({ success: true });
				} catch (error) {
					console.error("Error setting live:", error);
					res.status(500).json({
						success: false,
						message: "Failed to setting live.",
					});
				}
			})
		);

		this.router.post(
			"/set-live-complete",
			expressAsyncHandler(async (req, res) => {
				const { id } = req.body;
				try {
					const live = await LiveStreamSchedule.findByPk(id);
					if (!live) {
						res.send({ success: false, message: "Live not found" });
					}
					await live.update({ isComplete: true });
					if (!live.url) {
						return res.status(400).json({
							error: "URL are required",
						});
					}
					await YoutubeMetadata.destroy({ where: {} });
					const newMetadata = await YoutubeMetadata.create({
						video_id: live.url,
						metadata: {},
						products: live.products,
					});
					console.log(newMetadata);
					await ChatSend.destroy({ where: {} });
					await ChatReceive.destroy({ where: {} });

					res.send({ success: true });
				} catch (error) {
					console.error("Error setting live:", error);
					res.status(500).json({
						success: false,
						message: "Failed to setting live.",
					});
				}
			})
		);

		this.router.post(
			"/delete-live",
			expressAsyncHandler(async (req, res) => {
				const { id } = req.body;
				try {
					await LiveStreamSchedule.destroy({
						where: { id },
					});
					res.send({ success: true });
				} catch (error) {
					console.error("Error setting live:", error);
					res.status(500).json({
						success: false,
						message: "Failed to setting live.",
					});
				}
			})
		);

		this.router.post(
			"/get-all-live",
			expressAsyncHandler(async (req, res) => {
				try {
					const { currPage, limit } = req.body;

					if (!currPage || !limit) {
						return res.status(400).json({
							success: false,
							message: "Pagination parameters are required",
						});
					}

					const offset = (currPage - 1) * limit;
					const requests = await LiveStreamSchedule.findAndCountAll({
						where: { isComplete: false },
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
					console.error("Error fetching all live:", error);
					res.status(500).json({
						success: false,
						message: "An error occurred while fetching requests",
					});
				}
			})
		);

		this.router.post(
			"/get-all-live-complete",
			expressAsyncHandler(async (req, res) => {
				try {
					const { currPage, limit } = req.body;

					if (!currPage || !limit) {
						return res.status(400).json({
							success: false,
							message: "Pagination parameters are required",
						});
					}

					const offset = (currPage - 1) * limit;
					const requests = await LiveStreamSchedule.findAndCountAll({
						where: { isComplete: true },
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
					console.error("Error fetching all live:", error);
					res.status(500).json({
						success: false,
						message: "An error occurred while fetching requests",
					});
				}
			})
		);

		this.router.post(
			"/end-stream",
			expressAsyncHandler(async (req, res) => {
				await YoutubeMetadata.destroy({ where: {} });
				await ChatSend.destroy({ where: {} });
				await ChatReceive.destroy({ where: {} });

				res.json({
					success: true,
					message:
						"Stream ended successfully. All data has been cleared.",
				});
			})
		);

		this.router.get(
			"/get-metadata",
			expressAsyncHandler(async (req, res) => {
				let metadata = await YoutubeMetadata.findOne({
					where: {},
				});
				if (!metadata) {
					res.send({
						success: false,
						metadata: "",
						url: "",
						products: [],
					});
					return;
				}
				res.json({
					success: true,
					metadata: metadata.metadata,
					url: metadata.video_id,
					products: metadata.products,
				});
			})
		);
		this.router.get(
			"/get-yt-url",
			expressAsyncHandler(async (req, res) => {
				let metadata = await YoutubeMetadata.findOne({
					where: {},
				});
				if (!metadata) {
					res.send({ success: true, url: null });
					return;
				}
				res.send({
					success: true,
					url: metadata.video_id,
					products: metadata.products,
				});
			})
		);

		this.router.post(
			"/send-chat-live",
			expressAsyncHandler(async (req, res) => {
				const { profileSrc, user, message } = req.body;
				console.log(req.body);
				if (profileSrc === undefined || !user || !message) {
					return res.send({
						success: false,
						message: "Details are required",
					});
				}
				await ChatSend.create({
					userProfile: profileSrc,
					user,
					message,
				});
				res.json({
					success: true,
					message: "Chat message sent successfully.",
				});
			})
		);

		// this.router.post(
		// 	"/process-chat",
		// 	expressAsyncHandler(async (req, res) => {
		// 		const chatMessages = await ChatSend.findAll();
		// 		const receivedChats = chatMessages.map((chat) => ({
		// 			userProfile: chat.userProfile,
		// 			user: chat.user,
		// 			message: chat.message,
		// 		}));
		// 		res.json({
		// 			success: true,
		// 			message: "Chat processed successfully.",
		// 			messages: receivedChats,
		// 		});
		// 	})
		// );
		this.router.post(
			"/process-chat",
			expressAsyncHandler(async (req, res) => {
				const last30Chats = await ChatSend.findAll({
					order: [["createdAt", "DESC"]],
					limit: 30,
				});
				const receivedChats = last30Chats.reverse().map((chat) => ({
					userProfile: chat.userProfile,
					user: chat.user,
					message: chat.message,
					timestamp: chat.timestamp,
				}));
				res.json({
					success: true,
					message: "Chat processed successfully.",
					messages: receivedChats,
				});
			})
		);

		this.router.post(
			"/fetch-chats",
			expressAsyncHandler(async (req, res) => {
				try {
					const ytmeta = await YoutubeMetadata.findOne();
					if (ytmeta == null)
					{
						return res.send({success: false});
					}

					const last30Chats = await ChatSend.findAll({
						order: [["createdAt", "DESC"]], 
						limit: 30,
					});
					const receivedChats = last30Chats.reverse().map((chat) => ({
						id: chat.id,
						userProfile: chat.userProfile,
						user: chat.user,
						message: chat.message,
						timestamp: chat.timestamp,
					}));
					res.json({ success: true, chats: receivedChats });
				} catch (error) {
					console.error("Error fetching chats:", error);
					res.status(500).json({
						success: false,
						message: "Failed to fetch chats.",
					});
				}
			})
		);
	}
}

const youtubeRouter = new YoutubeRouter().router;
module.exports = { youtubeRouter };
