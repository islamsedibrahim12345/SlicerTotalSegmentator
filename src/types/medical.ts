export interface DicomImage {
  id: string;
  patientId: string;
  studyId: string;
  seriesId: string;
  instanceId: string;
  modality: string;
  bodyPart: string;
  studyDate: string;
  patientName: string;
  patientAge: number;
  patientSex: 'M' | 'F' | 'O';
  imageUrl: string;
  thumbnailUrl: string;
  metadata: DicomMetadata;
}

export interface DicomMetadata {
  rows: number;
  columns: number;
  pixelSpacing: [number, number];
  sliceThickness: number;
  windowCenter: number;
  windowWidth: number;
  rescaleIntercept: number;
  rescaleSlope: number;
}

export interface SegmentationResult {
  id: string;
  imageId: string;
  patientId: string;
  familyId: string;
  timestamp: string;
  segments: Segment[];
  metrics: HealthMetrics;
  status: 'processing' | 'completed' | 'failed';
}

export interface Segment {
  id: string;
  name: string;
  anatomicalStructure: string;
  volume: number;
  color: [number, number, number];
  opacity: number;
  visible: boolean;
  mesh?: ArrayBuffer;
}

export interface HealthMetrics {
  organVolumes: Record<string, number>;
  abnormalFindings: AbnormalFinding[];
  riskFactors: RiskFactor[];
  recommendations: string[];
}

export interface AbnormalFinding {
  organ: string;
  finding: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  description: string;
}

export interface RiskFactor {
  condition: string;
  risk: 'low' | 'medium' | 'high';
  factors: string[];
  familyHistory: boolean;
}

export interface ViewerSettings {
  windowLevel: number;
  windowWidth: number;
  zoom: number;
  pan: [number, number];
  rotation: number;
  invertColors: boolean;
  showAnnotations: boolean;
  showMeasurements: boolean;
}

export interface Annotation {
  id: string;
  type: 'arrow' | 'circle' | 'rectangle' | 'text' | 'measurement';
  coordinates: number[];
  text?: string;
  color: string;
  visible: boolean;
}