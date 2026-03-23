export const STUDENT = {
  name: "Raji",
  currentInstrument: "Guitar",
  currentLevel: "Intermediate",
  streakDays: 12,
} as const;

export type TutorAvailability = "Available" | "Busy";

export type Tutor = {
  id: string;
  name: string;
  instruments: string[];
  rating: number; // out of 5
  pricePerHour: number;
  bio: string;
  availability: TutorAvailability;
};

export const TUTORS: Tutor[] = [
  {
    id: "t1",
    name: "Ava Chen",
    instruments: ["Guitar", "Piano"],
    rating: 4.9,
    pricePerHour: 45,
    bio: "Warm, structured lessons with a focus on clean technique and musicality.",
    availability: "Available",
  },
  {
    id: "t2",
    name: "Noah Williams",
    instruments: ["Guitar", "Music Theory"],
    rating: 4.7,
    pricePerHour: 39,
    bio: "Barre chords, rhythm, and theory made simple. Great for intermediate players.",
    availability: "Busy",
  },
  {
    id: "t3",
    name: "Mia Patel",
    instruments: ["Guitar", "Ukulele"],
    rating: 4.8,
    pricePerHour: 42,
    bio: "Fingerpicking + confidence coaching. I'll help you play smoothly at tempo.",
    availability: "Available",
  },
  {
    id: "t4",
    name: "Ethan Brooks",
    instruments: ["Bass Guitar", "Guitar"],
    rating: 4.6,
    pricePerHour: 35,
    bio: "Rhythm-first approach with practical drills and real-song practice.",
    availability: "Busy",
  },
  {
    id: "t5",
    name: "Sophia Martinez",
    instruments: ["Guitar", "Songwriting"],
    rating: 4.9,
    pricePerHour: 55,
    bio: "Learn lead guitar basics and build your own solos step-by-step.",
    availability: "Available",
  },
  {
    id: "t6",
    name: "Liam Johnson",
    instruments: ["Music Theory", "Guitar"],
    rating: 4.5,
    pricePerHour: 30,
    bio: "Scales, chord shapes, and sight reading through targeted, friendly exercises.",
    availability: "Available",
  },
];

export type SheetDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type SheetMusic = {
  id: string;
  title: string;
  composer: string;
  instrument: string;
  difficulty: SheetDifficulty;
};

export const SHEET_MUSIC: SheetMusic[] = [
  {
    id: "s1",
    title: "Sunrise Chords",
    composer: "H. Marlowe",
    instrument: "Guitar",
    difficulty: "Beginner",
  },
  {
    id: "s2",
    title: "Teal Rhythm Pattern",
    composer: "K. Tanaka",
    instrument: "Guitar",
    difficulty: "Beginner",
  },
  {
    id: "s3",
    title: "City Streets Fingerpicking",
    composer: "L. Rivera",
    instrument: "Guitar",
    difficulty: "Intermediate",
  },
  {
    id: "s4",
    title: "Barre Chord Toolbox",
    composer: "D. Anders",
    instrument: "Guitar",
    difficulty: "Intermediate",
  },
  {
    id: "s5",
    title: "Rhythm Ladder (8th Notes)",
    composer: "R. Okoye",
    instrument: "Guitar",
    difficulty: "Intermediate",
  },
  {
    id: "s6",
    title: "Minor Scale Sprint",
    composer: "S. Ngu",
    instrument: "Guitar",
    difficulty: "Intermediate",
  },
  {
    id: "s7",
    title: "Lead Guitar Intro: Call & Response",
    composer: "A. Becker",
    instrument: "Guitar",
    difficulty: "Advanced",
  },
  {
    id: "s8",
    title: "Chord to Solo Bridge",
    composer: "T. Caldwell",
    instrument: "Guitar",
    difficulty: "Advanced",
  },
  {
    id: "s9",
    title: "Sight Reading Warmups",
    composer: "M. Suzuki",
    instrument: "Guitar",
    difficulty: "Intermediate",
  },
  {
    id: "s10",
    title: "Tempo Building: Full-Section Run",
    composer: "P. Ibrahim",
    instrument: "Guitar",
    difficulty: "Advanced",
  },
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
    { id: "m1", label: "First Lesson Booked", unlocked: true },
    { id: "m2", label: "7-Day Streak", unlocked: true },
    { id: "m3", label: "Completed Week 1", unlocked: true },
    { id: "m4", label: "Master a Solo Section", unlocked: false },
    { id: "m5", label: "30-Day Streak", unlocked: false },
  ],
  recentSessions: [
    { id: "rs1", tutorName: "Ava Chen", date: "2026-03-19", durationMinutes: 50 },
    { id: "rs2", tutorName: "Noah Williams", date: "2026-03-16", durationMinutes: 45 },
    { id: "rs3", tutorName: "Mia Patel", date: "2026-03-12", durationMinutes: 60 },
  ],
} as const;

