# QA Detector

A comprehensive web application that automatically scans websites for quality assurance issues including accessibility problems, spelling errors, and HTML validation errors.

## Features

- **Automated Website Scanning**: Analyze any website for QA issues with a single click
- **Accessibility Testing**: Detect WCAG compliance issues using axe-core
- **Spelling Check**: Find spelling errors and typos across your website
- **HTML Validation**: Identify HTML structure problems and invalid markup
- **Project Management**: Organize multiple websites/projects in one dashboard
- **Embeddable Widget**: Add QA scanning functionality to any website
- **Secure Authentication**: Google OAuth integration via Supabase
- **Real-time Results**: Get instant feedback on website quality

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Authentication**: Supabase Auth with Google OAuth
- **Database**: PostgreSQL (via Supabase)
- **Testing Tools**:
  - axe-core for accessibility testing
  - Custom spell checker
  - HTML validator
- **Web Scraping**: Puppeteer, Cheerio

## Quick Start

### Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Google Cloud Platform account (for OAuth)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd qa-detector
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables:

```bash
cp .env.local.example .env.local
```

4. Configure your environment variables with your Supabase credentials

5. Follow the detailed setup instructions in [SETUP_GUIDE.md](./SETUP_GUIDE.md) for:

   - Supabase project configuration
   - Database schema setup
   - Google OAuth configuration

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
qa-detector/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── login/             # Login page
│   └── page.tsx           # Dashboard (main page)
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions and configurations
│   ├── supabase-client.ts # Client-side Supabase client
│   ├── supabase-server.ts # Server-side Supabase client
│   └── validation-utils.ts # Validation utilities
├── public/                # Static assets
│   └── widget.js          # Embeddable widget script
└── types/                 # TypeScript type definitions
```

## Usage

### For Website Owners

1. Sign in with your Google account
2. Create a new project with your website domain
3. Copy the generated token
4. Run scans manually or embed the widget on your website

### Embedding the Widget

Add this script to your website:

```html
<script>
  (function (w, d, s, o, f, js, fjs) {
    w["QADetector"] = o;
    w[o] =
      w[o] ||
      function () {
        (w[o].q = w[o].q || []).push(arguments);
      };
    (js = d.createElement(s)), (fjs = d.getElementsByTagName(s)[0]);
    js.id = o;
    js.src = f;
    js.async = 1;
    fjs.parentNode.insertBefore(js, fjs);
  })(window, document, "script", "qa", "YOUR_WIDGET_URL/widget.js");

  qa("init", { token: "YOUR_PROJECT_TOKEN" });
</script>
```

## API Endpoints

- `POST /api/scan` - Perform a QA scan on a URL
- `GET /api/check-auth` - Check authentication status
- `POST /api/verify-token` - Verify project token
- `GET /api/auth/callback` - Supabase OAuth callback

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
npm run build
```

### Database Migrations

All database schema changes should be added to the SQL script in SETUP_GUIDE.md and applied via the Supabase dashboard.

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- API tokens are securely generated and stored
- Service role keys are only used server-side

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/qa-detector&env=NEXTAUTH_URL,NEXTAUTH_SECRET,NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_APP_URL)

For detailed deployment instructions including Vercel, Netlify, Railway, and self-hosting options, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For detailed setup instructions and troubleshooting, please refer to [SETUP_GUIDE.md](./SETUP_GUIDE.md).
