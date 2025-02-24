// Initialize API keys and preferences
const API_KEYS = {
    WEATHER: '',
    GEMINI: ''
};

// Weather emoji mappings
const WEATHER_EMOJIS = {
    'clear sky': '☀️',
    'few clouds': '🌤️',
    'scattered clouds': '⛅',
    'broken clouds': '☁️',
    'overcast clouds': '☁️',
    'light rain': '🌦️',
    'moderate rain': '🌧️',
    'heavy rain': '⛈️',
    'thunderstorm': '⛈️',
    'snow': '🌨️',
    'mist': '🌫️',
    'fog': '🌫️'
};

// Star Trek themed greetings
const TREK_GREETINGS = [
    "Greetings! I am Commander Data, how may I assist you today? 🖖",
    "Welcome! My neural networks are functioning within normal parameters. How may I be of service? 🖖",
    "Greetings! I am prepared to assist you with an efficiency rating of 100%. How may I help? 🖖",
    "Hello! My positronic brain is ready to process your queries. How may I assist? 🖖"
];

// Initialize user preferences
let USER_PREFERENCES = {
    theme: 'light',
    continuePreviousChats: true,
    chatHistory: [],
    personalInfo: {
        name: '',
        nickname: '',
        defaultCity: ''
    }
};

// Update the weather pattern to catch more variations
const weatherPattern = /(?:weather|temperature|temp|forecast|how (?:hot|cold|warm) is it)(?: (?:today|now|tonight))?(?: in)? ?([a-zA-Z\s,]+?)?(?: (?:today|now|tonight))?\??$/i;

// Setup functions
document.addEventListener('DOMContentLoaded', () => {
    setupUserPreferences();
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
    }
    
    // Setup input handling
    const userInput = document.getElementById('userInput');
    if (userInput) {
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    // Show initial greeting
    const randomGreeting = TREK_GREETINGS[Math.floor(Math.random() * TREK_GREETINGS.length)];
    addMessageToChat('ai', randomGreeting);
});

// Theme toggle function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
    }
}

// Update the sendMessage function to handle weather queries better
async function sendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;

    addMessageToChat('user', message);
    userInput.value = '';
    userInput.style.height = 'auto';
    userInput.focus();

    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
    }

    try {
        let aiResponse;
        
        // Check for weather-related queries
        if (weatherPattern.test(message)) {
            const matches = message.match(weatherPattern);
            // Use specified city or default city
            let city = matches[1] ? matches[1].trim() : USER_PREFERENCES.personalInfo.defaultCity;
            
            if (!city) {
                aiResponse = "I apologize, but I don't know which city to check. Please specify a city or set your default city in settings. 🌍";
            } else {
                aiResponse = await getWeather(city);
            }
        } else {
            aiResponse = await getGeminiResponse(message);
        }

        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }

        addMessageToChat('ai', aiResponse);

        if (USER_PREFERENCES.continuePreviousChats) {
            USER_PREFERENCES.chatHistory.push(
                { role: 'user', content: message },
                { role: 'assistant', content: aiResponse }
            );
            localStorage.setItem('chatHistory', JSON.stringify(USER_PREFERENCES.chatHistory));
        }
    } catch (error) {
        console.error('Error:', error);
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        addMessageToChat('ai', `I apologize, but I encountered an error: ${error.message}. Please try again. ⚠️`);
    }
}

// Add message to chat
function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    const timestamp = new Date().toLocaleTimeString();
    
    // Remove any extra newlines at the start and end of the content
    content = content.trim();
    
    messageDiv.innerHTML = `<div class="message-content">${content}<div class="timestamp">${timestamp}</div></div>`;
    
    const chatHistory = document.getElementById('chatHistory');
    if (chatHistory) {
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }
}

// Update the weather function with reduced spacing
async function getWeather(city) {
    if (!API_KEYS.WEATHER) {
        return "Please set up your OpenWeather API key in the settings first. 🔧";
    }

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEYS.WEATHER}&units=metric`);
        const data = await response.json();
        
        if (response.status === 404) {
            return `I apologize, but I cannot find weather data for ${city}.\nPlease verify the city name and try again. 🔍`;
        }

        if (!response.ok) {
            throw new Error(`Weather API error: ${data.message}`);
        }

        const weather = data.weather[0].description;
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const windSpeed = Math.round(data.wind.speed * 3.6); // Convert m/s to km/h

        // Get weather emoji
        const weatherEmoji = WEATHER_EMOJIS[weather.toLowerCase()] || '🌡️';

        // Add thermometer emoji based on temperature
        let tempEmoji;
        if (temp <= 0) tempEmoji = '🥶';
        else if (temp < 10) tempEmoji = '❄️';
        else if (temp < 20) tempEmoji = '😊';
        else if (temp < 30) tempEmoji = '☀️';
        else tempEmoji = '🥵';

        // Format response without extra newlines
        return `Here is the current weather data for ${data.name}, ${data.sys.country}:
🌍 Location: ${data.name}, ${data.sys.country}
🌡️ Temperature: ${temp}°C ${tempEmoji}
🌡️ Feels like: ${feelsLike}°C
🌤️ Conditions: ${weather.charAt(0).toUpperCase() + weather.slice(1)} ${weatherEmoji}
💧 Humidity: ${humidity}%
💨 Wind Speed: ${windSpeed} km/h
⏰ Local Time: ${new Date().toLocaleTimeString()}
Data retrieved from my meteorological sensors. Is there anything else you would like to know? 🖖`.trim();

    } catch (error) {
        console.error('Weather API Error:', error);
        return `I apologize, but my weather sensors are malfunctioning.