/** Total practice hours for profile stats (hardcoded) */
export const TOTAL_PRACTICE_HOURS = 48;

/** XP / gamification */
export const XP_SYSTEM = {
  currentXp: 1240,
  currentLevel: 5,
  nextLevel: 6,
  xpForNextLevel: 1500,
} as const;

export const DAILY_CHALLENGE = {
  id: "dc1",
  title: "Daily Challenge",
  description: "Practice C major scale for 10 minutes",
  xpReward: 50,
} as const;

export type ProfileBadge = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
};

export const PROFILE_BADGES: ProfileBadge[] = [
  {
    id: "b1",
    name: "7-Day Streak",
    description: "Practice 7 days in a row",
    unlocked: true,
  },
  {
    id: "b2",
    name: "First Booking",
    description: "Book your first lesson",
    unlocked: true,
  },
  {
    id: "b3",
    name: "Sheet Music Collector",
    description: "Save 5 pieces to favorites",
    unlocked: true,
  },
  {
    id: "b4",
    name: "Community Contributor",
    description: "Post in the community feed",
    unlocked: true,
  },
  {
    id: "b5",
    name: "Scale Master",
    description: "Complete 10 scale exercises",
    unlocked: true,
  },
  {
    id: "b6",
    name: "Early Bird",
    description: "Practice before 8am",
    unlocked: true,
  },
  {
    id: "b7",
    name: "30-Day Streak",
    description: "Practice 30 days in a row",
    unlocked: false,
  },
  {
    id: "b8",
    name: "Theory Ace",
    description: "Score 90% on a theory quiz",
    unlocked: false,
  },
  {
    id: "b9",
    name: "Concert Ready",
    description: "Finish a full performance piece",
    unlocked: false,
  },
  {
    id: "b10",
    name: "Tutor Favorite",
    description: "Get 5 five-star reviews",
    unlocked: false,
  },
  {
    id: "b11",
    name: "Leaderboard Top 10",
    description: "Reach top 10 weekly",
    unlocked: false,
  },
  {
    id: "b12",
    name: "Night Owl",
    description: "Practice after 10pm for a week",
    unlocked: false,
  },
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

export const MY_BOOKED_TUTORS = [
  {
    id: "t1",
    name: "Ava Chen",
    lastSession: "2026-03-19",
    instrument: "Guitar",
  },
  {
    id: "t3",
    name: "Mia Patel",
    lastSession: "2026-03-12",
    instrument: "Guitar",
  },
] as const;

export type NotificationKind =
  | "message"
  | "calendar"
  | "trophy"
  | "music";

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
    kind: "message",
    title: "New message",
    description: "Ava Chen sent you a message about your next lesson.",
    timestamp: "9:42 AM",
    group: "today",
    unread: true,
  },
  {
    id: "n2",
    kind: "calendar",
    title: "Upcoming lesson",
    description: "Reminder: Guitar session with Mia Patel tomorrow at 4:00 PM.",
    timestamp: "8:15 AM",
    group: "today",
    unread: true,
  },
  {
    id: "n3",
    kind: "trophy",
    title: "Milestone unlocked",
    description: "You unlocked \"Completed Week 1\" — keep going!",
    timestamp: "Yesterday",
    group: "today",
    unread: true,
  },
  {
    id: "n4",
    kind: "message",
    title: "Community",
    description: "Someone liked your community post.",
    timestamp: "Yesterday",
    group: "today",
    unread: true,
  },
  {
    id: "n5",
    kind: "music",
    title: "Weekly practice report",
    description: "Your weekly practice report is ready to view.",
    timestamp: "Mon",
    group: "earlier",
    unread: false,
  },
  {
    id: "n6",
    kind: "music",
    title: "New sheet music",
    description: "New Guitar pieces were added that match your level.",
    timestamp: "Sun",
    group: "earlier",
    unread: false,
  },
  {
    id: "n7",
    kind: "calendar",
    title: "Lesson rescheduled",
    description: "Noah Williams updated your lesson time.",
    timestamp: "Sat",
    group: "earlier",
    unread: false,
  },
  {
    id: "n8",
    kind: "trophy",
    title: "Streak badge",
    description: "You are on a 12-day streak — amazing consistency!",
    timestamp: "Fri",
    group: "earlier",
    unread: false,
  },
];

