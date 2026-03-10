# MyApp

A professional React + Vite + Tailwind CSS starter.

## Stack

| Tool | Purpose |
|------|---------|
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [React 18](https://react.dev) | UI framework |
| [Tailwind CSS v3](https://tailwindcss.com) | Styling |
| [React Router v6](https://reactrouter.com) | Routing |
| [ESLint](https://eslint.org) | Linting |
| [Prettier](https://prettier.io) | Code formatting |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static files (images, fonts, icons)
├── components/      # Reusable UI components
├── context/         # React Context providers
├── hooks/           # Custom hooks
├── layouts/         # Page layout wrappers
├── pages/           # Route-level page components
├── services/        # API calls & external services
├── styles/          # Additional global styles
└── utils/           # Helper functions
```

## Environment Variables

Copy `.env.example` to `.env` and fill in your values.
All client-side env vars must be prefixed with `VITE_`.

```bash
cp .env.example .env
```

## Path Aliases

Import with clean aliases instead of relative paths:

```js
import Button from '@components/Button'
import { api } from '@services/api'
import { cn } from '@utils/cn'
```

## Tailwind Custom Utilities

Pre-built component classes in `src/index.css`:

```html
<button class="btn-primary">Save</button>
<button class="btn-outline">Cancel</button>
<div class="card">...</div>
<input class="input" />
<div class="container-page">...</div>
```
