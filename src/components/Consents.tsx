import { useState, useEffect } from "react";
import {
  FileCheck,
  Plus,
  Search,
  Filter,
  Calendar,
  CheckCircle,
  X,
  Printer,
  Clock,
  Shield,
  FileText,
  Sparkles,
} from "lucide-react";
import { useDashboard } from "../context/DashboardContext";
import { Patient, Consent, ConsentType, ConsentStatus } from "../types";
import UserAssignment from "./UserAssignment";
import { useUsers } from "../hooks/useUsers";
import PrintPreview from "./PrintPreview";
import { openPrintWindow } from "../utils/popupHandler";
import { getOrganizationFooter, getOrganizationDetails } from "../utils/organization";
import { consentsService } from "../services/consents";
import { useToast } from "../context/ToastContext";
import { logger } from "../utils/logger";

interface ConsentsProps {
  patient?: Patient;
}

// Consent Templates
const consentTemplates: Record<ConsentType, {
  title: string;
  description: string;
  procedureName?: string;
  risks: string[];
  benefits: string[];
  alternatives: string[];
}> = {
  procedure: {
    title: "Consent for Medical Procedure",
    description: "I understand that I am consenting to undergo a medical procedure. The procedure, its benefits, risks, and alternatives have been explained to me. I have had the opportunity to ask questions, and all my questions have been answered to my satisfaction.",
    risks: [
      "Bleeding or infection at the procedure site",
      "Allergic reaction to medications or contrast agents",
      "Pain or discomfort during or after the procedure",
      "Need for additional procedures if complications occur"
    ],
    benefits: [
      "Diagnosis or treatment of medical condition",
      "Potential improvement in symptoms",
      "Minimally invasive approach when possible"
    ],
    alternatives: [
      "Conservative management with medications",
      "Alternative diagnostic procedures",
      "No treatment (with monitoring)"
    ]
  },
  surgery: {
    title: "Consent for Surgical Procedure",
    description: "I understand that I am consenting to undergo a surgical procedure. The nature and purpose of the surgery, its benefits, risks, complications, and alternative treatments have been fully explained to me. I understand that no guarantee has been made regarding the results of the surgery.",
    procedureName: "Surgical Procedure",
    risks: [
      "Bleeding requiring transfusion or reoperation",
      "Infection at the surgical site",
      "Blood clots (deep vein thrombosis or pulmonary embolism)",
      "Adverse reaction to anesthesia",
      "Damage to surrounding structures or organs",
      "Scarring or poor wound healing",
      "Need for additional surgery",
      "Death (rare but possible)"
    ],
    benefits: [
      "Treatment or cure of the underlying condition",
      "Relief of symptoms",
      "Improved quality of life",
      "Prevention of disease progression"
    ],
    alternatives: [
      "Non-surgical treatment options",
      "Medical management",
      "Watchful waiting",
      "Alternative surgical approaches"
    ]
  },
  anesthesia: {
    title: "Consent for Anesthesia",
    description: "I understand that anesthesia will be administered for my procedure. The type of anesthesia, its risks, benefits, and alternatives have been explained to me by the anesthesiologist. I understand that anesthesia involves risks and complications.",
    procedureName: "Anesthesia Administration",
    risks: [
      "Allergic reaction to anesthetic agents",
      "Nausea and vomiting after anesthesia",
      "Sore throat or hoarseness (from breathing tube)",
      "Dental injury",
      "Awareness during surgery (rare)",
      "Nerve injury from positioning",
      "Respiratory complications",
      "Cardiac complications",
      "Death (rare but possible)"
    ],
    benefits: [
      "Pain-free procedure",
      "Patient comfort during surgery",
      "Optimal conditions for surgeon",
      "Amnesia of the procedure"
    ],
    alternatives: [
      "Local anesthesia only",
      "Regional anesthesia (spinal/epidural)",
      "Conscious sedation",
      "General anesthesia"
    ]
  },
  blood_transfusion: {
    title: "Consent for Blood Transfusion",
    description: "I understand that a blood transfusion may be necessary during my treatment. The risks, benefits, and alternatives to blood transfusion have been explained to me. I consent to receiving blood products if medically necessary.",
    procedureName: "Blood Transfusion",
    risks: [
      "Allergic reaction to blood products",
      "Transmission of infectious diseases (HIV, hepatitis - extremely rare with modern screening)",
      "Hemolytic reaction (destruction of red blood cells)",
      "Transfusion-related acute lung injury (TRALI)",
      "Fever or chills",
      "Volume overload",
      "Iron overload with repeated transfusions"
    ],
    benefits: [
      "Restoration of blood volume",
      "Improved oxygen delivery to tissues",
      "Correction of anemia",
      "Support during surgery or treatment"
    ],
    alternatives: [
      "Autologous blood donation (donating your own blood)",
      "Bloodless surgery techniques",
      "Medications to increase blood production",
      "Delaying procedure if medically safe"
    ]
  },
  imaging_contrast: {
    title: "Consent for Imaging with Contrast",
    description: "I understand that contrast material (dye) will be injected to enhance the imaging study. The risks, benefits, and alternatives have been explained to me. I understand that contrast agents can cause allergic reactions and kidney problems.",
    procedureName: "Contrast-Enhanced Imaging",
    risks: [
      "Allergic reaction to contrast material (mild to severe)",
      "Kidney damage (contrast-induced nephropathy)",
      "Extravasation (contrast leaking into tissue)",
      "Thyroid dysfunction (with iodine-based contrast)",
      "Nausea or vomiting",
      "Metallic taste in mouth"
    ],
    benefits: [
      "Improved image quality and diagnostic accuracy",
      "Better visualization of blood vessels and organs",
      "More accurate diagnosis",
      "Detection of abnormalities not visible without contrast"
    ],
    alternatives: [
      "Imaging without contrast",
      "Alternative imaging modalities (MRI, ultrasound)",
      "Non-contrast CT scan",
      "Other diagnostic tests"
    ]
  },
  research: {
    title: "Consent for Research Participation",
    description: "I understand that I am being asked to participate in a research study. The purpose, procedures, risks, benefits, and alternatives have been explained to me. I understand that participation is voluntary and I may withdraw at any time.",
    procedureName: "Research Study",
    risks: [
      "Side effects from investigational treatments",
      "Time commitment for study visits",
      "Potential for no direct benefit",
      "Unknown long-term effects",
      "Privacy concerns with data sharing"
    ],
    benefits: [
      "Access to potentially beneficial treatment",
      "Contribution to medical knowledge",
      "Close monitoring during study",
      "Potential improvement in condition"
    ],
    alternatives: [
      "Standard treatment outside of research",
      "Other available treatments",
      "No treatment",
      "Participation in different research study"
    ]
  },
  photography: {
    title: "Consent for Medical Photography",
    description: "I understand that photographs or videos may be taken for medical documentation, treatment planning, or educational purposes. I consent to the use of these images for medical purposes as explained.",
    procedureName: "Medical Photography",
    risks: [
      "Privacy concerns",
      "Potential for unauthorized use (though protected by HIPAA)",
      "Identification in images"
    ],
    benefits: [
      "Accurate documentation of condition",
      "Treatment planning and monitoring",
      "Medical education and training",
      "Comparison over time"
    ],
    alternatives: [
      "Written documentation only",
      "No photography",
      "Limited photography with restrictions"
    ]
  },
  other: {
    title: "Consent for Treatment",
    description: "I understand that I am consenting to receive medical treatment. The nature of the treatment, its benefits, risks, and alternatives have been explained to me. I have had the opportunity to ask questions.",
    risks: [
      "Side effects or complications",
      "Allergic reactions",
      "Treatment failure",
      "Need for additional treatment"
    ],
    benefits: [
      "Treatment of medical condition",
      "Symptom relief",
      "Improved health outcomes"
    ],
    alternatives: [
      "Alternative treatments",
      "Conservative management",
      "No treatment"
    ]
  }
};

