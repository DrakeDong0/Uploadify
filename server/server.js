const express = require('express');
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;

const spotifyApi = new SpotifyWebApi({
  clientId,
  clientSecret,
  redirectUri,
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/exchange_token', (req, res) => {
    const { code } = req.body;

    spotifyApi.authorizationCodeGrant(code)
        .then(data => {
            const { access_token, refresh_token } = data.body;
            res.json({
                access_token: access_token,
                refresh_token: refresh_token
            });
        })
        .catch(error => {
            console.error('Error exchanging authorization code:', error);
            res.status(500).json({ error: 'Error exchanging authorization code' });
        });
});


app.post('/refresh_token/', async (req, res) => {
    const { refreshToken } = req.body;
    spotifyApi.setRefreshToken(refreshToken);

    try {
        const data = await spotifyApi.refreshAccessToken();
        const { access_token } = data.body;
        res.json({ access_token: access_token });
    } catch (err) {
        console.error('Could not refresh access token', err);
        res.status(500).json({ error: 'Could not refresh access token' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
