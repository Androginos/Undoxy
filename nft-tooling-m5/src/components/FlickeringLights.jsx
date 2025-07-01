import { useState, useEffect } from 'react'

const FlickeringLight = ({ position, width = 120, height = 60, color = "rgba(255, 255, 200, 1)" }) => {
  const [intensity, setIntensity] = useState(1)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    let timeoutId

    const flicker = () => {
      setIntensity(Math.random() * 0.7 + 0.3)
      setOpacity(Math.random() * 0.5 + 0.5)
      timeoutId = setTimeout(flicker, Math.random() * 500 + 100)
    }

    flicker()
    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <div
      style={{
        position: "absolute",
        top: position.top,
        left: position.left,
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "8px",
        backgroundColor: color,
        filter: `brightness(${intensity})`,
        opacity: opacity,
        transition: "filter 0.12s linear, opacity 0.12s linear",
        pointerEvents: "none",
        mixBlendMode: "screen",
        boxShadow: `0 0 ${width / 2}px ${height / 2}px ${color.replace('1)', '0.6)')}`
      }}
    />
  )
}

// Responsive FlickeringLights container
const FlickeringLights = ({ deviceType }) => {
  // Define lights for 3 main device types only
  const lightsConfig = {
    desktop: [
      {
        id: 'light1',
        position: { top: "35%", left: "48%" },
        width: 220,
        height: 40,
        color: "rgba(255, 255, 200, 1)"
      },
      {
        id: 'light2', 
        position: { top: "60%", left: "25%" },
        width: 180,
        height: 35,
        color: "rgba(200, 255, 255, 1)"
      },
      {
        id: 'light3',
        position: { top: "20%", left: "70%" },
        width: 150,
        height: 30,
        color: "rgba(255, 200, 255, 1)"
      }
    ],
    tablet: [
      {
        id: 'light1',
        position: { top: "25%", left: "40%" },
        width: 180,
        height: 35,
        color: "rgba(255, 255, 200, 1)"
      },
      {
        id: 'light2',
        position: { top: "50%", left: "18%" },
        width: 140,
        height: 30,
        color: "rgba(200, 255, 255, 1)"
      },
      {
        id: 'light3',
        position: { top: "12%", left: "65%" },
        width: 120,
        height: 25,
        color: "rgba(255, 200, 255, 1)"
      }
    ],
    mobile: [
      {
        id: 'light1',
        position: { top: "35%", left: "25%" },
        width: 100,
        height: 20,
        color: "rgba(255, 255, 200, 1)"
      },
      {
        id: 'light2',
        position: { top: "60%", left: "10%" },
        width: 80,
        height: 18,
        color: "rgba(200, 255, 255, 1)"
      }
    ]
  }

  const currentLights = lightsConfig[deviceType] || lightsConfig.desktop

  return (
    <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
      {currentLights.map((light) => (
        <FlickeringLight
          key={`${deviceType}-${light.id}`}
          position={light.position}
          width={light.width}
          height={light.height}
          color={light.color}
        />
      ))}
    </div>
  )
}

export default FlickeringLights 