import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import { 
  Eye, 
  EyeOff, 
  Palette, 
  Download, 
  Play,
  Pause,
  RotateCcw,
  Volume2
} from 'lucide-react'
import { Segment, SegmentationResult } from '../../types/medical'
import { cn } from '../../lib/utils'

interface SegmentationPanelProps {
  segmentation: SegmentationResult | null
  onSegmentVisibilityChange: (segmentId: string, visible: boolean) => void
  onSegmentOpacityChange: (segmentId: string, opacity: number) => void
  onRunSegmentation: () => void
  isProcessing?: boolean
  className?: string
}

export const SegmentationPanel: React.FC<SegmentationPanelProps> = ({
  segmentation,
  onSegmentVisibilityChange,
  onSegmentOpacityChange,
  onRunSegmentation,
  isProcessing = false,
  className
}) => {
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [globalOpacity, setGlobalOpacity] = useState(0.7)

  const handleGlobalOpacityChange = (value: number[]) => {
    const opacity = value[0]
    setGlobalOpacity(opacity)
    
    // Apply to all visible segments
    segmentation?.segments.forEach(segment => {
      if (segment.visible) {
        onSegmentOpacityChange(segment.id, opacity)
      }
    })
  }

  const toggleAllSegments = () => {
    if (!segmentation) return
    
    const allVisible = segmentation.segments.every(s => s.visible)
    segmentation.segments.forEach(segment => {
      onSegmentVisibilityChange(segment.id, !allVisible)
    })
  }

  const getSegmentColor = (segment: Segment) => {
    return `rgb(${segment.color[0]}, ${segment.color[1]}, ${segment.color[2]})`
  }

  const organCategories = {
    'Cardiovascular': ['heart', 'aorta', 'pulmonary', 'vena_cava'],
    'Respiratory': ['lung', 'trachea', 'bronchi'],
    'Digestive': ['liver', 'stomach', 'pancreas', 'gallbladder', 'colon', 'small_bowel'],
    'Urinary': ['kidney', 'urinary_bladder'],
    'Musculoskeletal': ['vertebrae', 'rib', 'sternum', 'femur', 'humerus'],
    'Nervous': ['brain', 'spinal_cord'],
    'Other': []
  }

  const categorizeSegments = (segments: Segment[]) => {
    const categorized: Record<string, Segment[]> = {}
    
    Object.keys(organCategories).forEach(category => {
      categorized[category] = []
    })

    segments.forEach(segment => {
      let assigned = false
      
      Object.entries(organCategories).forEach(([category, keywords]) => {
        if (keywords.some(keyword => segment.name.toLowerCase().includes(keyword))) {
          categorized[category].push(segment)
          assigned = true
        }
      })
      
      if (!assigned) {
        categorized['Other'].push(segment)
      }
    })

    return categorized
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Segmentation</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRunSegmentation}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Run TotalSegmentator
                </>
              )}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {!segmentation ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Volume2 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Segmentation Available</h3>
            <p className="text-gray-600 mb-4">
              Run TotalSegmentator to generate 3D segmentation of anatomical structures
            </p>
            <Button onClick={onRunSegmentation} disabled={isProcessing}>
              <Play className="w-4 h-4 mr-2" />
              Start Segmentation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Global Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Global Controls</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllSegments}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Toggle All
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2">
                  Global Opacity: {(globalOpacity * 100).toFixed(0)}%
                </label>
                <Slider
                  value={[globalOpacity]}
                  onValueChange={handleGlobalOpacityChange}
                  min={0}
                  max={1}
                  step={0.01}
                />
              </div>
            </div>

            {/* Segmentation Status */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Status: {segmentation.status}</span>
                <span>{segmentation.segments.length} segments</span>
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Generated: {new Date(segmentation.timestamp).toLocaleString()}
              </div>
            </div>

            {/* Segments by Category */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {Object.entries(categorizeSegments(segmentation.segments)).map(([category, segments]) => {
                if (segments.length === 0) return null
                
                return (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 border-b pb-1">
                      {category} ({segments.length})
                    </h4>
                    
                    <div className="space-y-1">
                      {segments.map(segment => (
                        <div
                          key={segment.id}
                          className={cn(
                            'flex items-center space-x-2 p-2 rounded hover:bg-gray-50 cursor-pointer',
                            selectedSegment === segment.id && 'bg-blue-50 border border-blue-200'
                          )}
                          onClick={() => setSelectedSegment(segment.id)}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation()
                              onSegmentVisibilityChange(segment.id, !segment.visible)
                            }}
                          >
                            {segment.visible ? (
                              <Eye className="w-3 h-3" />
                            ) : (
                              <EyeOff className="w-3 h-3" />
                            )}
                          </Button>
                          
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: getSegmentColor(segment) }}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {segment.anatomicalStructure}
                            </div>
                            <div className="text-xs text-gray-500">
                              {segment.volume.toFixed(1)} cm³
                            </div>
                          </div>
                          
                          <div className="w-16">
                            <Slider
                              value={[segment.opacity]}
                              onValueChange={(value) => onSegmentOpacityChange(segment.id, value[0])}
                              min={0}
                              max={1}
                              step={0.01}
                              className="w-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}