export const NOTIFICATIONS_UNREAD_COUNT = 4;

export type ChatMessage = {
  id: string;
  from: "student" | "tutor";
  text: string;
  timestamp: string;
};

export type MessageConversation = {
  id: string;
  tutorId: string;
  tutorName: string;
  tutorInitials: string;
  online: boolean;
  lastPreview: string;
  lastTime: string;
  unread: boolean;
  messages: ChatMessage[];
};

export const MESSAGE_CONVERSATIONS: MessageConversation[] = [
  {
    id: "c1",
    tutorId: "t1",
    tutorName: "Ava Chen",
    tutorInitials: "AC",
    online: true,
    lastPreview: "See you Thursday!",
    lastTime: "10:22 AM",
    unread: true,
    messages: [
      {
        id: "m1",
        from: "tutor",
        text: "Hi Raji! How did the barre chord drills go?",
        timestamp: "Mon 3:10 PM",
      },
      {
        id: "m2",
        from: "student",
        text: "Better! Still a little buzz on the B string.",
        timestamp: "Mon 3:18 PM",
      },
      {
        id: "m3",
        from: "tutor",
        text: "Try rolling your index finger slightly and press closer to the fret.",
        timestamp: "Mon 3:22 PM",
      },
      {
        id: "m4",
        from: "student",
        text: "Will do. Should I slow the metronome again?",
        timestamp: "Mon 3:25 PM",
      },
      {
        id: "m5",
        from: "tutor",
        text: "Yes — 50% tempo until every note rings clean.",
        timestamp: "Mon 3:27 PM",
      },
      {
        id: "m6",
        from: "student",
        text: "Perfect, thanks Ava!",
        timestamp: "Mon 3:30 PM",
      },
      {
        id: "m7",
        from: "tutor",
        text: "Great work. See you Thursday!",
        timestamp: "Tue 10:22 AM",
      },
    ],
  },
  {
    id: "c2",
    tutorId: "t3",
    tutorName: "Mia Patel",
    tutorInitials: "MP",
    online: false,
    lastPreview: "Fingerpicking pattern attached...",
    lastTime: "Yesterday",
    unread: true,
    messages: [
      {
        id: "m1",
        from: "tutor",
        text: "Here is the fingerpicking pattern for this week.",
        timestamp: "Sun 11:02 AM",
      },
      {
        id: "m2",
        from: "student",
        text: "Got it — should I use thumb on bass only?",
        timestamp: "Sun 11:18 AM",
      },
      {
        id: "m3",
        from: "tutor",
        text: "Exactly. Keep the thumb steady like a heartbeat.",
        timestamp: "Sun 11:21 AM",
      },
      {
        id: "m4",
        from: "student",
        text: "Love that analogy.",
        timestamp: "Sun 11:25 AM",
      },
      {
        id: "m5",
        from: "tutor",
        text: "Record 30 seconds and send it over when you can.",
        timestamp: "Sun 11:30 AM",
      },
      {
        id: "m6",
        from: "student",
        text: "Will send tonight!",
        timestamp: "Sun 6:40 PM",
      },
    ],
  },
  {
    id: "c3",
    tutorId: "t2",
    tutorName: "Noah Williams",
    tutorInitials: "NW",
    online: true,
    lastPreview: "Rhythm worksheet is in the library.",
    lastTime: "Mar 18",
    unread: false,
    messages: [
      {
        id: "m1",
        from: "tutor",
        text: "Rhythm worksheet is in the library under Week 2.",
        timestamp: "Mar 18 9:00 AM",
      },
      {
        id: "m2",
        from: "student",
        text: "Found it — thanks!",
        timestamp: "Mar 18 9:12 AM",
      },
      {
        id: "m3",
        from: "tutor",
        text: "Focus on ghost notes in the chorus pattern.",
        timestamp: "Mar 18 9:15 AM",
      },
      {
        id: "m4",
        from: "student",
        text: "Those are tricky but fun.",
        timestamp: "Mar 18 9:20 AM",
      },
      {
        id: "m5",
        from: "tutor",
        text: "Start at 60 BPM, then bump +5 when clean.",
        timestamp: "Mar 18 9:22 AM",
      },
      {
        id: "m6",
        from: "student",
        text: "On it. Appreciate the structure.",
        timestamp: "Mar 18 9:28 AM",
      },
      {
        id: "m7",
        from: "tutor",
        text: "You are making solid progress.",
        timestamp: "Mar 18 9:30 AM",
      },
      {
        id: "m8",
        from: "student",
        text: "See you next week!",
        timestamp: "Mar 18 9:35 AM",
      },
    ],
  },
];

