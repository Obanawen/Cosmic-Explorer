# AI Mark Checker

A modern single-page application built with Next.js, ShadCN/UI, and OpenAI Vision API that allows users to upload images and automatically detect and analyze marks, annotations, and symbols using artificial intelligence.

## Features

- 🖼️ **Drag & Drop Image Upload** - Easy file upload with drag and drop functionality
- 🤖 **AI-Powered Analysis** - Uses OpenRouter's GPT-4o-mini Vision API to detect marks and annotations
- 📊 **Detailed Results** - Shows mark type, location, size, color, and confidence level
- 🎨 **Modern UI** - Beautiful interface built with ShadCN/UI components
- ⚡ **Real-time Processing** - Instant analysis with progress indicators
- 📱 **Responsive Design** - Works on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: ShadCN/UI
- **Styling**: Tailwind CSS
- **AI Integration**: OpenRouter GPT-4o-mini Vision API
- **Language**: TypeScript
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenRouter API key

### Installation

1. **Clone the repository** (or navigate to the project directory)
   ```bash
   cd mark-checker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   # OpenRouter API Key (required)
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

   To get an OpenRouter API key:
   - Go to [OpenRouter API Keys](https://openrouter.ai/keys)
   - Create a new API key
   - Copy and paste it into your `.env.local` file

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## Usage

1. **Upload an Image**
   - Drag and drop an image file onto the upload area, or
   - Click "Browse Files" to select an image

2. **Analyze the Image**
   - Click "Analyze Image" to process the uploaded file
   - Wait for the AI to analyze the image (typically takes a few seconds)

3. **View Results**
   - The app will display all detected marks with details including:
     - Mark type (check mark, X, circle, text, etc.)
     - Location in the image
     - Size and color
     - Confidence level

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- And other common image formats

## API Endpoints

### POST `/api/analyze-marks`

Analyzes an uploaded image for marks and annotations.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'image' field containing the image file

**Response:**
```json
{
  "success": true,
  "analysis": {
    "marks": [
      {
        "type": "check mark",
        "location": "top left corner",
        "color": "red",
        "size": "medium",
        "confidence": "high"
      }
    ]
  },
  "filename": "example.jpg",
  "fileSize": 1234567,
  "mimeType": "image/jpeg"
}
```

## Project Structure

```
mark-checker/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── analyze-marks/
│   │   │       └── route.ts          # API endpoint for image analysis
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main application page
│   ├── components/
│   │   └── ui/                       # ShadCN/UI components
│   └── lib/
│       └── utils.ts                  # Utility functions
├── public/                           # Static assets
├── .env.local                        # Environment variables (create this)
├── components.json                   # ShadCN/UI configuration
├── package.json                      # Dependencies and scripts
├── tailwind.config.ts               # Tailwind CSS configuration
└── tsconfig.json                    # TypeScript configuration
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. **UI Components**: Add new ShadCN/UI components using:
   ```bash
   npx shadcn@latest add [component-name]
   ```

2. **API Routes**: Create new API endpoints in `src/app/api/`

3. **Styling**: Use Tailwind CSS classes for styling

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | Your OpenRouter API key for vision analysis | Yes |

## Troubleshooting

### Common Issues

1. **"OpenRouter API key not found"**
   - Make sure you've created a `.env.local` file
   - Verify your OPENROUTER_API_KEY is correctly set

2. **Image upload fails**
   - Check that the file is a valid image format
   - Ensure the file size is reasonable (< 20MB)

3. **Analysis takes too long**
   - OpenRouter API calls can take 5-30 seconds depending on image size
   - Check your internet connection

### Getting Help

If you encounter issues:
1. Check the browser console for error messages
2. Verify your OpenRouter API key is valid and has credits
3. Ensure all dependencies are installed correctly

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
