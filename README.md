# Soba AI Platform

A blockchain-powered AI platform for generating unique profile pictures with Solana integration and NFT minting capabilities.

## 🌟 Features

- AI-Powered Profile Picture Generation
- Solana Blockchain Integration
- NFT Minting Functionality
- Token-Based Access System
- Daily Generation Limits

## 🏗️ Architecture

- **Frontend**: Next.js with TypeScript
- **Backend**: Node.js API (Heroku)
- **Blockchain**: Solana
- **AI Model**: Replicate Flux
- **Database**: MongoDB
- **Wallet Support**: Phantom and Solflare

## 📁 Project Structure

```
soba-ai-platform/
├── apps/
│   ├── web/           # Next.js frontend application
│   └── api/           # Node.js backend API
├── packages/
│   ├── ui/            # Shared UI components
│   ├── config/        # Shared configuration
│   ├── blockchain/    # Solana integration utilities
│   ├── ai/            # AI generation services
│   └── types/         # Shared TypeScript types
```

## 🚀 Getting Started

1. **Prerequisites**
   - Node.js >= 18
   - Yarn
   - Solana CLI tools
   - MongoDB

2. **Installation**
   ```bash
   yarn install
   ```

3. **Development**
   ```bash
   yarn dev
   ```

4. **Build**
   ```bash
   yarn build
   ```

## 🔧 Configuration

Create a `.env` file in each app directory with the required environment variables:

```env
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=
NEXT_PUBLIC_SOLANA_NETWORK=
NEXT_PUBLIC_REPLICATE_API_KEY=

# Backend (.env)
MONGODB_URI=
JWT_SECRET=
SOLANA_PRIVATE_KEY=
```

## 📜 License

Copyright © 2024 Soba AI Platform. All rights reserved. 