export const MESSAGES_UNREAD_COUNT = 2;

export type CommunityPostType = "question" | "milestone" | "tip" | "general";

export type CommunityPost = {
  id: string;
  userInitials: string;
  username: string;
  timestamp: string;
  text: string;
  tag?: string;
  type: CommunityPostType;
  likes: number;
  comments: number;
  likedByMe?: boolean;
};

export const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: "p1",
    userInitials: "LK",
    username: "Leo K.",
    timestamp: "2h ago",
    text: "How do I stop buzzing on barre chords? My index finger gets tired fast.",
    tag: "#Guitar",
    type: "question",
    likes: 14,
    comments: 6,
  },
  {
    id: "p2",
    userInitials: "RN",
    username: "Raji N.",
    timestamp: "5h ago",
    text: "Just finished Week 2 of my practice plan!",
    tag: "#Beginner",
    type: "milestone",
    likes: 32,
    comments: 4,
  },
  {
    id: "p3",
    userInitials: "AM",
    username: "Aria M.",
    timestamp: "Yesterday",
    text: "Practice tip: slow down to 50% tempo first, then build speed in small steps.",
    tag: "#Tips",
    type: "tip",
    likes: 58,
    comments: 11,
  },
  {
    id: "p4",
    userInitials: "JD",
    username: "Jordan D.",
    timestamp: "Yesterday",
    text: "Anyone have a good warm-up for sight reading on guitar?",
    tag: "#SheetMusic",
    type: "question",
    likes: 9,
    comments: 3,
  },
  {
    id: "p5",
    userInitials: "SK",
    username: "Sofia K.",
    timestamp: "2d ago",
    text: "Finally nailed the rhythm ladder exercise — metronome is your friend.",
    tag: "#PracticeRoutine",
    type: "general",
    likes: 21,
    comments: 2,
  },
  {
    id: "p6",
    userInitials: "TC",
    username: "Tom C.",
    timestamp: "3d ago",
    text: "Music theory click: the circle of fifths is less scary when you map it to songs you know.",
    tag: "#MusicTheory",
    type: "tip",
    likes: 45,
    comments: 8,
  },
];

export const COMMUNITY_TRENDING_TAGS = [
  "#GuitarTips",
  "#Beginner",
  "#PracticeRoutine",
  "#SheetMusic",
  "#MusicTheory",
] as const;

