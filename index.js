import pkg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ytdl from '@distube/ytdl-core'
import cliProgress from 'cli-progress'
import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()

const { setFfmpegPath } = pkg
setFfmpegPath(ffmpegPath)

const ffmpeg = pkg

const convertToMp3 = async url => {
  try {
    // Fetch basic information to get the video title and duration
    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Sanitize file name

    // Create downloads folder if it doesn't exist
    const downloadsFolder = path.join(__dirname, 'downloads')
    if (!fs.existsSync(downloadsFolder)) {
      fs.mkdirSync(downloadsFolder)
    }

    const outputPath = path.join(downloadsFolder, `${title}.mp3`)

    console.log(`Starting conversion for: ${title}`)

    // Initialize the progress bar
    const progressBar = new cliProgress.SingleBar(
      {},
      cliProgress.Presets.shades_classic
    )
    progressBar.start(100, 0) // Start at 0%

    // Track download progress
    let downloadedBytes = 0
    const videoStream = ytdl(url, { quality: 'highestaudio' }).on(
      'progress',
      (chunkLength, downloaded, total) => {
        downloadedBytes += chunkLength
        const percent = Math.round((downloadedBytes / total) * 100) // Round to nearest whole number
        progressBar.update(percent) // Update progress bar
      }
    )

    ffmpeg(videoStream)
      .audioBitrate(320)
      .format('mp3')
      .on('error', err => {
        console.error(`Error: ${err.message}`)
        progressBar.stop()
      })
      .on('end', () => {
        console.log(`\nConverted to: ${outputPath}`)
        progressBar.stop()
      })
      .save(outputPath)
  } catch (error) {
    console.error(`Failed to convert: ${error.message}`)
  }
}

// Usage example
const youtubeUrl = 'https://www.youtube.com/watch?v=QtXby3twMmI'
convertToMp3(youtubeUrl)
