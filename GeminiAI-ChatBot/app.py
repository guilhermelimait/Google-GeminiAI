import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set.")

API_URL = "https://api.generativeai.google.com/v1beta2/models/gemini-pro:generateText"

def generate_text(prompt, temperature=0.7, max_output_tokens=256):
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
        response = requests.post(API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()

        response_json = response.json()

        if 'candidates' in response_json and response_json['candidates']:
            generated_text = response_json['candidates'][0]['output']
            return generated_text
        else:
            print("Unexpected API response format:", response_json)
            return None

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini API: {e}")
        try:
            if hasattr(response, 'status_code'):
                print(f"Status Code: {response.status_code}")
                try:
                    error_details = response.json()
                    print("Error Details:", error_details)
                except json.JSONDecodeError:
                    print("Could not decode JSON error response.")
            else:
                print("No response object to get status code from.")
        except NameError: # If response is not defined
            print("No response object to get status code from.")
        return None

    except (KeyError, IndexError) as e:
        print(f"Error parsing API response: {e}")
        return None
    except Exception as e:
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
        print("-" * 50)


if __name__ == "__main__":
    main()