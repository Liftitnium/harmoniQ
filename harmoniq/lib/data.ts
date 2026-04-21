export const STUDENT = {
  name: "Raji",
  currentInstrument: "Guitar",
  currentLevel: "Intermediate",
  streakDays: 12,
} as const;

export type SheetDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type SheetMusic = {
  id: string;
  title: string;
  composer: string;
  instrument: string;
  difficulty: SheetDifficulty;
};

export const SHEET_MUSIC: SheetMusic[] = [
  { id: "s1", title: "Sunrise Chords", composer: "H. Marlowe", instrument: "Guitar", difficulty: "Beginner" },
  { id: "s2", title: "Teal Rhythm Pattern", composer: "K. Tanaka", instrument: "Guitar", difficulty: "Beginner" },
  { id: "s3", title: "City Streets Fingerpicking", composer: "L. Rivera", instrument: "Guitar", difficulty: "Intermediate" },
  { id: "s4", title: "Barre Chord Toolbox", composer: "D. Anders", instrument: "Guitar", difficulty: "Intermediate" },
  { id: "s5", title: "Rhythm Ladder (8th Notes)", composer: "R. Okoye", instrument: "Guitar", difficulty: "Intermediate" },
  { id: "s6", title: "Minor Scale Sprint", composer: "S. Ngu", instrument: "Guitar", difficulty: "Intermediate" },
  { id: "s7", title: "Lead Guitar Intro: Call & Response", composer: "A. Becker", instrument: "Guitar", difficulty: "Advanced" },
  { id: "s8", title: "Chord to Solo Bridge", composer: "T. Caldwell", instrument: "Guitar", difficulty: "Advanced" },
  { id: "s9", title: "Sight Reading Warmups", composer: "M. Suzuki", instrument: "Guitar", difficulty: "Intermediate" },
  { id: "s10", title: "Tempo Building: Full-Section Run", composer: "P. Ibrahim", instrument: "Guitar", difficulty: "Advanced" },
];

export type WeekStatus = "completed" | "in_progress" | "upcoming";

export type PracticeDailyTask = {
  id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  task: string;
};

export type PracticeWeek = {
  id: string;
  label: string;
  status: WeekStatus;
  focusSummary: string;
  tasks: PracticeDailyTask[];
};

export const PRACTICE_PLAN_WEEKS: PracticeWeek[] = [
  {
    id: "w1",
    label: "Week 1",
    status: "completed",
    focusSummary: "Chord transitions, fingerpicking basics",
    tasks: [
      { id: "w1-m", day: "Mon", task: "Chord transition drills (20 min)" },
      { id: "w1-t", day: "Tue", task: "Fingerpicking basics at slow tempo (15 min)" },
      { id: "w1-w", day: "Wed", task: "Mix chords + picking pattern (15 min)" },
      { id: "w1-th", day: "Thu", task: "Clean changes + metronome (20 min)" },
      { id: "w1-f", day: "Fri", task: "Mini-routine: 2 songs sections (20 min)" },
    ],
  },
  {
    id: "w2",
    label: "Week 2",
    status: "completed",
    focusSummary: "Barre chords, rhythm patterns",
    tasks: [
      { id: "w2-m", day: "Mon", task: "First barre chord shapes (20 min)" },
      { id: "w2-t", day: "Tue", task: "Strumming rhythm patterns (15 min)" },
      { id: "w2-w", day: "Wed", task: "Barre + chord transitions (20 min)" },
      { id: "w2-th", day: "Thu", task: "Rhythm ladder with metronome (20 min)" },
      { id: "w2-f", day: "Fri", task: "Practice to a backing track (25 min)" },
    ],
  },
  {
    id: "w3",
    label: "Week 3",
    status: "in_progress",
    focusSummary: "Lead guitar intro, scales",
    tasks: [
      { id: "w3-m", day: "Mon", task: "Pentatonic shapes (20 min)" },
      { id: "w3-t", day: "Tue", task: "Scale runs with clean fretting (15 min)" },
      { id: "w3-w", day: "Wed", task: "Call & response lead patterns (20 min)" },
      { id: "w3-th", day: "Thu", task: "Micro-solo over a groove (20 min)" },
      { id: "w3-f", day: "Fri", task: "Record + review your lead (15 min)" },
    ],
  },
  {
    id: "w4",
    label: "Week 4",
    status: "upcoming",
    focusSummary: "Full song practice, speed building",
    tasks: [
      { id: "w4-m", day: "Mon", task: "Full song run-through (20 min)" },
      { id: "w4-t", day: "Tue", task: "Speed building with chunking (15 min)" },
      { id: "w4-w", day: "Wed", task: "Verse/chorus transitions at tempo (20 min)" },
      { id: "w4-th", day: "Thu", task: "Lead section practice (20 min)" },
      { id: "w4-f", day: "Fri", task: "Performance run: take 1 + corrections (25 min)" },
    ],
  },
];

