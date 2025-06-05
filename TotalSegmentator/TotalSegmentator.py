import os
import vtk, qt, ctk, slicer
from slicer.ScriptedLoadableModule import *
from slicer.util import VTKObservationMixin
import logging
from datetime import datetime
from .TotalSegmentatorCloud import TotalSegmentatorCloud

class TotalSegmentator(ScriptedLoadableModule):
    def __init__(self, parent):
        ScriptedLoadableModule.__init__(self, parent)
        self.parent.title = "TotalSegmentator"
        self.parent.categories = ["Segmentation"]
        self.parent.dependencies = ["PyTorch"]
        self.parent.contributors = ["Andras Lasso (PerkLab)"]
        self.parent.helpText = """
        Fully automatic whole-body CT segmentation using TotalSegmentator AI model with cloud-based family health tracking.
        See more information in <a href="https://github.com/lassoan/SlicerTotalSegmentator">module documentation</a>.
        """
        self.parent.acknowledgementText = """
        This module was developed by Andras Lasso (PerkLab, Queen's University).
        The module uses TotalSegmentator AI model developed by Jakob Wasserthal.
        If you use the TotalSegmentator nn-Unet function from this software in your research,
        please cite: Wasserthal J., Meyer M., Breit H.C., Cyriac J., Shan Y., Segeroth M.:
        TotalSegmentator: robust segmentation of 104 anatomical structures in CT images.
        """

class TotalSegmentatorWidget(ScriptedLoadableModuleWidget, VTKObservationMixin):
    def __init__(self, parent=None):
        ScriptedLoadableModuleWidget.__init__(self, parent)
        VTKObservationMixin.__init__(self)
        self.logic = None
        self.cloud = TotalSegmentatorCloud()
        self.patientId = None
        self.familyId = None
        
    def setup(self):
        ScriptedLoadableModuleWidget.setup(self)
        
        # Load widget from .ui file
        uiWidget = slicer.util.loadUI(self.resourcePath('UI/TotalSegmentator.ui'))
        self.layout.addWidget(uiWidget)
        self.ui = slicer.util.childWidgetVariables(uiWidget)
        
        # Add cloud integration section
        cloudCollapsibleButton = ctk.ctkCollapsibleButton()
        cloudCollapsibleButton.text = "Cloud Integration"
        self.layout.addWidget(cloudCollapsibleButton)
        cloudFormLayout = qt.QFormLayout(cloudCollapsibleButton)
        
        # Patient ID input
        self.patientIdLineEdit = qt.QLineEdit()
        cloudFormLayout.addRow("Patient ID:", self.patientIdLineEdit)
        
        # Family ID input
        self.familyIdLineEdit = qt.QLineEdit()
        cloudFormLayout.addRow("Family ID:", self.familyIdLineEdit)
        
        # Cloud status label
        self.cloudStatusLabel = qt.QLabel("Not connected to cloud")
        cloudFormLayout.addRow("Status:", self.cloudStatusLabel)
        
        # Connect signals
        self.ui.applyButton.connect('clicked(bool)', self.onApplyButton)
        self.patientIdLineEdit.textChanged.connect(self.onPatientIdChanged)
        self.familyIdLineEdit.textChanged.connect(self.onFamilyIdChanged)
        
        # Initial setup
        self.updateGUIFromParameters()

    def onPatientIdChanged(self, text):
        self.patientId = text
        
    def onFamilyIdChanged(self, text):
        self.familyId = text
        
    def onApplyButton(self):
        try:
            # Perform segmentation
            if not self.logic:
                self.logic = TotalSegmentatorLogic()
            
            inputVolume = self.ui.inputVolumeSelector.currentNode()
            outputSegmentation = self.ui.outputSegmentationSelector.currentNode()
            
            if not inputVolume or not outputSegmentation:
                raise ValueError("Input volume and output segmentation must be selected")
                
            # Run segmentation
            self.logic.run(inputVolume, outputSegmentation)
            
            # Upload to cloud if IDs are provided
            if self.patientId and self.familyId:
                self.cloudStatusLabel.text = "Uploading to cloud..."
                result = self.cloud.upload_segmentation_result(
                    outputSegmentation,
                    self.patientId,
                    self.familyId
                )
                
                if result:
                    # Calculate and update health metrics
                    metrics = self.logic.calculate_health_metrics(outputSegmentation)
                    self.cloud.update_health_metrics(self.patientId, metrics)
                    self.cloudStatusLabel.text = "Upload successful"
                else:
                    self.cloudStatusLabel.text = "Upload failed"
            
        except Exception as e:
            slicer.util.errorDisplay(f"Failed to process: {str(e)}")
            self.cloudStatusLabel.text = "Error occurred"
            
    def updateGUIFromParameters(self):
        self.ui.applyButton.enabled = (
            self.ui.inputVolumeSelector.currentNode() 
            and self.ui.outputSegmentationSelector.currentNode()
        )