Error: ${error.message} ⚠️
Please try again later.`.trim();
    }
}

// Gemini AI integration
async function getGeminiResponse(message) {
    if (!API_KEYS.GEMINI) {
        return "Please set up your Gemini API key in the settings first. 🔧";
    }
    
    try {
        // Create context from user preferences
        const userContext = `
User Information:
- Name: ${USER_PREFERENCES.personalInfo.name || 'Unknown'}
- Nickname: ${USER_PREFERENCES.personalInfo.nickname || 'Unknown'}
- City: ${USER_PREFERENCES.personalInfo.defaultCity || 'Unknown'}

You are Commander Data from Star Trek. You should remember and use the user's name or nickname in conversations. 
If they ask about their personal information, use the data provided above.
If they ask about weather and no city is specified, use their default city.

Respond to: ${message}`;

        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' + API_KEYS.GEMINI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: userContext
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Gemini API Error:', error);
        return `I apologize, but my neural network is experiencing difficulties. Error: ${error.message} ⚠️`;
    }
}

// Function to create and show settings modal
function openSettings() {
    let modal = document.querySelector('.settings-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <div class="settings-content">
                <h3>Settings</h3>
                
                <div class="settings-section">
                    <h4>Personal Information 👤</h4>
                    <div class="input-group">
                        <label for="userName">Name:</label>
                        <input type="text" id="userName" value="${USER_PREFERENCES.personalInfo?.name || ''}" placeholder="Enter your name">
                    </div>
                    <div class="input-group">
                        <label for="userNickname">Nickname:</label>
                        <input type="text" id="userNickname" value="${USER_PREFERENCES.personalInfo?.nickname || ''}" placeholder="Enter your nickname">
                    </div>
                    <div class="input-group">
                        <label for="defaultCity">Default City:</label>
                        <input type="text" id="defaultCity" value="${USER_PREFERENCES.personalInfo?.defaultCity || ''}" placeholder="Enter your default city">
                    </div>
                </div>

                <div class="settings-section">
                    <h4>API Keys Configuration 🔑</h4>
                    <div class="input-group">
                        <label for="weatherKey">Weather API Key:</label>
                        <input type="password" id="weatherKey" value="${API_KEYS.WEATHER || ''}" placeholder="Enter Weather API key">
                    </div>
                    <div class="input-group">
                        <label for="geminiKey">Gemini AI API Key:</label>
                        <input type="password" id="geminiKey" value="${API_KEYS.GEMINI || ''}" placeholder="Enter Gemini API key">
                    </div>
                </div>

                <div class="settings-section">
                    <h4>Chat Preferences</h4>
                    <div class="input-group">
                        <label>
                            <input type="checkbox" id="continuePreviousChats" ${USER_PREFERENCES.continuePreviousChats ? 'checked' : ''}>
                            Continue Previous Chats
                        </label>
                    </div>
                </div>

                <div class="settings-actions">
                    <button onclick="saveSettings()">Save Settings</button>
                    <button onclick="clearHistory()">Clear Chat History</button>
                    <button onclick="closeSettings()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.style.display = 'flex';
}

// Function to save settings
function saveSettings() {
    USER_PREFERENCES.personalInfo = {
        name: document.getElementById('userName').value.trim(),
        nickname: document.getElementById('userNickname').value.trim(),
        defaultCity: document.getElementById('defaultCity').value.trim()
    };

    API_KEYS.WEATHER = document.getElementById('weatherKey').value.trim();
    API_KEYS.GEMINI = document.getElementById('geminiKey').value.trim();
    
    USER_PREFERENCES.continuePreviousChats = document.getElementById('continuePreviousChats').checked;
    
    localStorage.setItem('userPreferences', JSON.stringify(USER_PREFERENCES));
    localStorage.setItem('apiKeys', JSON.stringify(API_KEYS));
    
    closeSettings();
    
    // Confirmation message using the user's preferred name
    const name = USER_PREFERENCES.personalInfo.nickname || USER_PREFERENCES.personalInfo.name || 'friend';
    addMessageToChat('ai', `Settings saved successfully. I will remember your preferences, ${name}. 🖖`);
}

// Function to clear chat history
function clearHistory() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        USER_PREFERENCES.chatHistory = [];
        localStorage.setItem('userPreferences', JSON.stringify(USER_PREFERENCES));
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.innerHTML = '';
        closeSettings();
        addMessageToChat('ai', 'Chat history has been cleared. How may I assist you? 🖖');
    }
}

// Function to close settings
function closeSettings() {
    const modal = document.querySelector('.settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Make functions globally accessible
window.toggleTheme = toggleTheme;
window.sendMessage = sendMessage;
window.openSettings = openSettings;
window.saveSettings = saveSettings;
window.clearHistory = clearHistory;
window.closeSettings = closeSettings;

// Update setupUserPreferences function
function setupUserPreferences() {
    const savedPreferences = localStorage.getItem('userPreferences');
    const savedApiKeys = localStorage.getItem('apiKeys');
    
    if (savedPreferences) {
        USER_PREFERENCES = JSON.parse(savedPreferences);
        // Ensure personalInfo exists
        if (!USER_PREFERENCES.personalInfo) {
            USER_PREFERENCES.personalInfo = {
                name: '',
                nickname: '',
                defaultCity: ''
            };
        }
    }
    
    // Initialize empty API keys if none are saved
    if (savedApiKeys) {
        Object.assign(API_KEYS, JSON.parse(savedApiKeys));
    } else {
        API_KEYS.WEATHER = '';
        API_KEYS.GEMINI = '';
    }
}