export const PROGRESS_DASHBOARD = {
  activity: [
    { day: "Mon", minutes: 35 },
    { day: "Tue", minutes: 50 },
    { day: "Wed", minutes: 20 },
    { day: "Thu", minutes: 60 },
    { day: "Fri", minutes: 45 },
    { day: "Sat", minutes: 70 },
    { day: "Sun", minutes: 25 },
  ],
  skills: [
    { label: "Chords", value: 75 },
    { label: "Rhythm", value: 60 },
    { label: "Theory", value: 40 },
    { label: "Sight Reading", value: 30 },
  ],
  milestones: [
    { id: "m1", label: "7-Day Streak", unlocked: true },
    { id: "m2", label: "Completed Week 1", unlocked: true },
    { id: "m3", label: "Completed Week 2", unlocked: true },
    { id: "m4", label: "Master a Solo Section", unlocked: false },
    { id: "m5", label: "30-Day Streak", unlocked: false },
  ],
} as const;

export const TOTAL_PRACTICE_HOURS = 48;

export type ProfileBadge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

export const PROFILE_BADGES: ProfileBadge[] = [
  { id: "b1", name: "First Steps", description: "Finish roadmap Week 1", unlocked: true },
  { id: "b2", name: "Building Momentum", description: "Finish roadmap Week 2", unlocked: true },
  { id: "b3", name: "7-Day Streak", description: "Complete tasks 7 days in a row", unlocked: true },
  { id: "b4", name: "Month Strong", description: "Finish roadmap Week 4", unlocked: true },
  { id: "b5", name: "Sheet Music Collector", description: "Save 5 pieces to favorites", unlocked: true },
  { id: "b6", name: "Dedicated Learner", description: "Complete 50+ tasks total", unlocked: true },
  { id: "b7", name: "Halfway There", description: "Reach the midpoint of your roadmap", unlocked: false },
  { id: "b8", name: "30-Day Streak", description: "Complete tasks 30 days in a row", unlocked: false },
  { id: "b9", name: "Roadmap Graduate", description: "Finish your entire roadmap", unlocked: false },
  { id: "b10", name: "Challenge Seeker", description: "Rate 10 tasks as 'Too easy'", unlocked: false },
  { id: "b11", name: "Persistent Learner", description: "Push through 10 'Too hard' tasks", unlocked: false },
  { id: "b12", name: "Adaptable", description: "Complete an adapted roadmap week", unlocked: false },
];

export const USER_PROFILE = {
  displayName: "Raji Nasrallah",
  shortName: "Raji",
  initials: "R",
  memberSince: "January 2026",
  currentInstrument: "Guitar",
  level: "Intermediate",
  bio: "Passionate about music and learning. Based in Madrid.",
  favoriteSheetMusicIds: ["s3", "s4", "s6", "s9"] as const,
} as const;

export type NotificationKind = "calendar" | "trophy" | "music";

export type NotificationItem = {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  timestamp: string;
  group: "today" | "earlier";
  unread: boolean;
};

export const NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    kind: "trophy",
    title: "Week 2 complete!",
    description: "You finished Week 2 of your roadmap — keep going!",
    timestamp: "9:42 AM",
    group: "today",
    unread: true,
  },
  {
    id: "n2",
    kind: "calendar",
    title: "Today's practice",
    description: "You have tasks on today's roadmap — start with your warm-up.",
    timestamp: "8:15 AM",
    group: "today",
    unread: true,
  },
  {
    id: "n3",
    kind: "trophy",
    title: "Badge unlocked: 7-Day Streak",
    description: "You completed tasks 7 days in a row — amazing consistency!",
    timestamp: "Fri",
    group: "earlier",
    unread: false,
  },
  {
    id: "n4",
    kind: "music",
    title: "Roadmap adapted",
    description: "Your plan was adjusted based on Week 1 difficulty ratings.",
    timestamp: "Mon",
    group: "earlier",
    unread: false,
  },
];

export const NOTIFICATIONS_UNREAD_COUNT = 2;

export const SETTINGS_DEFAULTS = {
  name: "Raji Nasrallah",
  email: "raji@example.com",
  bio: "Passionate about music and learning. Based in Madrid.",
  primaryInstrument: "Guitar",
  skillLevel: "Intermediate",
  practiceGoalMinutes: 30,
} as const;
