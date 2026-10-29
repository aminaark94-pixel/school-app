import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Sparkles,
  Bell,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Sliders,
  Send,
  Zap,
  Check,
  RotateCcw,
  ShieldAlert,
  CalendarDays,
  CreditCard,
  Building2,
} from 'lucide-react';
import { useSchoolData } from '../../hooks/useSchoolData';
import {
  AUTOMATED_HOLIDAY_RULES,
  AUTOMATED_FEE_RULES,
  AutomatedCircularRule,
  getUpcomingMilestones,
} from '../../lib/circularAutomation';

interface Props {
  onSelectForBroadcast?: (text: string) => void;
  onNavigateToNotices?: () => void;
}

export const CircularAutomationPanel: React.FC<Props> = ({
  onSelectForBroadcast,
  onNavigateToNotices,
}) => {
  const { currentSchool, currentUser, addNotice, notices } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'all' | 'holidays' | 'fees'>('all');
  const [expandedRuleId, setExpandedRuleId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isPopulatingAll, setIsPopulatingAll] = useState(false);

  // Automation Toggles stored in local settings
  const [autoPublishEnabled, setAutoPublishEnabled] = useState(() => {
    return localStorage.getItem('sms_auto_publish_circulars_v1') !== 'false';
  });
  const [autoBroadcastEnabled, setAutoBroadcastEnabled] = useState(() => {
    return localStorage.getItem('sms_auto_broadcast_circulars_v1') === 'true';
  });

  const handleToggleAutoPublish = (enabled: boolean) => {
    setAutoPublishEnabled(enabled);
    localStorage.setItem('sms_auto_publish_circulars_v1', String(enabled));
  };

  const handleToggleAutoBroadcast = (enabled: boolean) => {
    setAutoBroadcastEnabled(enabled);
    localStorage.setItem('sms_auto_broadcast_circulars_v1', String(enabled));
  };

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });

  // Upcoming Milestones
  const upcomingMilestones = useMemo(() => {
    return getUpcomingMilestones(now).slice(0, 3);
  }, []);

  const nextMilestone = upcomingMilestones[0];

  // Filtered Rules
  const displayedRules = useMemo(() => {
    if (activeTab === 'holidays') return AUTOMATED_HOLIDAY_RULES;
    if (activeTab === 'fees') return AUTOMATED_FEE_RULES;
    return [...AUTOMATED_FEE_RULES, ...AUTOMATED_HOLIDAY_RULES];
  }, [activeTab]);

  // Check if a circular matching this refNumber already exists in notices
  const isCircularPublished = (rule: AutomatedCircularRule): boolean => {
    return notices.some((n) => n.title.includes(rule.refNumber) || n.title.includes(rule.title));
  };

  // Publish a Single Automated Circular
  const handlePublishCircular = (rule: AutomatedCircularRule) => {
    const schoolName = currentSchool?.name || 'School System';
    const content = rule.contentTemplate(schoolName, currentYear, currentMonthName);

    addNotice({
      title: `[${rule.refNumber}] ${rule.title}`,
      content,
      category: rule.category,
      target_audience: 'all',
      priority: rule.priority,
      publish_date: new Date().toISOString().split('T')[0],
    });

    setSuccessToast(`Published official circular: "${rule.title}"`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  // 1-Click Populate All Annual Circulars
  const handlePopulateAllCirculars = () => {
    const schoolName = currentSchool?.name || 'School System';
    setIsPopulatingAll(true);

    const rules = [...AUTOMATED_FEE_RULES, ...AUTOMATED_HOLIDAY_RULES];
    let addedCount = 0;

    rules.forEach((rule) => {
      // Avoid duplicate publishing if already present
      if (!isCircularPublished(rule)) {
        const content = rule.contentTemplate(schoolName, currentYear, currentMonthName);
        addNotice({
          title: `[${rule.refNumber}] ${rule.title}`,
          content,
          category: rule.category,
          target_audience: 'all',
          priority: rule.priority,
          publish_date: new Date().toISOString().split('T')[0],
        });
        addedCount++;
      }
    });

    setIsPopulatingAll(false);
    setSuccessToast(
      `🎉 Successfully auto-generated ${addedCount} official holiday & fee circulars into the school portal!`
    );
    setTimeout(() => setSuccessToast(null), 5000);
  };

  const handleBroadcastShortcut = (rule: AutomatedCircularRule) => {
    const schoolName = currentSchool?.name || 'School System';
    const whatsappText = rule.whatsappTemplate(schoolName, currentYear, currentMonthName);
    if (onSelectForBroadcast) {
      onSelectForBroadcast(whatsappText);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Automation Controls */}
      <div className="bg-white rounded-3xl border border-[#EDE7C7] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8B0000] text-white flex items-center justify-center shrink-0 shadow-md">
              <Zap className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#200E01] font-['Cinzel',serif]">
                  Automated Circulars &amp; Holiday Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                  Govt &amp; Academic Gazette
                </span>
              </div>
              <p className="text-xs text-[#5B0202]/70 mt-1 max-w-2xl">
                Automatically generate, schedule, and publish official school circulars for all gazetted Pakistani public holidays,
                religious breaks, and monthly tuition fee clearance deadlines.
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePopulateAllCirculars}
              disabled={isPopulatingAll}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#8B0000] hover:bg-[#700000] transition shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span>1-Click Generate All Annual Circulars</span>
            </button>
          </div>
        </div>

        {/* Global Automation Toggles */}
        <div className="pt-3 border-t border-[#EDE7C7] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F2] border border-[#EDE7C7]">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#8B0000]" />
              <div>
                <span className="font-bold text-[#200E01] block">Auto-Publish Circulars</span>
                <span className="text-[11px] text-[#5B0202]/70">Publish to portal 3 days prior to holiday/due date</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoPublishEnabled}
              onChange={(e) => handleToggleAutoPublish(e.target.checked)}
              className="h-4 w-4 rounded text-[#8B0000] focus:ring-[#8B0000] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8F2] border border-[#EDE7C7]">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="font-bold text-[#200E01] block">WhatsApp / SMS Auto-Prompt</span>
                <span className="text-[11px] text-[#5B0202]/70">Pre-queue WhatsApp broadcast to parents</span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoBroadcastEnabled}
              onChange={(e) => handleToggleAutoBroadcast(e.target.checked)}
              className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {successToast && (
        <div className="flex items-center justify-between gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. Upcoming Event & Fee Milestone Hero Alert */}
      {nextMilestone && (
        <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-300 rounded-3xl p-5 sm:p-6 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500 text-white font-black shadow-xs">
                <Clock className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                  Next Scheduled Milestone
                </span>
                <h3 className="text-base font-bold text-[#200E01]">{nextMilestone.rule.title}</h3>
                <p className="text-xs text-[#5B0202]/70">
                  Target Date: {nextMilestone.targetDate.toLocaleDateString(undefined, { dateStyle: 'full' })} (
                  {nextMilestone.daysRemaining === 0
                    ? 'TODAY'
                    : nextMilestone.daysRemaining === 1
                    ? 'TOMORROW'
                    : `In ${nextMilestone.daysRemaining} days`}
                  )
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePublishCircular(nextMilestone.rule)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#8B0000] text-white hover:bg-[#700000] transition shadow-xs"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Publish Notice Now</span>
              </button>

              <button
                onClick={() => handleBroadcastShortcut(nextMilestone.rule)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-xs"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Broadcast on WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Circular Rule Categories (Holidays vs Fee Reminders) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="inline-flex rounded-2xl p-1 bg-slate-100 text-xs font-bold border border-slate-200">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-xl transition ${
                activeTab === 'all' ? 'bg-white text-[#8B0000] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Presets ({AUTOMATED_FEE_RULES.length + AUTOMATED_HOLIDAY_RULES.length})
            </button>
            <button
              onClick={() => setActiveTab('holidays')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'holidays' ? 'bg-white text-[#8B0000] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Public Holidays ({AUTOMATED_HOLIDAY_RULES.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('fees')}
              className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
                activeTab === 'fees' ? 'bg-white text-[#8B0000] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              <span>Monthly Fee Cycles ({AUTOMATED_FEE_RULES.length})</span>
            </button>
          </div>
        </div>

        {/* Circulars Preset Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedRules.map((rule) => {
            const isPublished = isCircularPublished(rule);
            const isExpanded = expandedRuleId === rule.id;
            const schoolName = currentSchool?.name || 'School System';
            const sampleContent = rule.contentTemplate(schoolName, currentYear, currentMonthName);
            const sampleWhatsapp = rule.whatsappTemplate(schoolName, currentYear, currentMonthName);

            return (
              <div
                key={rule.id}
                className="bg-white rounded-3xl border border-[#EDE7C7] p-5 space-y-3 transition hover:border-[#D4AF37] shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F2] border border-[#EDE7C7] text-[#5B0202]">
                          {rule.refNumber}
                        </span>
                        {rule.priority === 'urgent' && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-700">
                            Urgent Priority
                          </span>
                        )}
                        {isPublished && (
                          <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5" /> Published
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#200E01] mt-1 line-clamp-1">{rule.title}</h4>
                      <p className="text-[11px] text-[#5B0202]/70 mt-0.5 line-clamp-2">{rule.description}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                        rule.type === 'holiday'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : rule.type === 'fee_reminder'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {rule.category.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Expand / Preview Button */}
                  <button
                    onClick={() => setExpandedRuleId(isExpanded ? null : rule.id)}
                    className="text-[11px] font-bold text-[#8B0000] hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <span>{isExpanded ? 'Hide Draft Text' : 'Preview Circular & WhatsApp Template'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {/* Expanded Content Preview */}
                  {isExpanded && (
                    <div className="mt-2 p-3.5 rounded-2xl bg-[#FAF8F2] border border-[#EDE7C7] space-y-2 text-xs animate-in fade-in">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#5B0202]/70 block mb-1">
                          Official School Seal Circular Draft:
                        </span>
                        <p className="text-[11px] text-slate-800 whitespace-pre-wrap font-sans leading-relaxed bg-white p-2.5 rounded-xl border border-[#EDE7C7]">
                          {sampleContent}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                          WhatsApp / SMS Alert Template:
                        </span>
                        <p className="text-[11px] text-emerald-950 font-mono bg-emerald-50/70 p-2 rounded-xl border border-emerald-200">
                          {sampleWhatsapp}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#EDE7C7]/60">
                  <button
                    onClick={() => handlePublishCircular(rule)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#8B0000] text-white hover:bg-[#700000] transition shadow-2xs"
                  >
                    <Megaphone className="w-3 h-3" />
                    <span>Publish to Portal</span>
                  </button>

                  <button
                    onClick={() => handleBroadcastShortcut(rule)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
                  >
                    <Smartphone className="w-3 h-3 text-emerald-700" />
                    <span>WhatsApp Alert</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
