# SampleExercise

A full-stack web application for managing user messages, built with ASP.NET Core 8.0 backend and React TypeScript frontend.

## Project Structure

```
SampleExercise/
├── SampleExercise.Application/     # Business logic and models
├── SampleExercise.Infrastructure/  # Data access layer with Dapper
├── SampleExercise.Server/          # ASP.NET Core Web API
└── sampleexercise.client/          # React TypeScript frontend
```

## Backend API Endpoints

### User Messages API (`/api/usermessages`)

| Method   | Endpoint                 | Description                                                    |
| -------- | ------------------------ | -------------------------------------------------------------- |
| `GET`    | `/api/usermessages`      | Retrieve paginated list of messages with filtering and sorting |
| `GET`    | `/api/usermessages/{id}` | Get a specific message by ID                                   |
| `POST`   | `/api/usermessages`      | Create a new user message                                      |
| `PUT`    | `/api/usermessages/{id}` | Update message content                                         |
| `DELETE` | `/api/usermessages/{id}` | Delete a message                                               |

#### Query Parameters for GET `/api/usermessages`

- `messageFilter` - Filter messages by content (minimum 3 characters)
- `sortBy` - Sort by: `Id`, `MessageContent`, `SubmittedOn`, `ModifiedOn`
- `sortOrder` - Sort order: `ASC` or `DESC`
- `pageNumber` - Page number (1-based)
- `pageSize` - Items per page (5, 10, 25, 50)

#### Example Requests

```http
# Get all messages with pagination
GET /api/usermessages?pageNumber=1&pageSize=10

# Search and sort messages
GET /api/usermessages?messageFilter=hello&sortBy=SubmittedOn&sortOrder=DESC

# Create a new message (JSON format)
POST /api/usermessages
Content-Type: application/json
{
  "senderNumber": 1234567890,
  "recipientNumber": 9876543210,
  "messageContent": "Hello, this is a test message from json."
}

# Create a new message (Form data format)
POST /api/usermessages
Content-Type: application/x-www-form-urlencoded

senderNumber=1234567890&recipientNumber=9876543210&messageContent=Hello%2C%20this%20is%20a%20test%20message%20from%20form.

# Create a new message (Query parameters format)
POST /api/usermessages/?senderNumber=1234567890&recipientNumber=9876543210&messageContent=Hello%2C%20this%20is%20a%20test%20message%20from%20query%20string.
```

## Frontend Features

### User Message Grid Component

- **Real-time Search**: Filter messages by content
- **Smart Search Validation**:
  - Minimum 3 characters required for search activation
  - Visual feedback for insufficient character count
  - Auto-clear functionality
- **Debounced Search**: 1-second delay to optimize API calls and improve performance
- **Advanced Sorting**: Click column headers to sort by ID, Message Content, Submitted Date, or Modified Date
- **Pagination**: Navigate through large datasets with configurable page sizes

## Technology Stack

### Backend

- **ASP.NET Core 8.0** - Web API framework
- **Dapper** - Lightweight ORM for data access
- **SQL Server** - Database
- **Clean Architecture** - Separation of concerns

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Material-UI** - Component library
- **Styled Components** - CSS-in-JS styling

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- Node.js 20.x
- SQL Server

### Running the Application

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd SampleExercise
   ```

2. **Backend Setup**

   ```bash
   # Restore dependencies
   dotnet restore

   # Run the API (default: http://localhost:32769)
   dotnet run --project SampleExercise.Server
   ```

3. **Frontend Setup**

   ```bash
   cd sampleexercise.client

   # Install dependencies
   npm install

   # Start development server
   npm run dev
   ```

## Deployment

The application supports deployment to Azure App Service with automated CI/CD via GitHub Actions. The workflow builds both frontend and backend components and deploys them as a unified application.