export default function Consents({ patient }: ConsentsProps) {
  const { selectedPatient, addTimelineEvent } = useDashboard();
  const currentPatient = patient || selectedPatient;
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | ConsentType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | ConsentStatus>("all");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedConsent, setSelectedConsent] = useState<Consent | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [printPreview, setPrintPreview] = useState<{ content: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { users } = useUsers();
  const [consents, setConsents] = useState<Consent[]>([]);

  // Load consents from API when patient changes
  useEffect(() => {
    const loadConsents = async () => {
      if (!currentPatient?.id) {
        setConsents([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await consentsService.getPatientConsents(currentPatient.id);
        if (response.data) {
          // Transform API data to match Consent interface
          const transformedConsents: Consent[] = response.data.map((consent: any) => ({
            id: consent.id,
            date: typeof consent.date === 'string' ? consent.date.split('T')[0] : consent.date,
            type: consent.type,
            title: consent.title,
            description: consent.description,
            status: consent.status,
            procedureName: consent.procedureName,
            risks: consent.risks || [],
            benefits: consent.benefits || [],
            alternatives: consent.alternatives || [],
            signedBy: consent.signedBy,
            signedById: consent.signedById,
            witnessName: consent.witnessName,
            witnessId: consent.witnessId,
            physicianName: consent.physicianName || consent.physician?.firstName + " " + consent.physician?.lastName,
            physicianId: consent.physicianId || consent.physician?.id,
            signedDate: consent.signedDate ? (typeof consent.signedDate === 'string' ? consent.signedDate.split('T')[0] : consent.signedDate) : undefined,
            signedTime: consent.signedTime,
            expirationDate: consent.expirationDate ? (typeof consent.expirationDate === 'string' ? consent.expirationDate.split('T')[0] : consent.expirationDate) : undefined,
            notes: consent.notes,
            digitalSignature: consent.digitalSignature,
            printedSignature: consent.printedSignature,
          }));
          setConsents(transformedConsents);
        }
      } catch (error) {
        logger.error("Failed to load consents:", error);
        toast.error("Failed to load consents");
        // Fallback to patient data if API fails
        if (currentPatient?.consents) {
          setConsents(currentPatient.consents);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadConsents();
  }, [currentPatient?.id, toast]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "procedure" as ConsentType,
    title: "",
    description: "",
    procedureName: "",
    risks: [] as string[],
    benefits: [] as string[],
    alternatives: [] as string[],
    physicianId: null as string | null,
    expirationDate: "",
    notes: "",
    currentRisk: "",
    currentBenefit: "",
    currentAlternative: "",
  });

  const filteredConsents = consents.filter((consent) => {
    const matchesSearch =
      consent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consent.procedureName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || consent.type === typeFilter;
    const matchesStatus = statusFilter === "all" || consent.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: ConsentStatus) => {
    switch (status) {
      case "signed":
        return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400";
      case "declined":
        return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400";
      case "expired":
        return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400";
      case "revoked":
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: ConsentType) => {
    return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const handleTemplateSelect = (templateType: ConsentType) => {
    const template = consentTemplates[templateType];
    setFormData({
      ...formData,
      type: templateType,
      title: template.title,
      description: template.description,
      procedureName: template.procedureName || "",
      risks: [...template.risks],
      benefits: [...template.benefits],
      alternatives: [...template.alternatives],
      currentRisk: "",
      currentBenefit: "",
      currentAlternative: "",
    });
  };

  const handleAddConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPatient?.id) {
      toast.error("No patient selected");
      return;
    }

    // Optimistic update
    const tempConsent: Consent = {
      id: `temp-${Date.now()}`,
      date: formData.date,
      type: formData.type,
      title: formData.title,
      description: formData.description,
      status: "pending",
      procedureName: formData.procedureName || undefined,
      risks: formData.risks.length > 0 ? formData.risks : undefined,
      benefits: formData.benefits.length > 0 ? formData.benefits : undefined,
      alternatives: formData.alternatives.length > 0 ? formData.alternatives : undefined,
      physicianName: formData.physicianId ? users.find(u => u.id === formData.physicianId)?.firstName + " " + users.find(u => u.id === formData.physicianId)?.lastName : undefined,
      physicianId: formData.physicianId || undefined,
      expirationDate: formData.expirationDate || undefined,
      notes: formData.notes || undefined,
    };

    setConsents([tempConsent, ...consents]);

    try {
      const response = await consentsService.createConsent(currentPatient.id, {
        date: formData.date,
        type: formData.type,
        title: formData.title,
        description: formData.description,
        status: "pending",
        procedureName: formData.procedureName || undefined,
        risks: formData.risks.length > 0 ? formData.risks : undefined,
        benefits: formData.benefits.length > 0 ? formData.benefits : undefined,
        alternatives: formData.alternatives.length > 0 ? formData.alternatives : undefined,
        physicianId: formData.physicianId || undefined,
        expirationDate: formData.expirationDate || undefined,
        notes: formData.notes || undefined,
      });

      if (response.data) {
        // Replace temp consent with real one
        const realConsent: Consent = {
          id: response.data.id,
          date: typeof response.data.date === 'string' ? response.data.date.split('T')[0] : response.data.date,
          type: response.data.type,
          title: response.data.title,
          description: response.data.description,
          status: response.data.status,
          procedureName: response.data.procedureName,
          risks: response.data.risks || [],
          benefits: response.data.benefits || [],
          alternatives: response.data.alternatives || [],
          physicianName: response.data.physicianName || ((response.data as any).physician ? `${(response.data as any).physician.firstName} ${(response.data as any).physician.lastName}` : undefined),
          physicianId: response.data.physicianId || (response.data as any).physician?.id,
          expirationDate: response.data.expirationDate ? (typeof response.data.expirationDate === 'string' ? response.data.expirationDate.split('T')[0] : response.data.expirationDate) : undefined,
          notes: response.data.notes,
        };
        setConsents(prev => prev.map(c => c.id === tempConsent.id ? realConsent : c));
        
        addTimelineEvent(currentPatient.id, {
          date: realConsent.date,
          type: "consent",
          title: realConsent.title,
          description: `Status: ${realConsent.status}`,
          icon: "file-check",
        });
        
        toast.success("Consent created successfully");
      }
    } catch (error) {
      // Rollback on error
      setConsents(prev => prev.filter(c => c.id !== tempConsent.id));
      logger.error("Failed to create consent:", error);
      toast.error("Failed to create consent");
      return;
    }

    setFormData({
      date: new Date().toISOString().split("T")[0],
      type: "procedure",
      title: "",
      description: "",
      procedureName: "",
      risks: [],
      benefits: [],
      alternatives: [],
      physicianId: null,
      expirationDate: "",
      notes: "",
      currentRisk: "",
      currentBenefit: "",
      currentAlternative: "",
    });
    setShowAddForm(false);
  };

  const handleSignConsent = async (consentId: string) => {
    if (!currentPatient?.id) {
      toast.error("No patient selected");
      return;
    }

    const consent = consents.find(c => c.id === consentId);
    if (!consent) return;

    // Optimistic update
    const updatedConsent = {
      ...consent,
      status: "signed" as ConsentStatus,
      signedBy: currentPatient?.name,
      signedDate: new Date().toISOString().split("T")[0],
      signedTime: new Date().toTimeString().slice(0, 5),
    };
    setConsents(consents.map(c => c.id === consentId ? updatedConsent : c));

    try {
      await consentsService.updateConsent(currentPatient.id, consentId, {
        status: "signed",
        signedBy: currentPatient?.name,
        signedDate: new Date().toISOString().split("T")[0],
        signedTime: new Date().toTimeString().slice(0, 5),
      });
      toast.success("Consent signed successfully");
      setShowDetailsModal(false);
    } catch (error) {
      // Rollback on error
      setConsents(consents);
      logger.error("Failed to sign consent:", error);
      toast.error("Failed to sign consent");
    }
  };

  const handlePrintFromPreview = () => {
    if (!printPreview) return;
    openPrintWindow(printPreview.content, printPreview.title);
  };

  const handlePrint = (consent: Consent) => {
    const orgDetails = getOrganizationDetails();
    const orgFooter = getOrganizationFooter();

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Consent Form - ${consent.title}</title>
          <style>
            @page { margin: 1in; size: letter; }
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
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
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .info-item { padding: 10px; background: #f9fafb; border-radius: 4px; }
            .info-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
            .info-value { font-size: 14px; font-weight: 600; color: #111827; }
            .section { margin: 30px 0; }
            .section-title { font-size: 16px; font-weight: 600; color: #1e40af; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
            .content { background: #f9fafb; padding: 15px; border-radius: 4px; margin: 20px 0; white-space: pre-wrap; }
            .list-item { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .signature-section { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; }
            .signature-line { margin-top: 60px; border-top: 1px solid #333; padding-top: 5px; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center; }
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
            <h1>INFORMED CONSENT</h1>
            <h2>${consent.title}</h2>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Patient Name</div>
              <div class="info-value">${currentPatient?.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Date</div>
              <div class="info-value">${new Date(consent.date).toLocaleDateString()}</div>
            </div>
            ${consent.procedureName ? `
            <div class="info-item">
              <div class="info-label">Procedure</div>
              <div class="info-value">${consent.procedureName}</div>
            </div>
            ` : ""}
            <div class="info-item">
              <div class="info-label">Consent Type</div>
              <div class="info-value">${getTypeLabel(consent.type)}</div>
            </div>
            ${consent.physicianName ? `
            <div class="info-item">
              <div class="info-label">Physician</div>
              <div class="info-value">${consent.physicianName}</div>
            </div>
            ` : ""}
            <div class="info-item">
              <div class="info-label">Status</div>
              <div class="info-value">${consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}</div>
            </div>
          </div>
          <div class="section">
            <div class="section-title">Description</div>
            <div class="content">${consent.description}</div>
          </div>
          ${consent.risks && consent.risks.length > 0 ? `
          <div class="section">
            <div class="section-title">Risks</div>
            ${consent.risks.map(risk => `<div class="list-item">• ${risk}</div>`).join('')}
          </div>
          ` : ""}
          ${consent.benefits && consent.benefits.length > 0 ? `
          <div class="section">
            <div class="section-title">Benefits</div>
            ${consent.benefits.map(benefit => `<div class="list-item">• ${benefit}</div>`).join('')}
          </div>
          ` : ""}
          ${consent.alternatives && consent.alternatives.length > 0 ? `
          <div class="section">
            <div class="section-title">Alternatives</div>
            ${consent.alternatives.map(alt => `<div class="list-item">• ${alt}</div>`).join('')}
          </div>
          ` : ""}
          ${consent.status === "signed" ? `
          <div class="signature-section">
            <div class="signature-line">
              <div class="info-label">Patient Signature</div>
              <div class="info-value">${consent.signedBy || currentPatient?.name}</div>
              ${consent.signedDate ? `<div class="info-label" style="margin-top: 10px;">Date: ${new Date(consent.signedDate).toLocaleDateString()}</div>` : ""}
            </div>
          </div>
          ` : ""}
          <div class="footer">
            ${orgFooter}<br>
            Generated: ${new Date().toLocaleString()}<br>
            This is an official informed consent document. Confidential medical information.
          </div>
        </body>
      </html>
    `;

    // Show print preview instead of printing directly
    setPrintPreview({
      content: printContent,
      title: `Consent Form - ${consent.title}`
    });
  };

  if (!currentPatient) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg font-medium mb-2">No Patient Selected</p>
        <p className="text-sm">Please select a patient to view consents.</p>
      </div>
    );
  }

  return (
    <div className="section-spacing">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <FileCheck className="text-primary-600 dark:text-primary-400" size={24} />
            Consents
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage consent forms for {currentPatient.name}
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          New Consent
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search consents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ConsentType)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="procedure">Procedure</option>
              <option value="surgery">Surgery</option>
              <option value="anesthesia">Anesthesia</option>
              <option value="blood_transfusion">Blood Transfusion</option>
              <option value="imaging_contrast">Imaging Contrast</option>
              <option value="research">Research</option>
              <option value="photography">Photography</option>
              <option value="other">Other</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ConsentStatus)}
              className="px-4 py-2.5 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="signed">Signed</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
        </div>
      </div>

      {/* Consents List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-4">
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredConsents.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <FileCheck size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-medium mb-2">No Consents Found</p>
            <p className="text-sm">
              {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "No consent forms have been created for this patient"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredConsents.map((consent) => (
              <div
                key={consent.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {consent.title}
                      </h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400">
                        {getTypeLabel(consent.type)}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(consent.status)}`}>
                        {consent.status.charAt(0).toUpperCase() + consent.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{consent.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(consent.date).toLocaleDateString()}
                      </span>
                      {consent.procedureName && (
                        <span className="flex items-center gap-1">
                          <Shield size={14} />
                          {consent.procedureName}
                        </span>
                      )}
                      {consent.signedDate && (
                        <span className="flex items-center gap-1">
                          <CheckCircle size={14} />
                          Signed: {new Date(consent.signedDate).toLocaleDateString()}
                        </span>
                      )}
                      {consent.expirationDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Expires: {new Date(consent.expirationDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedConsent(consent);
                        setShowDetailsModal(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm font-medium"
                    >
                      <FileCheck size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handlePrint(consent)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      <Printer size={16} />
                      Print
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Consent Modal */}
      {showAddForm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddForm(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Consent Form</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Create informed consent documentation</p>
              </div>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddConsent} className="p-6 space-y-5">
              {/* Consent Templates */}
              <div>
                <label className="block text-base font-medium mb-2.5 flex items-center gap-2">
                  <Sparkles size={18} className="text-primary-600 dark:text-primary-400" />
                  Quick Templates
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                  {Object.entries(consentTemplates).map(([type, template]) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleTemplateSelect(type as ConsentType)}
                      className="p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors bg-white dark:bg-gray-800"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileText size={14} className="text-primary-600 dark:text-primary-400" />
                        <span className="font-medium text-xs text-gray-900 dark:text-gray-100">
                          {getTypeLabel(type as ConsentType)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                        {template.title}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Click a template to pre-fill the form. You can modify any fields after selecting.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-medium mb-2.5">Date <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    max={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-base font-medium mb-2.5">Consent Type <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as ConsentType })}
                    className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="procedure">Procedure</option>
                    <option value="surgery">Surgery</option>
                    <option value="anesthesia">Anesthesia</option>
                    <option value="blood_transfusion">Blood Transfusion</option>
                    <option value="imaging_contrast">Imaging Contrast</option>
                    <option value="research">Research</option>
                    <option value="photography">Photography</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Consent for Colonoscopy"
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Procedure Name (Optional)</label>
                <input
                  type="text"
                  value={formData.procedureName}
                  onChange={(e) => setFormData({ ...formData, procedureName: e.target.value })}
                  placeholder="Procedure name..."
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Description <span className="text-red-500">*</span></label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the procedure or treatment..."
                  rows={4}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div>
                <UserAssignment
                  assignedTo={formData.physicianId}
                  allowedRoles={["physician", "nurse_practitioner", "physician_assistant"]}
                  label="Physician (Optional)"
                  placeholder="Select physician..."
                  onAssign={(userId) => setFormData({ ...formData, physicianId: userId })}
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Risks (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentRisk}
                      onChange={(e) => setFormData({ ...formData, currentRisk: e.target.value })}
                      placeholder="Enter a risk..."
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentRisk.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            risks: [...formData.risks, formData.currentRisk.trim()],
                            currentRisk: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentRisk.trim()) {
                          setFormData({
                            ...formData,
                            risks: [...formData.risks, formData.currentRisk.trim()],
                            currentRisk: "",
                          });
                        }
                      }}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                  {formData.risks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.risks.map((risk, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg text-sm"
                        >
                          {risk}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                risks: formData.risks.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-red-700 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Benefits (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentBenefit}
                      onChange={(e) => setFormData({ ...formData, currentBenefit: e.target.value })}
                      placeholder="Enter a benefit..."
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentBenefit.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            benefits: [...formData.benefits, formData.currentBenefit.trim()],
                            currentBenefit: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentBenefit.trim()) {
                          setFormData({
                            ...formData,
                            benefits: [...formData.benefits, formData.currentBenefit.trim()],
                            currentBenefit: "",
                          });
                        }
                      }}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                  {formData.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.benefits.map((benefit, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm"
                        >
                          {benefit}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                benefits: formData.benefits.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-green-700 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Alternatives (Optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.currentAlternative}
                      onChange={(e) => setFormData({ ...formData, currentAlternative: e.target.value })}
                      placeholder="Enter an alternative..."
                      className="flex-1 px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && formData.currentAlternative.trim()) {
                          e.preventDefault();
                          setFormData({
                            ...formData,
                            alternatives: [...formData.alternatives, formData.currentAlternative.trim()],
                            currentAlternative: "",
                          });
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (formData.currentAlternative.trim()) {
                          setFormData({
                            ...formData,
                            alternatives: [...formData.alternatives, formData.currentAlternative.trim()],
                            currentAlternative: "",
                          });
                        }
                      }}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                  {formData.alternatives.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.alternatives.map((alt, idx) => (
                        <span
                          key={idx}
                          className="flex items-center gap-1 px-3 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-lg text-sm"
                        >
                          {alt}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                alternatives: formData.alternatives.filter((_, i) => i !== idx),
                              });
                            }}
                            className="text-teal-700 dark:text-teal-400 hover:text-teal-900 dark:hover:text-blue-300"
                          >
                            <X size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Expiration Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expirationDate}
                  onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-base font-medium mb-2.5">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                  className="w-full px-4 py-3 text-base border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 font-medium text-gray-700 dark:text-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create Consent
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedConsent && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDetailsModal(false);
            }
          }}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Consent Details</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{selectedConsent.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {selectedConsent.status === "pending" && (
                  <button
                    onClick={() => handleSignConsent(selectedConsent.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors"
                  >
                    Sign Consent
                  </button>
                )}
                <button
                  onClick={() => handlePrint(selectedConsent)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Print"
                >
                  <Printer size={20} />
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-teal-50 dark:bg-teal-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="text-teal-600 dark:text-teal-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Date</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(selectedConsent.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="text-purple-600 dark:text-purple-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Type</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {getTypeLabel(selectedConsent.type)}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={16} />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status</span>
                  </div>
                  <p className={`text-sm font-semibold ${getStatusColor(selectedConsent.status)}`}>
                    {selectedConsent.status.charAt(0).toUpperCase() + selectedConsent.status.slice(1)}
                  </p>
                </div>
                {selectedConsent.expirationDate && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="text-orange-600 dark:text-orange-400" size={16} />
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Expires</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {new Date(selectedConsent.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedConsent.description}</p>
              </div>

              {selectedConsent.procedureName && (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Procedure</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{selectedConsent.procedureName}</p>
                </div>
              )}

              {selectedConsent.risks && selectedConsent.risks.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Risks</h4>
                  <ul className="space-y-1">
                    {selectedConsent.risks.map((risk, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-red-600 dark:text-red-400 mt-1">•</span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConsent.benefits && selectedConsent.benefits.length > 0 && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Benefits</h4>
                  <ul className="space-y-1">
                    {selectedConsent.benefits.map((benefit, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-green-600 dark:text-green-400 mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConsent.alternatives && selectedConsent.alternatives.length > 0 && (
                <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Alternatives</h4>
                  <ul className="space-y-1">
                    {selectedConsent.alternatives.map((alt, idx) => (
                      <li key={idx} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-teal-600 dark:text-teal-400 mt-1">•</span>
                        <span>{alt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConsent.signedBy && selectedConsent.signedDate && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Signature</h4>
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Signed by:</span> {selectedConsent.signedBy}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      <span className="font-medium">Date:</span> {new Date(selectedConsent.signedDate).toLocaleDateString()}
                      {selectedConsent.signedTime && ` at ${selectedConsent.signedTime}`}
                    </p>
                    {selectedConsent.witnessName && (
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Witness:</span> {selectedConsent.witnessName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {selectedConsent.notes && (
                <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{selectedConsent.notes}</p>
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

