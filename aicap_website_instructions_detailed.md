# AICAP Website Development Instructions for Claude Code

## Overview
Create a modern, scalable, and professional website for AICAP. Use the style and structure of https://www.maplecroft.com/products-and-solutions/geopolitical-and-country-risk/ as inspiration, but populate all content directly from the provided Markdown files.

## Input Content
Use the following Markdown files (provided separately) as the authoritative content source for the product pages:
- `AICAP_Portfolio_Risk_Intelligence.md`
- `AICAP_Conflict_Sensitive_Screening.md`
- `AICAP_Catastrophic_Civil_Risk_Forecast.md`
- `AICAP_GeoESG_Compliance_Engine.md`
- `AICAP_Conflict_Early_Warning_Portal.md`

Each file includes:  
- Product name  
- Overview paragraph  
- Use cases (typically 3–4 bullet points)  
- Key features (3–4 bullet points)  
- Target audience

## Site Structure

### Homepage
- Hero section: 1-line value proposition about AICAP
- High-level overview of platform features (predictive, explainable, scalable)
- Buttons linking to Forecast Explorer, Product Suite, and Contact
- Optional: Partner logos or academic endorsement tags

### Forecast Explorer (Interactive Map Page)
- Design inspired by https://conflictforecast.org
- Use Mapbox or Leaflet to render interactive map
- Country-level forecast values (from AICAP data) visualized via color scale
- Hover/click to show mini-profile: top conflict indicators, recent trend
- Add filters: by region, event type (e.g., protest, civil war), or intensity

### Products & Solutions
Each product listed on this page should:
- Render title from the markdown filename (remove underscores and extension)
- Use the first paragraph as the product description
- Use **Use Cases** section as a bullet list
- Use **Key Features** section as a secondary list
- Highlight **Audience** as a gray callout or footer note

Include visual call-to-actions linking to:
- PDF download of full product brief
- Contact form to request demo or API access

### Resources
- Upload background whitepapers, validation studies, and case studies (can be added later)
- Link to blog posts or media mentions (optional)

### Contact Page
- Basic inquiry form with name, email, company, and message
- Optional newsletter signup (Mailchimp or Substack)
- Separate section for sales and media inquiries

## Technical Notes
- Use React or Vue frontend
- Use Tailwind CSS or Bootstrap 5 for styling
- Use Markdown parser to dynamically render product pages from `.md` files
- Map rendering should support filtering and tooltips
- Pages must be mobile-optimized and lightweight

## Deliverables
- A complete, styled, and responsive web app
- Static build and source repo
- API-ready endpoints for forecast data (if required)
- Working interactive map page modeled after conflictforecast.org

## Optional Enhancements
- Include download links for each product brief in PDF format
- Add search bar to Products & Solutions page
- Enable blog or updates section for case studies