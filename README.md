# Clairient Website

A professional website for Clairient - an intelligence technology company focused on forecasting geopolitical conflict, civil unrest, and political instability using machine learning and dynamic exposure modeling.

## 🚀 Quick Start

### Prerequisites

- **Node.js** (version 18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** (for version control)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site in your browser.

### 3. Build for Production

```bash
npm run build
```

This creates an optimized production build in the `out/` directory.

## 📁 Project Structure

```
clairient-website/
├── app/                    # Next.js App Router pages
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── dashboard/         # Dashboard placeholder
│   ├── technology/        # Technology overview
│   ├── use-cases/         # Use cases and client sectors
│   ├── globals.css        # Global styles with Tailwind
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx           # Homepage
├── components/            # Reusable React components
│   ├── Navigation.tsx     # Main navigation header
│   └── Footer.tsx         # Site footer
├── content/              # Content management (JSON files)
│   ├── company.json      # Company information
│   ├── services.json     # Services and capabilities
│   └── use-cases.json    # Use case data
├── public/               # Static assets
└── README.md             # This file
```

## 🎨 Customization Guide

### Changing Content

All website content is stored in JSON files in the `/content/` directory for easy editing:

#### Company Information (`/content/company.json`)
- Company name, tagline, mission
- Value propositions
- Contact information

#### Services & Products (`/content/services.json`)
- Core capabilities
- Product descriptions
- Features and use cases

#### Use Cases (`/content/use-cases.json`)
- Target sectors
- Client examples
- Use case scenarios

### Adding New Use Cases

1. Edit `/content/use-cases.json`
2. Add a new sector object with:
   ```json
   {
     "name": "New Sector",
     "useCase": "Primary use case description",
     "description": "Detailed description",
     "icon": "IconName"
   }
   ```

### Updating Styles

The site uses Tailwind CSS for styling:
- Global styles: `/app/globals.css`
- Component classes: `.btn-primary`, `.btn-secondary`, `.section-heading`
- Colors: `clairient-blue`, `clairient-light`, `clairient-dark`

### Adding New Pages

1. Create a new directory in `/app/`
2. Add a `page.tsx` file with your React component
3. Update navigation in `/components/Navigation.tsx`

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Create a Vercel account** at [vercel.com](https://vercel.com)

2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/clairient-website.git
   git push -u origin main
   ```

3. **Deploy on Vercel**:
   - Go to [vercel.com/import](https://vercel.com/import)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js and deploy
   - Your site will be live at `https://your-project.vercel.app`

### Option 2: Netlify

1. Build the project: `npm run build`
2. Drag the `out/` folder to [Netlify Drop](https://app.netlify.com/drop)

### Option 3: GitHub Pages

1. Uncomment the GitHub Actions workflow in `.github/workflows/deploy.yml`
2. Push to GitHub
3. Enable GitHub Pages in repository settings

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:
```
# Add any environment variables here
# NEXT_PUBLIC_API_URL=https://api.clairient.com
```

### Custom Domain

To use a custom domain:
1. Add `CNAME` file to `/public/` with your domain
2. Configure DNS settings with your domain provider
3. Update Vercel domain settings (if using Vercel)

## 🔌 Future API Integration

The site is prepared for future API integration:

### Adding API Routes

1. Create `/app/api/` directory
2. Add API route files (e.g., `/app/api/forecasts/route.ts`)

### Dashboard Integration

The dashboard page (`/app/dashboard/page.tsx`) is ready for:
- Real-time data fetching
- Interactive charts
- User authentication
- API endpoints

### Example API Integration

```typescript
// In a component
const [forecasts, setForecasts] = useState([])

useEffect(() => {
  fetch('/api/forecasts')
    .then(res => res.json())
    .then(data => setForecasts(data))
}, [])
```

## 📱 Mobile Optimization

The site is fully responsive and optimized for:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)

## 🧪 Testing

Run the development server and test:
- Navigation works on all screen sizes
- Forms submit properly (currently shows success message)
- All links are functional
- Images load correctly

## 📈 Performance

The site is optimized for:
- **Core Web Vitals** compliance
- **Fast loading** with Next.js static generation
- **SEO** with proper meta tags
- **Accessibility** with semantic HTML

## 🆘 Troubleshooting

### Common Issues

1. **Build fails**: Check Node.js version (18+)
2. **Styles not loading**: Ensure Tailwind CSS is configured
3. **Images not showing**: Check file paths in `/public/`

### Getting Help

- Check [Next.js documentation](https://nextjs.org/docs)
- Visit [Tailwind CSS docs](https://tailwindcss.com/docs)
- Review [Vercel deployment guide](https://vercel.com/docs)

## 📝 Content Management Tips

### Writing Guidelines
- Keep headlines clear and concise
- Use active voice for better engagement
- Include specific metrics and benefits
- Maintain consistent tone throughout

### SEO Best Practices
- Update page titles and descriptions in layout files
- Add alt text for images
- Use proper heading hierarchy (h1, h2, h3)
- Include relevant keywords naturally

## 🔒 Security Notes

- No sensitive data is stored in the repository
- Contact form is client-side only (replace with backend)
- All external links should be verified
- Regular dependency updates recommended

## 📄 License

This project is proprietary to Clairient. All rights reserved.

---

**Need help?** Contact the development team or refer to the documentation links above.

**Last updated:** July 2025