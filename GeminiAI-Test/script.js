// API Keys - Store these at the top of your script
const API_KEYS = {
    NASA: 'TDDK7NfZnhBymFIT8QBvRWMcCvrNCKW4VgC9R6hr',    // Get from https://api.nasa.gov/
    NEWS: '4b7e9aaab0324fa69d124da001a58af4',    // Get from https://newsapi.org/
    WEATHER: 'ee5ab21cc2405127ff46ebc7add3de6d'  // Get from OpenWeatherMap
};

// API URLs using the keys directly
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${API_KEYS.NASA}`;
const NEWS_API = 'https://newsapi.org/v2/top-headlines';
const IP_API = 'https://ipapi.co/json/';
const WEATHER_API = 'https://api.openweathermap.org/data/2.5';

// All patterns defined at the top
const userInfoPattern = /(?:what(?:'s| is)?|tell me|show|get|my) (?:my )?(name|nickname|email|preferred name|email address)(?:\?)?/i;
const weatherPattern = /(?:weather|temperature|temp|forecast|how (?:hot|cold|warm) is it)(?: (?:today|now|tonight|tomorrow))?(?: in)? ?([a-zA-Z\s,]+?)(?:\s+(?:today|now|tonight|tomorrow))?\??$/i;
const securityPattern = /(?:check|verify|test)(?: my)? (?:password|email)(?: strength)?(?: )?([^\n]+)?/i;
const nasaPattern = /(?:show|get|what is) (?:the |today's |current )?(?:nasa|space|astronomy) (?:image|picture|photo)(?:\?)?/i;
const newsPattern = /(?:show|get|what(?:'s| is| are)|tell me)(?: the| about)? (?:latest |current |recent )?(?:news|updates)(?: about| on| in| for)? ?([\w\s]+)?(?:\?)?/i;
const locationPattern = /(?:where am i|what is my location|detect my location|get my location)(?:\?)?/i;
const howToCallPattern = /(?:how|what) (?:should|do|will) you (?:call|address|refer to) me(?:\?)?/i;

// User Preferences
const USER_PREFERENCES = {
    name: localStorage.getItem('userName') || '',
    nickname: localStorage.getItem('userNickname') || '',
    preferredName: localStorage.getItem('preferredName') || '',
    email: localStorage.getItem('userEmail') || '',
    continuePreviousChats: localStorage.getItem('continuePreviousChats') === 'true' || false,
    chatHistory: JSON.parse(localStorage.getItem('chatHistory')) || [],
    apiKeys: {
        NASA: localStorage.getItem('NASA_API_KEY') || '',
        NEWS: localStorage.getItem('NEWS_API_KEY') || '',
        WEATHER: localStorage.getItem('WEATHER_API_KEY') || '',
        GEMINI: localStorage.getItem('GEMINI_API_KEY') || ''
    },
    personalInfo: {
        name: '',
        nickname: '',
        preferredTitle: '',
        defaultCity: ''
    }
};

// Trek Greetings
const TREK_GREETINGS = [
    "Greetings. I am Lieutenant Commander Data of the USS Enterprise. My neural network is configured to assist you with weather analysis, security protocols, Federation news updates, spatial coordinates, and astronomical observations. How may I be of service?",
    "Lieutenant Commander Data here. My positronic brain is capable of processing weather patterns, security protocols, news aggregation, geolocation, and astronomical data. Please state the nature of your inquiry.",
    "Greetings. This is Lieutenant Commander Data. My systems are optimized to analyze meteorological data, evaluate security parameters, process news feeds, determine spatial coordinates, and share astronomical observations. How may I assist you?"
].map(greeting => greeting.trim());

// DOM Elements
const chatHistory = document.getElementById('chatHistory');
const userInput = document.getElementById('userInput');

// Add a weather emoji mapping
const WEATHER_EMOJIS = {
    // Clear
    'clear sky': '☀️',
    'clear': '☀️',
    
    // Clouds
    'few clouds': '🌤️',
    'scattered clouds': '⛅',
    'broken clouds': '☁️',
    'overcast clouds': '☁️',
    
    // Rain
    'light rain': '🌦️',
    'moderate rain': '🌧️',
    'heavy rain': '⛈️',
    'rain': '🌧️',
    'shower rain': '🌧️',
    
    // Thunderstorm
    'thunderstorm': '⛈️',
    'thunder': '⛈️',
    
    // Snow
    'snow': '🌨️',
    'light snow': '🌨️',
    'heavy snow': '❄️',
    
    // Misc
    'mist': '🌫️',
    'fog': '🌫️',
    'haze': '🌫️',
    'dust': '💨',
    'sand': '💨',
    'drizzle': '🌦️'
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Initialize settings and buttons
    setupUserPreferences();
    setupHeaderButtons();
    
    // Get input elements
    const userInput = document.getElementById('userInput');
    
    // Add event listeners if input exists
    if (userInput) {
        // Handle Enter key
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Auto-resize textarea
        userInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });
    }

    // Show initial greeting
    if (USER_PREFERENCES.continuePreviousChats && USER_PREFERENCES.chatHistory.length > 0) {
        USER_PREFERENCES.chatHistory.forEach(msg => {
            addMessageToChat(msg.role === 'user' ? 'user' : 'ai', msg.content.trim());
        });
    } else {
        const randomGreeting = TREK_GREETINGS[Math.floor(Math.random() * TREK_GREETINGS.length)].trim();
        addMessageToChat('ai', randomGreeting);
    }
});

// Setup Functions
function setupUserPreferences() {
    if (!localStorage.getItem('userPreferences')) {
        USER_PREFERENCES = {
            theme: 'light',
            continuePreviousChats: true,
            chatHistory: [],
            apiKeys: {
                NASA: '',
                NEWS: '',
                WEATHER: '',
                GEMINI: ''
            },
            personalInfo: {
                name: '',
                nickname: '',
                preferredTitle: '',
                defaultCity: ''
            }
        };
        localStorage.setItem('userPreferences', JSON.stringify(USER_PREFERENCES));
    } else {
        USER_PREFERENCES = JSON.parse(localStorage.getItem('userPreferences'));
        // Ensure all properties exist
        if (!USER_PREFERENCES.personalInfo) {
            USER_PREFERENCES.personalInfo = {
                name: '',
                nickname: '',
                preferredTitle: '',
                defaultCity: ''
            };
        }
        if (!USER_PREFERENCES.apiKeys) {
            USER_PREFERENCES.apiKeys = {
                NASA: '',
                NEWS: '',
                WEATHER: '',
                GEMINI: ''
            };
        }
    }
}

function setupHeaderButtons() {
    // Set up theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        themeToggle.textContent = currentTheme === 'light' ? '☀️' : '🌙';
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Set up settings button
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            const modal = document.querySelector('.settings-modal');
            if (modal) {
                modal.style.display = 'flex';
            }
        });
    }

    // Set up modal close on outside click
    const modal = document.querySelector('.settings-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
}

function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];

    // Length checks (max 3 points)
    if (password.length < 8) {
        feedback.push("❌ Password is too short (minimum 8 characters)");
    } else if (password.length >= 16) {
        score += 3;
    } else if (password.length >= 12) {
        score += 2;
    } else {
        score += 1;
    }

    // Complexity checks (max 4 points)
    if (/[A-Z]/.test(password)) score += 1;
    else feedback.push("❌ Missing uppercase letters");
    
    if (/[a-z]/.test(password)) score += 1;
    else feedback.push("❌ Missing lowercase letters");
    
    if (/[0-9]/.test(password)) score += 1;
    else feedback.push("❌ Missing numbers");
    
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    else feedback.push("❌ Missing special characters");

    // Penalty points (negative scoring)
    let penalties = 0;

    // Pattern checks
    if (/(.)\1{2,}/.test(password)) {
        penalties += 1;
        feedback.push("⚠️ Avoid repeated characters (e.g., 'aaa')");
    }

    if (/^[A-Za-z]+$/.test(password) || /^[0-9]+$/.test(password)) {
        penalties += 1;
        feedback.push("⚠️ Avoid using only letters or only numbers");
    }

    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
        penalties += 1;
        feedback.push("⚠️ Avoid sequential letters");
    }

    if (/(?:012|123|234|345|456|567|678|789)/.test(password)) {
        penalties += 1;
        feedback.push("⚠️ Avoid sequential numbers");
    }

    // Apply penalties
    score = Math.max(0, score - penalties);

    // Maximum score is 7 (3 for length + 4 for complexity)
    let strengthText = '';
    if (score <= 2) strengthText = 'Very Weak';
    else if (score <= 3) strengthText = 'Weak';
    else if (score <= 4) strengthText = 'Moderate';
    else if (score <= 5) strengthText = 'Strong';
    else strengthText = 'Very Strong';

    return { 
        strength: strengthText, 
        score, 
        maxScore: 7,
        feedback 
    };
}

// Theme toggle function
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Update theme
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Update button text
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = newTheme === 'light' ? '☀️' : '🌙';
    }
}

// Make sure functions are globally accessible
window.toggleTheme = toggleTheme;
window.setupHeaderButtons = setupHeaderButtons;

function addMessageToChat(role, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message`;
    
    // Create message HTML
    const timestamp = `<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;
    messageDiv.innerHTML = `<div class="message-content">${content}${timestamp}</div>`;
    
    chatHistory.appendChild(messageDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// Update the getWeather function with better city name handling
async function getWeather(city) {
    try {
        // Clean up city name and remove time references
        city = city
            .replace(/^in /i, '')
            .replace(/\b(?:today|now|tonight|tomorrow)\b/gi, '')
            .replace(/\s+/g, ' ')
            .trim();
        
        // Capitalize first letter of each word
        const formattedCity = city
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        const response = await fetch(`${WEATHER_API}/weather?q=${encodeURIComponent(formattedCity)}&appid=${API_KEYS.WEATHER}&units=metric`);
        const data = await response.json();
        
        if (response.status === 404) {
            return `I apologize, but I cannot find weather data for ${formattedCity}. Please try using the city name only, for example: "temperature in London" 🔍`;
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

        // Use <br> tags for line breaks
        return `According to my meteorological sensors for ${data.name}, ${data.sys.country}:<br><br>` +
               `🌍 Location: ${data.name}, ${data.sys.country}<br>` +
               `🌡️ Temperature: ${temp}°C ${tempEmoji}<br>` +
               `🌡️ Feels like: ${feelsLike}°C<br>` +
               `🌤️ Conditions: ${weather.charAt(0).toUpperCase() + weather.slice(1)} ${weatherEmoji}<br>` +
               `💧 Humidity: ${humidity}%<br>` +
               `💨 Wind Speed: ${windSpeed} km/h<br>` +
               `⏰ Local Time: ${new Date().toLocaleTimeString()}`;

    } catch (error) {
        console.error('Weather API Error:', error);
        return `I apologize, but my weather sensors are malfunctioning. Error: ${error.message} ⚠️`;
    }
}

// Add a function to get news with topic handling
async function getNews(topic = '') {
    try {
        let query = '';
        if (topic) {
            // Clean up the topic
            topic = topic.toLowerCase().trim();
            
            // Handle specific topics
            if (topic.includes('space') || topic.includes('astronomy') || topic.includes('astronomical')) {
                query = 'space OR astronomy OR NASA OR telescope OR planet OR star OR galaxy';
            } else {
                query = topic;
            }
        }

        const url = `${NEWS_API}?apiKey=${API_KEYS.NEWS}&language=en&q=${query}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.status !== 'ok') {
            return `I apologize, but my news subroutines are experiencing difficulties. Error: ${data.message} ⚠️`;
        }

        if (data.articles.length === 0) {
            return `I regret to inform you that I could not find any recent news articles about ${topic || 'that topic'} in my database. Perhaps try a different query? 🔍`;
        }

        // Get the top 3 articles
        const articles = data.articles.slice(0, 3);
        
        let newsResponse = `Here are the most recent ${topic ? `${topic}-related` : ''} news articles from my database:\n\n`;
        
        articles.forEach((article, index) => {
            newsResponse += `📰 Article ${index + 1}:\n`;
            newsResponse += `📌 Title: ${article.title}\n`;
            if (article.description) {
                newsResponse += `📝 Summary: ${article.description}\n`;
            }
            newsResponse += `🔗 Source: ${article.url}\n\n`;
        });

        newsResponse += `Stardate ${new Date().toLocaleTimeString()} 🚀`;
        
        return newsResponse;

    } catch (error) {
        console.error('News API Error:', error);
        return `I apologize, but my news retrieval subroutines are malfunctioning. Error: ${error.message} ⚠️`;
    }
}

