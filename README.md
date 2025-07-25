# GoodMap - A Positive Community Map Platform

GoodMap is a unique social platform that combines the concept of Reddit with geographical mapping, focusing on spreading positivity through location-based posts. It's a place where users can discover and share positive experiences, stories, and moments tied to specific locations.

## 🌟 Key Features

### Map-Based Interaction
- Interactive map interface showing posts based on geographical coordinates
- Automatic location detection for users (with permission)
- Custom location markers for new positive spaces

### Post Management
- Location-based positive posts only
- Posts sorted by likes and engagement
- Real-time updates of nearby posts
- AI-powered content moderation

### Admin Features
- Comprehensive admin dashboard
- Real-time post monitoring
- AI-assisted content moderation
- Automated cleanup of inactive markers and negative content
- Manual post deletion capabilities

### User Experience
- Create and name new positive locations
- View and interact with nearby positive posts
- Like and engage with community content
- Discover new positive spaces in your area

## 🛠️ Technical Stack

- **Frontend**: Next.js with TypeScript
- **UI Components**: ShadCN UI
- **Styling**: Tailwind CSS
- **Database**: Prisma with PostgreSQL
- **Package Manager**: pnpm
- **Authentication**: NextAuth.js
- **Maps**: Mapbox/Google Maps API
- **AI Integration**: For content moderation

## 🔄 System Architecture

1. **Location Detection**
   - Browser geolocation API
   - Manual location input option

2. **Post Creation**
   - Location-based marker creation
   - Positive content validation
   - Real-time post submission

3. **Content Moderation**
   - AI-powered sentiment analysis
   - Automated cleanup every 5 minutes
   - Admin manual review system

4. **User Interaction**
   - Like-based post sorting
   - Location-based post discovery
   - Real-time updates

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm
- PostgreSQL database

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables
4. Run the development server:
   ```bash
   pnpm dev
   ```

## 📝 Project Structure

```
goodmap/
├── components/
│   ├── ui/           # ShadCN components
│   └── ...          # Custom components
├── app/             # Next.js app directory
├── prisma/          # Database schema and migrations
├── public/          # Static assets
└── ...             # Configuration files
```

## 🔒 Security Considerations

- User authentication and authorization
- Content moderation system
- Location data privacy
- API key management
- Rate limiting

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
