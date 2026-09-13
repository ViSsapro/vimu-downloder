const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Main Extractor API Endpoint
app.post('/api/extract', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL field is required.' });
    }

    try {
        // Dynamic Extraction API Routing via Cobalt Protocol Engine
        const response = await axios.post('https://co.wuk.sh/api/json', {
            url: url,
            vCodec: 'h264',
            vQuality: 'max',
            aFormat: 'mp3',
            isAudioOnly: false,
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        const data = response.data;

        if (data.status === 'stream' || data.status === 'redirect') {
            return res.json({
                success: true,
                downloadUrl: data.url,
                filename: data.filename || 'download.mp4'
            });
        } else if (data.status === 'picker') {
            return res.json({
                success: true,
                picker: data.picker, // Multi-quality or gallery items
            });
        } else {
            return res.status(400).json({ success: false, error: data.text || 'Unable to extract video stream.' });
        }
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: 'Server error or website blocked request. Try using proxy headers.'
        });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Downloader engine running on http://localhost:${PORT}`);
});