// Update the default response formatting
const DEFAULT_RESPONSE = `I am detecting uncertainty in how to process your request. As Lieutenant Commander Data, I am programmed to assist with:

1. Meteorological analysis (Example query: 'Weather in San Francisco')
2. Security protocol verification (Example query: 'Check password strength')
3. Astronomical data from NASA (Example query: 'Show space image')
4. Federation news updates (Example query: 'Show latest news')
5. Spatial coordinates (Example query: 'Where am I?')
6. Personal data retrieval (Example query: 'What is my email?')

Please rephrase your query using one of these parameters.`.trim();

// Update the sendMessage function to use the cleaned-up default response
window.sendMessage = async function() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (!message) return;

    // Add user message to chat
    addMessageToChat('user', message);
    
    // Clear and reset input field
    userInput.value = '';
    userInput.style.height = 'auto';
    userInput.focus();

    // Show typing indicator
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
    }

    try {
        let aiResponse;
        
        if (weatherPattern.test(message)) {
            const matches = message.match(weatherPattern);
            const city = matches[1].trim();
            aiResponse = await getWeather(city);
        } else if (newsPattern.test(message)) {
            const matches = message.match(newsPattern);
            const topic = matches[1]?.trim() || '';
            aiResponse = await getNews(topic);
        } else if (howToCallPattern.test(message)) {
            const preferredName = USER_PREFERENCES.preferredName;
            const nickname = USER_PREFERENCES.nickname;
            const name = USER_PREFERENCES.name;

            if (preferredName) {
                aiResponse = `Based on your specified preferences in my database, I am configured to address you as ${preferredName}.`;
            } else if (nickname) {
                aiResponse = `According to my records, I am programmed to refer to you by your nickname: ${nickname}.`;
            } else if (name) {
                aiResponse = `My database indicates I should address you by your full name: ${name}.`;
            } else {
                aiResponse = "I apologize, but I do not have any name preferences stored in my database. You may set your preferred form of address through the settings interface (⚙️).";
            }
        } else if (userInfoPattern.test(message)) {
            const matches = message.match(userInfoPattern);
            const infoType = matches[1].toLowerCase();
            
            switch(infoType) {
                case 'name':
                    aiResponse = USER_PREFERENCES.name ? 
                        `According to my database, your full name is ${USER_PREFERENCES.name}.` : 
                        "I apologize, but I do not have your name stored in my database. You may update this information using the settings interface (⚙️).";
                    break;
                case 'nickname':
                    aiResponse = USER_PREFERENCES.nickname ? 
                        `My records indicate your nickname is ${USER_PREFERENCES.nickname}.` : 
                        "I do not have a nickname stored in my database for you. You may add one through the settings interface (⚙️).";
                    break;
                case 'preferred name':
                    aiResponse = USER_PREFERENCES.preferredName ? 
                        `You have indicated a preference to be addressed as ${USER_PREFERENCES.preferredName}.` : 
                        "I do not have a preferred name stored for you. You may specify one through the settings interface (⚙️).";
                    break;
                case 'email':
                case 'email address':
                    aiResponse = USER_PREFERENCES.email ? 
                        `The email address in my database for you is ${USER_PREFERENCES.email}.` : 
                        "I do not have an email address stored in my database. You may add one through the settings interface (⚙️).";
                    break;
                default:
                    aiResponse = "I apologize, but I am unable to process that specific information request. You may inquire about your name, nickname, preferred name, or email address.";
            }
        } else if (securityPattern.test(message)) {
            const password = message.match(securityPattern)[1];
            const strengthResult = checkPasswordStrength(password);
            aiResponse = `🔒 Password Security Analysis:\n\n` +
                        `Strength: ${strengthResult.strength}\n` +
                        `Score: ${strengthResult.score}/${strengthResult.maxScore}\n\n`;
            
            if (strengthResult.feedback.length > 0) {
                aiResponse += `Improvement Suggestions:\n${strengthResult.feedback.join('\n')}\n\n`;
            }
        } else if (nasaPattern.test(message)) {
            // Existing NASA code...
        } else if (locationPattern.test(message)) {
            // Existing location code...
        } else {
            aiResponse = DEFAULT_RESPONSE;
        }

        // Hide typing indicator
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }

        // Add AI response to chat
        addMessageToChat('ai', aiResponse);

        // Save to chat history if enabled
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
        addMessageToChat('ai', `I apologize, but I encountered an error in my positronic network: ${error.message}. Please try again.`);
    }
};

