// server.js
import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // ✅ Enable CORS for all origins

const CONTINENTS = ["AFR", "ANT", "ASIA", "AUS", "EUR", "NAR", "SAR", "Ocean"];

app.get('/api/disaster', async (req, res) => {
    try {
        const results = await Promise.all(
            CONTINENTS.map(async (continent) => {
                const response = await fetch(
                    `https://api.ambeedata.com/disasters/latest/by-continent?continent=${continent}&page=1&limit=5`,
                    {
                        headers: {
                            'x-api-key': process.env.AMBEEDATA_API_KEY || "f93c81fe438db3ffb0ecaa0d7356d9ac806bbea4540730f905df48131206da47",
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`Failed for ${continent}:`, errorText);
                    return null;
                }

                const data = await response.json();
                return { continent, data };
            })
        );

        // Filter out failed or null responses
        const validResults = results.filter(Boolean);

        res.json(validResults);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
