# MovAI

MovAI is a personalized movie recommendation web app that curates content based on each user's unique taste. Whether you're into Tarantino thrillers, Studio Ghibli animations, or obscure indie gems, MovAI tailors your homepage and suggestions to match your cinematic preferences.

---

## Features

### Personalized Dashboard
Users can input their favorite:
- Genres
- Directors
- Actors
- Movies

Based on these preferences, the app dynamically generates a customized homepage filled with tailored recommendations and content.

### Smart Recommendation Bot
An intelligent bot suggests movies and provides detailed metadata including:
- Genre
- IMDb rating
- Overview
- Poster and release info

Each movie has its own dedicated page at `/movies/:movieId`, with data fetched in real-time from the [TMDB API](https://www.themoviedb.org/documentation/api).

### User Authentication
- Authentication is handled via [Clerk](https://clerk.dev/)
- A webhook is triggered on sign-in to store user data in **Amazon DynamoDB**

### Real-Time Recommendation Updates
- A **DynamoDB Stream** monitors changes to the `interests` field in user profiles
- When updated, a **Lambda function** is triggered to:
  - Query an LLM-based recommendation engine
  - Store the updated movie suggestions back into DynamoDB

### Watchlist Management
Users can create and manage personalized watchlists to keep track of movies they want to see or revisit.

---

## 🛠️ Tech Stack

| Layer              | Technology                     
|--------------------|------------------------------------------|
| Frontend           | React + Vite                             |
| Backend            | AWS Lambda, DynamoDB Streams, Express.js |
| Authentication     | Clerk                                    |
| Data Source        | TMDB API                                 |
| AI Model           | LLM-based recommendation engine          |
| Database           | Amazon DynamoDB                    mmmmm |

---

## 📦 Installation

```bash
git clone https://github.com/arpangtm/movAI.git
cd movAI 
npm install
npm run dev
