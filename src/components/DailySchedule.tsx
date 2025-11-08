import { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, User, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { appointmentService } from "../services/appointments";
import { patientService } from "../services/patients";
import { useToast } from "../context/ToastContext";
import { useDashboard } from "../context/DashboardContext";
import { Appointment } from "../types";

// Extended Appointment type for DailySchedule with patient info
interface AppointmentWithPatient extends Appointment {
  patientId?: string;
  patientName?: string;
}

export default function DailySchedule() {
  const { user } = useAuth();
  const { setSelectedPatient, patients, setActiveTab } = useDashboard();
  const toast = useToast();
  const [appointments, setAppointments] = useState<AppointmentWithPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPatientId, setLoadingPatientId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<"all" | "scheduled" | "completed" | "cancelled">("all");


  // Get start and end of selected day
  const getDayRange = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  };

  // Load appointments for the selected date
  useEffect(() => {
    const loadAppointments = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { from, to } = getDayRange(selectedDate);
        const response = await appointmentService.getProviderAppointments(user.id, {
          from,
          to,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        
        // Transform API response to match frontend Appointment type
        const transformedAppointments = (response.data || []).map((apt: any) => {
          const aptDate = new Date(apt.date);
          const dateStr = aptDate.toISOString().split('T')[0];
          const timeStr = apt.time || aptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          
          return {
            id: apt.id,
            date: dateStr,
            time: timeStr,
            type: apt.type,
            provider: apt.provider ? `${apt.provider.firstName} ${apt.provider.lastName}` : 'Unknown',
            status: apt.status,
            notes: apt.notes,
            consultationType: apt.consultationType,
            specialty: apt.specialty,
            duration: apt.duration,
            location: apt.location,
            reason: apt.reason,
            patientId: apt.patient?.id,
            patientName: apt.patient?.name || 'Unknown Patient',
          };
        });
        
        setAppointments(transformedAppointments);
      } catch (error: any) {
        console.error('Failed to load appointments:', error);
        toast.error('Failed to load appointments. Please try again.');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [user?.id, selectedDate, statusFilter, toast]);

  // Group appointments by time
  const appointmentsByTime = useMemo(() => {
    const grouped: Record<string, AppointmentWithPatient[]> = {};
    
    appointments.forEach(apt => {
      const time = apt.time || '00:00';
      if (!grouped[time]) {
        grouped[time] = [];
      }
      grouped[time].push(apt);
    });

    // Sort times
    const sortedTimes = Object.keys(grouped).sort((a, b) => {
      const timeA = a.includes(':') ? a : '00:00';
      const timeB = b.includes(':') ? b : '00:00';
      return timeA.localeCompare(timeB);
    });

    return { grouped, sortedTimes };
  }, [appointments]);

  const handleDateChange = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const handleGoToToday = () => {
    setSelectedDate(new Date());
  };

  const handlePatientClick = async (patientId: string) => {
    if (!patientId) {
      toast.error('Invalid patient ID');
      return;
    }

    setLoadingPatientId(patientId);

    try {
      // First, try to find patient in loaded list
      let patient = patients.find(p => p.id === patientId);
      
      // If patient not in list, fetch from API
      if (!patient) {
        try {
          const response = await patientService.getPatient(patientId);
          patient = response.data;
        } catch (error: any) {
          console.error('Failed to fetch patient:', error);
          toast.error(`Failed to load patient: ${error.message || 'Unknown error'}`);
          setLoadingPatientId(null);
          return;
        }
      }

      if (patient) {
        // Set the selected patient
        setSelectedPatient(patient);
        
        // Switch to Overview tab to show patient details
        setActiveTab('overview');
        
        toast.success(`Viewing ${patient.name}`);
      } else {
        toast.error('Patient not found');
      }
    } catch (error: any) {
      console.error('Error handling patient click:', error);
      toast.error('Failed to load patient. Please try again.');
    } finally {
      setLoadingPatientId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-200 border-teal-200 dark:border-teal-800";
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600";
    }
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const dateDisplay = selectedDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Get time-based greeting
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Get today's appointment stats
  const todayAppointments = useMemo(() => {
    if (!isToday) return null;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const total = appointments.length;
    return { scheduled, completed, total };
  }, [appointments, isToday]);

  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">Please log in to view your schedule</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Compact Welcome Bar - Doctor's Schedule */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-lg px-4 py-2.5 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-3">
          <div className="text-sm font-medium text-teal-900 dark:text-teal-100">
            {getTimeGreeting()}, Dr. {user.firstName} 👋
          </div>
          <span className="text-teal-600 dark:text-teal-400">•</span>
          <div className="text-sm text-teal-700 dark:text-teal-300">
            {isToday 
              ? "Your schedule today"
              : `Your schedule - ${dateDisplay}`
            }
          </div>
          {isToday && todayAppointments && todayAppointments.total > 0 && (
            <>
              <span className="text-teal-600 dark:text-teal-400">•</span>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-teal-700 dark:text-teal-300">
                  {todayAppointments.total} appointments
                </span>
                {todayAppointments.scheduled > 0 && (
                  <span className="text-teal-600 dark:text-teal-400">
                    {todayAppointments.scheduled} scheduled
                  </span>
                )}
                {todayAppointments.completed > 0 && (
                  <span className="text-green-600 dark:text-green-400">
                    {todayAppointments.completed} completed
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <Calendar size={16} className="text-teal-600 dark:text-teal-400" />
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => handleDateChange(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Previous day"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold">{dateDisplay}</div>
            {!isToday && (
              <button
                onClick={handleGoToToday}
                className="text-sm text-teal-600 dark:text-teal-400 hover:underline mt-1"
              >
                Go to Today
              </button>
            )}
          </div>
        </div>

        <button
          onClick={() => handleDateChange(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Next day"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-gray-600 dark:text-gray-400" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Filter:</span>
        <div className="flex gap-2">
          {(["all", "scheduled", "completed", "cancelled"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                statusFilter === status
                  ? "bg-teal-500 text-white"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <Calendar size={48} className="mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No appointments</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {statusFilter === "all" 
              ? `You have no appointments scheduled for ${dateDisplay}`
              : `No ${statusFilter} appointments for ${dateDisplay}`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {appointmentsByTime.sortedTimes.map((time) => (
            <div key={time} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-teal-50 dark:bg-teal-900/20 border-b border-teal-200 dark:border-teal-800 px-4 py-2">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold text-teal-900 dark:text-teal-100">{time}</span>
                  <span className="text-sm text-teal-700 dark:text-teal-300">
                    ({appointmentsByTime.grouped[time].length} {appointmentsByTime.grouped[time].length === 1 ? 'appointment' : 'appointments'})
                  </span>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {appointmentsByTime.grouped[time].map((apt) => (
                  <div
                    key={apt.id}
                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer ${
                      loadingPatientId === apt.patientId ? 'opacity-50 pointer-events-none' : ''
                    }`}
                    onClick={() => apt.patientId && handlePatientClick(apt.patientId)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <User size={16} className="text-gray-600 dark:text-gray-400" />
                          <span className="font-semibold text-lg">
                            {apt.patientName || 'Unknown Patient'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 ml-7">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {apt.type}
                          </span>
                          {apt.location && (
                            <span className="flex items-center gap-1">
                              📍 {apt.location}
                            </span>
                          )}
                          {apt.duration && (
                            <span className="flex items-center gap-1">
                              ⏱️ {apt.duration} min
                            </span>
                          )}
                        </div>
                        {apt.reason && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 ml-7">
                            Reason: {apt.reason}
                          </p>
                        )}
                        {apt.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 ml-7 italic">
                            {apt.notes}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 text-xs rounded-full border ${getStatusColor(apt.status)}`}
                      >
                        {apt.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {appointments.length > 0 && (
        <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-teal-900 dark:text-teal-100 font-medium">
              Total Appointments: {appointments.length}
            </span>
            <div className="flex gap-4 text-teal-700 dark:text-teal-300">
              <span>Scheduled: {appointments.filter(a => a.status === 'scheduled').length}</span>
              <span>Completed: {appointments.filter(a => a.status === 'completed').length}</span>
              <span>Cancelled: {appointments.filter(a => a.status === 'cancelled').length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

