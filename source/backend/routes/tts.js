const express = require('express');
const router = express.Router();

// GET /speak?text=...
router.get('/speak', async (req, res) => {
    const text = req.query.text || '';
    if (!text) {
        return res.status(400).send("No text provided");
    }

    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=vi&q=${encodeURIComponent(text)}`;
        const upstream = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });

        if (!upstream.ok) {
            return res.status(502).send("TTS upstream error");
        }

        const buffer = Buffer.from(await upstream.arrayBuffer());
        res.set({
            "Content-Type": "audio/mpeg",
            "Content-Length": buffer.length,
            "Accept-Ranges": "bytes"
        });
        res.status(200).send(buffer);
    } catch (err) {
        console.error(err);
        res.status(500).send(String(err));
    }
});

module.exports = router;
