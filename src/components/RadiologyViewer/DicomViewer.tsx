import React, { useRef, useEffect, useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Slider } from '../ui/Slider'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Move, 
  Ruler, 
  Eye, 
  EyeOff,
  Settings,
  Download,
  Share
} from 'lucide-react'
import { DicomImage, ViewerSettings, Annotation } from '../../types/medical'
import { cn } from '../../lib/utils'

interface DicomViewerProps {
  image: DicomImage
  segmentationVisible?: boolean
  onSegmentationToggle?: () => void
  className?: string
}

export const DicomViewer: React.FC<DicomViewerProps> = ({
  image,
  segmentationVisible = false,
  onSegmentationToggle,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [settings, setSettings] = useState<ViewerSettings>({
    windowLevel: image.metadata.windowCenter,
    windowWidth: image.metadata.windowWidth,
    zoom: 1,
    pan: [0, 0],
    rotation: 0,
    invertColors: false,
    showAnnotations: true,
    showMeasurements: true
  })
  
  const [tool, setTool] = useState<'pan' | 'zoom' | 'measure' | 'annotate'>('pan')
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeViewer()
  }, [image])

  const initializeViewer = async () => {
    setIsLoading(true)
    try {
      // Initialize DICOM viewer with cornerstone
      const canvas = canvasRef.current
      if (!canvas) return

      // Simulate loading DICOM image
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Render the image
      renderImage()
      setIsLoading(false)
    } catch (error) {
      console.error('Failed to initialize viewer:', error)
      setIsLoading(false)
    }
  }

  const renderImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(settings.zoom, settings.zoom)
    ctx.rotate((settings.rotation * Math.PI) / 180)
    ctx.translate(settings.pan[0], settings.pan[1])

    // Simulate DICOM image rendering
    ctx.fillStyle = settings.invertColors ? '#ffffff' : '#000000'
    ctx.fillRect(-200, -200, 400, 400)
    
    // Draw simulated anatomical structures
    drawAnatomicalStructures(ctx)
    
    ctx.restore()

    // Draw annotations
    if (settings.showAnnotations) {
      drawAnnotations(ctx)
    }
  }

  const drawAnatomicalStructures = (ctx: CanvasRenderingContext2D) => {
    // Simulate CT scan appearance
    const gradient = ctx.createRadialGradient(0, 0, 50, 0, 0, 150)
    gradient.addColorStop(0, settings.invertColors ? '#333333' : '#cccccc')
    gradient.addColorStop(0.5, settings.invertColors ? '#666666' : '#999999')
    gradient.addColorStop(1, settings.invertColors ? '#999999' : '#666666')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, 150, 0, 2 * Math.PI)
    ctx.fill()

    // Draw organs (simplified representation)
    ctx.fillStyle = settings.invertColors ? '#444444' : '#bbbbbb'
    ctx.beginPath()
    ctx.ellipse(-30, -20, 40, 30, 0, 0, 2 * Math.PI)
    ctx.fill()

    ctx.beginPath()
    ctx.ellipse(30, -20, 40, 30, 0, 0, 2 * Math.PI)
    ctx.fill()
  }

  const drawAnnotations = (ctx: CanvasRenderingContext2D) => {
    annotations.forEach(annotation => {
      if (!annotation.visible) return

      ctx.strokeStyle = annotation.color
      ctx.fillStyle = annotation.color
      ctx.lineWidth = 2

      switch (annotation.type) {
        case 'circle':
          ctx.beginPath()
          ctx.arc(annotation.coordinates[0], annotation.coordinates[1], 20, 0, 2 * Math.PI)
          ctx.stroke()
          break
        case 'rectangle':
          ctx.strokeRect(
            annotation.coordinates[0],
            annotation.coordinates[1],
            annotation.coordinates[2],
            annotation.coordinates[3]
          )
          break
        case 'text':
          ctx.font = '14px Arial'
          ctx.fillText(
            annotation.text || '',
            annotation.coordinates[0],
            annotation.coordinates[1]
          )
          break
      }
    })
  }

  const handleZoomIn = () => {
    setSettings(prev => ({ ...prev, zoom: Math.min(prev.zoom * 1.2, 5) }))
  }

  const handleZoomOut = () => {
    setSettings(prev => ({ ...prev, zoom: Math.max(prev.zoom / 1.2, 0.1) }))
  }

  const handleRotate = () => {
    setSettings(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }))
  }

  const handleReset = () => {
    setSettings({
      windowLevel: image.metadata.windowCenter,
      windowWidth: image.metadata.windowWidth,
      zoom: 1,
      pan: [0, 0],
      rotation: 0,
      invertColors: false,
      showAnnotations: true,
      showMeasurements: true
    })
  }

  const handleWindowLevelChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, windowLevel: value[0] }))
  }

  const handleWindowWidthChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, windowWidth: value[0] }))
  }

  useEffect(() => {
    renderImage()
  }, [settings, annotations])

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant={tool === 'pan' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('pan')}
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRotate}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'measure' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTool('measure')}
          >
            <Ruler className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {onSegmentationToggle && (
            <Button
              variant={segmentationVisible ? 'default' : 'outline'}
              size="sm"
              onClick={onSegmentationToggle}
            >
              {segmentationVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Segmentation
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Viewer */}
      <div className="flex-1 relative bg-black">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white">Loading DICOM image...</div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-full object-contain cursor-crosshair"
          />
        )}

        {/* Image Info Overlay */}
        <div className="absolute top-4 left-4 text-white text-sm space-y-1">
          <div>{image.patientName}</div>
          <div>{image.modality} - {image.bodyPart}</div>
          <div>{image.studyDate}</div>
          <div>Zoom: {(settings.zoom * 100).toFixed(0)}%</div>
        </div>

        {/* Window Level Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/50 p-4 rounded">
          <div className="grid grid-cols-2 gap-4 text-white text-sm">
            <div>
              <label className="block mb-2">Window Level: {settings.windowLevel}</label>
              <Slider
                value={[settings.windowLevel]}
                onValueChange={handleWindowLevelChange}
                min={-1000}
                max={1000}
                step={1}
                className="w-full"
              />
            </div>
            <div>
              <label className="block mb-2">Window Width: {settings.windowWidth}</label>
              <Slider
                value={[settings.windowWidth]}
                onValueChange={handleWindowWidthChange}
                min={1}
                max={4000}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t text-sm text-gray-600">
        <div>
          {image.metadata.rows} x {image.metadata.columns} | 
          {image.metadata.pixelSpacing[0].toFixed(2)}mm
        </div>
        <div>
          Slice: {image.metadata.sliceThickness}mm
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </Card>
  )
}