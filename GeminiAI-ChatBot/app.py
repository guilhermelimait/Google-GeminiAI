
import requests
import json
import os
from dotenv import load_dotenv  # For managing API keys securely

# Load environment variables from .env file
load_dotenv()

# Retrieve API key (replace with your actual key or use environment variables)
API_KEY = os.getenv("GEMINI_API_KEY")  # Store API key in .env file for security
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

API_URL = "https://api.generativeai.google.com/v1beta2/models/gemini-pro:generateText"  # Gemini API endpoint

def generate_text(prompt, temperature=0.7, max_output_tokens=256):
    """
    Generates text using the Gemini API.

    Args:
        prompt: The input prompt string.
        temperature: Controls randomness (higher = more random).
        max_output_tokens: Maximum number of tokens in the generated text.

    Returns:
        The generated text, or None if there was an error.
    """

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "prompt": {
            "text": prompt
        },
        "temperature": temperature,
        "maxOutputTokens": max_output_tokens
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout = 10) # Added timeout
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)

        response_json = response.json()
        #print(json.dumps(response_json, indent = 2)) # For debugging

        if 'candidates' in response_json and response_json['candidates']:  # Check for candidates
            generated_text = response_json['candidates'][0]['output']  # Get the generated text
            return generated_text
        else:
            print("Unexpected API response format:", response_json)
            return None

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        if response.status_code != 200:
            print(f"Status Code: {response.status_code}")
            try:
                error_details = response.json()
                print("Error Details:", error_details)
            except json.JSONDecodeError:
                print("Could not decode JSON error response.")
        return None
    except (KeyError, IndexError) as e:
        print(f"Error parsing API response: {e}. Response was: {response_json}")
        return None
    except Exception as e: # Catching general exceptions
        print(f"An unexpected error occurred: {e}")
        return None


def main():
    while True:
        user_prompt = input("Enter your prompt (or type 'exit'): ")
        if user_prompt.lower() == 'exit':
            break

        generated_text = generate_text(user_prompt)

        if generated_text:
            print("\nGemini's response:\n", generated_text)
        print("-" * 50)  # Separator


if __name__ == "__main__":
    main()