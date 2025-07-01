import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const BlockchainVisualizer = ({ data, deviceType, isConnected }) => {
  const [visibleBlocks, setVisibleBlocks] = useState([])
  const [realtimeStats, setRealtimeStats] = useState(data.realtimeData)

  // Update realtime stats with animation trigger
  useEffect(() => {
    setRealtimeStats(data.realtimeData)
  }, [data.realtimeData])

  // Manage visible blocks for animation - Device-specific limits
  useEffect(() => {
    if (data.blocks.length > 0) {
      const blockLimit = (() => {
        switch (deviceType) {
          case 'iphone14pro': return 3
          case 'mobile': return 4
          case 'ipad': return 7
          case 'tablet': return 6
          default: return 8
        }
      })()
      setVisibleBlocks(data.blocks.slice(0, blockLimit))
    }
  }, [data.blocks, deviceType])

  // Responsive sizing based on device - Precise device targeting
  const getResponsiveStyles = () => {
    switch (deviceType) {
      case 'iphone14pro':
        return {
          blockSize: '35px',
          fontSize: '9px',
          padding: '6px',
          gap: '6px'
        }
      case 'mobile':
        return {
          blockSize: '40px',
          fontSize: '10px',
          padding: '8px',
          gap: '8px'
        }
      case 'ipad':
        return {
          blockSize: '70px',
          fontSize: '13px',
          padding: '14px',
          gap: '14px'
        }
      case 'tablet':
        return {
          blockSize: '60px',
          fontSize: '12px',
          padding: '12px',
          gap: '12px'
        }
      default:
        return {
          blockSize: '80px',
          fontSize: '14px',
          padding: '16px',
          gap: '16px'
        }
    }
  }

  const styles = getResponsiveStyles()

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: 'none' }}>
      
      {/* Real-time Stats Panel */}
      <motion.div
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '12px',
          padding: styles.padding,
          border: '1px solid rgba(0, 212, 255, 0.3)',
          fontSize: styles.fontSize,
          color: 'var(--color-light)',
          pointerEvents: 'auto',
          zIndex: 25
        }}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div style={{ marginBottom: '8px', fontWeight: 'bold', color: 'var(--color-primary)' }}>
          Live Stats
        </div>
        <div>Price: ${realtimeStats.price?.toLocaleString() || '0'}</div>
        <div>Gas: {realtimeStats.gasPrice || '0'} gwei</div>
        <div>Volume: ${(realtimeStats.volume / 1000000).toFixed(1) || '0'}M</div>
      </motion.div>

      {/* Network Status Indicator */}
      <motion.div
        style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: styles.gap,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(10px)',
          borderRadius: '8px',
          padding: styles.padding,
          border: '1px solid rgba(0, 212, 255, 0.3)',
          fontSize: styles.fontSize,
          color: 'var(--color-light)',
          pointerEvents: 'auto',
          zIndex: 25
        }}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isConnected ? 'var(--color-success)' : 'var(--color-error)'
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
        <span>Network: {isConnected ? 'Connected' : 'Disconnected'}</span>
      </motion.div>

      {/* Recent Blocks Visualization */}
      <motion.div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          gap: styles.gap,
          flexWrap: 'wrap',
          justifyContent: 'center',
                     maxWidth: deviceType === 'iphone14pro' ? '250px' : deviceType === 'mobile' ? '300px' : deviceType === 'ipad' ? '500px' : deviceType === 'tablet' ? '400px' : '600px',
          pointerEvents: 'auto'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <AnimatePresence mode="popLayout">
          {visibleBlocks.map((block, index) => (
            <motion.div
              key={block.hash || index}
              style={{
                width: styles.blockSize,
                height: styles.blockSize,
                background: `linear-gradient(135deg, 
                  rgba(0, 212, 255, 0.8), 
                  rgba(255, 107, 53, 0.6))`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: styles.fontSize,
                fontWeight: 'bold',
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              initial={{ 
                opacity: 0, 
                scale: 0.5, 
                rotateY: 90,
                x: -100 
              }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                rotateY: 0,
                x: 0 
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.3, 
                rotateY: -90,
                x: 100 
              }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              whileHover={{
                scale: 1.1,
                rotateY: 15,
                boxShadow: '0 10px 30px rgba(0, 212, 255, 0.4)'
              }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {/* Block number or height */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.8em', opacity: 0.8 }}>Block</div>
                <div>{block.number || block.height || index + 1}</div>
              </div>

              {/* Animated background effect */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                  pointerEvents: 'none'
                }}
                animate={{
                  left: ['100%', '-100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3
                }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Transaction Flow Visualization */}
      {data.transactions.length > 0 && (
        <motion.div
          style={{
            position: 'absolute',
            bottom: '100px',
            right: '20px',
                         width: deviceType === 'iphone14pro' ? '180px' : deviceType === 'mobile' ? '200px' : deviceType === 'ipad' ? '320px' : '300px',
             height: deviceType === 'iphone14pro' ? '70px' : deviceType === 'mobile' ? '80px' : deviceType === 'ipad' ? '130px' : '120px',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '12px',
            padding: styles.padding,
            border: '1px solid rgba(255, 107, 53, 0.3)',
            overflow: 'hidden',
            pointerEvents: 'auto'
          }}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div style={{ 
            fontSize: styles.fontSize, 
            fontWeight: 'bold', 
            color: 'var(--color-secondary)',
            marginBottom: '8px'
          }}>
            Recent Transactions
          </div>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '4px',
            fontSize: '10px',
            color: 'var(--color-light)'
          }}>
            {data.transactions.slice(0, 3).map((tx, index) => (
              <motion.div
                key={tx.hash || index}
                style={{
                  padding: '4px',
                  background: 'rgba(255, 107, 53, 0.1)',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <span>{`${(tx.hash || 'tx').substring(0, 8)}...`}</span>
                <span>{tx.value || '0.1'} ETH</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  )
}

export default BlockchainVisualizer 