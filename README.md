# College Counselor MVP

A modern web application to help students plan their college journey, manage applications, and get essay feedback.

## Features

- **Profile Builder**: Create and manage your academic profile
- **College List**: Organize your target schools by reach, match, and safety
- **Major Selection**: Choose your primary and backup majors
- **Activity Planner**: Get personalized activity recommendations
- **Essay Review**: Receive instant feedback on your college essays

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Framer Motion
- React Hot Toast

## Getting Started

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd college-counselor-mvp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
├── app/
│   ├── activities/     # Activity planner page
│   ├── colleges/       # College list page
│   ├── essay/         # Essay review page
│   ├── major/         # Major selection page
│   ├── profile/       # Profile setup page
│   ├── globals.css    # Global styles
│   └── layout.tsx     # Root layout
├── public/            # Static assets
├── styles/           # Additional styles
├── package.json      # Dependencies
└── README.md        # Documentation
```

## Development

- Built with Next.js 14 App Router
- Fully responsive design
- Modern UI with smooth animations
- TypeScript for type safety
- Tailwind CSS for styling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Conversation History Feature

The application now includes a conversation history feature that allows users to:

1. Save conversations to MongoDB (embedded in User documents)
2. View past conversations
3. Resume previous conversations
4. Restart conversations (keeping the title but with a fresh message history)
5. Delete unwanted conversations

### Using the Conversation Feature

1. Navigate to `/chat` to use the conversation interface
2. Logged-in users will automatically have their conversations saved
3. Click "Show History" to see past conversations
4. Use the controls to manage your conversation history:
   - Resume a conversation (checkmark icon)
   - Restart a conversation (reset icon)
   - Delete a conversation (trash icon)

### Technical Implementation

The conversation system is built with:

- MongoDB for persistent storage
- Conversations stored directly in the User document
- Mongoose for schema definition and data validation
- Next.js API routes for CRUD operations
- React components for UI display and interaction

### Example Usage

```javascript
// Fetch user's conversations
const response = await fetch('/api/conversations');
const { conversations } = await response.json();

// Create or update a conversation
await fetch('/api/conversations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    conversation: {
      _id: existingId, // Optional - omit for new conversation
      title: 'My Conversation',
      messages: [
        {
          content: 'Hello there!',
          sender: 'user',
          timestamp: new Date()
        },
        {
          content: 'Hi! How can I help you today?',
          sender: 'assistant',
          timestamp: new Date()
        }
      ]
    }
  }),
});

// Delete a conversation
await fetch(`/api/conversations?id=${conversationId}`, {
  method: 'DELETE'
});

// Archive instead of delete
await fetch(`/api/conversations?id=${conversationId}&archive=true`, {
  method: 'DELETE'
});
```

The system automatically creates a new conversation if one doesn't exist when a user starts chatting.