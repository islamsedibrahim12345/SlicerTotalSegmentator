import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card'
import { Button } from '../ui/Button'
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileImage, 
  Clock,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react'
import { DicomImage } from '../../types/medical'
import { cn, formatDate } from '../../lib/utils'

interface StudyBrowserProps {
  studies: DicomImage[]
  selectedStudy: DicomImage | null
  onStudySelect: (study: DicomImage) => void
  onStudyLoad: (study: DicomImage) => void
  className?: string
}

export const StudyBrowser: React.FC<StudyBrowserProps> = ({
  studies,
  selectedStudy,
  onStudySelect,
  onStudyLoad,
  className
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterModality, setFilterModality] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'modality'>('date')

  const filteredStudies = studies
    .filter(study => {
      const matchesSearch = study.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           study.studyId.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesModality = filterModality === 'all' || study.modality === filterModality
      return matchesSearch && matchesModality
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime()
        case 'name':
          return a.patientName.localeCompare(b.patientName)
        case 'modality':
          return a.modality.localeCompare(b.modality)
        default:
          return 0
      }
    })

  const modalities = Array.from(new Set(studies.map(s => s.modality)))

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'CT': return '🔍'
      case 'MR': return '🧲'
      case 'XR': return '📷'
      case 'US': return '🔊'
      default: return '📋'
    }
  }

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case 'CT': return 'bg-blue-100 text-blue-800'
      case 'MR': return 'bg-purple-100 text-purple-800'
      case 'XR': return 'bg-green-100 text-green-800'
      case 'US': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Study Browser</span>
          <span className="text-sm font-normal text-gray-600">
            {filteredStudies.length} studies
          </span>
        </CardTitle>
        
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search patients or studies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={filterModality}
              onChange={(e) => setFilterModality(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Modalities</option>
              {modalities.map(modality => (
                <option key={modality} value={modality}>{modality}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'name' | 'modality')}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="modality">Sort by Modality</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="space-y-1">
          {filteredStudies.map(study => (
            <div
              key={study.id}
              className={cn(
                'p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors',
                selectedStudy?.id === study.id && 'bg-blue-50 border-blue-200'
              )}
              onClick={() => onStudySelect(study)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  {/* Patient Info */}
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium truncate">{study.patientName}</span>
                    <span className="text-sm text-gray-500">
                      {study.patientAge}y, {study.patientSex}
                    </span>
                  </div>
                  
                  {/* Study Info */}
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(study.studyDate)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileImage className="w-3 h-3" />
                      <span>{study.bodyPart}</span>
                    </div>
                  </div>
                  
                  {/* Modality Badge */}
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getModalityColor(study.modality)
                    )}>
                      <span className="mr-1">{getModalityIcon(study.modality)}</span>
                      {study.modality}
                    </span>
                    <span className="text-xs text-gray-500">
                      {study.metadata.rows}×{study.metadata.columns}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onStudyLoad(study)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              {/* Study Details */}
              {selectedStudy?.id === study.id && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Study ID:</span> {study.studyId}
                    </div>
                    <div>
                      <span className="font-medium">Series ID:</span> {study.seriesId}
                    </div>
                    <div>
                      <span className="font-medium">Pixel Spacing:</span> {study.metadata.pixelSpacing.join('×')}mm
                    </div>
                    <div>
                      <span className="font-medium">Slice Thickness:</span> {study.metadata.sliceThickness}mm
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3">
                    <Button
                      size="sm"
                      onClick={() => onStudyLoad(study)}
                      className="flex-1 mr-2"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Load Study
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {filteredStudies.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileImage className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Studies Found</h3>
              <p className="text-gray-600">
                {searchTerm || filterModality !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No DICOM studies available'
                }
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}