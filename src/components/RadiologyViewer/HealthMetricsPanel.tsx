import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Heart, Sun as Lung, Brain, Activity, AlertTriangle, TrendingUp, TrendingDown, Minus, Info, Download, Share } from 'lucide-react'
import { HealthMetrics, AbnormalFinding, RiskFactor } from '../../types/medical'
import { cn } from '../../lib/utils'

interface HealthMetricsPanelProps {
  metrics: HealthMetrics | null
  patientAge: number
  patientSex: 'M' | 'F' | 'O'
  className?: string
}

export const HealthMetricsPanel: React.FC<HealthMetricsPanelProps> = ({
  metrics,
  patientAge,
  patientSex,
  className
}) => {
  if (!metrics) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle>Health Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Activity className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Metrics Available</h3>
            <p className="text-gray-600">
              Run segmentation to generate health metrics and analysis
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
    }
  }

  const getSeverityIcon = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'low': return <TrendingDown className="w-4 h-4" />
      case 'medium': return <Minus className="w-4 h-4" />
      case 'high': return <TrendingUp className="w-4 h-4" />
    }
  }

  const getRiskIcon = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return <Heart className="w-4 h-4 text-green-600" />
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'high': return <AlertTriangle className="w-4 h-4 text-red-600" />
    }
  }

  const organIcons: Record<string, React.ReactNode> = {
    heart: <Heart className="w-4 h-4" />,
    lung: <Lung className="w-4 h-4" />,
    brain: <Brain className="w-4 h-4" />,
    liver: <Activity className="w-4 h-4" />,
    kidney: <Activity className="w-4 h-4" />
  }

  const getNormalRange = (organ: string, age: number, sex: string) => {
    // Simplified normal ranges - in real implementation, use medical references
    const ranges: Record<string, { min: number, max: number }> = {
      heart: { min: 500, max: 900 },
      liver: { min: 1200, max: 1800 },
      spleen: { min: 150, max: 300 },
      kidney_left: { min: 120, max: 200 },
      kidney_right: { min: 120, max: 200 },
      lung_left: { min: 1500, max: 2500 },
      lung_right: { min: 1500, max: 2500 }
    }
    
    return ranges[organ] || { min: 0, max: 1000 }
  }

  const isVolumeNormal = (organ: string, volume: number) => {
    const range = getNormalRange(organ, patientAge, patientSex)
    return volume >= range.min && volume <= range.max
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Health Analysis</span>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-6">
        {/* Organ Volumes */}
        <div>
          <h3 className="font-medium mb-3 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Organ Volumes
          </h3>
          <div className="space-y-2">
            {Object.entries(metrics.organVolumes).map(([organ, volume]) => {
              const isNormal = isVolumeNormal(organ, volume)
              const organName = organ.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              
              return (
                <div
                  key={organ}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    isNormal ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                  )}
                >
                  <div className="flex items-center space-x-2">
                    {organIcons[organ.split('_')[0]] || <Activity className="w-4 h-4" />}
                    <span className="font-medium">{organName}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{volume.toFixed(1)} cm³</div>
                    <div className={cn(
                      'text-xs',
                      isNormal ? 'text-green-600' : 'text-yellow-600'
                    )}>
                      {isNormal ? 'Normal' : 'Abnormal'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Abnormal Findings */}
        {metrics.abnormalFindings.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-yellow-600" />
              Findings ({metrics.abnormalFindings.length})
            </h3>
            <div className="space-y-2">
              {metrics.abnormalFindings.map((finding, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-3 rounded-lg border',
                    getSeverityColor(finding.severity)
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        {getSeverityIcon(finding.severity)}
                        <span className="font-medium">{finding.organ}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                          {finding.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-sm font-medium mb-1">{finding.finding}</div>
                      <div className="text-sm">{finding.description}</div>
                    </div>
                    <div className="text-xs text-gray-600 ml-2">
                      {(finding.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {metrics.riskFactors.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-red-600" />
              Risk Assessment
            </h3>
            <div className="space-y-2">
              {metrics.riskFactors.map((risk, index) => (
                <div key={index} className="p-3 rounded-lg border bg-gray-50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getRiskIcon(risk.risk)}
                      <span className="font-medium">{risk.condition}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {risk.familyHistory && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                          Family History
                        </span>
                      )}
                      <span className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        risk.risk === 'low' ? 'bg-green-100 text-green-700' :
                        risk.risk === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      )}>
                        {risk.risk.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Factors:</strong> {risk.factors.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {metrics.recommendations.length > 0 && (
          <div>
            <h3 className="font-medium mb-3 flex items-center">
              <Info className="w-4 h-4 mr-2 text-blue-600" />
              Recommendations
            </h3>
            <div className="space-y-2">
              {metrics.recommendations.map((recommendation, index) => (
                <div key={index} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="text-sm">{recommendation}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {metrics.abnormalFindings.filter(f => f.severity === 'low').length}
            </div>
            <div className="text-sm text-gray-600">Low Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {metrics.abnormalFindings.filter(f => f.severity === 'high').length}
            </div>
            <div className="text-sm text-gray-600">High Risk</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}