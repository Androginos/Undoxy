import { motion } from 'framer-motion'

// Components
import FixedWorkspace from './components/FixedWorkspace'
import MusicPlayer from './components/MusicPlayer'
// import ResponsiveBackground from './components/ResponsiveBackground'
// import MagnifyingGlass from './components/MagnifyingGlass'
// import InteractiveOverlay from './components/InteractiveOverlay'
// import FlickeringLights from './components/FlickeringLights' // Temporarily disabled

function App() {
  return (
    <motion.div 
      className="app-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Sabit Boyutlu Workspace Sistemi */}
      <FixedWorkspace />
      
      {/* Müzik Çalar - Fixed Position */}
      <MusicPlayer />
      
      {/* Eski responsive sistem - geçici olarak kapalı */}
      {/* <ResponsiveBackground deviceType={deviceType} /> */}
      {/* <MagnifyingGlass deviceType={deviceType} /> */}
      {/* <InteractiveOverlay deviceType={deviceType} /> */}
      {/* <FlickeringLights deviceType={deviceType} /> */}
    </motion.div>
  )
}

export default App 