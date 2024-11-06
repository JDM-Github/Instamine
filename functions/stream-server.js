const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const ffmpegPath = require("ffmpeg-static");
const ffmpeg = require("fluent-ffmpeg");
const { PassThrough } = require("stream");
ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const activeStreams = {};
const usersInStream = {};

io.on("connection", (socket) => {
	console.log("Connection Established.");

	socket.on("join_stream", ({ streamId }) => {
		console.log(`Client joined stream: ${streamId}`);
		socket.join(streamId);
	});

	// socket.on("join_stream", ({ streamId, userId }) => {
	// 	if (usersInStream[streamId]?.includes(userId)) {
	// 		console.log(`User ${userId} is already in stream ${streamId}`);
	// 		return;
	// 	}

	// 	console.log(`Client ${userId} joined stream: ${streamId}`);
	// 	socket.join(streamId);

	// 	if (!usersInStream[streamId]) {
	// 		usersInStream[streamId] = [];
	// 	}
	// 	usersInStream[streamId].push(userId);

	// 	if (!activeStreams[streamId]) {
	// 		startStream(streamId);
	// 	}
	// });

	socket.on("start_stream", ({ yt_url, streamId }) => {
		console.log("START stream:", streamId);
		startStream(yt_url, streamId);
	});

	socket.on("new_comment", ({ streamId, commentData }) => {
		console.log(`New comment in stream ${streamId}:`, commentData);
		io.to(streamId).emit("receive_comment", commentData);
	});

	socket.on("end_stream", ({ streamId }) => {
		console.log(`Ending stream: ${streamId}`);
		// endStream(streamId);
	});
});

// let ffmpegStream;
async function startStream(yt_url, streamId) {
	if (!yt_url) {
		console.log("Error: No stream URL provided.");
		return;
	}

	try {
		const ffmpegStream = ffmpeg(yt_url)
			.inputOptions("-re")
			.outputOptions("-vf", "fps=30")
			.outputOptions("-f", "image2pipe")
			.outputOptions("-q:v", "2")
			.format("mjpeg")
			.pipe(new PassThrough(), { end: true });

		ffmpegStream.on("data", (chunk) => {
			io.to(streamId).emit("frame", chunk);
		});

		ffmpegStream.on("error", (err) => {
			console.log("FFmpeg Error:", err.message);
			endStream(streamId);
		});
	} catch (error) {
		console.log("Error in startStream:", error.message);
	}
}

// function endStream(streamId) {
// 	const stream = activeStreams[streamId];
// 	if (stream) {
// 		stream.unpipe();
// 		delete activeStreams[streamId];
// 		console.log(`Stream ${streamId} has been stopped.`);
// 	}
// }

const port = 3000;
server.listen(port, () => {
	console.log(`Listening in PORT: ${port}`);
});
