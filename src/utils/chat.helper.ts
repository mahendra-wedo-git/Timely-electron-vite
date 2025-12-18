// import dayjs from "dayjs";
// import { IChatReaction, IUserLite } from "packages/types/src";

// export function groupChatData(messages: any[], logs: any[]) {
//   const combined = [...messages, ...logs];
//   combined.sort(
//     (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
//   );
//   return combined.reduce((acc: Record<string, any[]>, item) => {
//     const dateKey = dayjs(item.created_at).format("YYYY-MM-DD");

//     if (!acc[dateKey]) acc[dateKey] = [];

//     acc[dateKey].push(item);
//     return acc;
//   }, {});
// }

export function groupChatData(messages: any[], logs: any[]) {
  if(!messages || !logs) return {};
  const combined = [...messages, ...logs];

  combined.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return combined.reduce((acc: Record<string, any[]>, item) => {
    const date = new Date(item.created_at);

    // YYYY-MM-DD format
    const dateKey = date.toISOString().split("T")[0];

    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(item);

    return acc;
  }, {});
}


export function formatDateLabel(dateStr: string, showTime = false) {
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Format time (e.g., 3:00 PM)
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  let label: string;

  // Today / Yesterday
  if (date.toDateString() === today.toDateString()) {
    label = "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    label = "Yesterday";
  } else {
    // Last 7 days → weekday name
    const diffTime = today.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 3600 * 24);

    if (diffDays < 7) {
      label = date.toLocaleDateString("en-US", { weekday: "long" });
    } else {
      // Older → full date
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  return showTime ? `${label} ${time}` : label;
}

export function formatMonthLabel(dateStr: string) {
  const date = new Date(dateStr);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11 index

  const messageYear = date.getFullYear();
  const messageMonth = date.getMonth();

  // ✅ If message is from the current month
  if (messageYear === currentYear && messageMonth === currentMonth) {
    return "This Month";
  }

  // ✅ If message is from this year (but not current month)
  if (messageYear === currentYear) {
    return date.toLocaleDateString("en-US", {
      month: "long",
    });
  }

  // ✅ Older years → month + year
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function generateInvoiceNumber(): string {
  const now = new Date();

  const mm = String(now.getMonth() + 1).padStart(2, "0");

  const yyyy = now.getFullYear();
  const dd = String(now.getDate()).padStart(2, "0");
  const MM = String(now.getMinutes()).padStart(2, "0");
  const SS = String(now.getSeconds()).padStart(2, "0");

  const timestamp = `${yyyy}${mm}${dd}${MM}${SS}`;

  return `INV-${timestamp}`;
}

export function formatToTime(isoString: string, AMPM = false): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: AMPM });
}

export const formatMessageDate = (dateString: string) => {
  const msgDate = new Date(dateString);
  const today = new Date();
  const isToday =
    msgDate.getDate() === today.getDate() &&
    msgDate.getMonth() === today.getMonth() &&
    msgDate.getFullYear() === today.getFullYear();

  return isToday
    ? msgDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : msgDate.toLocaleDateString([], { day: "2-digit", month: "numeric" });
};


// export function getMemberName(member: IUserLite): string {
//   if (member.first_name && member.last_name) {
//     return `${member.first_name} ${member.last_name}`;
//   }
//   return member.display_name;
// }

// export function groupReactionsWithUsers(
//   reactions: IChatReaction[],
//   currentUserId: string,
//   usersById: Record<string, any>
// ) {
//   const grouped = reactions.reduce((acc, r) => {
//     if (!acc[r.emoji]) {
//       acc[r.emoji] = {
//         emoji: r.emoji,
//         users: [] as any[],
//         count: 0,
//         reactedByMe: false,
//       };
//     }
//     acc[r.emoji].count += 1;
//     acc[r.emoji].users.push(usersById[r.user] || { id: r.user, name: "Unknown" });
//     if (r.user === currentUserId) acc[r.emoji].reactedByMe = true;
//     return acc;
//   }, {} as Record<string, { emoji: string; users: any[]; count: number; reactedByMe: boolean }>);

//   return Object.values(grouped);
// }

export function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = (bytes / Math.pow(k, i)).toFixed(2);
  return parseFloat(value) + " " + sizes[i];
}
