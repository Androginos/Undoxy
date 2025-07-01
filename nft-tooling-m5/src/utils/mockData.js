// Mock blockchain data for testing
export const generateMockBlockchainData = () => {
  const mockBlocks = Array.from({ length: 10 }, (_, i) => ({
    number: 18500000 + i,
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    timestamp: Date.now() - (i * 15000), // 15 seconds per block
    size: Math.floor(Math.random() * 100000) + 50000,
    gasUsed: Math.floor(Math.random() * 30000000) + 10000000
  }))

  const mockTransactions = Array.from({ length: 20 }, (_, i) => ({
    hash: `0x${Math.random().toString(16).substr(2, 64)}`,
    from: `0x${Math.random().toString(16).substr(2, 40)}`,
    to: `0x${Math.random().toString(16).substr(2, 40)}`,
    value: (Math.random() * 10).toFixed(4),
    gasPrice: Math.floor(Math.random() * 100) + 20,
    timestamp: Date.now() - (i * 5000)
  }))

  return {
    blocks: mockBlocks,
    transactions: mockTransactions,
    networkStats: {
      hashRate: Math.floor(Math.random() * 500) + 200,
      difficulty: Math.floor(Math.random() * 50) + 30,
      blockTime: 12 + Math.random() * 6,
      mempool: Math.floor(Math.random() * 200000) + 50000
    },
    realtimeData: {
      price: Math.floor(Math.random() * 1000) + 2000,
      volume: Math.floor(Math.random() * 10000000000) + 5000000000,
      marketCap: Math.floor(Math.random() * 100000000000) + 200000000000,
      gasPrice: Math.floor(Math.random() * 50) + 20
    }
  }
}

// Simulate real-time updates
export const generateRandomUpdate = () => {
  const updateTypes = ['newBlock', 'newTransaction', 'priceUpdate', 'networkUpdate']
  const type = updateTypes[Math.floor(Math.random() * updateTypes.length)]
  
  switch (type) {
    case 'newBlock':
      return {
        type: 'newBlock',
        data: {
          number: 18500000 + Math.floor(Math.random() * 1000),
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: Date.now(),
          size: Math.floor(Math.random() * 100000) + 50000,
          gasUsed: Math.floor(Math.random() * 30000000) + 10000000
        }
      }
    
    case 'newTransaction':
      return {
        type: 'newTransaction', 
        data: {
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          from: `0x${Math.random().toString(16).substr(2, 40)}`,
          to: `0x${Math.random().toString(16).substr(2, 40)}`,
          value: (Math.random() * 10).toFixed(4),
          gasPrice: Math.floor(Math.random() * 100) + 20,
          timestamp: Date.now()
        }
      }
    
    case 'priceUpdate':
      return {
        type: 'priceUpdate',
        data: {
          realtimeData: {
            price: Math.floor(Math.random() * 1000) + 2000,
            volume: Math.floor(Math.random() * 10000000000) + 5000000000,
            gasPrice: Math.floor(Math.random() * 50) + 20
          }
        }
      }
    
    case 'networkUpdate':
      return {
        type: 'networkUpdate',
        data: {
          networkStats: {
            hashRate: Math.floor(Math.random() * 500) + 200,
            difficulty: Math.floor(Math.random() * 50) + 30,
            blockTime: 12 + Math.random() * 6,
            mempool: Math.floor(Math.random() * 200000) + 50000
          }
        }
      }
    
    default:
      return null
  }
} 