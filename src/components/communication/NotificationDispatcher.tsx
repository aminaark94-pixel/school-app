import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MessageSquare,
  Smartphone,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  RotateCcw,
  QrCode,
  ShieldAlert,
  Sliders,
  Users,
  Search,
  Filter,
  Check,
  X,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Wifi,
  WifiOff,
  Server,
  Play,
  Pause,
  Square,
  FileText,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import { Student, Fee, NotificationChannel, NotificationLog } from '../../types';

interface GatewayStatus {
  connected: boolean;
  status: string;
  clientInfo?: { pushname?: string; number?: string };
  hasQr?: boolean;
}

const DEFAULT_TEMPLATES = [
  {
    id: 'fee_reminder',
    name: 'Fee Defaulter Reminder',
    category: 'Finance',
    text: 'Assalam-o-Alaikum Respected {parent_name},\n\nThis is a gentle reminder from {school_name} regarding pending school tuition dues for {student_name} (Roll No: {roll_number}).\n\n• Payable Amount: PKR {amount}\n• Due Date: {due_date}\n\nPlease clear the fee voucher at your earliest convenience to avoid examination report card blockage.\n\nRegards,\nAccounts & Bursar Office\n{school_name}',
  },
  {
    id: 'absence_alert',
    name: 'Student Absence Notice',
    category: 'Attendance',
    text: 'Dear {parent_name},\n\nYour child {student_name} (Roll No: {roll_number}) has been marked ABSENT today at {school_name}.\n\nPlease ensure regular attendance. Daily homework has been posted on the digital diary feed.\n\nRegards,\nAdministration, {school_name}',
  },
  {
    id: 'exam_datesheet',
    name: 'Exams & Datesheet Advisory',
    category: 'Academics',
    text: 'Dear {parent_name},\n\nMid-Term Examinations for {student_name} will commence shortly at {school_name}.\n\nPlease access the digital portal to review the detailed datesheet, room assignments, and syllabus outlines.\n\nRegards,\nExamination Secretariat\n{school_name}',
  },
  {
    id: 'general_circular',
    name: 'General Holiday / Announcement',
    category: 'General',
    text: 'Respected Parents & Guardians of {school_name},\n\nPlease be informed that school campus will remain closed tomorrow due to official advisory. Online classwork is accessible on the portal.\n\nRegards,\nPrincipal Office, {school_name}',
  },
];

interface NotificationDispatcherProps {
  initialMessageText?: string;
}

