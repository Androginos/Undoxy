# UnDoxy Canvas Editor

A swanky React-based canvas editor that's cooler than a penguin in sunglasses 😎. Snatches Twitter profile pics and lets you drag 'em around like a digital puppet master.

## Features That'll Make You Go "Wow!"

### ✨ The Main Event
- **Twitter Avatar Magic**: Drop an @username and watch the pfp appear faster than you can say "social media"
- **Responsive Canvas**: Desktop, Tablet, and Mobile views (because size matters, but adaptability matters more)
- **Drag & Drop Madness**: Move avatars around like you're playing chess with profile pics
- **Resize Like a Boss**: Make avatars bigger or smaller than your ego
- **Background Uploads**: Upload custom backgrounds that are prettier than your last vacation photos
- **Export/Download**: Download high-res PNGs that would make a photographer jealous

### 🎨 User Experience Smoother Than Butter
- Modern and clean design (no ugly buttons here!)
- Sora font family typography (fancy, right?)
- Responsive design (mobile-friendly because we're not monsters)
- Drag-and-drop so easy, even your grandma could do it
- Real-time preview (instant gratification included)

## Installation (Don't Panic!)

### Prerequisites
- Node.js 16+ (if you don't have it, what are you even doing?)
- npm or yarn (pick your poison)

### Steps to Glory

1. **Install the goodies:**
```bash
npm install
```

2. **Fire up the app:**
```bash
npm start
```

3. **Open in browser:**
[http://localhost:3000](http://localhost:3000)

## How to Use This Beast

### 1. Adding Twitter Avatars
- Type a Twitter username in the input field
- Use `@username` or just `username` format (we're not picky)
- Click "Add Avatar" button or smash that Enter key

### 2. Background Images
- Upload a background image from the "Background" section
- Drag & drop or click to select files (we support your workflow)
- JPG, PNG, GIF formats supported (because variety is the spice of life)

### 3. Canvas Editing Wizardry
- **View Modes**: Desktop (1200x800), Tablet (768x1024), Mobile (375x667)
- **Avatar Dragging**: Click and drag avatars like you're rearranging furniture
- **Resizing**: Select an avatar and drag the orange corner handle (it's like magic)
- **Deleting**: Select an avatar and click the red X (goodbye, cruel avatar!)

### 4. Export/Download Your Masterpiece
- Use the "Download" button above the canvas
- Gets downloaded as high-res PNG
- File name: `undoxy-{viewMode}-{timestamp}.png` (organized like a pro)

## Technical Nerdy Stuff

### Technologies That Power This Beast
- **React 18**: Modern React hooks (because we're living in the future)
- **html2canvas**: For canvas export magic
- **react-draggable**: Drag-and-drop operations
- **Unavatar.io API**: Twitter profile pics on demand

### API Integration
- **Twitter Avatars**: `https://unavatar.io/twitter/{username}`
- **Fallback System**: Default avatar when things go wrong
- **CORS Support**: Cross-origin requests handled like a champ

### Responsive Design That Actually Works
- **Desktop**: 1200x800px canvas (for the big screen enthusiasts)
- **Tablet**: 768x1024px canvas (perfect for your iPad)
- **Mobile**: 375x667px canvas (pocket-sized perfection)
- **Adaptive UI**: Mobile-optimized interface (because we care)

## File Structure (For the Curious)

```
src/
├── components/
│   ├── CanvasWrapper.js      # Main canvas component (the star of the show)
│   ├── DraggableAvatar.js    # Draggable avatar magic
│   ├── TwitterAvatar.js      # Twitter avatar component
│   └── ImageUpload.js        # Background upload wizardry
├── utils/
│   └── twitterAvatar.js      # Twitter API helpers
├── App.js                    # Main application (the conductor)
├── App.css                   # Style file (making things pretty)
└── index.js                  # Entry point (where it all begins)
```

## Contributing (Join the Fun!)

1. Fork this bad boy
2. Create a feature branch (`git checkout -b feature/awesome-new-thing`)
3. Commit your changes (`git commit -am 'Added something amazing'`)
4. Push to the branch (`git push origin feature/awesome-new-thing`)
5. Create a Pull Request (and wait for applause)

## License

This project is licensed under the MIT license (because sharing is caring).

## Troubleshooting (When Things Go Sideways)

### Avatars Not Loading
- Check your internet connection (turn it off and on again)
- Make sure the Twitter username is correct (typos are evil)
- If you get CORS errors, check the browser console (it knows things)

### Canvas Export Not Working
- Use a modern browser (Internet Explorer is not your friend)
- Make sure popup blocker is disabled (let the downloads flow)

### Performance Issues
- Don't add too many avatars (recommended: fewer than 10, your computer will thank you)
- Keep background image size reasonable (suggested: under 2MB, nobody likes slow loading)

## Contact

Got questions? Open an issue or send a pull request. We're friendly, I promise! 🤝 