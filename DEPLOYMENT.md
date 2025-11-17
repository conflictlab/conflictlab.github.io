# Website Deployment Instructions

## GitHub Pages Deployment

This Next.js website is configured for static export and can be deployed to GitHub Pages using browser-based methods.

### Prerequisites

- GitHub account
- Node.js and npm installed locally (for building the website)

### Method 1: GitHub Web Interface Upload (Recommended)

1. **Build the Website Locally**:
   ```bash
   npm install
   npm run build
   ```
   This creates an `out` folder with your static website files.

   Optional (sync forecasts from GitHub CSVs before build):
   ```bash
   npm run csv:sync:github -- --repo your-org/your-repo --dir path/to/csvs --branch main --latestOnly --token $GITHUB_TOKEN
   ```

2. **Create GitHub Repository**:
   - Go to [GitHub.com](https://github.com) and sign in
   - Click the "+" icon in the top right → "New repository"
   - Name it something like `luscint-website` or `your-website`
   - Make it public (required for free GitHub Pages)
   - Check "Add a README file"
   - Click "Create repository"

3. **Upload Website Files**:
   - In your new repository, click "uploading an existing file"
   - Open your local `out` folder and select all files (Ctrl/Cmd+A)
   - Drag and drop all files into the GitHub upload area
   - Add a commit message like "Deploy website"
   - Click "Commit changes"

4. **Enable GitHub Pages**:
   - Go to your repository's "Settings" tab
   - Scroll down to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

5. **Get Your Website URL**:
   - GitHub will show you the URL where your site is published
   - It will be: `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/`
   - Wait 1-2 minutes for deployment to complete

### Method 2: GitHub Actions (Browser Setup)

1. **Build and Upload Files** (same as Method 1, steps 1-3)

2. **Create GitHub Actions Workflow**:
   - In your repository, click "Create new file"
   - Name it `.github/workflows/deploy.yml`
   - Copy and paste this content:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
             cache: 'npm'

         - name: Install dependencies
           run: npm ci

         - name: Sync forecasts from GitHub CSVs
           run: npm run csv:sync:github -- --repo your-org/your-repo --dir path/to/csvs --branch main --latestOnly
           env:
             GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

         - name: Build
           run: npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```
   - Click "Commit changes"

3. **Upload Your Source Code**:
   - Create a new file called `package.json` and copy your local package.json content
   - Upload all your source files (app/, components/, content/, public/, etc.)
   - Do NOT upload the `out` folder - GitHub Actions will build it

4. **Enable GitHub Pages**:
   - Go to Settings → Pages
   - Select "GitHub Actions" as the source
   - Your site will auto-deploy when you push changes

### Method 3: Direct File Management

For quick updates without rebuilding:

1. **Make Changes Locally** and run `npm run build`
2. **Update Files via Browser**:
   - Go to your repository on GitHub
   - Click on the file you want to update
   - Click the pencil icon to edit
   - Copy and paste new content
   - Commit changes

### Updating Your Website

**For Method 1 (Manual Upload)**:
1. Make changes locally
2. Run `npm run build`
3. Delete old files in GitHub repository
4. Upload new files from the `out` folder

**For Method 2 (GitHub Actions)**:
1. Make changes locally
2. Upload changed source files via GitHub web interface
3. GitHub automatically rebuilds and deploys

### Configuration Notes

The website is already configured for static export with:
- `output: 'export'` in `next.config.js`
- `trailingSlash: true` for GitHub Pages compatibility
- `unoptimized: true` for images

### Custom Domain (Optional)

To use a custom domain:

1. **Add CNAME file** to the `public` directory:
   ```
   your-domain.com
   ```

2. **Configure DNS** with your domain provider:
   - Add a CNAME record pointing to `your-username.github.io`

3. **Enable Custom Domain** in GitHub Pages settings

### Troubleshooting

- **Build fails**: Check that all dependencies are installed with `npm install`
- **404 errors**: Ensure `trailingSlash: true` is set in `next.config.js`
- **Assets not loading**: Verify `basePath` configuration if using a repository name as subdirectory
- **Workflow fails**: Check that GitHub Actions has proper permissions in repository settings

### Live URL

After deployment, your website will be available at:
- `https://YOUR_USERNAME.github.io/YOUR_REPOSITORY/` (if repository is not named `username.github.io`)
- `https://YOUR_USERNAME.github.io/` (if repository is named `username.github.io`)

The deployment typically takes 1-2 minutes to complete after pushing changes.
