import { format, formatDistanceToNow } from "date-fns";

export const formatDateToLocalTime = (date: Date | string | number) => {
  return format(new Date(date), "hh:mm aaa");
};

export const formatDateToDay = (date: Date | string | number) => {
  return format(new Date(date), "PP");
};

/** Relative time for message previews (e.g. "2 min ago", "Just now") */
export const formatRelativeTime = (date: Date | string | number) => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};
