'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Calculator, Info } from 'lucide-react'

/**
 * Sample Size Calculator for A/B Tests
 * 
 * Uses standard statistical formula:
 * n = (Z_α/2 + Z_β)² * (p1(1-p1) + p2(1-p2)) / (p1-p2)²
 * 
 * Where:
 * - Z_α/2 = Z-score for significance level (default: 1.96 for 5% two-tailed)
 * - Z_β = Z-score for power (default: 0.84 for 80% power)
 * - p1 = baseline conversion rate
 * - p2 = expected conversion rate (p1 + minimum detectable effect)
 */
export function SampleSizeCalculator() {
  const [baselineRate, setBaselineRate] = useState<string>('50')
  const [minEffect, setMinEffect] = useState<string>('10')
  const [power, setPower] = useState<string>('80')
  const [significance, setSignificance] = useState<string>('5')
  
  // Z-scores for common significance levels (two-tailed)
  const zScores: Record<string, number> = {
    '1': 2.576,
    '5': 1.96,
    '10': 1.645,
  }
  
  // Z-scores for common power levels
  const powerZScores: Record<string, number> = {
    '70': 0.524,
    '80': 0.842,
    '90': 1.282,
    '95': 1.645,
  }
  
  const calculateSampleSize = () => {
    const baseline = parseFloat(baselineRate) / 100
    const effect = parseFloat(minEffect) / 100
    const powerValue = parseFloat(power)
    const sigValue = parseFloat(significance)
    
    if (baseline <= 0 || baseline >= 1 || effect <= 0 || effect >= 1) {
      return null
    }
    
    const expectedRate = baseline + effect
    if (expectedRate >= 1) {
      return null
    }
    
    const zAlpha = zScores[significance] || 1.96
    const zBeta = powerZScores[power] || 0.842
    
    // Standard A/B test sample size formula
    const numerator = Math.pow(zAlpha + zBeta, 2) * (baseline * (1 - baseline) + expectedRate * (1 - expectedRate))
    const denominator = Math.pow(effect, 2)
    
    const sampleSize = Math.ceil(numerator / denominator)
    
    return {
      perVariant: sampleSize,
      total: sampleSize * 2, // Assuming 2 variants (control + treatment)
      baseline,
      expectedRate,
      effect,
      power: powerValue,
      significance: sigValue,
    }
  }
  
  const result = calculateSampleSize()
  
  return (
    <Card className="mission-card">
      <CardHeader>
        <CardTitle className="text-indigo-400 font-mono text-lg flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Sample Size Calculator
        </CardTitle>
        <CardDescription className="text-gray-400">
          Calculate required sample size for A/B tests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="baseline" className="text-sm font-medium text-gray-300">
              Baseline Conversion Rate (%)
            </label>
            <Input
              id="baseline"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={baselineRate}
              onChange={(e) => setBaselineRate(e.target.value)}
              className="bg-[#1a1f2e] border-cyan-500/20 text-gray-200"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="effect" className="text-sm font-medium text-gray-300">
              Minimum Detectable Effect (%)
            </label>
            <Input
              id="effect"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={minEffect}
              onChange={(e) => setMinEffect(e.target.value)}
              className="bg-[#1a1f2e] border-cyan-500/20 text-gray-200"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="power" className="text-sm font-medium text-gray-300">
              Statistical Power (%)
            </label>
            <Input
              id="power"
              type="number"
              min="70"
              max="95"
              step="5"
              value={power}
              onChange={(e) => setPower(e.target.value)}
              className="bg-[#1a1f2e] border-cyan-500/20 text-gray-200"
            />
            <p className="text-xs text-gray-500">Default: 80%</p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="significance" className="text-sm font-medium text-gray-300">
              Significance Level (%)
            </label>
            <Input
              id="significance"
              type="number"
              min="1"
              max="10"
              step="1"
              value={significance}
              onChange={(e) => setSignificance(e.target.value)}
              className="bg-[#1a1f2e] border-cyan-500/20 text-gray-200"
            />
            <p className="text-xs text-gray-500">Default: 5% (two-tailed)</p>
          </div>
        </div>
        
        {result ? (
          <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-lg space-y-3">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold">
              <Info className="h-4 w-4" />
              <span>Required Sample Size</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Per Variant</p>
                <p className="text-2xl font-bold text-indigo-400 font-mono">
                  {result.perVariant.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Total (2 variants)</p>
                <p className="text-2xl font-bold text-indigo-400 font-mono">
                  {result.total.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="pt-3 border-t border-indigo-500/20 space-y-2 text-sm">
              <div className="flex justify-between text-gray-300">
                <span>Baseline Rate:</span>
                <span className="font-mono text-indigo-400">{(result.baseline * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Expected Rate:</span>
                <span className="font-mono text-indigo-400">{(result.expectedRate * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Effect Size:</span>
                <span className="font-mono text-indigo-400">+{(result.effect * 100).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Power:</span>
                <span className="font-mono text-indigo-400">{result.power}%</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Significance:</span>
                <span className="font-mono text-indigo-400">{result.significance}%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              Please enter valid values. Baseline and effect must be between 0-100%, and expected rate must be less than 100%.
            </p>
          </div>
        )}
        
        <div className="pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Formula: n = (Z_α/2 + Z_β)² × (p1(1-p1) + p2(1-p2)) / (p1-p2)²
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This calculates the minimum sample size needed per variant to detect the specified effect with the given power and significance level.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

