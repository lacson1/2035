import { useState, useEffect } from "react";
import {
  Scan,
  Calendar,
  Eye,
  Download,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Columns,
  Plus,
  Search,
  Filter,
  Printer,
  Trash2,
  CheckCircle,
  Info,
  Upload,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { useUser } from "../context/UserContext";
import { Patient, ImagingStudy } from "../types";
import { imagingStudiesService } from "../services/imaging-studies";
import { useUsers } from "../hooks/useUsers";
import { getRoleName } from "../data/roles";
import UserAssignment from "./UserAssignment";
import PrintPreview from "./PrintPreview";
import { openPrintWindow } from "../utils/popupHandler";
import { getOrganizationFooter, getOrganizationDetails } from "../utils/organization";
import { logger } from "../utils/logger";
import SmartFormField from "./SmartFormField";
import FormGroup from "./FormGroup";

interface ViewImagingProps {
  patient?: Patient;
}

type ImagingStatus = "completed" | "pending" | "cancelled";
type ImagingModality = "CT" | "MRI" | "X-Ray" | "Ultrasound" | "PET";

// Common imaging studies for quick selection
const commonImagingStudies = [
  { type: "CT Head", modality: "CT" as ImagingModality, bodyPart: "Head", description: "Computed Tomography of the head" },
  { type: "CT Chest", modality: "CT" as ImagingModality, bodyPart: "Chest", description: "Computed Tomography of the chest" },
  { type: "CT Abdomen", modality: "CT" as ImagingModality, bodyPart: "Abdomen", description: "Computed Tomography of the abdomen" },
  { type: "CT Pelvis", modality: "CT" as ImagingModality, bodyPart: "Pelvis", description: "Computed Tomography of the pelvis" },
  { type: "MRI Brain", modality: "MRI" as ImagingModality, bodyPart: "Brain", description: "Magnetic Resonance Imaging of the brain" },
  { type: "MRI Spine", modality: "MRI" as ImagingModality, bodyPart: "Spine", description: "Magnetic Resonance Imaging of the spine" },
  { type: "MRI Knee", modality: "MRI" as ImagingModality, bodyPart: "Knee", description: "Magnetic Resonance Imaging of the knee" },
  { type: "Chest X-Ray", modality: "X-Ray" as ImagingModality, bodyPart: "Chest", description: "Chest X-Ray" },
  { type: "Abdominal X-Ray", modality: "X-Ray" as ImagingModality, bodyPart: "Abdomen", description: "Abdominal X-Ray" },
  { type: "Extremity X-Ray", modality: "X-Ray" as ImagingModality, bodyPart: "Extremity", description: "Extremity X-Ray" },
  { type: "Abdominal Ultrasound", modality: "Ultrasound" as ImagingModality, bodyPart: "Abdomen", description: "Abdominal ultrasound" },
  { type: "Pelvic Ultrasound", modality: "Ultrasound" as ImagingModality, bodyPart: "Pelvis", description: "Pelvic ultrasound" },
  { type: "Cardiac Echo", modality: "Ultrasound" as ImagingModality, bodyPart: "Heart", description: "Echocardiogram" },
  { type: "PET Scan", modality: "PET" as ImagingModality, bodyPart: "Whole Body", description: "Positron Emission Tomography scan" },
];

export default function ViewImaging({ patient }: ViewImagingProps) {
  const { selectedPatient } = useDashboard();
  const { currentUser } = useUser();
  const currentPatient = patient || selectedPatient;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ImagingStatus>("all");
  const [modalityFilter, setModalityFilter] = useState<"all" | ImagingModality>("all");
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [viewingStudy, setViewingStudy] = useState<ImagingStudy | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareStudy, setCompareStudy] = useState<ImagingStudy | null>(null);
  const [zoom, setZoom] = useState(100);
  const [printPreview, setPrintPreview] = useState<{ content: string; title: string } | null>(null);
  const { users } = useUsers();
  const [imagingStudies, setImagingStudies] = useState<ImagingStudy[]>(
    currentPatient?.imagingStudies || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"orders" | "completed">("orders");
  const [selectedStudiesForBulk, setSelectedStudiesForBulk] = useState<Set<string>>(new Set());
  const [uploadingStudyId, setUploadingStudyId] = useState<string | null>(null);

  const [orderFormData, setOrderFormData] = useState({
    type: "",
    modality: "CT" as ImagingModality,
    bodyPart: "",
    date: new Date().toISOString().split("T")[0],
    findings: "",
    status: "pending" as ImagingStatus,
    reportUrl: "",
    orderingPhysicianId: null as string | null,
  });
  const [multipleOrders, setMultipleOrders] = useState<Array<{
    type: string;
    modality: ImagingModality;
    bodyPart: string;
    date: string;
    findings: string;
    status: ImagingStatus;
    reportUrl: string;
    orderingPhysicianId: string | null;
  }>>([]);

  // Load imaging studies from API
  useEffect(() => {
    if (currentPatient?.id) {
      loadImagingStudies();
    }
  }, [currentPatient?.id]);

  const loadImagingStudies = async () => {
    if (!currentPatient?.id) return;

    setIsLoading(true);
    try {
      const response = await imagingStudiesService.getPatientImagingStudies(currentPatient.id);
      if (response.data && response.data.length > 0) {
        setImagingStudies(response.data);
      } else {
        // No data from API - set empty array
        setImagingStudies([]);
      }
    } catch (error) {
      logger.error("Failed to load imaging studies:", error);
      // Fallback to local data if API fails
      if (currentPatient?.imagingStudies && currentPatient.imagingStudies.length > 0) {
        setImagingStudies(currentPatient.imagingStudies);
      } else {
        // No data available
        setImagingStudies([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getModalityColor = (modality: string) => {
    switch (modality) {
      case "CT":
        return "bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400";
      case "MRI":
        return "bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400";
      case "X-Ray":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "Ultrasound":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "PET":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  // Filter studies
  const completedStudies = imagingStudies.filter((study) => study.status === "completed");

  const filteredStudies = imagingStudies.filter((study) => {
    const matchesSearch =
      study.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.modality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.findings.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || study.status === statusFilter;
    const matchesModality = modalityFilter === "all" || study.modality === modalityFilter;
    return matchesSearch && matchesStatus && matchesModality;
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const filteredCompletedStudies = completedStudies.filter((study) => {
    const matchesSearch =
      study.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.bodyPart.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.modality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.findings.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModality = modalityFilter === "all" || study.modality === modalityFilter;
    return matchesSearch && matchesModality;
  }).sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const studiesToShow = activeTab === "completed" ? filteredCompletedStudies : filteredStudies;

  const handleViewImages = (study: ImagingStudy) => {
    setViewingStudy(study);
    setZoom(100);
  };

  const handleCompare = (study: ImagingStudy) => {
    if (compareMode && compareStudy?.id === study.id) {
      setCompareMode(false);
      setCompareStudy(null);
    } else {
      setCompareMode(true);
      setCompareStudy(study);
    }
  };

  const handleAddToMultipleOrders = () => {
    if (!orderFormData.type || !orderFormData.bodyPart) {
      alert("Please fill in Study Type and Body Part before adding to order list.");
      return;
    }

    setMultipleOrders([
      ...multipleOrders,
      {
        type: orderFormData.type,
        modality: orderFormData.modality,
        bodyPart: orderFormData.bodyPart,
        date: orderFormData.date,
        findings: orderFormData.findings || "",
        status: orderFormData.status,
        reportUrl: orderFormData.reportUrl || "",
        orderingPhysicianId: orderFormData.orderingPhysicianId,
      },
    ]);

    // Reset form for next entry
    setOrderFormData({
      type: "",
      modality: "CT",
      bodyPart: "",
      date: new Date().toISOString().split("T")[0],
      findings: "",
      status: "pending",
      reportUrl: "",
      orderingPhysicianId: null,
    });
  };

  const handleRemoveFromMultipleOrders = (index: number) => {
    setMultipleOrders(multipleOrders.filter((_, i) => i !== index));
  };

  const handleOrderStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient?.id) return;

    // If there are multiple orders, submit all of them
    if (multipleOrders.length > 0) {
      // Also add current form if it's filled
      const ordersToSubmit = [...multipleOrders];
      if (orderFormData.type && orderFormData.bodyPart) {
        ordersToSubmit.push({
          type: orderFormData.type,
          modality: orderFormData.modality,
          bodyPart: orderFormData.bodyPart,
          date: orderFormData.date,
          findings: orderFormData.findings || "",
          status: orderFormData.status,
          reportUrl: orderFormData.reportUrl || "",
          orderingPhysicianId: orderFormData.orderingPhysicianId,
        });
      }

      // Submit all orders
      setIsLoading(true);
      try {
        const promises = ordersToSubmit.map((order) =>
          imagingStudiesService.createImagingStudy(currentPatient.id, {
            type: order.type,
            modality: order.modality,
            bodyPart: order.bodyPart,
            date: order.date,
            findings: order.findings || "Pending radiology report",
            status: order.status,
            reportUrl: order.reportUrl || undefined,
            orderingPhysicianId: order.orderingPhysicianId || currentUser?.id || undefined,
          })
        );

        const responses = await Promise.all(promises);
        const newStudies = responses
          .map((r) => r.data)
          .filter((s) => s !== undefined) as ImagingStudy[];

        if (newStudies.length > 0) {
          setImagingStudies([...newStudies, ...imagingStudies]);
          setShowOrderForm(false);
          setMultipleOrders([]);
          setOrderFormData({
            type: "",
            modality: "CT",
            bodyPart: "",
            date: new Date().toISOString().split("T")[0],
            findings: "",
            status: "pending",
            reportUrl: "",
            orderingPhysicianId: null,
          });
        }
      } catch (error) {
        logger.error("Failed to create imaging studies:", error);
        alert("Failed to create some imaging studies. Please try again.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Single order submission (original behavior)
    try {
      const response = await imagingStudiesService.createImagingStudy(currentPatient.id, {
        type: orderFormData.type,
        modality: orderFormData.modality,
        bodyPart: orderFormData.bodyPart,
        date: orderFormData.date,
        findings: orderFormData.findings || "Pending radiology report",
        status: orderFormData.status,
        reportUrl: orderFormData.reportUrl || undefined,
        orderingPhysicianId: orderFormData.orderingPhysicianId || currentUser?.id || undefined,
      });

      if (response.data) {
        setImagingStudies([response.data, ...imagingStudies]);
        setShowOrderForm(false);
        setOrderFormData({
          type: "",
          modality: "CT",
          bodyPart: "",
          date: new Date().toISOString().split("T")[0],
          findings: "",
          status: "pending",
          reportUrl: "",
          orderingPhysicianId: null,
        });
      }
    } catch (error) {
      logger.error("Failed to create imaging study:", error);
      alert("Failed to create imaging study. Please try again.");
    }
  };

  const handleUpdateStudy = async (studyId: string, updates: Partial<ImagingStudy>) => {
    if (!currentPatient?.id) return;

    try {
      const response = await imagingStudiesService.updateImagingStudy(
        currentPatient.id,
        studyId,
        updates
      );

      if (response.data) {
        setImagingStudies(
          imagingStudies.map((study) => (study.id === studyId ? response.data : study))
        );
      }
    } catch (error) {
      logger.error("Failed to update imaging study:", error);
      alert("Failed to update imaging study. Please try again.");
    }
  };

  const handleDeleteStudy = async (studyId: string) => {
    if (!currentPatient?.id) return;
    if (!confirm("Are you sure you want to delete this imaging study?")) return;

    try {
      await imagingStudiesService.deleteImagingStudy(currentPatient.id, studyId);
      setImagingStudies(imagingStudies.filter((study) => study.id !== studyId));
    } catch (error) {
      logger.error("Failed to delete imaging study:", error);
      alert("Failed to delete imaging study. Please try again.");
    }
  };

  // Bulk operations
  const handleBulkStatusUpdate = (newStatus: ImagingStatus) => {
    if (selectedStudiesForBulk.size === 0) return;

    selectedStudiesForBulk.forEach((studyId) => {
      handleUpdateStudy(studyId, { status: newStatus });
    });

    setSelectedStudiesForBulk(new Set());
  };

  const handleBulkCancel = () => {
    if (selectedStudiesForBulk.size === 0) return;
    if (!confirm(`Cancel ${selectedStudiesForBulk.size} imaging study/studies?`)) return;
    handleBulkStatusUpdate("cancelled");
  };

  const toggleStudySelection = (studyId: string) => {
    setSelectedStudiesForBulk((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studyId)) {
        newSet.delete(studyId);
      } else {
        newSet.add(studyId);
      }
      return newSet;
    });
  };

  const handleFileUpload = async (studyId: string, file: File) => {
    if (!currentPatient?.id) return;

    setUploadingStudyId(studyId);
    try {
      const formData = new FormData();
      formData.append('reportFile', file);

      const response = await fetch(
        `/api/v1/patients/${currentPatient.id}/imaging/${studyId}/upload-report`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Update the study in the local state
      setImagingStudies(prev =>
        prev.map(study =>
          study.id === studyId
            ? { ...study, reportUrl: result.fileUrl }
            : study
        )
      );

      logger.info('Report uploaded successfully:', result.fileUrl);
    } catch (error) {
      logger.error('Failed to upload report:', error);
      alert('Failed to upload report. Please try again.');
    } finally {
      setUploadingStudyId(null);
    }
  };

  // Bulk print functionality
  const handleBulkPrint = () => {
    if (selectedStudiesForBulk.size === 0) return;

    const selectedStudies = imagingStudies.filter((study) =>
      selectedStudiesForBulk.has(study.id)
    );

    if (selectedStudies.length === 0) return;

    const orgDetails = getOrganizationDetails();
    const studiesHtml = selectedStudies
      .map((study, index) => {
        const orderingPhysician = study.orderingPhysicianId
          ? users.find((u) => u.id === study.orderingPhysicianId)
          : null;
        const physicianName = orderingPhysician
          ? `${orderingPhysician.firstName} ${orderingPhysician.lastName}`.trim()
          : "";

        return `
          <div class="study-section" style="page-break-after: ${index < selectedStudies.length - 1 ? 'always' : 'auto'}; margin-bottom: 40px;">
            <div class="study-details">
              <h3>Requested Imaging Study #${index + 1}</h3>
              <div style="padding: 12px; background: white; border-radius: 4px; border-left: 4px solid #2563eb;">
                <div style="font-weight: 600; margin-bottom: 8px;">${study.type}</div>
                <div style="font-size: 12px; color: #6b7280;">
                  Modality: ${study.modality} | Body Part: ${study.bodyPart} | Date: ${new Date(study.date).toLocaleDateString()}
                </div>
              </div>
            </div>

            ${study.findings ? `
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 25px 0;">
              <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #92400e; font-weight: 600;">Clinical Indication</h4>
              <p style="margin: 0; font-size: 12px; color: #78350f; line-height: 1.6;">${study.findings}</p>
            </div>
            ` : ""}

            ${orderingPhysician && physicianName ? `
            <div style="margin-top: 20px; padding: 10px; background: #f9fafb; border-radius: 4px;">
              <div style="font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; font-weight: 600;">Ordering Physician</div>
              <div style="font-size: 14px; font-weight: 600; color: #111827;">${physicianName}${orderingPhysician.role ? ` (${getRoleName(orderingPhysician.role)})` : ""}</div>
            </div>
            ` : ""}
          </div>
        `;
      })
      .join("");

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Multiple Imaging Requests - ${selectedStudies.length} Studies</title>
          <style>
            @page {
              margin: 0.75in;
              size: letter;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 0;
            }
            .org-header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 15px;
              margin-bottom: 25px;
              text-align: center;
            }
            .org-name {
              font-size: 22px;
              font-weight: 700;
              color: #1e40af;
              margin: 0 0 5px 0;
            }
            .org-type {
              font-size: 14px;
              color: #4b5563;
              margin: 0 0 8px 0;
              font-weight: 500;
            }
            .org-details {
              font-size: 11px;
              color: #6b7280;
              line-height: 1.5;
              margin: 0;
            }
            .document-header {
              text-align: center;
              margin: 25px 0;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
            }
            .document-header h1 {
              margin: 0;
              font-size: 20px;
              color: #1e40af;
              font-weight: 600;
            }
            .document-header h2 {
              margin: 8px 0 0 0;
              font-size: 16px;
              color: #4b5563;
              font-weight: normal;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 25px 0;
            }
            .info-item {
              padding: 10px;
              background: #f9fafb;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
            .info-label {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
              font-weight: 600;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
            }
            .study-details {
              background: #eff6ff;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .study-details h3 {
              margin: 0 0 15px 0;
              font-size: 18px;
              color: #1e40af;
              font-weight: 600;
            }
            .study-section {
              margin-bottom: 40px;
            }
            .signature-section {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
            .signature-line {
              margin-top: 60px;
              border-top: 1px solid #333;
              width: 300px;
            }
            .signature-label {
              font-size: 11px;
              color: #6b7280;
              margin-top: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 10px;
              color: #6b7280;
              text-align: center;
            }
            @media print {
              .no-print {
                display: none;
              }
              .study-section {
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="org-header">
            <div class="org-name">${orgDetails.name}</div>
            <div class="org-type">${orgDetails.type}</div>
            <div class="org-details">
              ${orgDetails.address}, ${orgDetails.city}, ${orgDetails.state} ${orgDetails.zipCode}<br>
              Phone: ${orgDetails.phone}${orgDetails.fax ? ` | Fax: ${orgDetails.fax}` : ""}${orgDetails.email ? ` | Email: ${orgDetails.email}` : ""}
            </div>
          </div>

          <div class="document-header">
            <h1>MULTIPLE IMAGING STUDY REQUESTS</h1>
            <h2>Total: ${selectedStudies.length} Study${selectedStudies.length > 1 ? "ies" : ""}</h2>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of Birth</div>
              <div class="info-value">${currentPatient?.dob ? new Date(currentPatient.dob).toLocaleDateString() : "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Patient ID</div>
              <div class="info-value">${currentPatient?.id || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Request Date</div>
              <div class="info-value">${new Date().toLocaleDateString()}</div>
            </div>
          </div>

          ${studiesHtml}

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">Ordering Physician Signature</div>
          </div>

          <div class="footer">
            ${getOrganizationFooter()}<br>
            Generated: ${new Date().toLocaleString()}<br>
            This document contains ${selectedStudies.length} imaging study request${selectedStudies.length > 1 ? "s" : ""}. Please process according to standard procedures.
          </div>
        </body>
      </html>
    `;

    setPrintPreview({
      content: printContent,
      title: `Multiple Imaging Requests - ${selectedStudies.length} Studies`,
    });
  };

  // Print functionality
  const handlePrintRequest = (study: ImagingStudy) => {
    const orgDetails = getOrganizationDetails();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imaging Request - ${study.type}</title>
          <style>
            @page {
              margin: 0.75in;
              size: letter;
            }
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 0;
            }
            .org-header {
              border-bottom: 3px solid #2563eb;
              padding-bottom: 15px;
              margin-bottom: 25px;
              text-align: center;
            }
            .org-name {
              font-size: 22px;
              font-weight: 700;
              color: #1e40af;
              margin: 0 0 5px 0;
            }
            .org-type {
              font-size: 14px;
              color: #4b5563;
              margin: 0 0 8px 0;
              font-weight: 500;
            }
            .org-details {
              font-size: 11px;
              color: #6b7280;
              line-height: 1.5;
              margin: 0;
            }
            .document-header {
              text-align: center;
              margin: 25px 0;
              padding-bottom: 15px;
              border-bottom: 2px solid #e5e7eb;
            }
            .document-header h1 {
              margin: 0;
              font-size: 20px;
              color: #1e40af;
              font-weight: 600;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin: 25px 0;
            }
            .info-item {
              padding: 10px;
              background: #f9fafb;
              border-radius: 4px;
              border: 1px solid #e5e7eb;
            }
            .info-label {
              font-size: 11px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 5px;
              font-weight: 600;
            }
            .info-value {
              font-size: 14px;
              font-weight: 600;
              color: #111827;
            }
            .study-details {
              background: #eff6ff;
              border: 2px solid #2563eb;
              border-radius: 8px;
              padding: 20px;
              margin: 25px 0;
            }
            .study-details h3 {
              margin: 0 0 15px 0;
              font-size: 18px;
              color: #1e40af;
              font-weight: 600;
            }
            .signature-section {
              margin-top: 60px;
              padding-top: 20px;
              border-top: 2px solid #e5e7eb;
            }
            .signature-line {
              margin-top: 60px;
              border-top: 1px solid #333;
              width: 300px;
            }
            .signature-label {
              font-size: 11px;
              color: #6b7280;
              margin-top: 5px;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 10px;
              color: #6b7280;
              text-align: center;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="org-header">
            <div class="org-name">${orgDetails.name}</div>
            <div class="org-type">${orgDetails.type}</div>
            <div class="org-details">
              ${orgDetails.address}, ${orgDetails.city}, ${orgDetails.state} ${orgDetails.zipCode}<br>
              Phone: ${orgDetails.phone}${orgDetails.fax ? ` | Fax: ${orgDetails.fax}` : ""}${orgDetails.email ? ` | Email: ${orgDetails.email}` : ""}
            </div>
          </div>

          <div class="document-header">
            <h1>IMAGING STUDY REQUEST</h1>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date of Birth</div>
              <div class="info-value">${currentPatient?.dob ? new Date(currentPatient.dob).toLocaleDateString() : "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Patient ID</div>
              <div class="info-value">${currentPatient?.id || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Request Date</div>
              <div class="info-value">${new Date(study.date).toLocaleDateString()}</div>
            </div>
          </div>

          <div class="study-details">
            <h3>Requested Imaging Study</h3>
            <div style="padding: 12px; background: white; border-radius: 4px; border-left: 4px solid #2563eb;">
              <div style="font-weight: 600; margin-bottom: 8px;">${study.type}</div>
              <div style="font-size: 12px; color: #6b7280;">
                Modality: ${study.modality} | Body Part: ${study.bodyPart}
              </div>
            </div>
          </div>

          ${study.findings ? `
          <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin: 25px 0;">
            <h4 style="margin: 0 0 10px 0; font-size: 14px; color: #92400e; font-weight: 600;">Clinical Indication</h4>
            <p style="margin: 0; font-size: 12px; color: #78350f; line-height: 1.6;">${study.findings}</p>
          </div>
          ` : ""}

          <div class="signature-section">
            <div class="signature-line"></div>
            <div class="signature-label">Ordering Physician Signature</div>
          </div>

          <div class="footer">
            ${getOrganizationFooter()}<br>
            Generated: ${new Date().toLocaleString()}<br>
            This is an official imaging study request form. Please process according to standard procedures.
          </div>
        </body>
      </html>
    `;

    setPrintPreview({
      content: printContent,
      title: `Imaging Request - ${study.type}`,
    });
  };

  const handlePrintReport = (study: ImagingStudy) => {
    const orgDetails = getOrganizationDetails();

    const printContent = `
      <!DOCTYPE html>
        <html>
          <head>
            <title>Imaging Report - ${study.type}</title>
            <style>
              @page {
                margin: 1in;
                size: letter;
              }
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                border-bottom: 3px solid #2563eb;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
                color: #1e40af;
              }
              .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin-bottom: 30px;
              }
              .info-item {
                padding: 10px;
                background: #f9fafb;
                border-radius: 4px;
              }
              .info-label {
                font-size: 11px;
                color: #6b7280;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 5px;
              }
              .info-value {
                font-size: 14px;
                font-weight: 600;
                color: #111827;
              }
              .findings {
                background: #eff6ff;
                padding: 20px;
                border-left: 4px solid #2563eb;
                border-radius: 4px;
                margin: 20px 0;
              }
              .findings h3 {
                margin: 0 0 15px 0;
                font-size: 16px;
                color: #1e40af;
                font-weight: 600;
              }
              .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                font-size: 11px;
                color: #6b7280;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>RADIOLOGY REPORT</h1>
              <h2 style="margin: 5px 0 0 0; font-size: 18px; color: #4b5563; font-weight: normal;">${study.type}</h2>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Patient Name</div>
                <div class="info-value">${currentPatient?.name || "N/A"}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Study Date</div>
                <div class="info-value">${new Date(study.date).toLocaleDateString()}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Modality</div>
                <div class="info-value">${study.modality}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Body Part</div>
                <div class="info-value">${study.bodyPart}</div>
              </div>
            </div>

            <div class="findings">
              <h3>Findings</h3>
              <p style="margin: 0; white-space: pre-wrap;">${study.findings}</p>
            </div>

            <div class="footer">
              Generated: ${new Date().toLocaleString()}<br>
              ${orgDetails.name} - Electronic Health Record System
            </div>
          </body>
        </html>
      `;

    setPrintPreview({
      content: printContent,
      title: `Imaging Report - ${study.type}`,
    });
  };

  const handlePrintFromPreview = () => {
    if (!printPreview) return;
    openPrintWindow(printPreview.content, printPreview.title);
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

  if (!currentPatient) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No Patient Selected</p>
        <p className="text-sm">Please select a patient to view imaging studies.</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Scan className="text-primary-600 dark:text-primary-400" size={24} />
            Imaging Studies
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage imaging orders and results for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowOrderForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Order Imaging Study
        </button>
      </div>

      {/* Tabs */}
      <div className="card mb-4">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-300 ${activeTab === "orders"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/20 dark:to-transparent shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gradient-to-b hover:from-gray-50 hover:to-transparent dark:hover:from-gray-700/50 dark:hover:to-transparent"
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText size={18} />
              All Studies ({imagingStudies.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-300 ${activeTab === "completed"
              ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 bg-gradient-to-b from-primary-50/50 to-transparent dark:from-primary-900/20 dark:to-transparent shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gradient-to-b hover:from-gray-50 hover:to-transparent dark:hover:from-gray-700/50 dark:hover:to-transparent"
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Eye size={18} />
              Completed ({completedStudies.length})
            </div>
          </button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedStudiesForBulk.size > 0 && (
        <div className="bg-gradient-to-r from-primary-50 via-primary-50/50 to-success-50 dark:from-primary-900/20 dark:via-primary-900/10 dark:to-success-900/20 border border-primary-200 dark:border-primary-800 rounded-xl p-4 mb-4 shadow-md animate-slide-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-primary-900 dark:text-primary-100 text-base">
                {selectedStudiesForBulk.size} {selectedStudiesForBulk.size === 1 ? "study" : "studies"} selected
              </span>
              <button
                onClick={() => setSelectedStudiesForBulk(new Set())}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
              >
                Clear selection
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleBulkPrint}
                className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 active:scale-95"
                title="Print selected orders"
              >
                <Printer size={16} />
                Print Selected
              </button>
              <button
                onClick={() => handleBulkStatusUpdate("completed")}
                className="btn-success px-3 py-1.5 text-sm flex items-center gap-2"
              >
                <CheckCircle size={16} />
                Mark Completed
              </button>
              <button
                onClick={handleBulkCancel}
                className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
              >
                Cancel Selected
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="card mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search imaging studies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-base pl-10 pr-4 py-2.5"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | ImagingStatus)}
              className="input-base px-4 py-2.5"
              title="Filter by status"
              aria-label="Filter imaging studies by status"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={modalityFilter}
              onChange={(e) => setModalityFilter(e.target.value as "all" | ImagingModality)}
              className="input-base px-4 py-2.5"
              title="Filter by modality"
              aria-label="Filter imaging studies by modality"
            >
              <option value="all">All Modalities</option>
              <option value="CT">CT</option>
              <option value="MRI">MRI</option>
              <option value="X-Ray">X-Ray</option>
              <option value="Ultrasound">Ultrasound</option>
              <option value="PET">PET</option>
            </select>
          </div>
        </div>
      </div>

      {/* Studies List */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Loading imaging studies...</p>
          </div>
        ) : studiesToShow.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Scan size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">
              {activeTab === "completed"
                ? "No Completed Studies Found"
                : "No Imaging Studies Found"}
            </p>
            <p className="text-sm">
              {activeTab === "completed"
                ? "No completed imaging studies available to view"
                : searchTerm || statusFilter !== "all" || modalityFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No imaging studies have been ordered for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {studiesToShow.map((study) => (
              <div
                key={study.id}
                className={`p-4 transition-all duration-300 ${selectedStudiesForBulk.has(study.id)
                  ? "bg-gradient-to-br from-primary-50 via-white to-success-50 dark:from-primary-900/30 dark:via-gray-800 dark:to-success-900/20 border-2 border-primary-500 shadow-md"
                  : "hover:bg-gradient-to-br hover:from-gray-50 hover:to-primary-50/30 dark:hover:from-gray-700/50 dark:hover:to-primary-900/10 border border-transparent hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-sm"
                  } rounded-lg`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Bulk selection checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedStudiesForBulk.has(study.id)}
                      onChange={() => toggleStudySelection(study.id)}
                      className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      onClick={(e) => e.stopPropagation()}
                      title={`Select ${study.type} for bulk actions`}
                      aria-label={`Select ${study.type} for bulk actions`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          {study.type}
                        </h3>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${getModalityColor(
                            study.modality
                          )}`}
                        >
                          {study.modality}
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(
                            study.status
                          )}`}
                        >
                          {getStatusLabel(study.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {new Date(study.date).toLocaleDateString()}
                        </span>
                        <span>Body Part: {study.bodyPart}</span>
                      </div>
                      {study.findings && study.status === "completed" && (
                        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle size={14} className="text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-800 dark:text-green-200">Results Available</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3 mt-1">
                            {study.findings}
                          </p>
                          <button
                            onClick={() => handleViewImages(study)}
                            className="mt-2 text-xs text-green-700 dark:text-green-400 hover:underline font-medium"
                          >
                            View Full Report →
                          </button>
                        </div>
                      )}
                      {study.findings && study.status !== "completed" && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {study.findings}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                    {study.status !== "completed" && (
                      <button
                        onClick={() => handlePrintRequest(study)}
                        className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                        title="Print Request"
                      >
                        <Printer size={18} />
                      </button>
                    )}
                    {study.status === "completed" && (
                      <>
                        <button
                          onClick={() => handleViewImages(study)}
                          className={`flex items-center gap-2 rounded-lg transition-colors ${activeTab === "completed"
                            ? "px-3 py-2 bg-primary-500 text-white hover:bg-primary-600 font-medium"
                            : "p-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30"
                            }`}
                          title="View Images"
                        >
                          <Eye size={18} />
                          {activeTab === "completed" && <span className="text-sm">View</span>}
                        </button>
                        {imagingStudies.length > 1 && (
                          <button
                            onClick={() => handleCompare(study)}
                            className={`p-2 rounded-lg transition-colors ${compareMode && compareStudy?.id === study.id
                              ? "bg-purple-500 text-white"
                              : "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30"
                              }`}
                            title="Compare Studies"
                          >
                            <Columns size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handlePrintReport(study)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          title="Print Report"
                        >
                          <Printer size={18} />
                        </button>
                        {study.reportUrl ? (
                          <a
                            href={study.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Download Report"
                          >
                            <Download size={18} />
                          </a>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileUpload(study.id, file);
                                }
                              }}
                              disabled={uploadingStudyId === study.id}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              title="Upload Report"
                            />
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors">
                              {uploadingStudyId === study.id ? (
                                <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                              ) : (
                                <Upload size={18} />
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {(currentUser?.role === "admin" ||
                      currentUser?.role === "physician" ||
                      currentUser?.role === "radiologist") && (
                        <button
                          onClick={() => handleDeleteStudy(study.id)}
                          className="p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                          title="Delete Study"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Imaging Study Modal */}
      {showOrderForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowOrderForm(false);
            }
          }}
        >
          <div
            className="glass-strong rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-primary-200/30 dark:border-primary-700/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gradient">
                  Order Imaging {multipleOrders.length > 0 ? `Studies (${multipleOrders.length + 1})` : "Study"}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {multipleOrders.length > 0
                    ? `Ordering ${multipleOrders.length + 1} studies for ${currentPatient.name}`
                    : `Create a new imaging order for ${currentPatient.name}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowOrderForm(false);
                  setMultipleOrders([]);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 hover:scale-110 active:scale-95"
                aria-label="Close order form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleOrderStudy} className="p-6 space-y-5">
              {/* Multiple Orders List */}
              {multipleOrders.length > 0 && (
                <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-primary-900 dark:text-primary-100">
                      Studies to Order ({multipleOrders.length})
                    </h4>
                    <button
                      type="button"
                      onClick={() => setMultipleOrders([])}
                      className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {multipleOrders.map((order, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {order.type}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.modality} • {order.bodyPart} • {new Date(order.date).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveFromMultipleOrders(idx)}
                          className="ml-3 p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Remove"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Select Common Studies */}
              <div>
                <label className="block text-base font-medium mb-2.5">Quick Select</label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                  {commonImagingStudies.map((common, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setOrderFormData({
                          ...orderFormData,
                          type: common.type,
                          modality: common.modality,
                          bodyPart: common.bodyPart,
                        });
                      }}
                      className="p-2.5 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors bg-white dark:bg-gray-800"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {common.type}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {common.modality} • {common.bodyPart}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <FormGroup
                title="Study Details"
                description="Specify the imaging study type and parameters"
              >
                <div className="grid grid-cols-2 gap-6">
                  <SmartFormField
                    type="text"
                    name="studyType"
                    label="Study Type"
                    value={orderFormData.type}
                    onChange={(value) => setOrderFormData({ ...orderFormData, type: value })}
                    placeholder="e.g., CT Head, MRI Brain"
                    required
                  />
                  <SmartFormField
                    type="select"
                    name="modality"
                    label="Modality"
                    value={orderFormData.modality}
                    onChange={(value) => setOrderFormData({ ...orderFormData, modality: value as ImagingModality })}
                    options={["CT", "MRI", "X-Ray", "Ultrasound", "PET"]}
                    required
                  />
                </div>
              </FormGroup>

              <FormGroup
                title="Study Parameters"
                description="Specify the body part and scheduling details"
              >
                <div className="grid grid-cols-2 gap-6">
                  <SmartFormField
                    type="text"
                    name="bodyPart"
                    label="Body Part"
                    value={orderFormData.bodyPart}
                    onChange={(value) => setOrderFormData({ ...orderFormData, bodyPart: value })}
                    placeholder="e.g., Head, Chest, Abdomen, Spine"
                    required
                  />
                  <SmartFormField
                    type="date"
                    name="studyDate"
                    label="Study Date"
                    value={orderFormData.date}
                    onChange={(value) => setOrderFormData({ ...orderFormData, date: value })}
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </FormGroup>

              <FormGroup
                title="Clinical Details"
                description="Provide clinical indication and any preliminary findings"
                collapsible
              >
                <SmartFormField
                  type="textarea"
                  name="findings"
                  label="Clinical Indication / Findings"
                  value={orderFormData.findings}
                  onChange={(value) => setOrderFormData({ ...orderFormData, findings: value })}
                  placeholder="Enter clinical indication or preliminary findings..."
                  rows={4}
                />
              </FormGroup>

              <FormGroup
                title="Order Configuration"
                description="Set status and optional report URL"
                collapsible
              >
                <div className="grid grid-cols-2 gap-6">
                  <SmartFormField
                    type="select"
                    name="status"
                    label="Status"
                    value={orderFormData.status}
                    onChange={(value) => setOrderFormData({ ...orderFormData, status: value as ImagingStatus })}
                    options={["pending", "completed", "cancelled"]}
                  />
                  <SmartFormField
                    type="text"
                    name="reportUrl"
                    label="Report URL"
                    value={orderFormData.reportUrl}
                    onChange={(value) => setOrderFormData({ ...orderFormData, reportUrl: value })}
                    placeholder="https://..."
                  />
                </div>
              </FormGroup>

              {/* Assign to Radiologist */}
              <UserAssignment
                assignedTo={orderFormData.orderingPhysicianId}
                allowedRoles={["radiologist", "physician"]}
                label="Ordering Physician / Radiologist"
                placeholder="Select physician or radiologist..."
                onAssign={(userId) =>
                  setOrderFormData({ ...orderFormData, orderingPhysicianId: userId })
                }
              />

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleAddToMultipleOrders}
                  disabled={!orderFormData.type || !orderFormData.bodyPart}
                  className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  aria-label="Add another study to order list"
                >
                  <Plus size={16} />
                  Add Another
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowOrderForm(false);
                      setMultipleOrders([]);
                    }}
                    className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || (!orderFormData.type && multipleOrders.length === 0)}
                    className="px-5 py-2.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus size={18} />
                    {multipleOrders.length > 0
                      ? `Order ${multipleOrders.length + (orderFormData.type ? 1 : 0)} Studies`
                      : "Order Study"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compare View */}
      {compareMode && compareStudy && (
        <div className="card-elevated p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Columns className="text-teal-600 dark:text-teal-400" size={20} />
              Comparison Mode
            </h3>
            <button
              onClick={() => {
                setCompareMode(false);
                setCompareStudy(null);
              }}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              title="Close comparison mode"
              aria-label="Close comparison mode"
            >
              <X size={20} />
            </button>
          </div>
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
                title="Close image viewer"
                aria-label="Close image viewer"
              >
                <X size={24} />
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 mb-4 text-white">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
                title="Zoom out"
                aria-label="Zoom out"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-sm">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
                title="Zoom in"
                aria-label="Zoom in"
              >
                <ZoomIn size={18} />
              </button>
              <button
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
                title="Rotate image"
                aria-label="Rotate image"
              >
                <RotateCw size={18} /> Rotate
              </button>
              <button
                onClick={() => handlePrintReport(viewingStudy)}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded"
                title="Download report"
                aria-label="Download report"
              >
                <Download size={18} /> Download
              </button>
            </div>

            {/* Image Display */}
            <div className="flex-1 overflow-auto flex items-center justify-center">
              {/* eslint-disable-next-line react/no-unknown-property */}
              <div className="transform-gpu" style={{ transform: `scale(${zoom / 100})` } as React.CSSProperties}>
                {renderImagePlaceholder(viewingStudy, "DICOM Image Viewer")}
              </div>
            </div>

            {/* Results Section - Findings Panel */}
            <div className="mt-4 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-700">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <FileText className="text-green-400" size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">Radiology Report</h4>
                  <p className="text-xs text-gray-400">Study Results & Findings</p>
                </div>
              </div>
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                <div className="flex items-start gap-3 mb-3">
                  <Info size={16} className="text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-300 mb-1">Study Information</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
                      <div>
                        <span className="text-gray-500">Modality:</span> {viewingStudy.modality}
                      </div>
                      <div>
                        <span className="text-gray-500">Body Part:</span> {viewingStudy.bodyPart}
                      </div>
                      <div>
                        <span className="text-gray-500">Date:</span> {new Date(viewingStudy.date).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span> <span className="text-green-400 font-semibold">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={18} className="text-green-400" />
                  <h5 className="font-semibold text-white">Findings & Interpretation</h5>
                </div>
                <div className="bg-gray-900/30 rounded-lg p-4 border-l-4 border-green-500">
                  <p className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
                    {viewingStudy.findings || "No findings reported."}
                  </p>
                </div>
              </div>
              {viewingStudy.reportUrl && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <a
                    href={viewingStudy.reportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Download size={16} />
                    Download Full Report PDF
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {printPreview && (
        <PrintPreview
          content={printPreview.content}
          title={printPreview.title}
          onClose={() => setPrintPreview(null)}
          onPrint={handlePrintFromPreview}
        />
      )}
    </div>
  );
}