// Add function to toggle password visibility
window.togglePasswordVisibility = function(inputId) {
    const input = document.getElementById(inputId);
    input.type = input.type === 'password' ? 'text' : 'password';
};

// Add function to save settings
window.saveSettings = function() {
    USER_PREFERENCES.apiKeys = {
        NASA: document.getElementById('nasaKey').value,
        NEWS: document.getElementById('newsKey').value,
        WEATHER: document.getElementById('weatherKey').value,
        GEMINI: document.getElementById('geminiKey').value
    };
    
    USER_PREFERENCES.personalInfo = {
        name: document.getElementById('userName').value,
        nickname: document.getElementById('userNickname').value,
        preferredTitle: document.getElementById('preferredTitle').value,
        defaultCity: document.getElementById('defaultCity').value
    };
    
    USER_PREFERENCES.continuePreviousChats = document.getElementById('continuePreviousChats').checked;
    
    localStorage.setItem('userPreferences', JSON.stringify(USER_PREFERENCES));
    Object.assign(API_KEYS, USER_PREFERENCES.apiKeys);
    
    closeSettings();
    addMessageToChat('ai', 'Settings saved successfully. I will remember your preferences, ' + 
        (USER_PREFERENCES.personalInfo.preferredTitle || USER_PREFERENCES.personalInfo.nickname || USER_PREFERENCES.personalInfo.name || 'friend') + '. 🖖');
};

