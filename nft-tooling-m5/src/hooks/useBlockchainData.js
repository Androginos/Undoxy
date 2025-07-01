import { useState, useCallback } from 'react'

export const useBlockchainData = () => {
  const [blockchainData, setBlockchainData] = useState({
    blocks: [],
    transactions: [],
    networkStats: {
      hashRate: 0,
      difficulty: 0,
      blockTime: 0,
      mempool: 0
    },
    realtimeData: {
      price: 0,
      volume: 0,
      marketCap: 0,
      gasPrice: 0
    }
  })

  const updateData = useCallback((newData) => {
    setBlockchainData(prevData => ({
      ...prevData,
      ...newData,
      // Merge arrays if they exist
      blocks: newData.blocks ? [...(newData.blocks || [])] : prevData.blocks,
      transactions: newData.transactions ? [...(newData.transactions || [])] : prevData.transactions,
      // Deep merge objects
      networkStats: { ...prevData.networkStats, ...(newData.networkStats || {}) },
      realtimeData: { ...prevData.realtimeData, ...(newData.realtimeData || {}) }
    }))
  }, [])

  const addBlock = useCallback((block) => {
    setBlockchainData(prevData => ({
      ...prevData,
      blocks: [block, ...prevData.blocks.slice(0, 9)] // Keep last 10 blocks
    }))
  }, [])

  const addTransaction = useCallback((transaction) => {
    setBlockchainData(prevData => ({
      ...prevData,
      transactions: [transaction, ...prevData.transactions.slice(0, 49)] // Keep last 50 transactions
    }))
  }, [])

  return {
    blockchainData,
    updateData,
    addBlock,
    addTransaction
  }
} 