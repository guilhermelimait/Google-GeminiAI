let API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your actual API key

document.addEventListener('DOMContentLoaded', () => {
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        API_KEY = savedApiKey;
    }

    const settingsBtn = document.getElementById('settingsBtn');
    const settingsPopup = document.getElementById('settingsPopup');
    const closeSettings = document.getElementById('closeSettings');
    const saveSettings = document.getElementById('saveSettings');
    const apiKeyInput = document.getElementById('apiKeyInput');
    const togglePassword = document.getElementById('togglePassword');

    settingsBtn.addEventListener('click', () => {
        apiKeyInput.value = API_KEY;
        settingsPopup.style.display = 'flex';
    });

    closeSettings.addEventListener('click', () => {
        settingsPopup.style.display = 'none';
    });

    saveSettings.addEventListener('click', () => {
        const newApiKey = apiKeyInput.value.trim();
        if (newApiKey) {
            API_KEY = newApiKey;
            localStorage.setItem('geminiApiKey', newApiKey);
            settingsPopup.style.display = 'none';
        } else {
            alert('Please enter a valid API key');
        }
    });

    togglePassword.addEventListener('click', () => {
        const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
        apiKeyInput.setAttribute('type', type);
        togglePassword.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
    });

    // Close popup when clicking outside
    settingsPopup.addEventListener('click', (e) => {
        if (e.target === settingsPopup) {
            settingsPopup.style.display = 'none';
        }
    });
});

async function analyzeImage() {
    const input = document.getElementById('imageInput');
    const preview = document.getElementById('imagePreview');
    const results = document.getElementById('results');
    
    // Check if API key is set
    if (!API_KEY || API_KEY === 'YOUR_GEMINI_API_KEY') {
        results.innerHTML = `<div class="error">
            Please set your Gemini API key in the settings first (⚙️)
        </div>`;
        return;
    }

    if (!input.files[0]) {
        results.innerHTML = `<div class="error">
            Please select an image first
        </div>`;
        return;
    }

    try {
        // Show loading state
        results.innerHTML = '<div class="loading">Analyzing image...</div>';
        preview.style.display = 'block';
        preview.src = URL.createObjectURL(input.files[0]);

        const base64Image = await convertToBase64(input.files[0]);
        
        // Updated endpoint to use gemini-1.5-flash model
        const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=' + API_KEY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: "Please analyze this image and list the main objects you can identify in it. Be concise and clear."
                    }, {
                        inline_data: {
                            mime_type: "image/jpeg",
                            data: base64Image.split(',')[1]
                        }
                    }]
                }],
                generationConfig: {
                    temperature: 0.2,  // Lower temperature for more focused results
                    maxOutputTokens: 1024
                },
                safetySettings: [
                    {
                        category: "HARM_CATEGORY_HARASSMENT",
                        threshold: "BLOCK_MEDIUM_AND_ABOVE"
                    }
                ]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message || 'API Error');
        }

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Unexpected API response format');
        }

        // Format the response text
        const responseText = data.candidates[0].content.parts[0].text
            .replace(/^Found Objects:\s*/, '') // Remove "Found Objects:" if present
            .replace(/^Here's.*?:\s*/m, '') // Remove "Here's a list..." if present
            .replace(/^\s*\n/gm, ''); // Remove empty lines

        const formattedText = responseText
            .split(/[,\n]/) // Split by commas or newlines
            .map(item => item.trim())
            .filter(item => item.length > 0)
            .map(item => item.replace(/^\*\s*/, '')) // Remove existing asterisks
            .map(item => `• ${item}`)
            .join('\n');

        results.innerHTML = `<div class="success">
            <h3>Found Objects:</h3>
            ${formattedText}
        </div>`;
    } catch (error) {
        console.error('API Error:', error);
        results.innerHTML = `<div class="error">
            ${error.message}<br>
            Please verify your API key is correct in settings.
        </div>`;
    }
}

function convertToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}