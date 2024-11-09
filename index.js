import pkg from 'fluent-ffmpeg'
import ffmpegPath from 'ffmpeg-static'
import ytdl from '@distube/ytdl-core'
import cliProgress from 'cli-progress'
import fs from 'fs'
import path from 'path'
import { Command } from 'commander'

const { setFfmpegPath } = pkg
setFfmpegPath(ffmpegPath)

const ffmpeg = pkg

const __dirname = path.resolve()

// Configure command-line options
const program = new Command()
program
  .version('1.0.0')
  .description('YouTube to MP3 Converter')
  .option('-u, --url <url>', 'YouTube video URL')
  .option('-o, --output <folder>', 'Output folder for MP3 file', 'downloads')
  .parse(process.argv)

const options = program.opts()

if (!options.url) {
  console.error(
    'Error: Please specify a YouTube URL using the -u or --url option.'
  )
  process.exit(1)
}

const convertToMp3 = async (url, outputFolder) => {
  try {
    const info = await ytdl.getInfo(url)
    const title = info.videoDetails.title.replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Sanitize file name

    const outputPath = path.join(__dirname, outputFolder, `${title}.mp3`)
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true })
    }

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
      (chunkLength, total) => {
        downloadedBytes += chunkLength
        const percent = Math.round((downloadedBytes / total) * 100)
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
    console.error(`\nFailed to convert: ${error.message}`)
  }
}

convertToMp3(options.url, options.output)
