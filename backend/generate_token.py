"""
Simple script to generate Google OAuth token.json
Run this locally with: python generate_token.py
"""
import os
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']
CREDENTIALS_FILE = 'credentials.json'
TOKEN_FILE = 'token.json'

def main():
    creds = None

    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                print(f"Error: {CREDENTIALS_FILE} not found!")
                print("Download it from Google Cloud Console:")
                print("1. Go to https://console.cloud.google.com/apis/credentials")
                print("2. Click on your OAuth 2.0 Client ID")
                print("3. Download JSON and rename to credentials.json")
                return

            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)

        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())
        print(f"Token saved to {TOKEN_FILE}")
        print("\nCopy the content below to Railway as GOOGLE_TOKEN_JSON:")
        print("-" * 50)
        with open(TOKEN_FILE, 'r') as f:
            print(f.read())

if __name__ == '__main__':
    main()
