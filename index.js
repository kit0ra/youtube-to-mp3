const fs = require('fs')
const ytdl = require('ytdl-core')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')

ffmpeg.setFfmpegPath(ffmpegPath)

const convertToMp3 = async (url, outputPath) => {
  const videoStream = ytdl(url, { quality: 'highestaudio' })

  ffmpeg(videoStream)
    .audioBitrate(320)
    .format('mp3')
    .on('error', err => console.error(`Error: ${err.message}`))
    .on('end', () => console.log(`Converted to: ${outputPath}`))
    .save(outputPath)
}

// Usage
const youtubeUrl = 'YOUR_YOUTUBE_VIDEO_URL'
convertToMp3(youtubeUrl, './output.mp3')
