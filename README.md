# Google Gemini AI

Three JavaScript projects built while exploring the Gemini API. The focus was getting hands-on with different capabilities: conversational AI, basic API integration, and image analysis via Gemini Pro Vision.

---

## Projects

### Commander Data Personal Companion

A chat assistant styled after the Star Trek character Commander Data. The personality and response patterns are shaped through a system prompt that leans into the character — factual, precise, occasionally philosophical.

Integrates OpenWeatherMap alongside Gemini so weather queries return real data rather than a generic response. Includes light and dark theme support, and stores preferences in local storage so settings persist between sessions.

**Uses:** Gemini AI API, OpenWeatherMap API, HTML, CSS, JavaScript

[View project](GeminiAI-PersonalCompanion/)

---

### Gemini AI API Examples

Minimal JavaScript examples showing how to interact with the Gemini API: sending a prompt, reading the response, handling errors, and chaining basic requests. A starting point if you are learning the API or want a clean reference without a full app around it.

**Uses:** Gemini AI API, JavaScript

[View project](GeminiAI-APICall/)

---

### Gemini AI Image Analyzer

Pass an image to Gemini Pro Vision and get back a structured description: objects present, visible text, context, and notable details. Demonstrates how to send image data to the API and parse the response into something readable.

**Uses:** Gemini Pro Vision API, JavaScript

[View project](GeminiAI-Image-Analyzer/)

---

## Setup

All three projects require a Gemini API key. The Commander Data project also requires an OpenWeatherMap API key.

- Gemini API key: [Google AI Studio](https://makersuite.google.com/app/apikey)
- OpenWeatherMap key: [openweathermap.org/api](https://openweathermap.org/api)

Store your keys in environment variables or a local config file. Do not commit them to the repository.

---

## License

MIT
