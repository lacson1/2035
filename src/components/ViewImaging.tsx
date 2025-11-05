import { useState } from "react";
import { Scan, Calendar, Eye, Download, X, ZoomIn, ZoomOut, RotateCw, FileText, Columns } from "lucide-react";
import { Patient, ImagingStudy } from "../types";
import { sortByDateDesc } from "../utils/patientUtils";

interface ViewImagingProps {
  patient: Patient;
}

export default function ViewImaging({ patient }: ViewImagingProps) {
  const [viewingStudy, setViewingStudy] = useState<ImagingStudy | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareStudy, setCompareStudy] = useState<ImagingStudy | null>(null);
  const [zoom, setZoom] = useState(100);

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case "CT":
        return "bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200";
      case "MRI":
        return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200";
      case "X-Ray":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "Ultrasound":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "PET":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
    }
  };

  const handleViewImages = (study: ImagingStudy) => {
    setViewingStudy(study);
    setZoom(100);
  };

  const handleCompare = (study: ImagingStudy) => {
    if (compareMode && compareStudy) {
      setCompareMode(false);
      setCompareStudy(null);
    } else {
      setCompareMode(true);
      setCompareStudy(study);
    }
  };

  // Mock image display - in real app, this would load actual DICOM images
  const renderImagePlaceholder = (study: ImagingStudy, label: string) => (
    <div className="bg-gray-900 p-8 rounded-lg flex flex-col items-center justify-center min-h-[400px]">
      <Scan size={64} className="text-gray-600 mb-4" />
      <p className="text-gray-400 text-sm mb-2">{study.type}</p>
      <p className="text-gray-500 text-xs">{study.bodyPart}</p>
      <p className="text-gray-600 text-xs mt-4">{label}</p>
      <div className="mt-4 text-xs text-gray-500">
        <p>Date: {new Date(study.date).toLocaleDateString()}</p>
        <p>Modality: {study.modality}</p>
      </div>
    </div>
  );

  const sortedStudies = sortByDateDesc(patient.imagingStudies || []);

  return (
    <div className="space-y-6">
      <div className="p-4 border rounded-lg dark:border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Imaging Studies</h3>
          {sortedStudies.length > 1 && (
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${
                compareMode
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <Columns size={14} /> {compareMode ? "Exit Compare" : "Compare Mode"}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {sortedStudies.length > 0 ? (
            sortedStudies.map((study) => (
              <div
                key={study.id}
                className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Scan size={20} className="text-teal-600 dark:text-teal-400" />
                    <div>
                      <h4 className="font-semibold">{study.type}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{study.bodyPart}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getModalityColor(study.modality)}`}
                    >
                      {study.modality}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusColor(study.status)}`}
                    >
                      {study.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <Calendar size={14} />
                  <span>{new Date(study.date).toLocaleDateString()}</span>
                </div>

                <div className="bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700 mb-3">
                  <p className="text-sm font-medium mb-1 flex items-center gap-2">
                    <FileText size={14} /> Findings:
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{study.findings}</p>
                </div>

                {study.status === "completed" && (
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleViewImages(study)}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-teal-500 text-white rounded-md hover:bg-teal-600"
                    >
                      <Eye size={14} /> View Images
                    </button>
                    {sortedStudies.length > 1 && (
                      <button
                        onClick={() => handleCompare(study)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md ${
                          compareMode && compareStudy?.id === study.id
                            ? "bg-purple-600 text-white"
                            : "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        <Columns size={14} /> {compareMode && compareStudy?.id === study.id ? "Selected" : "Compare"}
                      </button>
                    )}
                    {study.reportUrl && (
                      <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700">
                        <Download size={14} /> Download Report
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No imaging studies available
            </p>
          )}
        </div>
      </div>

      {/* Compare View */}
      {compareMode && compareStudy && (
        <div className="p-4 border rounded-lg dark:border-gray-700 bg-teal-50 dark:bg-teal-900/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Columns size={20} className="text-teal-600 dark:text-teal-400" />
            Comparison Mode
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select another study to compare with: <strong>{compareStudy.type}</strong>
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Study 1</p>
              {renderImagePlaceholder(compareStudy, "Selected for Comparison")}
            </div>
            <div>
              <p className="text-xs font-medium mb-2 text-gray-600 dark:text-gray-400">Study 2</p>
              <div className="bg-gray-100 dark:bg-gray-800 p-8 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500 text-sm">Select another study to compare</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewingStudy && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setViewingStudy(null)}
        >
          <div
            className="relative w-full h-full flex flex-col p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 text-white">
              <div>
                <h3 className="text-xl font-semibold">{viewingStudy.type}</h3>
                <p className="text-sm text-gray-300">
                  {viewingStudy.bodyPart} • {new Date(viewingStudy.date).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setViewingStudy(null)}
                className="p-2 hover:bg-white/10 rounded"
              >
                <X size={24} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-4 text-white">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-sm">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
              >
                <ZoomIn size={18} />
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded">
                <RotateCw size={18} /> Rotate
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded">
                <Download size={18} /> Download
              </button>
            </div>

            {/* Image Display */}
            <div className="flex-1 overflow-auto flex items-center justify-center">
              <div style={{ transform: `scale(${zoom / 100})` }}>
                {renderImagePlaceholder(viewingStudy, "DICOM Image Viewer")}
              </div>
            </div>

            {/* Findings Panel */}
            <div className="mt-4 bg-gray-800 p-4 rounded text-white">
              <h4 className="font-semibold mb-2">Radiology Report</h4>
              <p className="text-sm text-gray-300">{viewingStudy.findings}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

