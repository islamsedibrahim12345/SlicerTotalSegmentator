import os
import json
import requests
from pathlib import Path
import slicer
from datetime import datetime

class TotalSegmentatorCloud:
    def __init__(self):
        self.api_base_url = "https://marvelous-medovik-cc3fec.netlify.app/api"
        
    def upload_segmentation_result(self, segmentation_node, patient_id, family_id):
        """Upload segmentation results to cloud platform"""
        if not segmentation_node:
            raise ValueError("No segmentation node provided")
            
        # Export segmentation to NRRD format
        export_path = str(Path(slicer.app.temporaryPath) / "temp_export.nrrd")
        slicer.util.saveNode(segmentation_node, export_path)
        
        try:
            with open(export_path, 'rb') as f:
                files = {'segmentation': f}
                data = {
                    'patientId': patient_id,
                    'familyId': family_id,
                    'timestamp': str(datetime.now()),
                    'metadata': {
                        'software': 'SlicerTotalSegmentator',
                        'version': slicer.app.applicationVersion
                    }
                }
                
                response = requests.post(
                    f"{self.api_base_url}/segmentation/upload",
                    files=files,
                    data=data
                )
                response.raise_for_status()
                
            return response.json()
            
        except Exception as e:
            slicer.util.errorDisplay(f"Failed to upload segmentation: {str(e)}")
            return None
        finally:
            if os.path.exists(export_path):
                os.remove(export_path)
                
    def get_family_history(self, family_id):
        """Retrieve family medical history"""
        try:
            response = requests.get(
                f"{self.api_base_url}/family/{family_id}/history"
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            slicer.util.errorDisplay(f"Failed to get family history: {str(e)}")
            return None
            
    def update_health_metrics(self, patient_id, metrics):
        """Update patient health metrics"""
        try:
            response = requests.post(
                f"{self.api_base_url}/patient/{patient_id}/metrics",
                json=metrics
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            slicer.util.errorDisplay(f"Failed to update metrics: {str(e)}")
            return None
            
    def get_genetic_risk_factors(self, family_id, patient_id):
        """Get genetic risk factors based on family history"""
        try:
            response = requests.get(
                f"{self.api_base_url}/analysis/genetic-risk",
                params={'familyId': family_id, 'patientId': patient_id}
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            slicer.util.errorDisplay(f"Failed to get genetic risk factors: {str(e)}")
            return None