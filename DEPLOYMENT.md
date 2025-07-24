# Website Deployment Instructions

## GitHub Pages Deployment

This Next.js website is configured for static export and can be deployed to GitHub Pages using the following methods.

### Prerequisites

- GitHub account
- Git installed locally
- Node.js and npm installed

### Method 1: GitHub Actions (Recommended)

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to GitHub and create a new repository
   - Name it something like `your-website` or `company-website`
   - Don't initialize with README (since you already have files)

3. **Connect Local Repository to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M main
   git push -u origin main
   ```

4. **Create GitHub Actions Workflow**:
   Create `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     pull_request:
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

         - name: Build
           run: npm run build

         - name: Deploy to GitHub Pages
           uses: peaceiris/actions-gh-pages@v3
           if: github.ref == 'refs/heads/main'
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./out
   ```

5. **Enable GitHub Pages**:
   - Go to your repository settings
   - Navigate to "Pages" section
   - Set source to "Deploy from a branch"
   - Select `gh-pages` branch and `/ (root)` folder
   - Save the settings

6. **Push Changes**:
   ```bash
   git add .
   git commit -m "Add GitHub Actions deployment workflow"
   git push
   ```

### Method 2: Manual Deployment

1. **Build the Website**:
   ```bash
   npm install
   npm run build
   ```

2. **Initialize Git in Output Directory**:
   ```bash
   cd out
   git init
   git add .
   git commit -m "Deploy website"
   ```

3. **Push to GitHub Pages Branch**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
   git branch -M gh-pages
   git push -u origin gh-pages
   ```

4. **Enable GitHub Pages** (same as Method 1, step 5)

### Method 3: Using gh-pages Package

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add Deploy Script** to `package.json`:
   ```json
   {
     "scripts": {
       "deploy": "next build && gh-pages -d out"
     }
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

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