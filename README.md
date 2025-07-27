# ExceptionCoding Portfolio

A modern, responsive portfolio website showcasing elite software development and digital solutions.

## 🌟 Features

- **Modern Design**: Clean, professional layout with dark/light theme toggle
- **Responsive**: Optimized for all devices and screen sizes
- **Accessible**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Interactive**: Smooth animations and scroll effects
- **GitHub Integration**: Dynamically loads and displays GitHub repository data
- **Performance Optimized**: Minified assets and optimized build process

## 🚀 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Build Tools**: Grunt for asset optimization and minification
- **Icons**: Iconify for scalable vector icons
- **Fonts**: Inter and JetBrains Mono for optimal readability
- **Deployment**: Static site ready for any hosting platform

## 📋 Prerequisites

- Node.js >= 22.0.0
- npm or yarn package manager

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/exceptioncoding/exceptioncoding.net.git
   cd exceptioncoding.net
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Fetch GitHub data** (optional)
   ```bash
   npm run fetch-github
   ```

## 🎯 Available Scripts

- `npm run fetch-github` - Fetch latest GitHub repository data
- `npm run build` - Build optimized production assets
- `npm run serve` - Serve production build locally (port 8000)
- `npm run serve-dev` - Serve development files locally (port 8000)
- `npm run dev` - Full development workflow (fetch + build + serve)
- `npm run dev-src` - Development with source files (fetch + serve-dev)
- `npm run prod` - Production workflow (build + serve)

## 🔧 Development

1. **Start development server**
   ```bash
   npm run dev-src
   ```

2. **Make your changes** in the `src/` directory

3. **Build for production**
   ```bash
   npm run build
   ```

## 📁 Project Structure

```
exceptioncoding.net/
├── src/                    # Source files
│   ├── index.html         # Main HTML file
│   ├── styles/main.css    # Stylesheet
│   ├── scripts/main.js    # JavaScript functionality
│   ├── images/            # Images and favicons
│   └── fonts/             # Font files
├── dist/                  # Production build output
├── data/                  # GitHub API data
├── bin/                   # Build scripts
├── Gruntfile.js          # Grunt configuration
└── package.json          # Project dependencies
```

## 🎨 Customization

### Theme Colors
Edit CSS custom properties in `src/styles/main.css`:
```css
:root {
  --primary-color: #6366f1;
  --secondary-color: #8b5cf6;
  /* ... other variables */
}
```

### Content
Update the content in `src/index.html` to reflect your personal information, skills, and projects.

### GitHub Integration
The site can automatically fetch and display your GitHub repositories. Configure the username in `bin/fetch-github-data.js`.

## 🚀 Deployment

The site generates static files in the `dist/` directory after running `npm run build`. Deploy these files to any static hosting service:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Push the `dist` folder to a `gh-pages` branch
- **Traditional hosting**: Upload `dist` contents via FTP

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from modern portfolio websites
- Icons provided by [Iconify](https://iconify.design/)
- Fonts from Google Fonts and JetBrains

---

**ExceptionCoding** - Where innovation meets execution ✨