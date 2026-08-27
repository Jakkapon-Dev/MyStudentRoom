import { z } from "zod";

// Role Types
export type UserRole = "ADMIN" | "TEACHER" | "STUDENT" | "PARENT";

export interface CurrentUser {
  id: string;
  code: string | null;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  avatarUrl: string | null;
  advisorRoom: string | null;
  studentRoom: string | null;
  streakDays: number;
  points: number;
}

// Check-in Zod Contract
export const CheckinSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
  studentId: z.string().min(1, "Student ID is required"),
  token: z.string().optional(),
  pinCode: z.string().optional(),
  method: z.enum(["QR", "GPS", "MANUAL", "PIN", "GATE"]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  note: z.string().optional(),
});

export type CheckinPayload = z.infer<typeof CheckinSchema>;

// Leave Request Zod Contract
export const CreateLeaveSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  leaveType: z.enum(["SICK", "BUSINESS", "ACTIVITY"]),
  startDate: z.string(),
  endDate: z.string(),
  reason: z.string().min(3, "กรุณาระบุเหตุผลการลา"),
  attachmentUrl: z.string().optional(),
  isParentDirect: z.boolean().optional(),
});

export type CreateLeavePayload = z.infer<typeof CreateLeaveSchema>;

// SafeSpace Message Contract
export const CreateSafeMessageSchema = z.object({
  studentId: z.string().min(1),
  advisorId: z.string().min(1),
  category: z.enum(["STUDY", "FRIEND", "FAMILY", "STRESS", "HEALTH", "BULLYING"]),
  content: z.string().min(5, "กรุณาระบุข้อความที่ต้องการปรึกษาอย่างน้อย 5 ตัวอักษร"),
  requestMeet: z.boolean().default(false),
});

export type CreateSafeMessagePayload = z.infer<typeof CreateSafeMessageSchema>;

// Mood Check-in Contract
export const MoodCheckinSchema = z.object({
  studentId: z.string().min(1),
  mood: z.enum(["HAPPY", "NEUTRAL", "TIRED", "STRESSED", "SAD"]),
  note: z.string().optional(),
});

// Announcement Contract
export const CreateAnnouncementSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(5),
  priority: z.enum(["NORMAL", "URGENT"]).default("NORMAL"),
  targetRoom: z.string().default("ALL"),
  senderName: z.string().min(1),
});
