# Blockchain Visualizer

Real-time blockchain data visualization with responsive design and WebSocket connectivity.

## 🚀 Features

- **Real-time Data**: Live blockchain data via WebSocket connection
- **Responsive Design**: Optimized for PC (16:9), Tablet (1:1), and Mobile (2:3) aspect ratios
- **Interactive Elements**: Clickable areas with hover effects and animations
- **Modern Tech Stack**: React + Vite, Framer Motion, Viem integration
- **Performance Optimized**: Smooth animations and efficient rendering

## 📱 Responsive Design Strategy

### Aspect Ratio Targets:
- **Desktop (16:9)**: Background `169bg.jpg` - Optimized for wide screens
- **Tablet (1:1)**: Background `23bg.jpg` - Square aspect ratio layout
- **Mobile (2:3)**: Background `11bg.jpg` - Portrait orientation optimized

### Breakpoints:
```css
Mobile:  max-width: 768px
Tablet:  769px - 1024px  
Desktop: min-width: 1025px
```

## 🛠 Tech Stack

### Frontend:
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Framer Motion** - Animations and gestures
- **react-responsive** - Responsive breakpoint detection
- **react-use-websocket** - WebSocket connection management

### Future Blockchain Integration:
- **Viem** - Ethereum interactions
- **WebSocket API** - Real-time data stream
- **Custom Backend** - Data aggregation and processing

## 🏗 Project Structure

```
src/
├── components/
│   ├── ResponsiveBackground.jsx    # Device-specific backgrounds
│   ├── InteractiveOverlay.jsx      # Clickable areas overlay
│   └── BlockchainVisualizer.jsx    # Main data visualization
├── hooks/
│   └── useBlockchainData.js        # Blockchain data management
├── utils/
│   └── mockData.js                 # Test data generation
├── App.jsx                         # Main application
├── main.jsx                        # Entry point
└── index.css                       # Global styles & CSS variables
```

## 🚦 Getting Started

### Prerequisites:
- Node.js 18+ 
- npm or yarn

### Installation:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

## 🎨 CSS Architecture

### CSS Custom Properties:
```css
/* Responsive breakpoints */
--breakpoint-mobile: 768px
--breakpoint-tablet: 1024px
--breakpoint-desktop: 1200px

/* Blockchain color palette */
--color-primary: #00d4ff    /* Cyan */
--color-secondary: #ff6b35  /* Orange */
--color-success: #00ff88    /* Green */
--color-warning: #ffb800    /* Yellow */
--color-error: #ff4757      /* Red */
```

### Animation System:
```css
/* Duration standards */
--duration-fast: 0.15s
--duration-normal: 0.3s
--duration-slow: 0.6s

/* Z-index layers */
--z-background: 0
--z-content: 10
--z-interactive: 20
--z-overlay: 30
--z-modal: 40
```

## 🔌 WebSocket Integration

### Connection Setup:
```javascript
const socketUrl = 'ws://localhost:8080'
const { lastMessage, readyState } = useWebSocket(socketUrl, {
  onOpen: () => console.log('Connected'),
  onClose: () => console.log('Disconnected'),
  shouldReconnect: () => true
})
```

### Data Format Expected:
```json
{
  "type": "newBlock",
  "data": {
    "number": 18500123,
    "hash": "0x...",
    "timestamp": 1699123456789,
    "gasUsed": 15000000
  }
}
```

## 🎯 Interactive Areas

Each device type has optimized positioning for interactive elements:

### Desktop Layout:
- Blocks: 15%, 20% (200x150px)
- Transactions: 60%, 30% (180x120px)  
- Network Stats: 25%, 65% (300x100px)
- Price Data: 70%, 70% (150x100px)

### Tablet Layout:
- Proportionally scaled with adjusted spacing

### Mobile Layout:
- Compact positioning with touch-friendly sizing

## 🚀 Performance Features

- **Smart Re-rendering**: Device-specific component keys
- **Efficient Animations**: CSS transforms and Framer Motion
- **Memory Management**: Limited block/transaction history
- **Lazy Updates**: Debounced WebSocket message processing

## 🔮 Future Enhancements

### Planned Features:
1. **Zoom & Pan**: react-zoom-pan-pinch integration
2. **Advanced Visualizations**: Pixi.js/Three.js for complex graphics
3. **Real Blockchain APIs**: Ethereum, Bitcoin, other networks
4. **Custom Dashboards**: User-configurable layouts
5. **Export Features**: Screenshot, data export capabilities

### Backend Integration:
- Real-time blockchain data aggregation
- WebSocket server for live updates
- Multiple network support
- Historical data caching

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

**Built with ❤️ for the blockchain community** 