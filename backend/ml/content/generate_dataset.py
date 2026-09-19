import pandas as pd
import random
import os

# Ensure the output directory exists
os.makedirs(os.path.dirname(os.path.abspath(__file__)), exist_ok=True)

# Define intent categories
INTENTS = ['URL', 'TEXT', 'EMAIL', 'PHONE', 'WIFI']

# Generate variations
data = []

# URL Examples
url_templates = [
    "create a QR for {url}",
    "make a QR for my website {url}",
    "turn this website into a QR {url}",
    "generate a QR for my portfolio at {url}",
    "{url}",
    "link to {url}",
    "my blog {url}"
]
urls = ["example.com", "https://google.com", "www.mysite.org", "github.com/user"]

for url in urls:
    for template in url_templates:
        data.append({"text": template.format(url=url), "intent": "URL"})
        
# TEXT Examples
text_templates = [
    "encode {text}",
    "make a QR containing this message: {text}",
    "write {text} in a QR",
    "{text}",
    "display the text {text}"
]
texts = ["hello world", "secret code 123", "meeting at 5pm", "just some text"]

for text in texts:
    for template in text_templates:
        data.append({"text": template.format(text=text), "intent": "TEXT"})

# EMAIL Examples
email_templates = [
    "email {email}",
    "make an email QR for {email}",
    "create a QR to contact {email}",
    "send an email to {email}",
    "{email}"
]
emails = ["abc@example.com", "hr@company.com", "test@test.org"]

for email in emails:
    for template in email_templates:
        data.append({"text": template.format(email=email), "intent": "EMAIL"})

# PHONE Examples
phone_templates = [
    "call {phone}",
    "make a phone QR for {phone}",
    "create a QR that lets people call me at {phone}",
    "dial {phone}",
    "{phone}"
]
phones = ["+919876543210", "555-1234", "18005550199"]

for phone in phones:
    for template in phone_templates:
        data.append({"text": template.format(phone=phone), "intent": "PHONE"})

# WIFI Examples
wifi_templates = [
    "connect to my wifi {wifi}",
    "make a WiFi QR for {wifi}",
    "create a QR for my home network {wifi}",
    "wifi network {wifi}"
]
wifis = ["HomeNet", "GuestWiFi", "Cafe_Network"]

for wifi in wifis:
    for template in wifi_templates:
        data.append({"text": template.format(wifi=wifi), "intent": "WIFI"})

# Shuffle and save
df = pd.DataFrame(data)
df = df.sample(frac=1).reset_index(drop=True)
df.to_csv(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset.csv'), index=False)

print(f"Generated {len(df)} samples in dataset.csv")
