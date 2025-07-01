import { motion } from 'framer-motion'

const ResponsiveBackground = ({ deviceType }) => {
  // Background mappings - 3 main device types only
  const backgroundMap = {
    desktop: '/169bg.png',     // 16:9 aspect ratio for desktop (PNG)
    tablet: '/11bg.png',       // 1:1 aspect ratio for tablet (PNG)
    mobile: '/23bg.png'        // 2:3 aspect ratio for mobile (PNG)
  }

  const currentBackground = backgroundMap[deviceType] || backgroundMap.desktop

  return (
    <motion.img
      key={deviceType} // Force re-render on device change
      src={currentBackground}
      alt="Blockchain Visualization Background"
      className="bg-responsive"
      initial={{ opacity: 0, scale: 1.05 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
      style={{
        // filter: 'brightness(0.7) contrast(1.2)', // Temporarily disabled for GIF testing
        willChange: 'transform, opacity'
      }}
      onLoad={() => {
        console.log(`Background loaded for ${deviceType}: ${currentBackground}`)
      }}
    />
  )
}

export default ResponsiveBackground 