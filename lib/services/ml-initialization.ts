'use server'

import { MLCreditScoringModel } from '../models/ml-credit-model'
import { generateTrainingDataset, getDatasetStats, getDatasetBreakdown } from '../data/training-dataset'

let isInitialized = false

/**
 * Initialize ML model with pre-defined training data
 * This runs automatically on first use
 */
export async function initializeMLModel() {
  if (isInitialized) {
    console.log('[ML Init] Model already initialized')
    return { success: true, message: 'Model already initialized' }
  }

  console.log('[ML Init] Starting ML model initialization...')

  try {
    // Generate training dataset
    const trainingData = generateTrainingDataset()
    console.log('[ML Init] Generated', trainingData.length, 'training samples')

    // Train the model
    await MLCreditScoringModel.trainFromHistory(trainingData)

    // Get final stats
    const stats = MLCreditScoringModel.getModelStats()
    const datasetStats = getDatasetStats()
    const breakdown = getDatasetBreakdown()

    isInitialized = true

    console.log('[ML Init] ✅ Model initialization complete!')
    console.log('[ML Init] Training samples:', stats.training_samples)
    console.log('[ML Init] Learned weights:', stats.weights)
    console.log('[ML Init] Dataset stats:', datasetStats)

    return {
      success: true,
      message: 'ML model initialized successfully',
      stats: {
        training_samples: stats.training_samples,
        learned_weights: stats.weights,
        model_version: stats.model_version,
        confidence: Math.min(stats.training_samples / 1000, 1.0) * 100
      },
      dataset: {
        stats: datasetStats,
        breakdown: breakdown
      }
    }

  } catch (error) {
    console.error('[ML Init] Error initializing model:', error)
    return { 
      success: false, 
      error: 'Failed to initialize ML model' 
    }
  }
}

/**
 * Check if ML model is initialized
 */
export async function isMLModelInitialized(): Promise<boolean> {
  return isInitialized
}

/**
 * Get initialization status
 */
export async function getMLInitStatus() {
  const stats = MLCreditScoringModel.getModelStats()
  
  return {
    initialized: isInitialized,
    training_samples: stats.training_samples,
    ready: stats.training_samples >= 10,
    confidence: Math.min(stats.training_samples / 1000, 1.0) * 100
  }
}

/**
 * Force re-initialization (for testing)
 */
export async function reinitializeMLModel() {
  console.log('[ML Init] Force re-initializing model...')
  
  // Reset model
  MLCreditScoringModel.resetModel()
  isInitialized = false
  
  // Re-initialize
  return await initializeMLModel()
}
