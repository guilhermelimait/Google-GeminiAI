# 📷 Gemini AI Image Analyzer

A web-based application that analyzes images using Google's Gemini Pro Vision API, providing a detailed list of objects and elements found in the uploaded images.

![Gemini Image Analyzer Demo](demo.png)

## 🚀 Features

- Clean and modern user interface
- Real-time image preview
- Secure API key management
- Detailed object detection and analysis
- Mobile-responsive design

## 🤖 AI Model

This project uses the **Gemini Pro Vision** model, which is part of Google's Gemini AI family:
- Model: `gemini-pro-vision`
- API Version: v1
- Max Input Size: 4MB
- Supported Formats: JPEG, PNG, WEBP
- Response Type: Natural language description of detected objects

## 🛠️ Technologies Used

- HTML5 & CSS3
- JavaScript (Vanilla)
- Google's Gemini Pro Vision API
- Poppins Font (Google Fonts)

## 🔧 Setup

1. Clone this repository:
```bash
git clone https://github.com/yourusername/gemini-image-analysis.git
```

2. Get your Gemini AI API key:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the key (starts with "AI...")

3. Open `index.html` in your web browser

4. Click the settings icon (⚙️) and enter your API key

## 📝 How to Use

1. Click "Choose Image" to select an image
2. Preview the selected image
3. Click "Analyze Image" to process
4. View the detected objects list

## ⚙️ API Configuration

The application uses these API settings:
```javascript
{
    temperature: 0.2,
    maxOutputTokens: 1024,
    safetySettings: [
        {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
    ]
}
```

## 🔒 Privacy & Security

- API keys are stored in browser's localStorage
- No images are stored on servers
- Secure API calls over HTTPS
- No data persistence

## 📋 Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Active internet connection
- Valid Gemini AI API key
- Images less than 4MB in size

## 🤝 Contributing

Contributions are welcome:
- Open issues
- Suggest improvements
- Submit pull requests

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
*Note: Gemini AI and its APIs are subject to Google's terms of service and usage limits.*