# MediRemind - AI-Powered Medication Reminder App

An intelligent medication management solution designed for elderly users and people with visual impairments, featuring voice-controlled interactions and AI assistance to improve medication adherence and healthcare outcomes.

## The Problem

Meet Sarah, 64, who manages 5 medications daily. She often forgets doses,
struggles with small text on pill bottles, and worries about taking the wrong combination.

Sarah isn't alone. Medication non-adherence affects 50% of patients with chronic conditions, leading to 125,000 deaths annually and $100 billion in preventable healthcare costs. Elderly patients face unique challenges:

- Complex medication schedules
- Memory issues
- Visual impairments
- Difficulty using traditional apps
- Lack of immediate support

## Our Solution

Unlike traditional pill reminder apps, MediRemind combines AI, voice technology,
and intelligent reminders to make medication management effortless...

## Impact

- **Improved Adherence**: Smart reminders with escalating alerts ensure no doses are missed
- **Reduced Errors**: AI-powered drug interaction checking prevents dangerous combinations
- **Independence**: Voice control enables self-management without caregiver dependency
- **Peace of Mind**: Real-time tracking gives caregivers visibility without being intrusive
- **Better Health Outcomes**: Consistent medication adherence leads to improved treatment effectiveness

## Screenshots

### Home Dashboard

<img src="screenshots/home.png" alt="Home Screen" width="300" />
<p><em>Quick overview of daily schedule and pending medications</em>

### AI Voice Assistant

<img src="screenshots/ai-assistant.png" alt="AI Assistant" width="320" />

<p><em>Natural conversation for hands-free medication management</em>

### Medication Schedule

  <img src="screenshots/meds.png" alt="Schedule" width="320" />
 
  <p><em>Easy-to-read medication list with search and filters</em>

### Analytics Dashboard

  <img src="screenshots/stat.png" alt="Analytics" width="320" />
 
  <p><em>Track adherence patterns and receive AI-powered insights</em>
</p>

  <img src="screenshots/more.png" alt="Analytics (more)" width="320" />
 
  <p><em>Additional AI-powered insights and adherence visuals</em>

## Key Features

- **Voice-First Design**: Add medications, mark doses, and get information hands-free
- **AI Assistant**: GPT-4 powered natural conversation for queries and guidance
- **Smart Reminders**: Time-based notifications with progressive escalation
- **Accessibility**: Large text, high contrast, and voice feedback throughout

## Tech Stack

- React Native with Expo
- TypeScript
- OpenAI GPT-4
- Voice Recognition and TTS
- Local MMKV Storage

## Quick Start

```bash
# Clone and install
git clone https://github.com/lurdharry/medication-reminder-app.git
cd medication-reminder-app
npm install

# Add your env details key to .env
EXPO_PUBLIC_OPENAI_MODEL=gpt-5-mini // or your prefered model
EXPO_PUBLIC_OPENAI_API_KEY=your_api_key
EXPO_PUBLIC_AI_TEMPERATURE=1
EXPO_PUBLIC_AI_MAX_TOKENS=1000

# Prebuild (required for voice command permissions to work correctly)
npx expo prebuild

# Start the app
npx expo start
```
