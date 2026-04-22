# 📚 Library Search Engine

A high-performance hybrid search system for library book catalogs, combining traditional keyword matching with modern semantic vector search.

## 🚀 Overview

This project implements a sophisticated search engine for library book collections, featuring:

- **Hybrid Search**: Combines BM25 keyword matching with semantic vector similarity
- **Reciprocal Rank Fusion (RRF)**: Merges results from multiple retrieval methods
- **Real-time Embeddings**: Uses BGE model for 768-dimensional vector representations
- **Scalable Architecture**: Handles 68,000+ book records with efficient indexing
- **Modern Web Interface**: Built with Next.js and shadcn/ui components

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **PostgreSQL** with Prisma ORM
- **Elasticsearch** for search indexing
- **Redis** for caching and queues (BullMQ)
- **JWT** authentication
- **Zod** for validation

### Frontend
- **Next.js** 14 with App Router
- **React** with TypeScript
- **Redux Toolkit** for state management
- **shadcn/ui** + Tailwind CSS for UI
- **Axios** for API calls

### AI/ML Services
- **FastAPI** (Python) for embedding generation
- **BGE (BAAI General Embedding)** model
- **Cross-encoder** for relevance scoring
- **Reciprocal Rank Fusion** algorithm

### Infrastructure
- **Docker** (optional)
- **Nodemon** for development
- **Jest** for testing

## 📋 Features

- 🔍 **Advanced Search**: Multi-modal search with keyword and semantic matching
- 📖 **Book Management**: CRUD operations for book catalog
- 👤 **User Authentication**: JWT-based auth with role-based access
- 📊 **Dashboard**: Analytics and insights
- 🔄 **Real-time Processing**: Queue-based book processing and embedding generation
- 📱 **Responsive UI**: Modern, accessible web interface

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Python API    │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (FastAPI)     │
│                 │    │                 │    │                 │
│ - React UI      │    │ - Express API   │    │ - Embeddings    │
│ - Redux Store   │    │ - Elasticsearch │    │ - Cross-encoder │
│ - Axios         │    │ - RRF Ranking   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Databases     │
                    │                 │
                    │ - PostgreSQL    │
                    │ - Elasticsearch │
                    │ - Redis         │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- PostgreSQL
- Elasticsearch 8+
- Redis

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "library search engine"
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   # Configure environment variables (see .env.example)
   npm run seed:books  # Optional: seed initial data
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Python Services Setup**
   ```bash
   cd python_server
   pip install -r requirements.txt
   python server.py
   ```

### Environment Configuration

Create `.env` files in respective directories:

**Backend (.env)**
```env
DATABASE_URL="postgresql://..."
ELASTICSEARCH_NODE="http://localhost:9200"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret"
PORT=6000
```

**Python Server**
```env
# Configuration for embedding models
MODEL_PATH="./embedding_model"
```

## 📖 API Documentation

### Authentication Endpoints
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout

### Book Management
- `GET /books` - Search books (hybrid search)
- `POST /books` - Add new book
- `PUT /books/:id` - Update book
- `DELETE /books/:id` - Delete book

### User Management
- `GET /users` - List users (admin)
- `POST /users` - Create user
- `PUT /users/:id` - Update user

## 🔍 Search Algorithm

The system implements a two-pass hybrid search:

1. **First Pass**: Generate query embedding and find anchor document
2. **Second Pass**: Parallel retrieval using:
   - BM25 text matching
   - Query-to-document similarity
   - Document-to-document similarity
3. **Fusion**: RRF combines results by rank position

## 🧪 Testing

```bash
cd backend
npm test
```

## 📊 Data Processing

- **Migration**: Streams 68K+ records from PostgreSQL to Elasticsearch
- **Embedding Generation**: Batched processing (50 books/batch)
- **Index Configuration**: Custom analyzers with stemming and synonyms

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- BAAI for the BGE embedding model
- Elasticsearch community
- Open source contributors

---

Built with ❤️ for efficient library search experiences.</content>
<parameter name="filePath">D:\projects\library search engine\README.md