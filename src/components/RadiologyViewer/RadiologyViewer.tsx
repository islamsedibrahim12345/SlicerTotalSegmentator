import React, { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs'
import { DicomViewer } from './DicomViewer'
import { SegmentationPanel } from './SegmentationPanel'
import { HealthMetricsPanel } from './HealthMetricsPanel'
import { StudyBrowser } from './StudyBrowser'
import { DicomImage, SegmentationResult, HealthMetrics } from '../../types/medical'
import { generateId } from '../../lib/utils'

// Mock data for demonstration
const mockStudies: DicomImage[] = [
  {
    id: '1',
    patientId: 'P001',
    studyId: 'S001',
    seriesId: 'SE001',
    instanceId: 'I001',
    modality: 'CT',
    bodyPart: 'Chest',
    studyDate: '2024-01-15T10:30:00Z',
    patientName: 'John Doe',
    patientAge: 45,
    patientSex: 'M',
    imageUrl: '/api/dicom/1',
    thumbnailUrl: '/api/dicom/1/thumbnail',
    metadata: {
      rows: 512,
      columns: 512,
      pixelSpacing: [0.7, 0.7],
      sliceThickness: 1.25,
      windowCenter: 40,
      windowWidth: 400,
      rescaleIntercept: -1024,
      rescaleSlope: 1
    }
  },
  {
    id: '2',
    patientId: 'P002',
    studyId: 'S002',
    seriesId: 'SE002',
    instanceId: 'I002',
    modality: 'CT',
    bodyPart: 'Abdomen',
    studyDate: '2024-01-14T14:20:00Z',
    patientName: 'Jane Smith',
    patientAge: 38,
    patientSex: 'F',
    imageUrl: '/api/dicom/2',
    thumbnailUrl: '/api/dicom/2/thumbnail',
    metadata: {
      rows: 512,
      columns: 512,
      pixelSpacing: [0.8, 0.8],
      sliceThickness: 2.0,
      windowCenter: 50,
      windowWidth: 350,
      rescaleIntercept: -1024,
      rescaleSlope: 1
    }
  }
]

const mockSegmentation: SegmentationResult = {
  id: 'seg001',
  imageId: '1',
  patientId: 'P001',
  familyId: 'F001',
  timestamp: '2024-01-15T11:00:00Z',
  status: 'completed',
  segments: [
    {
      id: 'heart',
      name: 'heart_myocardium',
      anatomicalStructure: 'Heart Myocardium',
      volume: 650.5,
      color: [192, 104, 88],
      opacity: 0.7,
      visible: true
    },
    {
      id: 'lung_left',
      name: 'lung_upper_lobe_left',
      anatomicalStructure: 'Left Upper Lung Lobe',
      volume: 1850.2,
      color: [112, 162, 95],
      opacity: 0.7,
      visible: true
    },
    {
      id: 'lung_right',
      name: 'lung_upper_lobe_right',
      anatomicalStructure: 'Right Upper Lung Lobe',
      volume: 1920.8,
      color: [173, 69, 44],
      opacity: 0.7,
      visible: true
    },
    {
      id: 'liver',
      name: 'liver',
      anatomicalStructure: 'Liver',
      volume: 1450.3,
      color: [221, 130, 101],
      opacity: 0.7,
      visible: true
    },
    {
      id: 'spleen',
      name: 'spleen',
      anatomicalStructure: 'Spleen',
      volume: 180.7,
      color: [157, 108, 162],
      opacity: 0.7,
      visible: true
    }
  ],
  metrics: {
    organVolumes: {
      heart: 650.5,
      lung_left: 1850.2,
      lung_right: 1920.8,
      liver: 1450.3,
      spleen: 180.7
    },
    abnormalFindings: [
      {
        organ: 'lung_left',
        finding: 'Small nodule detected',
        severity: 'medium',
        confidence: 0.85,
        description: 'A 6mm nodule was detected in the left upper lobe. Recommend follow-up imaging in 6 months.'
      }
    ],
    riskFactors: [
      {
        condition: 'Lung Cancer',
        risk: 'medium',
        factors: ['Age > 40', 'Smoking history', 'Nodule detected'],
        familyHistory: false
      }
    ],
    recommendations: [
      'Follow-up CT scan in 6 months to monitor nodule progression',
      'Consider smoking cessation counseling if applicable',
      'Regular cardiovascular health monitoring recommended'
    ]
  }
}

export const RadiologyViewer: React.FC = () => {
  const [selectedStudy, setSelectedStudy] = useState<DicomImage | null>(null)
  const [currentImage, setCurrentImage] = useState<DicomImage | null>(null)
  const [segmentation, setSegmentation] = useState<SegmentationResult | null>(null)
  const [segmentationVisible, setSegmentationVisible] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState('viewer')

  useEffect(() => {
    // Auto-select first study for demo
    if (mockStudies.length > 0 && !selectedStudy) {
      setSelectedStudy(mockStudies[0])
    }
  }, [])

  const handleStudyLoad = (study: DicomImage) => {
    setCurrentImage(study)
    // Load segmentation if available
    if (study.id === '1') {
      setSegmentation(mockSegmentation)
    } else {
      setSegmentation(null)
    }
  }

  const handleRunSegmentation = async () => {
    if (!currentImage) return
    
    setIsProcessing(true)
    
    // Simulate TotalSegmentator processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Generate mock segmentation result
      const newSegmentation: SegmentationResult = {
        ...mockSegmentation,
        id: generateId(),
        imageId: currentImage.id,
        timestamp: new Date().toISOString(),
        status: 'completed'
      }
      
      setSegmentation(newSegmentation)
    } catch (error) {
      console.error('Segmentation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSegmentVisibilityChange = (segmentId: string, visible: boolean) => {
    if (!segmentation) return
    
    setSegmentation(prev => ({
      ...prev!,
      segments: prev!.segments.map(segment =>
        segment.id === segmentId ? { ...segment, visible } : segment
      )
    }))
  }

  const handleSegmentOpacityChange = (segmentId: string, opacity: number) => {
    if (!segmentation) return
    
    setSegmentation(prev => ({
      ...prev!,
      segments: prev!.segments.map(segment =>
        segment.id === segmentId ? { ...segment, opacity } : segment
      )
    }))
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Study Browser Sidebar */}
      <div className="w-80 border-r bg-white">
        <StudyBrowser
          studies={mockStudies}
          selectedStudy={selectedStudy}
          onStudySelect={setSelectedStudy}
          onStudyLoad={handleStudyLoad}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentImage ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="border-b bg-white px-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="viewer">DICOM Viewer</TabsTrigger>
                <TabsTrigger value="segmentation">Segmentation</TabsTrigger>
                <TabsTrigger value="analysis">Health Analysis</TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-4">
              <TabsContent value="viewer" className="h-full">
                <DicomViewer
                  image={currentImage}
                  segmentationVisible={segmentationVisible}
                  onSegmentationToggle={() => setSegmentationVisible(!segmentationVisible)}
                  className="h-full"
                />
              </TabsContent>

              <TabsContent value="segmentation" className="h-full">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <div className="col-span-2">
                    <DicomViewer
                      image={currentImage}
                      segmentationVisible={segmentationVisible}
                      onSegmentationToggle={() => setSegmentationVisible(!segmentationVisible)}
                      className="h-full"
                    />
                  </div>
                  <div>
                    <SegmentationPanel
                      segmentation={segmentation}
                      onSegmentVisibilityChange={handleSegmentVisibilityChange}
                      onSegmentOpacityChange={handleSegmentOpacityChange}
                      onRunSegmentation={handleRunSegmentation}
                      isProcessing={isProcessing}
                      className="h-full"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="h-full">
                <div className="grid grid-cols-3 gap-4 h-full">
                  <div className="col-span-2">
                    <DicomViewer
                      image={currentImage}
                      segmentationVisible={segmentationVisible}
                      onSegmentationToggle={() => setSegmentationVisible(!segmentationVisible)}
                      className="h-full"
                    />
                  </div>
                  <div>
                    <HealthMetricsPanel
                      metrics={segmentation?.metrics || null}
                      patientAge={currentImage.patientAge}
                      patientSex={currentImage.patientSex}
                      className="h-full"
                    />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🏥</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Radiology Viewer</h2>
              <p className="text-gray-600 mb-4">
                Select a study from the browser to begin viewing and analysis
              </p>
              <p className="text-sm text-gray-500">
                Powered by TotalSegmentator AI for comprehensive anatomical segmentation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}