export const NotificationDispatcher: React.FC<NotificationDispatcherProps> = ({ initialMessageText }) => {
  const { currentSchool, students, fees } = useSchoolData();

  // 1. Gateway Server URL (defaults to local express server on 5001)
  const [gatewayUrl, setGatewayUrl] = useState(() => {
    return localStorage.getItem('school_sms_gateway_url') || 'http://localhost:5001';
  });
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus>({
    connected: false,
    status: 'CHECKING',
  });
  const [isCheckingGateway, setIsCheckingGateway] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showGatewayConfig, setShowGatewayConfig] = useState(false);

  // Android SMS Gateway direct config
  const [androidSmsUrl, setAndroidSmsUrl] = useState(() => {
    return localStorage.getItem('school_android_sms_url') || '';
  });
  const [textbeeApiKey, setTextbeeApiKey] = useState(() => {
    return localStorage.getItem('school_textbee_api_key') || '';
  });
  const [textbeeDeviceId, setTextbeeDeviceId] = useState(() => {
    return localStorage.getItem('school_textbee_device_id') || '';
  });

  // 2. Audience & Filters
  const [audienceFilter, setAudienceFilter] = useState<'defaulters' | 'all'>('defaulters');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // 3. Channel & Message
  const [channel, setChannel] = useState<NotificationChannel>('whatsapp');
  const [messageTemplate, setMessageTemplate] = useState<string>(() => {
    return initialMessageText || DEFAULT_TEMPLATES[0].text;
  });

  useEffect(() => {
    if (initialMessageText) {
      setMessageTemplate(initialMessageText);
    }
  }, [initialMessageText]);
  const [minDelaySec, setMinDelaySec] = useState<number>(5);
  const [maxDelaySec, setMaxDelaySec] = useState<number>(10);

  // 4. Queue Runner State
  const [isSending, setIsSending] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentQueueIndex, setCurrentQueueIndex] = useState(0);
  const [countdownSeconds, setCountdownSeconds] = useState<number | null>(null);
  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem('sms_notification_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const abortControllerRef = useRef<boolean>(false);
  const isPausedRef = useRef<boolean>(false);
  isPausedRef.current = isPaused;

  // Persist logs
  useEffect(() => {
    try {
      localStorage.setItem('sms_notification_logs_v1', JSON.stringify(logs.slice(-100)));
    } catch {
      /* ignore storage full */
    }
  }, [logs]);

  // Check Gateway Health
  const checkGatewayHealth = async (showModalIfQr = false) => {
    setIsCheckingGateway(true);
    try {
      const res = await fetch(`${gatewayUrl}/api/status`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        setGatewayStatus({
          connected: data.whatsapp?.connected || false,
          status: data.whatsapp?.status || 'UNKNOWN',
          clientInfo: data.whatsapp?.clientInfo,
          hasQr: data.whatsapp?.hasQr,
        });

        // If QR is ready and user opened modal or asked to check
        if (data.whatsapp?.status === 'QR_READY' || data.whatsapp?.hasQr) {
          fetchQrCode();
          if (showModalIfQr) setShowQrModal(true);
        }
      } else {
        setGatewayStatus({ connected: false, status: 'SERVER_ERROR' });
      }
    } catch {
      setGatewayStatus({ connected: false, status: 'OFFLINE' });
    } finally {
      setIsCheckingGateway(false);
    }
  };

  const fetchQrCode = async () => {
    try {
      const res = await fetch(`${gatewayUrl}/api/qr`);
      if (res.ok) {
        const data = await res.json();
        setQrDataUrl(data.qrDataUrl || null);
      }
    } catch {
      setQrDataUrl(null);
    }
  };

  useEffect(() => {
    checkGatewayHealth();
    const interval = setInterval(() => {
      checkGatewayHealth();
    }, 12000);
    return () => clearInterval(interval);
  }, [gatewayUrl]);

  // Save Settings
  const handleSaveGatewaySettings = () => {
    localStorage.setItem('school_sms_gateway_url', gatewayUrl);
    localStorage.setItem('school_android_sms_url', androidSmsUrl);
    localStorage.setItem('school_textbee_api_key', textbeeApiKey);
    localStorage.setItem('school_textbee_device_id', textbeeDeviceId);
    setShowGatewayConfig(false);
    checkGatewayHealth();
  };

  // Build Target Recipients
  const availableRecipients = useMemo(() => {
    const feeMap = new Map<string, Fee>();
    fees.forEach((f) => feeMap.set(f.student_id, f));

    return students.map((std) => {
      const fee = feeMap.get(std.id);
      const isDefaulter = fee ? fee.status === 'pending' : false;
      const phone = std.parent_phone || '+92 300 4819283';

      return {
        student: std,
        fee,
        isDefaulter,
        phone,
      };
    });
  }, [students, fees]);

  // Filtered Recipients
  const filteredRecipients = useMemo(() => {
    return availableRecipients.filter((item) => {
      if (audienceFilter === 'defaulters' && !item.isDefaulter) return false;
      if (selectedClass !== 'all' && item.student.class_id !== selectedClass) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.student.name.toLowerCase().includes(q);
        const matchesParent = (item.student.parent_name || '').toLowerCase().includes(q);
        const matchesRoll = item.student.roll_number.toLowerCase().includes(q);
        if (!matchesName && !matchesParent && !matchesRoll) return false;
      }
      return true;
    });
  }, [availableRecipients, audienceFilter, selectedClass, searchQuery]);

  // Auto select filtered recipients on filter change
  useEffect(() => {
    setSelectedStudentIds(new Set(filteredRecipients.map((r) => r.student.id)));
  }, [audienceFilter, selectedClass]);

  const toggleSelectAll = () => {
    if (selectedStudentIds.size === filteredRecipients.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(filteredRecipients.map((r) => r.student.id)));
    }
  };

  const toggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  // Render Template with Placeholder Variables
  const renderMessage = (template: string, student: Student, fee?: Fee): string => {
    const parentName = student.parent_name || 'Respected Guardian';
    const schoolName = currentSchool?.name || 'School';
    const amount = fee ? fee.amount.toLocaleString() : '12,500';
    const dueDate = fee?.due_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

    return template
      .replace(/{parent_name}/g, parentName)
      .replace(/{student_name}/g, student.name)
      .replace(/{roll_number}/g, student.roll_number)
      .replace(/{school_name}/g, schoolName)
      .replace(/{amount}/g, amount)
      .replace(/{due_date}/g, dueDate);
  };

  // First selected recipient for preview
  const previewRecipient = useMemo(() => {
    const first = filteredRecipients.find((r) => selectedStudentIds.has(r.student.id)) || filteredRecipients[0];
    if (!first) return null;
    return {
      student: first.student,
      fee: first.fee,
      phone: first.phone,
      renderedText: renderMessage(messageTemplate, first.student, first.fee),
    };
  }, [filteredRecipients, selectedStudentIds, messageTemplate, currentSchool]);

  // Insert Variable into Message
  const insertVariable = (variable: string) => {
    setMessageTemplate((prev) => prev + ` {${variable}} `);
  };

  // Queue Dispatcher Execution
  const handleStartQueue = async () => {
    const recipientsToSend = filteredRecipients.filter((r) => selectedStudentIds.has(r.student.id));

    if (recipientsToSend.length === 0) {
      alert('Please select at least one recipient to broadcast.');
      return;
    }

    if (!messageTemplate.trim()) {
      alert('Please write a message or select a template.');
      return;
    }

    abortControllerRef.current = false;
    setIsSending(true);
    setIsPaused(false);
    setCurrentQueueIndex(0);

    for (let i = 0; i < recipientsToSend.length; i++) {
      if (abortControllerRef.current) break;

      // Check Pause state
      while (isPausedRef.current) {
        await new Promise((res) => setTimeout(res, 500));
        if (abortControllerRef.current) break;
      }
      if (abortControllerRef.current) break;

      setCurrentQueueIndex(i + 1);
      const item = recipientsToSend[i];
      const rendered = renderMessage(messageTemplate, item.student, item.fee);

      const logId = `log-${Date.now()}-${item.student.id}`;
      const newLog: NotificationLog = {
        id: logId,
        school_id: currentSchool?.id || 'school-apex',
        recipient_name: item.student.parent_name || 'Guardian',
        student_name: item.student.name,
        phone_number: item.phone,
        channel,
        message: rendered,
        status: 'sending',
        retry_count: 0,
      };

      setLogs((prev) => [newLog, ...prev]);

      // Execute Send API Call
      let isSuccess = false;
      let errorMsg = '';

      try {
        if (channel === 'whatsapp' || channel === 'both') {
          const res = await fetch(`${gatewayUrl}/api/send-whatsapp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: item.phone,
              message: rendered,
            }),
          });
          const json = await res.json();
          if (json.success) {
            isSuccess = true;
          } else {
            errorMsg = json.error || 'WhatsApp delivery failed';
          }
        }

        if ((channel === 'sms' || channel === 'both') && (!isSuccess || channel === 'both')) {
          const res = await fetch(`${gatewayUrl}/api/send-sms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              number: item.phone,
              message: rendered,
              gatewayUrl: androidSmsUrl || undefined,
              apiKey: textbeeApiKey || undefined,
              deviceId: textbeeDeviceId || undefined,
            }),
          });
          const json = await res.json();
          if (json.success) {
            isSuccess = true;
          } else if (!errorMsg) {
            errorMsg = json.error || 'SMS relay failed';
          }
        }
      } catch (err: unknown) {
        // Fallback simulation mode if local server is not running
        const error = err as Error;
        if (gatewayStatus.status === 'OFFLINE') {
          isSuccess = true; // simulated in offline dev
          errorMsg = 'Simulated Delivery (Connect Node.js gateway server on port 5001 for live dispatch)';
        } else {
          errorMsg = error.message || 'Network error';
        }
      }

      // Update Log
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? {
                ...l,
                status: isSuccess ? 'sent' : 'failed',
                sent_at: isSuccess ? new Date().toISOString() : undefined,
                error: errorMsg || undefined,
              }
            : l
        )
      );

      // Anti-Ban Delay: wait random 5 to 10 seconds before sending next message (unless it's the last message)
      if (i < recipientsToSend.length - 1 && !abortControllerRef.current) {
        const randomSeconds = Math.floor(Math.random() * (maxDelaySec - minDelaySec + 1)) + minDelaySec;
        for (let s = randomSeconds; s > 0; s--) {
          if (abortControllerRef.current) break;
          while (isPausedRef.current) {
            await new Promise((res) => setTimeout(res, 500));
            if (abortControllerRef.current) break;
          }
          setCountdownSeconds(s);
          await new Promise((res) => setTimeout(res, 1000));
        }
        setCountdownSeconds(null);
      }
    }

    setIsSending(false);
    setIsPaused(false);
    setCountdownSeconds(null);
  };

  const handleStopQueue = () => {
    abortControllerRef.current = true;
    setIsSending(false);
    setIsPaused(false);
    setCountdownSeconds(null);
  };

  // Retry Failed
  const handleRetryFailed = () => {
    const failedStudentNames = new Set(logs.filter((l) => l.status === 'failed').map((l) => l.student_name));
    const failedRecipientIds = filteredRecipients
      .filter((r) => failedStudentNames.has(r.student.name))
      .map((r) => r.student.id);

    if (failedRecipientIds.length === 0) {
      alert('No failed messages found to retry.');
      return;
    }

    setSelectedStudentIds(new Set(failedRecipientIds));
    alert(`Selected ${failedRecipientIds.length} failed recipients. Click "Start Broadcast" to retry.`);
  };

  const clearLogs = () => {
    if (confirm('Clear all notification transmission logs?')) {
      setLogs([]);
    }
  };

  const uniqueClasses = Array.from(new Set(students.map((s) => s.class_id))).sort();

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Gateway Status */}
      <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#200E01] font-['Cinzel',serif]">
                  WhatsApp &amp; SMS Broadcast Desk
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Zero Cost
                </span>
              </div>
              <p className="text-xs text-[#5B0202]/70 mt-1 max-w-2xl">
                Send fee vouchers, attendance alerts, and exam datesheets directly to parents' WhatsApp &amp; SMS using your
                own phone and free Node.js WhatsApp Web gateway.
              </p>
            </div>
          </div>

          {/* Connection Status Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {gatewayStatus.connected ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>WhatsApp: {gatewayStatus.clientInfo?.pushname || 'Connected'}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  checkGatewayHealth(true);
                  setShowQrModal(true);
                }}
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold hover:bg-amber-100 transition shadow-2xs"
              >
                <QrCode className="w-4 h-4 text-amber-700" />
                <span>Link WhatsApp (Scan QR)</span>
              </button>
            )}

            <button
              onClick={() => setShowGatewayConfig(!showGatewayConfig)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
            >
              <Sliders className="w-4 h-4 text-slate-600" />
              <span>Gateway Config</span>
            </button>
          </div>
        </div>

        {/* Gateway Config Drawer */}
        {showGatewayConfig && (
          <div className="mt-4 pt-4 border-t border-[#EDE7C7] space-y-4 animate-in fade-in">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#5B0202]">
              Microservice Connection &amp; Android Phone Gateway Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5B0202]/80 mb-1">
                  Node.js Server URL
                </label>
                <input
                  type="text"
                  value={gatewayUrl}
                  onChange={(e) => setGatewayUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#EDE7C7] bg-[#FAF8F2]"
                  placeholder="http://localhost:5001"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5B0202]/80 mb-1">
                  Android HTTP Gateway URL (Optional)
                </label>
                <input
                  type="text"
                  value={androidSmsUrl}
                  onChange={(e) => setAndroidSmsUrl(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#EDE7C7] bg-[#FAF8F2]"
                  placeholder="e.g. http://192.168.1.50:8080"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wide text-[#5B0202]/80 mb-1">
                  TextBee Device ID / Key (Optional)
                </label>
                <input
                  type="text"
                  value={textbeeApiKey}
                  onChange={(e) => setTextbeeApiKey(e.target.value)}
                  className="w-full text-xs font-mono p-2.5 rounded-xl border border-[#EDE7C7] bg-[#FAF8F2]"
                  placeholder="TextBee API Key"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => checkGatewayHealth()}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
              >
                Test Ping
              </button>
              <button
                onClick={handleSaveGatewaySettings}
                className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000]"
              >
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. QR Code Pairing Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#EDE7C7] shadow-2xl animate-in zoom-in-95 text-center">
            <div className="flex items-center justify-between pb-3 border-b border-[#EDE7C7]">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-emerald-700" />
                <h3 className="text-base font-bold text-[#200E01]">Link WhatsApp Account</h3>
              </div>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-slate-700 font-bold">
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5B0202]/80 text-left">
              1. Open <b>WhatsApp</b> on your mobile phone.<br />
              2. Tap <b>Linked Devices &gt; Link a Device</b>.<br />
              3. Point your camera at this QR code to log in:
            </p>

            <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-emerald-300 flex items-center justify-center min-h-[220px]">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="WhatsApp QR Code" className="w-52 h-52 object-contain" />
              ) : gatewayStatus.connected ? (
                <div className="space-y-2 text-emerald-700">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
                  <p className="font-bold text-sm">WhatsApp Already Linked &amp; Ready!</p>
                </div>
              ) : (
                <div className="space-y-3 py-6">
                  <Server className="w-10 h-10 mx-auto text-slate-400 animate-bounce" />
                  <p className="text-xs text-slate-500 font-medium">
                    Waiting for QR code from Gateway server...
                  </p>
                  <p className="text-[11px] font-mono bg-slate-100 p-2 rounded-lg text-slate-700">
                    Make sure to run: <b>cd server &amp;&amp; npm start</b>
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => fetchQrCode()}
                className="text-xs font-bold text-emerald-700 hover:underline inline-flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Refresh QR
              </button>
              <button
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000]"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Operations Grid (Left: Audience & Template | Right: Preview & Queue Control) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Recipients & Message Composer */}
        <div className="lg:col-span-7 space-y-5">
          {/* Audience Filter Bar */}
          <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#200E01] font-['Cinzel',serif] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#8B0000]" />
                1. Select Target Parents
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                {selectedStudentIds.size} of {filteredRecipients.length} Selected
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setAudienceFilter('defaulters')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  audienceFilter === 'defaulters'
                    ? 'bg-[#8B0000] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Fee Defaulters Only
              </button>

              <button
                onClick={() => setAudienceFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  audienceFilter === 'all'
                    ? 'bg-[#8B0000] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                All Enrolled Students
              </button>

              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs font-bold p-1.5 rounded-xl border border-[#EDE7C7] bg-[#FAF8F2] ml-auto"
              >
                <option value="all">All Classes</option>
                {uniqueClasses.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Recipient Quick Checklist */}
            <div className="max-h-48 overflow-y-auto divide-y divide-[#EDE7C7]/60 border border-[#EDE7C7] rounded-2xl bg-[#FAF8F2]/60">
              <div className="p-2.5 bg-[#FAF8F2] flex items-center justify-between text-[11px] font-bold text-[#5B0202]">
                <button onClick={toggleSelectAll} className="hover:underline flex items-center gap-1">
                  <span>Toggle Select All ({filteredRecipients.length})</span>
                </button>
                <span>Status &amp; Contact</span>
              </div>
              {filteredRecipients.map((item) => {
                const isSelected = selectedStudentIds.has(item.student.id);
                return (
                  <div
                    key={item.student.id}
                    onClick={() => toggleStudent(item.student.id)}
                    className="p-2.5 flex items-center justify-between text-xs hover:bg-white cursor-pointer transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-[#8B0000] focus:ring-[#8B0000]"
                      />
                      <div className="truncate">
                        <span className="font-bold text-[#200E01]">{item.student.name}</span>
                        <span className="text-[11px] text-[#5B0202]/60 ml-1.5">
                          ({item.student.parent_name || 'Guardian'})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.isDefaulter && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700">
                          Fee Due: PKR {item.fee?.amount.toLocaleString()}
                        </span>
                      )}
                      <span className="font-mono text-[11px] text-slate-500">{item.phone}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message Composer & Template Selector */}
          <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#200E01] font-['Cinzel',serif] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8B0000]" />
                2. Message Composer &amp; Templates
              </h3>
              {/* Channel Selector */}
              <div className="inline-flex rounded-xl p-0.5 bg-slate-100 text-xs font-bold">
                <button
                  onClick={() => setChannel('whatsapp')}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                    channel === 'whatsapp' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  WhatsApp
                </button>
                <button
                  onClick={() => setChannel('sms')}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                    channel === 'sms' ? 'bg-[#8B0000] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  Android SMS
                </button>
                <button
                  onClick={() => setChannel('both')}
                  className={`px-3 py-1 rounded-lg transition flex items-center gap-1 ${
                    channel === 'both' ? 'bg-slate-900 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Both
                </button>
              </div>
            </div>

            {/* Template Selector Pills */}
            <div className="flex flex-wrap gap-1.5">
              {DEFAULT_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setMessageTemplate(tmpl.text)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FAF8F2] border border-[#EDE7C7] text-[#5B0202] hover:bg-[#8B0000]/10 transition"
                >
                  {tmpl.name}
                </button>
              ))}
            </div>

            {/* Variable Pills */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#5B0202]/70 mb-1.5">
                Insert Dynamic Tags (Click to inject):
              </div>
              <div className="flex flex-wrap gap-1">
                {[
                  { tag: 'parent_name', label: '{parent_name}' },
                  { tag: 'student_name', label: '{student_name}' },
                  { tag: 'amount', label: '{amount}' },
                  { tag: 'due_date', label: '{due_date}' },
                  { tag: 'roll_number', label: '{roll_number}' },
                  { tag: 'school_name', label: '{school_name}' },
                ].map((v) => (
                  <button
                    key={v.tag}
                    onClick={() => insertVariable(v.tag)}
                    className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Textarea */}
            <textarea
              rows={7}
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              className="w-full text-xs font-sans leading-relaxed p-3.5 rounded-2xl border border-[#EDE7C7] bg-[#FAF8F2] focus:ring-2 focus:ring-[#8B0000] focus:outline-hidden"
              placeholder="Type your WhatsApp notification message here..."
            />

            {/* Anti-Ban Delay Settings */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-950 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Anti-Ban Human Delay Protection:</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 font-bold">
                <span>Random Delay:</span>
                <input
                  type="number"
                  min={3}
                  max={15}
                  value={minDelaySec}
                  onChange={(e) => setMinDelaySec(Number(e.target.value))}
                  className="w-12 p-1 text-center bg-white border border-amber-300 rounded-lg"
                />
                <span>to</span>
                <input
                  type="number"
                  min={6}
                  max={30}
                  value={maxDelaySec}
                  onChange={(e) => setMaxDelaySec(Number(e.target.value))}
                  className="w-12 p-1 text-center bg-white border border-amber-300 rounded-lg"
                />
                <span>seconds</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Message Preview & Queue Controller */}
        <div className="lg:col-span-5 space-y-5">
          {/* Live Mobile WhatsApp Preview Card */}
          <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#200E01] font-['Cinzel',serif] flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#8B0000]" />
                Live Parent View Preview
              </h3>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Target: {previewRecipient?.phone || 'No recipient'}
              </span>
            </div>

            {/* Mock WhatsApp Bubble */}
            <div className="p-4 rounded-2xl bg-[#EFEAE2] border border-[#D1D7DB] min-h-[160px] flex flex-col justify-between shadow-inner">
              <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs max-w-[95%] space-y-1">
                <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  {currentSchool?.name || 'School Office'}
                </div>
                <div className="text-xs text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {previewRecipient?.renderedText || 'Select a student to preview message.'}
                </div>
                <div className="text-[9px] text-right text-slate-400 font-mono flex items-center justify-end gap-1">
                  <span>10:45 AM</span>
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
              </div>
              <div className="text-[10px] text-slate-500 text-center italic mt-2">
                Simulated {channel === 'whatsapp' ? 'WhatsApp' : channel === 'sms' ? 'SMS' : 'Dual'} message
              </div>
            </div>

            {/* Broadcast Control Buttons */}
            <div className="space-y-3 pt-2">
              {isSending ? (
                <div className="space-y-2 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-950">
                    <span>
                      Dispatching: {currentQueueIndex} of {selectedStudentIds.size}
                    </span>
                    {countdownSeconds !== null && (
                      <span className="text-amber-800 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin" />
                        Next message in {countdownSeconds}s...
                      </span>
                    )}
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full bg-emerald-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{
                        width: `${Math.round((currentQueueIndex / Math.max(selectedStudentIds.size, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setIsPaused(!isPaused)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-600 text-white hover:bg-amber-700 flex items-center justify-center gap-1.5"
                    >
                      {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      <span>{isPaused ? 'Resume Queue' : 'Pause'}</span>
                    </button>
                    <button
                      onClick={handleStopQueue}
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-rose-700 text-white hover:bg-rose-800 flex items-center justify-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleStartQueue}
                  disabled={selectedStudentIds.size === 0}
                  className="w-full py-3.5 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>Start Broadcast to {selectedStudentIds.size} Parents</span>
                </button>
              )}

              <button
                onClick={handleRetryFailed}
                className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#8B0000] border border-[#8B0000]/30 hover:bg-rose-50 transition flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Failed Messages Only</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Live Transmission Logs & History */}
      <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[#200E01] font-['Cinzel',serif]">
              Live Delivery Logs &amp; Audit Trail ({logs.length})
            </h3>
            <p className="text-xs text-[#5B0202]/70">
              Track successful deliveries, timestamps, and error diagnostics for failed parent contacts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearLogs}
              className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            >
              Clear Logs
            </button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-[#FAF8F2] rounded-2xl border border-dashed border-[#EDE7C7]">
            No messages sent in this session yet. Launch a broadcast above to view real-time transmission logs.
          </div>
        ) : (
          <div className="overflow-x-auto border border-[#EDE7C7] rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F2] text-[#5B0202] text-[10px] font-bold uppercase tracking-wider border-b border-[#EDE7C7]">
                <tr>
                  <th className="p-3">Recipient &amp; Student</th>
                  <th className="p-3">Phone Number</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Time</th>
                  <th className="p-3">Details / Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7C7]/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-medium text-slate-900">
                      <div>{log.recipient_name}</div>
                      <div className="text-[11px] text-slate-500">Student: {log.student_name}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-600">{log.phone_number}</td>
                    <td className="p-3">
                      <span className="capitalize px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.channel}
                      </span>
                    </td>
                    <td className="p-3">
                      {log.status === 'sent' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Delivered
                        </span>
                      )}
                      {log.status === 'sending' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                          <Clock className="w-3 h-3 text-amber-600" />
                          Sending…
                        </span>
                      )}
                      {log.status === 'failed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <AlertCircle className="w-3 h-3 text-rose-600" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-500 font-mono text-[11px]">
                      {log.sent_at ? new Date(log.sent_at).toLocaleTimeString() : '—'}
                    </td>
                    <td className="p-3 text-[11px] text-slate-600 max-w-xs truncate">
                      {log.error || 'Transmission completed'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

