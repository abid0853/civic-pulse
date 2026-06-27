# Use Node.js 20
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install ALL dependencies
COPY package*.json ./
RUN npm install

# Copy all other files
COPY . .

# Set all your public environment variables for the BUILD phase
# (Make sure to paste your actual Gemini API key here, without quotes!)
ENV GEMINI_API_KEY=AIzaSyC7qFXlVZBEzIEoTRwfeBeA2owFfilQi5M
ENV NEXT_PUBLIC_SUPABASE_URL=https://jvypxmbfnyxythdhujus.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_07TkmApeqVommKDSXyxWRA_6FjHJ0-w
ENV NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyChXbxpy8y0WYSEenlexSkN7m0X-_vb_p0
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=civic-pulse-ai.firebaseapp.com
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=civic-pulse-ai
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=civic-pulse-ai.firebasestorage.app
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1061510709033
ENV NEXT_PUBLIC_FIREBASE_APP_ID=1:1061510709033:web:43793e20e1388b6d7b0138

# Build the Next.js app
RUN npm run build

# Expose the port Cloud Run expects
EXPOSE 8080
ENV PORT=8080
ENV HOST=0.0.0.0

# Start the app
CMD ["npm", "start"]