function clearHistory() {
    if (confirm('Are you sure you want to clear the chat history? This cannot be undone.')) {
        USER_PREFERENCES.chatHistory = [];
        localStorage.setItem('chatHistory', JSON.stringify([]));
        chatHistory.innerHTML = '';
        document.getElementById('settingsModal').style.display = 'none';
        
        const randomGreeting = TREK_GREETINGS[Math.floor(Math.random() * TREK_GREETINGS.length)].trim();
        addMessageToChat('ai', 'Memory banks have been cleared. Initiating new conversation protocol.');
        addMessageToChat('ai', randomGreeting);
    }
}

// Add this function to handle selective cache clearing
function clearChatButKeepSettings() {
    // Keep settings
    const savedSettings = {
        name: localStorage.getItem('userName'),
        nickname: localStorage.getItem('userNickname'),
        preferredName: localStorage.getItem('preferredName'),
        email: localStorage.getItem('userEmail'),
        continuePreviousChats: localStorage.getItem('continuePreviousChats')
    };

    // Clear localStorage
    localStorage.clear();

    // Restore settings
    localStorage.setItem('userName', savedSettings.name);
    localStorage.setItem('userNickname', savedSettings.nickname);
    localStorage.setItem('preferredName', savedSettings.preferredName);
    localStorage.setItem('userEmail', savedSettings.email);
    localStorage.setItem('continuePreviousChats', savedSettings.continuePreviousChats);
    localStorage.setItem('chatHistory', JSON.stringify([]));

    // Update USER_PREFERENCES
    Object.assign(USER_PREFERENCES, {
        ...savedSettings,
        chatHistory: []
    });

    // Clear chat display
    const chatHistory = document.getElementById('chatHistory');
    chatHistory.innerHTML = '';

    // Show confirmation and new greeting
    const randomGreeting = TREK_GREETINGS[Math.floor(Math.random() * TREK_GREETINGS.length)].trim();
    addMessageToChat('ai', 'Memory banks have been selectively cleared while maintaining user configuration parameters.');
    addMessageToChat('ai', randomGreeting);
}

