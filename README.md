# Plant Care Gujarati (Expo)

This repository contains an Expo managed React Native app converted from a JSX web component: a Plant Care Guide in Gujarati with a photo-identify tab that expects a backend identify endpoint.

What is included
- App.js — the Expo React Native app
- data/plants.js — initial plant data (subset included; request full set if needed)
- package.json — quick project configuration

What I did NOT include
- Fonts (Noto Serif Gujarati / Noto Sans Gujarati) are not committed to the repo to avoid large binary files. Please add them to `assets/fonts/` with the filenames:
  - `NotoSerifGujarati-Regular.ttf`
  - `NotoSansGujarati-Regular.ttf`

How to run locally
1. Clone the repo
   git clone https://github.com/ravichitroda-rc/plant-care-gujarati
   cd plant-care-gujarati

2. Install dependencies
   npm install

3. Add fonts
   Create `assets/fonts/` and place the two TTF files there (download from Google Fonts).

4. Start Expo
   npx expo start

Notes about Photo-ID
- The app uses a placeholder backend URL `https://your-backend.example.com/identify` in App.js. You must deploy a server that accepts `{ base64, media_type }` and calls your chosen LLM/vision API (Anthropic, OpenAI, etc.) and returns the parsed JSON. Do NOT put your API key into the mobile app.

If you want, I can push the full PLANTS array (all plants from the original JSX) or add a small example Express backend and instructions to deploy it.
