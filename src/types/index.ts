export type UserRole = 'trainer' | 'client' | 'admin';

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
};

export type TrainerSummary = {
  id: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  specialties?: string[];
};

export type ClientProfile = {
  id: string;
  userId: string;
  name: string;
  email?: string;
  goal?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  focusAreas?: string[];
  trainer?: TrainerSummary;
  trainerId?: string | null;
  status?: 'active' | 'paused';
};

export type PlanUserSummary = {
  id: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
};

export type TrainingPlanDifficulty = 'beginner' | 'intermediate' | 'advanced';

export type TrainingPlanExercise = {
  id: string;
  planId: string;
  workoutId: string;
  name: string;
  sets?: number;
  reps?: number;
  tempo?: string;
  restSeconds?: number;
  notes?: string;
  videoUrl?: string;
  imageUrl?: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TrainingPlanWorkout = {
  id: string;
  planId: string;
  title: string;
  day: number;
  week: number;
  notes?: string;
  position: number;
  exercises: TrainingPlanExercise[];
  createdAt?: string;
  updatedAt?: string;
};

export type TrainingPlanMetrics = {
  totalWorkouts: number;
  totalExercises: number;
  totalClients: number;
  completionRate: number;
  feedbackCount: number;
};

export type TrainingPlanProgressSummary = {
  client: PlanUserSummary;
  completedExercises: number;
  totalExercises: number;
  completionRate: number;
  lastCompletedAt?: string | null;
};

export type TrainingPlanWeeklyPoint = {
  week: number;
  completionRate: number;
};

export type TrainingPlanWeek = {
  weekNumber: number;
  description: string;
};

export type TrainingPlanWeekProgress = {
  weekNumber: number;
  status: 'locked' | 'active' | 'completed';
  unlockedAt?: string;
  completedAt?: string;
};

export type TrainingPlan = {
  id: string;
  trainerId: string;
  trainer?: PlanUserSummary | null;
  name: string;
  description?: string;
  difficulty: TrainingPlanDifficulty;
  durationWeeks: number;
  clientsAssigned: PlanUserSummary[];
  metrics: TrainingPlanMetrics;
  weeks?: TrainingPlanWeek[];
  workouts?: TrainingPlanWorkout[];
  progress?: TrainingPlanProgressSummary[];
  weeklyBreakdown?: TrainingPlanWeeklyPoint[];
  exerciseStates?: Record<
    string,
    {
      completed: boolean;
      completedAt?: string | null;
    }
  >;
  createdAt?: string;
  updatedAt?: string;
};

export type ClientTrainingPlan = TrainingPlan & {
  startDate: string;
  weeks: TrainingPlanWeek[];
  weekProgress: TrainingPlanWeekProgress[];
  myProgress: {
    completedExercises: number;
    totalExercises: number;
    completionRate: number;
    weeklyBreakdown: TrainingPlanWeeklyPoint[];
  };
  exerciseStates: Record<
    string,
    {
      completed: boolean;
      completedAt?: string | null;
    }
  >;
  schedule?: {
    workoutId: string;
    date: string;
    time?: string;
    completed: boolean;
    completedAt?: string;
    completedByTrainer?: boolean;
    photoUrl?: string;
  }[];
};

export type ClientWeekWorkouts = {
  planId: string;
  week: number;
  workouts: TrainingPlanWorkout[];
  exerciseStates: ClientTrainingPlan['exerciseStates'];
  progress: ClientTrainingPlan['myProgress'];
};

export type SessionStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type TrainingSession = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  status: SessionStatus;
  location?: string;
  trainer?: TrainerSummary;
  client?: {
    id: string;
    name: string;
    email?: string;
  };
  notes?: string;
};

export type ProgressLog = {
  id: string;
  date: string;
  weight: number;
  bodyFatPercent?: number;
  measurements?: Record<string, number>;
  notes?: string;
  createdAt: string;
};

export type TrainerProfile = {
  id: string;
  userId:
  | string
  | {
    id?: string;
    _id?: string;
    name?: string;
    email?: string;
    avatarUrl?: string;
  };
  bio?: string;
  specialties?: string[];
  yearsOfExperience?: number;
  pricePerSession?: number;
  location?: string;
  onlineSessionsAvailable?: boolean;
  socialLinks?: {
    instagram?: string;
    youtube?: string;
    website?: string;
  };
  rating?: number;
  totalReviews?: number;
};

export type ConversationPreview = {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
};

export type Message = {
  id: string;
  _id?: string;
  senderId: string | {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
  receiverId: string;
  content: string;
  createdAt: string;
  readAt?: string;
  likes?: string[];
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  updatedAt: string;
};

export type AdminTrainerSummary = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'active' | 'blocked' | 'pending';
  clientCount: number;
};

export type AdminClientSummary = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  status: 'active' | 'blocked' | 'pending';
  trainerId: string | null;
  trainer?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
};

export type TrainerChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export type TrainerChangeRequest = {
  id: string;
  client?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  currentTrainer?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  requestedTrainer?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  processedBy?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  reason: string;
  status: TrainerChangeRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export type DashboardScheduledWorkout = {
  id: string;
  assignmentId: string;
  planId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  workoutTitle: string;
  date: string;
  time?: string;
  completed: boolean;
  photoUrl?: string;
};