export const SUGGESTED_LEARNERS = [
  { id: "sl1", initials: "EV", name: "Elena V.", instrument: "Piano" },
  { id: "sl2", initials: "MR", name: "Marcus R.", instrument: "Violin" },
  { id: "sl3", initials: "IN", name: "Ines N.", instrument: "Guitar" },
] as const;

export type LeaderboardEntry = {
  rank: number;
  id: string;
  name: string;
  initials: string;
  instrument: string;
  minutes: number;
  streak: number;
  isRaji?: boolean;
};

export const LEADERBOARD_WEEKLY: LeaderboardEntry[] = [
  { rank: 1, id: "lb1", name: "Sofia K.", initials: "SK", instrument: "Guitar", minutes: 420, streak: 21 },
  { rank: 2, id: "lb2", name: "Marcus R.", initials: "MR", instrument: "Violin", minutes: 390, streak: 14 },
  { rank: 3, id: "lb3", name: "Leo K.", initials: "LK", instrument: "Guitar", minutes: 355, streak: 18 },
  { rank: 4, id: "lb4", name: "Aria M.", initials: "AM", instrument: "Piano", minutes: 310, streak: 9 },
  { rank: 5, id: "lb5", name: "Tom C.", initials: "TC", instrument: "Guitar", minutes: 285, streak: 11 },
  { rank: 6, id: "raji", name: "Raji Nasrallah", initials: "R", instrument: "Guitar", minutes: 265, streak: 12, isRaji: true },
  { rank: 7, id: "lb7", name: "Jordan D.", initials: "JD", instrument: "Guitar", minutes: 240, streak: 6 },
  { rank: 8, id: "lb8", name: "Ines N.", initials: "IN", instrument: "Guitar", minutes: 220, streak: 8 },
  { rank: 9, id: "lb9", name: "Elena V.", initials: "EV", instrument: "Piano", minutes: 198, streak: 5 },
  { rank: 10, id: "lb10", name: "Chris P.", initials: "CP", instrument: "Bass", minutes: 175, streak: 4 },
];

export const LEADERBOARD_ALL_TIME: LeaderboardEntry[] = [
  { rank: 1, id: "at1", name: "Aria M.", initials: "AM", instrument: "Piano", minutes: 18400, streak: 45 },
  { rank: 2, id: "at2", name: "Sofia K.", initials: "SK", instrument: "Guitar", minutes: 17250, streak: 38 },
  { rank: 3, id: "at3", name: "Leo K.", initials: "LK", instrument: "Guitar", minutes: 15890, streak: 29 },
  { rank: 4, id: "at4", name: "Marcus R.", initials: "MR", instrument: "Violin", minutes: 14200, streak: 22 },
  { rank: 5, id: "at5", name: "Tom C.", initials: "TC", instrument: "Guitar", minutes: 12100, streak: 19 },
  { rank: 6, id: "at6", name: "Jordan D.", initials: "JD", instrument: "Guitar", minutes: 9800, streak: 12 },
  { rank: 7, id: "raji", name: "Raji Nasrallah", initials: "R", instrument: "Guitar", minutes: 8640, streak: 12, isRaji: true },
  { rank: 8, id: "at8", name: "Ines N.", initials: "IN", instrument: "Guitar", minutes: 7200, streak: 15 },
  { rank: 9, id: "at9", name: "Elena V.", initials: "EV", instrument: "Piano", minutes: 6100, streak: 10 },
  { rank: 10, id: "at10", name: "Chris P.", initials: "CP", instrument: "Bass", minutes: 5400, streak: 7 },
];

export const SETTINGS_DEFAULTS = {
  name: "Raji Nasrallah",
  email: "raji@example.com",
  bio: "Passionate about music and learning. Based in Madrid.",
  primaryInstrument: "Guitar",
  skillLevel: "Intermediate",
  practiceGoalMinutes: 30,
  lessonFormat: "online" as "in_person" | "online",
} as const;

