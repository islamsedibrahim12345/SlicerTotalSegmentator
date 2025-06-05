# Add to existing imports
from .TotalSegmentatorCloud import TotalSegmentatorCloud

class TotalSegmentator(ScriptedLoadableModule):
    def __init__(self, parent):
        ScriptedLoadableModule.__init__(self, parent)
        self.parent.title = "TotalSegmentator"
        self.parent.categories = ["Segmentation"]
        self.parent.dependencies = ["PyTorch"]
        self.parent.contributors = ["Andras Lasso (PerkLab)"]
        self.parent.helpText = """
        Fully automatic whole-body CT segmentation using TotalSegmentator AI model.
        See more information in <a href="https://github.com/lassoan/SlicerTotalSegmentator">module documentation</a>.
        """
        self.parent.acknowledgementText = """
        This module was developed by Andras Lasso (PerkLab, Queen's University).
        The module uses TotalSegmentator AI model developed by Jakob Wasserthal.
        If you use the TotalSegmentator nn-Unet function from this software in your research,
        please cite: Wasserthal J., Meyer M., Breit H.C., Cyriac J., Shan Y., Segeroth M.:
        TotalSegmentator: robust segmentation of 104 anatomical structures in CT images.
        """
        
        # Initialize cloud integration
        self.cloud = TotalSegmentatorCloud()

    def onApplyButton(self):
        # Existing segmentation logic...
        
        # After successful segmentation, upload to cloud
        if self.outputSegmentation and self.patientId and self.familyId:
            self.cloud.upload_segmentation_result(
                self.outputSegmentation,
                self.patientId,
                self.familyId
            )
            
            # Update health metrics
            metrics = self.calculate_health_metrics(self.outputSegmentation)
            self.cloud.update_health_metrics(self.patientId, metrics)
            
    def calculate_health_metrics(self, segmentation):
        """Calculate health metrics from segmentation"""
        # Example metrics calculation
        metrics = {
            'organ_volumes': {},
            'symmetry_scores': {},
            'density_metrics': {}
        }
        
        # Calculate organ volumes
        for segment_id in segmentation.GetSegmentIDs():
            segment = segmentation.GetSegment(segment_id)
            metrics['organ_volumes'][segment_id] = segment.GetStatistics()['VolumeInMm3']
            
        return metrics