// Update CSS for message content
const style = document.createElement('style');
style.textContent = `
    .message-content {
        padding: 8px 12px;
        border-radius: 12px;
        max-width: 80%;
        word-wrap: break-word;
        white-space: pre-wrap;
        line-height: 1.3;
        margin: 0;
        font-size: 0.95rem;
    }

    .message {
        display: flex;
        margin: 4px 0;
        padding: 0 10px;
    }

    .user-message {
        justify-content: flex-end;
    }

    .ai-message {
        justify-content: flex-start;
    }

    .timestamp {
        font-size: 0.65rem;
        color: var(--timestamp-color);
        margin-top: 2px;
        text-align: right;
    }
`;
document.head.appendChild(style);

// Update the addSettingsButton function to create the modal if it doesn't exist
function addSettingsButton() {
    // Create settings modal if it doesn't exist
    let modal = document.querySelector('.settings-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.style.display = 'none';  // Initially hidden
        modal.innerHTML = `
            <div class="settings-content">
                <h3>Settings</h3>
                
                <div class="settings-section">
                    <h4>Personal Information 👤</h4>
                    <div class="personal-info-section">
                        <div class="input-group">
                            <label for="userName">Full Name:</label>
                            <input type="text" id="userName" value="${USER_PREFERENCES.personalInfo?.name || ''}" placeholder="Enter your name">
                        </div>
                        <div class="input-group">
                            <label for="userNickname">Nickname:</label>
                            <input type="text" id="userNickname" value="${USER_PREFERENCES.personalInfo?.nickname || ''}" placeholder="Enter your nickname">
                        </div>
                        <div class="input-group">
                            <label for="preferredTitle">Preferred Title:</label>
                            <input type="text" id="preferredTitle" value="${USER_PREFERENCES.personalInfo?.preferredTitle || ''}" placeholder="How should I address you?">
                        </div>
                        <div class="input-group">
                            <label for="defaultCity">Default City:</label>
                            <input type="text" id="defaultCity" value="${USER_PREFERENCES.personalInfo?.defaultCity || ''}" placeholder="Your default city for weather">
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h4>API Keys Configuration 🔑</h4>
                    <div class="api-keys-section">
                        <div class="input-group">
                            <label for="nasaKey">NASA API Key:</label>
                            <div class="input-with-button">
                                <input type="password" id="nasaKey" value="${USER_PREFERENCES.apiKeys?.NASA || ''}" placeholder="Enter NASA API key">
                                <button class="toggle-visibility" onclick="togglePasswordVisibility('nasaKey')">👁️</button>
                            </div>
                        </div>
                        <div class="input-group">
                            <label for="newsKey">News API Key:</label>
                            <div class="input-with-button">
                                <input type="password" id="newsKey" value="${USER_PREFERENCES.apiKeys?.NEWS || ''}" placeholder="Enter News API key">
                                <button class="toggle-visibility" onclick="togglePasswordVisibility('newsKey')">👁️</button>
                            </div>
                        </div>
                        <div class="input-group">
                            <label for="weatherKey">Weather API Key:</label>
                            <div class="input-with-button">
                                <input type="password" id="weatherKey" value="${USER_PREFERENCES.apiKeys?.WEATHER || ''}" placeholder="Enter Weather API key">
                                <button class="toggle-visibility" onclick="togglePasswordVisibility('weatherKey')">👁️</button>
                            </div>
                        </div>
                        <div class="input-group">
                            <label for="geminiKey">Gemini API Key:</label>
                            <div class="input-with-button">
                                <input type="password" id="geminiKey" value="${USER_PREFERENCES.apiKeys?.GEMINI || ''}" placeholder="Enter Gemini API key">
                                <button class="toggle-visibility" onclick="togglePasswordVisibility('geminiKey')">👁️</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="settings-section">
                    <h4>Chat Preferences</h4>
                    <div class="setting-item">
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

    // Add event listeners for the settings button
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
        settingsButton.addEventListener('click', () => {
            modal.style.display = 'flex';
        });
    }

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Add function to close settings
window.closeSettings = function() {
    const modal = document.querySelector('.settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

// Add these styles to your CSS
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .settings-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .settings-content {
        background-color: var(--chat-bg);
        padding: 20px;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .settings-content h3 {
        margin-top: 0;
        color: var(--text-color);
    }

    .settings-section {
        margin: 15px 0;
        padding: 15px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
    }

    .api-key-input {
        margin: 10px 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .api-key-input input {
        flex-grow: 1;
        padding: 8px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--input-bg);
        color: var(--text-color);
    }

    .settings-actions {
        margin-top: 20px;
        display: flex;
        gap: 10px;
        justify-content: flex-end;
    }

    .settings-actions button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        background: var(--accent-color);
        color: white;
        cursor: pointer;
    }

    .settings-actions button:hover {
        background: var(--button-hover);
    }
`;
document.head.appendChild(modalStyles);

// Add this function to handle opening settings
window.openSettings = function() {
    const modal = document.querySelector('.settings-modal');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        // Create modal if it doesn't exist
        createSettingsModal();
    }
};

// Function to create settings modal
function createSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal';
    modal.innerHTML = `
        <div class="settings-content">
            <h3>Settings</h3>
            
            <div class="settings-section">
                <h4>Personal Information 👤</h4>
                <div class="personal-info-section">
                    <div class="input-group">
                        <label for="userName">Full Name:</label>
                        <input type="text" id="userName" value="${USER_PREFERENCES.personalInfo?.name || ''}" placeholder="Enter your name">
                    </div>
                    <div class="input-group">
                        <label for="userNickname">Nickname:</label>
                        <input type="text" id="userNickname" value="${USER_PREFERENCES.personalInfo?.nickname || ''}" placeholder="Enter your nickname">
                    </div>
                    <div class="input-group">
                        <label for="preferredTitle">Preferred Title:</label>
                        <input type="text" id="preferredTitle" value="${USER_PREFERENCES.personalInfo?.preferredTitle || ''}" placeholder="How should I address you?">
                    </div>
                    <div class="input-group">
                        <label for="defaultCity">Default City:</label>
                        <input type="text" id="defaultCity" value="${USER_PREFERENCES.personalInfo?.defaultCity || ''}" placeholder="Your default city for weather">
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h4>API Keys Configuration 🔑</h4>
                <div class="api-keys-section">
                    <div class="input-group">
                        <label for="nasaKey">NASA API Key:</label>
                        <div class="input-with-button">
                            <input type="password" id="nasaKey" value="${USER_PREFERENCES.apiKeys?.NASA || ''}" placeholder="Enter NASA API key">
                            <button class="toggle-visibility" onclick="togglePasswordVisibility('nasaKey')">👁️</button>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="newsKey">News API Key:</label>
                        <div class="input-with-button">
                            <input type="password" id="newsKey" value="${USER_PREFERENCES.apiKeys?.NEWS || ''}" placeholder="Enter News API key">
                            <button class="toggle-visibility" onclick="togglePasswordVisibility('newsKey')">👁️</button>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="weatherKey">Weather API Key:</label>
                        <div class="input-with-button">
                            <input type="password" id="weatherKey" value="${USER_PREFERENCES.apiKeys?.WEATHER || ''}" placeholder="Enter Weather API key">
                            <button class="toggle-visibility" onclick="togglePasswordVisibility('weatherKey')">👁️</button>
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="geminiKey">Gemini API Key:</label>
                        <div class="input-with-button">
                            <input type="password" id="geminiKey" value="${USER_PREFERENCES.apiKeys?.GEMINI || ''}" placeholder="Enter Gemini API key">
                            <button class="toggle-visibility" onclick="togglePasswordVisibility('geminiKey')">👁️</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="settings-section">
                <h4>Chat Preferences</h4>
                <div class="setting-item">
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
    
    // Add click event to close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeSettings();
        }
    });
    
    // Show the modal
    modal.style.display = 'flex';
}

// Add these helper functions
window.closeSettings = function() {
    const modal = document.querySelector('.settings-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

window.clearHistory = function() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        USER_PREFERENCES.chatHistory = [];
        localStorage.setItem('userPreferences', JSON.stringify(USER_PREFERENCES));
        const chatHistory = document.getElementById('chatHistory');
        chatHistory.innerHTML = '';
        closeSettings();
        addMessageToChat('ai', 'Chat history has been cleared. How may I assist you?');
    }
};

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', () => {
    setupUserPreferences();
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    // Update theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'light' ? '☀️' : '🌙';
    }
    
    // Show initial greeting
    const randomGreeting = TREK_GREETINGS[Math.floor(Math.random() * TREK_GREETINGS.length)].trim();
    addMessageToChat('ai', randomGreeting);
});