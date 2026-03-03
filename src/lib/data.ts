
export type TimeSlot = {
  slot: number;
  start: string;
  end: string;
};

export type ClassInfo = {
  subject: string;
  room: string;
  slots: number[]; // e.g. [9, 10] for 9-10
};

export type DaySchedule = {
  [slot: number]: ClassInfo;
};

export type SectionSchedule = {
  [day: string]: DaySchedule;
};

export const TIME_SLOTS: TimeSlot[] = [
  { slot: 1, start: "08:10", end: "09:00" },
  { slot: 2, start: "09:00", end: "09:50" },
  { slot: 3, start: "09:50", end: "10:40" },
  { slot: 4, start: "10:40", end: "11:30" },
  { slot: 5, start: "11:30", end: "12:20" }, // Lunch
  { slot: 6, start: "12:20", end: "13:10" },
  { slot: 7, start: "13:10", end: "14:00" },
  { slot: 8, start: "14:00", end: "14:50" },
  { slot: 9, start: "14:50", end: "15:40" },
  { slot: 10, start: "15:40", end: "16:30" },
];

export const SCHEDULES: { [section: string]: SectionSchedule } = {
  "4DFCS": {
    "Monday": {
      1: { subject: "DM", room: "AF21", slots: [1] },
      2: { subject: "DBMS", room: "AS24", slots: [2] },
      3: { subject: "OS", room: "AS12", slots: [3] },
      4: { subject: "DTI-II", room: "AS19", slots: [4] },
      6: { subject: "CN", room: "AS19", slots: [6] },
      7: { subject: "QAPD-I", room: "AF23", slots: [7] },
      8: { subject: "DBMS", room: "AF18", slots: [8] },
      9: { subject: "NS LAB", room: "AF06", slots: [9, 10] },
      10: { subject: "NS LAB", room: "AF06", slots: [9, 10] },
    },
    "Tuesday": {
      1: { subject: "OS", room: "AF13", slots: [1] },
      2: { subject: "QAPD-I", room: "AS19", slots: [2] },
      3: { subject: "CN LAB", room: "AF11C", slots: [3, 4] },
      4: { subject: "CN LAB", room: "AF11C", slots: [3, 4] },
      6: { subject: "NS", room: "AF17", slots: [6] },
      7: { subject: "COA", room: "AS24", slots: [7] },
      8: { subject: "UHV", room: "AF21", slots: [8] },
      9: { subject: "IDS", room: "AF17", slots: [9] },
    },
    "Wednesday": {
      1: { subject: "UHV", room: "AS17", slots: [1] },
      2: { subject: "COA", room: "AF15", slots: [2] },
      3: { subject: "CN", room: "AG-23", slots: [3] },
      4: { subject: "OS", room: "AS24", slots: [4] },
      6: { subject: "DBMS", room: "AF21", slots: [6] },
      7: { subject: "DM", room: "AF21", slots: [7] },
      8: { subject: "NS", room: "AF21", slots: [8] },
      9: { subject: "IDS", room: "AF16", slots: [9] },
    },
    "Thursday": {
      1: { subject: "DM", room: "AF21", slots: [1] },
      2: { subject: "QAPD-I", room: "AF23", slots: [2] },
      3: { subject: "CN", room: "AS24", slots: [3] },
      4: { subject: "QAPD-I", room: "AS19", slots: [4] },
      6: { subject: "OS", room: "AF13", slots: [6] },
      7: { subject: "DM", room: "AF17", slots: [7] },
      8: { subject: "DBMS LAB", room: "AF09A", slots: [8, 9] },
      9: { subject: "DBMS LAB", room: "AF09A", slots: [8, 9] },
    },
    "Friday": {
      1: { subject: "DBMS", room: "AS24", slots: [1] },
      2: { subject: "IDS", room: "AF19", slots: [2] },
      3: { subject: "OS LAB", room: "AF09A", slots: [3, 4] },
      4: { subject: "OS LAB", room: "AF09A", slots: [3, 4] },
      6: { subject: "COA", room: "AS17", slots: [6] },
      7: { subject: "NS", room: "AF17", slots: [7] },
    },
  },
  "4DS": {
    "Monday": {
      1: { subject: "DM", room: "AF21", slots: [1] },
      2: { subject: "DBMS", room: "AS24", slots: [2] },
      3: { subject: "OS", room: "AS12", slots: [3] },
      4: { subject: "DTI-II", room: "AS19", slots: [4] },
      6: { subject: "CN", room: "AS19", slots: [6] },
      7: { subject: "QAPD-I", room: "AF23", slots: [7] },
      8: { subject: "MCFD", room: "AF14", slots: [8] },
      9: { subject: "R LAB", room: "AF09A", slots: [9, 10] },
      10: { subject: "R LAB", room: "AF09A", slots: [9, 10] },
    },
    "Tuesday": {
      1: { subject: "OS", room: "AF13", slots: [1] },
      2: { subject: "QAPD-I", room: "AS19", slots: [2] },
      3: { subject: "SFFDS", room: "AF16", slots: [3] },
      4: { subject: "MCFD", room: "AS17", slots: [4] },
      6: { subject: "SFFDS", room: "AS27", slots: [6] },
      7: { subject: "COA", room: "AS24", slots: [7] },
      8: { subject: "UHV", room: "AF21", slots: [8] },
      9: { subject: "DBMS LAB", room: "AG24", slots: [9, 10] },
      10: { subject: "DBMS LAB", room: "AG24", slots: [9, 10] },
    },
    "Wednesday": {
      1: { subject: "UHV", room: "AS17", slots: [1] },
      2: { subject: "COA", room: "AF15", slots: [2] },
      3: { subject: "CN", room: "AG-23", slots: [3] },
      4: { subject: "OS", room: "AS24", slots: [4] },
      6: { subject: "DBMS", room: "AF21", slots: [6] },
      7: { subject: "DM", room: "AF21", slots: [7] },
      8: { subject: "CN LAB", room: "AG24", slots: [8, 9] },
      9: { subject: "CN LAB", room: "AG24", slots: [8, 9] },
    },
    "Thursday": {
      1: { subject: "DM", room: "AF21", slots: [1] },
      2: { subject: "QAPD-I", room: "AF23", slots: [2] },
      3: { subject: "CN", room: "AS24", slots: [3] },
      4: { subject: "QAPD-I", room: "AS19", slots: [4] },
      6: { subject: "OS", room: "AF13", slots: [6] },
      7: { subject: "ADA", room: "AS17", slots: [7] },
      8: { subject: "OS LAB", room: "AG24", slots: [8, 9] },
      9: { subject: "OS LAB", room: "AG24", slots: [8, 9] },
    },
    "Friday": {
      1: { subject: "DBMS", room: "AS24", slots: [1] },
      2: { subject: "MCFD", room: "AF23", slots: [2] },
      3: { subject: "DM", room: "AF16", slots: [3] },
      4: { subject: "SFFDS", room: "AG-23", slots: [4] },
      6: { subject: "COA", room: "AS17", slots: [6] },
      7: { subject: "ADA", room: "AS12", slots: [7] },
      8: { subject: "DBMS", room: "AF16", slots: [8] },
    },
  },
};
