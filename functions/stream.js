const express = require("express");
const { YoutubeMetadata, ChatSend, ChatReceive } = require("./models");
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
				const { url } = req.body;
				if (!url) {
					return res.status(400).json({
						error: "URL are required",
					});
				}
				await YoutubeMetadata.destroy({ where: {} });
				const newMetadata = await YoutubeMetadata.create({
					video_id: url,
					metadata: {},
				});
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
					});
					return;
				}
				res.json({
					success: true,
					metadata: metadata.metadata,
					url: metadata.video_id,
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

		this.router.post(
			"/process-chat",
			expressAsyncHandler(async (req, res) => {
				const chatMessages = await ChatSend.findAll();
				const receivedChats = chatMessages.map((chat) => ({
					userProfile: chat.userProfile,
					user: chat.user,
					message: chat.message,
				}));
				await ChatReceive.destroy({ where: {} });
				await ChatSend.destroy({ where: {} });
				const value = await ChatReceive.bulkCreate(receivedChats);
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
				const { lastMessageId } = req.body;
				let chats;

				try {
					if (lastMessageId) {
						chats = await ChatReceive.findAll({
							where: { id: { [Op.gt]: lastMessageId } },
							order: [["id", "ASC"]],
						});
					} else {
						chats = await ChatReceive.findAll({
							order: [["id", "ASC"]],
							limit: 30,
						});
					}
					res.json({ success: true, chats });
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
