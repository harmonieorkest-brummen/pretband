# Pretband H.O.B. Website

A bold, energetic website for Pretband H.O.B., built with Tailwind CSS and Vite.

## Tech Stack
- **Vite**: For fast development and optimized production builds.
- **Tailwind CSS**: For custom, utility-first styling.
- **Google Fonts**: Syne (Display) and Outfit (Body).

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Navigate to the `app` directory:
   ```bash
   cd app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development
To start the development server:
```bash
npm run dev
```

### Build for Production
To create a production-ready build:
```bash
npm run build
```
The output will be in the `dist` folder.

## Deployment to GitHub Pages

This project is configured to run on GitHub Pages.

1. Build the project:
   ```bash
   npm run build
   ```
2. Deploy the `dist` folder to the `gh-pages` branch. You can use the `gh-pages` npm package:
   ```bash
   npm install gh-pages --save-dev
   ```
   Then add a deploy script to `package.json`:
   ```json
   "deploy": "gh-pages -d dist"
   ```
   And run:
   ```bash
   npm run deploy
   ```

## Aesthetic Choices
- **Typography**: Large, bold headings using "Syne" to reflect the loud and energetic nature of a brass band.
- **Color Palette**: High-energy orange, pink, and yellow accents against a deep dark background.
- **Layout**: Asymmetrical and grid-breaking elements to create a dynamic, festival-like feel.
- **Motion**: Subtle animations and staggered reveals for a modern, interactive experience.
