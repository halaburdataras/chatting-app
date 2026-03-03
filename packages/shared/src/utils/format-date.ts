import { format } from "date-fns";

export const formatDateToLocalTime = (date: Date | string | number) => {
  return format(new Date(date), "hh:mm aaa");
};

export const formatDateToDay = (date: Date | string | number) => {
  return format(new Date(date), "PP");
};
