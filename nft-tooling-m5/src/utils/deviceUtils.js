// Device detection utilities for precise responsive design

export const getDeviceInfo = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  const ratio = width / height
  
  return {
    width,
    height,
    ratio: ratio.toFixed(3),
    aspectRatio: `${width}:${height}`,
    deviceType: detectDeviceType(width, height),
    orientation: width > height ? 'landscape' : 'portrait'
  }
}

export const detectDeviceType = (width, height) => {
  // iPhone 14 Pro specific
  if (width === 430 && height === 932) return 'iphone14pro'
  
  // iPad specific  
  if (width === 1024 && height === 1366) return 'ipad'
  
  // General mobile (up to 430px width)
  if (width <= 430) return 'mobile'
  
  // Tablet range (431px - 1024px)
  if (width >= 431 && width <= 1024) return 'tablet'
  
  // Desktop (1025px+)
  return 'desktop'
}

export const getResponsiveBreakpoints = () => ({
  mobile: 430,
  tablet: 1024,
  desktop: 1440
})

export const logDeviceInfo = () => {
  const info = getDeviceInfo()
  console.log('🔍 Device Detection:', {
    'Screen Size': `${info.width}x${info.height}`,
    'Aspect Ratio': info.ratio,
    'Device Type': info.deviceType,
    'Orientation': info.orientation
  })
  return info
}

// Test different device configurations
export const testResponsiveBreakpoints = () => {
  const testCases = [
    { name: 'iPhone 14 Pro', width: 430, height: 932 },
    { name: 'iPad Portrait', width: 1024, height: 1366 },
    { name: 'iPad Landscape', width: 1366, height: 1024 },
    { name: 'Desktop 1080p', width: 1920, height: 1080 },
    { name: 'MacBook Air', width: 1440, height: 900 }
  ]
  
  console.log('📱 Responsive Test Results:')
  testCases.forEach(test => {
    const deviceType = detectDeviceType(test.width, test.height)
    console.log(`${test.name}: ${test.width}x${test.height} → ${deviceType}`)
  })
}

// Viewport units compatibility check
export const checkViewportSupport = () => {
  const testElement = document.createElement('div')
  testElement.style.height = '100dvh'
  
  const supportsDVH = testElement.style.height === '100dvh'
  
  console.log('🖥️ Viewport Support:', {
    'Dynamic VH (dvh)': supportsDVH ? '✅' : '❌',
    'Large VH (lvh)': 'CSS.supports' in window ? CSS.supports('height', '100lvh') : '❌',
    'Small VH (svh)': 'CSS.supports' in window ? CSS.supports('height', '100svh') : '❌'
  })
  
  return supportsDVH
} 