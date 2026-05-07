"use client";

/** Day-of-week colors per Thai สีประจำวัน convention (design spec). */
const DAY_COLORS: Record<number, { bg: string; fg: string }> = {
  0: { bg: "#fee2e2", fg: "#b91c1c" }, // อา — แดง
  1: { bg: "#fef9c3", fg: "#a16207" }, // จ  — เหลือง
  2: { bg: "#fce7f3", fg: "#be185d" }, // อ  — ชมพู
  3: { bg: "#dcfce7", fg: "#15803d" }, // พ  — เขียว
  4: { bg: "#ffedd5", fg: "#c2410c" }, // พฤ — ส้ม
  5: { bg: "#dbeafe", fg: "#1d4ed8" }, // ศ  — ฟ้า
  6: { bg: "#ede9fe", fg: "#6d28d9" }, // ส  — ม่วง
};

const DAY_NAMES = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

/** Schedule chip: shows day abbreviation + time range, colored by day of week. */
export function ScheduleChip({
  dayOfWeek,
  startTime,
  endTime,
}: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}) {
  const { bg, fg } = DAY_COLORS[dayOfWeek] ?? DAY_COLORS[1];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: bg,
        color: fg,
        fontSize: "12px",
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: "9999px",
        whiteSpace: "nowrap",
      }}
    >
      {DAY_NAMES[dayOfWeek]} {startTime}–{endTime}
    </span>
  );
}

/** Status pill: semantic session / attendance state. */
const STATUS_CONFIG = {
  checked:  { label: "เช็คชื่อแล้ว",   bg: "#dcfce7", fg: "#15803d" },
  open:     { label: "เปิดรับเช็คชื่อ", bg: "#fef9c3", fg: "#a16207" },
  closed:   { label: "ปิดแล้ว",         bg: "#fee2e2", fg: "#dc2626" },
  upcoming: { label: "ยังไม่ถึงเวลา",   bg: "#f3f4f6", fg: "#6b7280" },
  past:     { label: "ผ่านไปแล้ว",      bg: "#f3f4f6", fg: "#6b7280" },
  waiting:  { label: "รอเปิดเช็คชื่อ",  bg: "#eff6ff", fg: "#3b82f6" },
  present:  { label: "มา",             bg: "#dcfce7", fg: "#15803d" },
  late:     { label: "มาสาย",           bg: "#fef9c3", fg: "#a16207" },
  absent:   { label: "ขาด",            bg: "#fee2e2", fg: "#dc2626" },
  noexam:   { label: "ไม่มีสิทธิ์สอบ",  bg: "#fee2e2", fg: "#dc2626" },
} as const;

export type StatusVariant = keyof typeof STATUS_CONFIG;

export function StatusChip({ variant }: { variant: StatusVariant }) {
  const { label, bg, fg } = STATUS_CONFIG[variant];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: bg,
        color: fg,
        fontSize: "12px",
        fontWeight: 500,
        padding: "4px 10px",
        borderRadius: "9999px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
