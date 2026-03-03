"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Bell,
  BellOff,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Zap,
  Coffee,
  Plus,
  Upload,
  X,
  FileJson,
  Download,
  Image as ImageIcon,
  Loader2,
  Camera
} from "lucide-react";
import { createWorker } from "tesseract.js";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SCHEDULES as DEFAULT_SCHEDULES, TIME_SLOTS, type ClassInfo, type TimeSlot, type SectionSchedule } from "@/lib/data";

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function parseTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

// --- Hooks ---
function useCurrentTime() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return time;
}

// --- Components ---

export default function TimetableApp() {
  const [section, setSection] = useState<string>("4DFCS");
  const [customSchedules, setCustomSchedules] = useState<{ [key: string]: SectionSchedule }>({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importName, setImportName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const now = useCurrentTime();

  const handleImageScan = async (file: File) => {
    setIsScanning(true);
    try {
      const worker = await createWorker('eng');
      const { data: { text } } = await worker.recognize(file);
      await worker.terminate();

      // Basic extraction logic for "wowed" effect
      // Looking for common subject codes/names in the text
      const subjects = ["OS", "DBMS", "CN", "COA", "UHV", "DM", "ADA", "IDS", "NS"];
      const detected: string[] = [];
      subjects.forEach(s => {
        if (text.toUpperCase().includes(s)) detected.push(s);
      });

      setImportText(JSON.stringify({
        "Monday": { "1": { "subject": detected[0] || "Found Data", "room": "ScanResult", "slots": [1] } }
      }, null, 2));
      setImportName("Scanned Result");
      alert(`Scan complete! Found subjects: ${detected.join(", ")}. Please review the JSON format.`);
    } catch (e) {
      alert("Scan failed. Try a clearer photo.");
    } finally {
      setIsScanning(false);
    }
  };

  // Load preferences and custom schedules
  useEffect(() => {
    const savedSection = localStorage.getItem("timetable-section");
    if (savedSection) setSection(savedSection);

    const savedNotif = localStorage.getItem("timetable-notifications");
    if (savedNotif === "true") setNotificationsEnabled(true);

    const savedCustom = localStorage.getItem("timetable-custom-schedules");
    if (savedCustom) {
      try {
        setCustomSchedules(JSON.parse(savedCustom));
      } catch (e) {
        console.error("Failed to load custom schedules", e);
      }
    }
  }, []);

  const allSchedules = useMemo(() => ({
    ...DEFAULT_SCHEDULES,
    ...customSchedules
  }), [customSchedules]);

  useEffect(() => {
    localStorage.setItem("timetable-section", section);
  }, [section]);

  useEffect(() => {
    localStorage.setItem("timetable-custom-schedules", JSON.stringify(customSchedules));
  }, [customSchedules]);

  const currentDayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const schedule = allSchedules[section] || allSchedules["4DFCS"];

  // Logic to find current and next class
  const liveInfo = useMemo(() => {
    const daySchedule = schedule[currentDayName];
    const isWeekend = currentDayName === "Saturday" || currentDayName === "Sunday";

    if (isWeekend) return { current: null, next: null, isWeekend: true, countdownText: "" };
    if (!daySchedule) return { current: null, next: null, isWeekend: false, countdownText: "" };

    let current: (ClassInfo & { slot: TimeSlot }) | null = null;
    let next: (ClassInfo & { slot: TimeSlot }) | null = null;

    const currentTimeString = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const [currH, currM] = currentTimeString.split(":").map(Number);
    const currTotal = currH * 60 + currM;

    // Find current
    for (const slot of TIME_SLOTS) {
      const [sh, sm] = slot.start.split(":").map(Number);
      const [eh, em] = slot.end.split(":").map(Number);
      const startTotal = sh * 60 + sm;
      const endTotal = eh * 60 + em;

      if (currTotal >= startTotal && currTotal < endTotal) {
        if (daySchedule[slot.slot]) {
          current = { ...daySchedule[slot.slot], slot };
        } else if (slot.slot === 5) {
          current = { subject: "Lunch Break", room: "Cafeteria", slots: [5], slot };
        }
      }

      if (currTotal < startTotal && !next) {
        if (daySchedule[slot.slot]) {
          next = { ...daySchedule[slot.slot], slot };
        } else if (slot.slot === 5) {
          next = { subject: "Lunch Break", room: "Cafeteria", slots: [5], slot };
        }
      }
    }

    // Dynamic countdown
    let countdownText = "";
    if (next) {
      const [sh, sm] = next.slot.start.split(":").map(Number);
      const startTotal = sh * 60 + sm;
      const diff = startTotal - currTotal;
      if (diff > 60) {
        countdownText = `Starting in ${Math.floor(diff / 60)}h ${diff % 60}m`;
      } else {
        countdownText = `Starting in ${diff}m`;
      }
    }

    return { current, next, isWeekend: false, countdownText };
  }, [currentDayName, schedule, now]);

  // Notification logic
  useEffect(() => {
    if (notificationsEnabled && liveInfo.next) {
      const [sh, sm] = liveInfo.next.slot.start.split(":").map(Number);
      const nextStartTime = new Date();
      nextStartTime.setHours(sh, sm, 0, 0);

      const diff = nextStartTime.getTime() - new Date().getTime();

      if (diff > 0 && diff <= 60000) { // Notify 1 min before
        const timer = setTimeout(() => {
          new Notification("Class Starting Soon!", {
            body: `${liveInfo.next?.subject} in room ${liveInfo.next?.room} @ ${liveInfo.next?.slot.start}`,
            icon: "/favicon.ico"
          });
        }, diff - 30000); // 30s before
        return () => clearTimeout(timer);
      }
    }
  }, [liveInfo.next, notificationsEnabled]);

  const requestNotification = async () => {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setNotificationsEnabled(true);
      localStorage.setItem("timetable-notifications", "true");
    }
  };

  const handleImport = () => {
    if (!importName || !importText) {
      alert("Please provide both a name and JSON data.");
      return;
    }
    try {
      const newSchedule = JSON.parse(importText);
      setCustomSchedules(prev => ({ ...prev, [importName]: newSchedule }));
      setSection(importName); // Switch to the newly imported schedule
      setIsImportModalOpen(false);
      setImportName("");
      setImportText("");
    } catch (e) {
      alert("Invalid JSON data. Please check your input.");
      console.error("Import error:", e);
    }
  };

  const handleDeleteCustomSchedule = (name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      setCustomSchedules(prev => {
        const newSchedules = { ...prev };
        delete newSchedules[name];
        return newSchedules;
      });
      if (section === name) {
        setSection("4DFCS"); // Fallback to default if current section is deleted
      }
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-4 md:p-8 font-sans pb-24">
      {/* Header */}
      <header className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-bold gradient-text tracking-tight mb-2 flex items-center gap-3 italic">
            <Calendar className="text-blue-500" size={32} />
            ClassPing
          </h1>
          <p className="text-zinc-400 font-medium">Your personalized academic companion</p>
        </motion.div>

        <div className="flex items-center gap-3">
          {/* Section Switcher */}
          <div className="flex p-1 bg-zinc-900/50 rounded-xl border border-white/5 backdrop-blur-sm overflow-x-auto max-w-[200px] no-scrollbar">
            {Object.keys(allSchedules).map((s) => (
              <button
                key={s}
                onClick={() => setSection(s)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap focus:outline-none",
                  section === s
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="p-2.5 rounded-xl border bg-zinc-900/50 border-white/5 text-blue-400 hover:bg-blue-500/10 transition-all"
            title="Import New Timetable"
          >
            <Plus size={20} />
          </button>

          <button
            onClick={() => notificationsEnabled ? setNotificationsEnabled(false) : requestNotification()}
            className={cn(
              "p-2.5 rounded-xl border backdrop-blur-sm transition-all",
              notificationsEnabled
                ? "bg-green-500/10 border-green-500/20 text-green-500"
                : "bg-zinc-900/50 border-white/5 text-zinc-500 hover:text-zinc-300"
            )}
          >
            {notificationsEnabled ? <Bell size={20} /> : <BellOff size={20} />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* Live Status Card */}
        <section>
          <div className="flex items-center gap-2 mb-4 text-zinc-400 font-medium px-1">
            <Zap size={16} className="text-yellow-500" />
            <span>Happening Now</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={liveInfo.current?.subject || (liveInfo.isWeekend ? "weekend" : "free")}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card rounded-3xl p-6 relative overflow-hidden group border border-blue-500/20"
              >
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Clock size={120} />
                </div>

                <div className="flex justify-between items-start mb-6">
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-bold rounded-full border border-blue-500/20">
                    {liveInfo.current ? "ONGOING" : "STATUS"}
                  </span>
                  <span className="text-zinc-500 text-sm font-mono flex items-center gap-2">
                    <Clock size={14} />
                    {liveInfo.current ? `${liveInfo.current.slot.start} - ${liveInfo.current.slot.end}` : "--:--"}
                  </span>
                </div>

                <h2 className="text-3xl font-bold mb-2 truncate">
                  {liveInfo.current?.subject || (liveInfo.isWeekend ? "Happy Weekend!" : "Academic Break")}
                </h2>

                <div className="flex items-center gap-2 text-zinc-400 font-medium">
                  {liveInfo.isWeekend ? (
                    <Coffee size={16} className="text-amber-500/70" />
                  ) : (
                    <MapPin size={16} className="text-red-500/70" />
                  )}
                  <span>{liveInfo.current?.room || (liveInfo.isWeekend ? "Take a rest" : "Anywhere")}</span>
                </div>

                {liveInfo.current && (
                  <div className="mt-8 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "65%" }}
                      className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-3xl p-6 border border-white/5"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-xs font-bold rounded-full border border-white/5">
                  UP NEXT
                </span>
                {liveInfo.next && (
                  <span className="text-zinc-500 text-sm font-mono">
                    {liveInfo.countdownText}
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold mb-2 text-zinc-300">
                {liveInfo.next?.subject || (liveInfo.isWeekend ? "See you Monday" : "No more classes today")}
              </h3>

              <div className="flex items-center gap-2 text-zinc-500">
                <MapPin size={16} />
                <span>{liveInfo.next?.room || "None"}</span>
              </div>

              {liveInfo.next && (
                <div className="mt-6 flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <Clock size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Scheduled at</p>
                    <p className="text-sm font-bold">{liveInfo.next.slot.start}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Weekly View Controller */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 text-zinc-400 font-medium">
              <LayoutGrid size={16} className="text-purple-500" />
              <span>Weekly Schedule</span>
            </div>
          </div>

          <div className="space-y-4">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
              <DayRow
                key={day}
                day={day}
                data={schedule[day]}
                isToday={day === currentDayName}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Import Modal */}
      <AnimatePresence>
        {isImportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsImportModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                  <Upload className="text-blue-500" />
                  Import Timetable
                </h2>
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors"
                >
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                    Section Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 4DFCS-B"
                    value={importName}
                    onChange={(e) => setImportName(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all font-bold"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-500 uppercase mb-2 tracking-wider">
                    Paste JSON Data
                  </label>
                  <textarea
                    rows={8}
                    placeholder='{"Monday": { "1": { "subject": "Math", "room": "A101", "slots": [1] } } ...}'
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    className="w-full bg-zinc-800 border border-white/5 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-sm no-scrollbar"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                  <Download size={20} className="text-blue-400 shrink-0" />
                  <p className="text-xs text-zinc-400">
                    Copy the existing schedule from <code className="text-blue-300">src/lib/data.ts</code> to use as a template.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      if (!importName || !importText) return;
                      try {
                        const data = JSON.parse(importText);
                        setCustomSchedules(prev => ({ ...prev, [importName]: data }));
                        setSection(importName);
                        setIsImportModalOpen(false);
                        setImportName("");
                        setImportText("");
                        alert("Success! Timetable imported.");
                      } catch (e) {
                        alert("Invalid JSON format. Please check your data.");
                      }
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-95"
                  >
                    {isScanning ? <Loader2 className="animate-spin mx-auto" /> : "Save Timetable"}
                  </button>
                  <button
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = 'image/*';
                      fileInput.onchange = (e: any) => {
                        const file = e.target.files[0];
                        handleImageScan(file);
                      };
                      fileInput.click();
                    }}
                    className="px-6 bg-zinc-800 hover:bg-zinc-700 text-purple-400 font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center gap-2"
                    title="Scan Timetable Image"
                  >
                    <Camera size={20} />
                    Scan
                  </button>
                  <button
                    onClick={() => {
                      const fileInput = document.createElement('input');
                      fileInput.type = 'file';
                      fileInput.accept = '.json';
                      fileInput.onchange = (e: any) => {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onload = (event: any) => {
                          setImportText(event.target.result);
                        };
                        reader.readAsText(file);
                      };
                      fileInput.click();
                    }}
                    className="px-6 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold py-4 rounded-2xl transition-all active:scale-95 flex items-center gap-2"
                  >
                    <FileJson size={20} />
                    File
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-0 left-0 right-0 p-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          {/* Simple Status bar could go here */}
        </div>
      </footer>
    </div>
  );
}

function DayRow({ day, data, isToday }: { day: string, data: any, isToday: boolean }) {
  const [isOpen, setIsOpen] = useState(isToday);

  return (
    <div className={cn(
      "rounded-3xl transition-all duration-300 overflow-hidden",
      isToday ? "border border-blue-500/30 bg-blue-500/[0.02]" : "border border-white/5 hover:border-white/10"
    )}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
            isToday ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"
          )}>
            {day.substring(0, 2)}
          </div>
          <div>
            <h4 className={cn("font-bold text-lg", isToday ? "text-white" : "text-zinc-300")}>
              {day}
            </h4>
            <p className="text-xs text-zinc-500">{Object.keys(data || {}).length} Classes Today</p>
          </div>
        </div>
        <div className={cn("transition-transform", isOpen && "rotate-90 text-blue-400")}>
          <ChevronRight size={20} />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-5 pb-5 overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
              {TIME_SLOTS.map(slot => {
                const classItem = data ? data[slot.slot] : null;
                const isBreak = slot.slot === 5;

                return (
                  <div
                    key={slot.slot}
                    className={cn(
                      "p-3 rounded-2xl flex flex-col gap-1 border transition-all",
                      classItem
                        ? "bg-zinc-900/40 border-white/5"
                        : isBreak
                          ? "bg-zinc-800/10 border-dashed border-zinc-800 text-zinc-600"
                          : "bg-transparent border-transparent opacity-30"
                    )}
                  >
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">
                      {slot.start}
                    </span>
                    <span className={cn(
                      "text-sm font-bold truncate",
                      classItem ? "text-zinc-200" : "text-zinc-700 font-normal italic"
                    )}>
                      {classItem ? classItem.subject : (isBreak ? "Lunch" : "Free")}
                    </span>
                    {classItem && (
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <MapPin size={10} /> {classItem.room}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
