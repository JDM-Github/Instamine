const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const ffmpegPath = require('ffmpeg-static')
const ffmpeg = require('fluent-ffmpeg');
const { PassThrough } = require('stream');
ffmpeg.setFfmpegPath(ffmpegPath)

const app = express()
const server = http.createServer(app)
const io = socketIo(server)

io.on('connection', (socket) => {
    console.log("Connection Established.");

    socket.on('start_stream', (yt_url) => {
        console.log("START")
        startStream(yt_url, socket)        
    })

})

async function startStream(yt_url, socket) {
    try {
        const streamUrl = yt_url
        const ffmpegStream = ffmpeg(streamUrl)
            .inputOptions('-re')
            .outputOptions('-vf', 'fps=30')
            .outputOptions('-f', 'image2pipe')
            .outputOptions('-q:v', '2')
            .format('mjpeg')
            .pipe(new PassThrough(), { end: true })
        
        ffmpegStream.on('data', (chunk) => {
            socket.emit('frame', chunk)
        })
    } catch (error) {
        console.log("TEST")
    }
}

const port = 3000;
server.listen(port, () => {
    console.log(`Listening in PORT: ${port}`)
})