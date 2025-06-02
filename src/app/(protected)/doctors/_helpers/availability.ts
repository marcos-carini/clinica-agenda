import "dayjs/locale/pt-br";

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { doctorsTable } from "@/db/schema";

dayjs.extend(utc);
dayjs.locale("pt-br");

export const getAvailability = (doctor: typeof doctorsTable.$inferSelect) => {
  // Primeiro convertemos os horários UTC do banco para local
  const fromTime = dayjs()
    .utc()
    .set("hour", Number(doctor.availableFromTime.split(":")[0]))
    .set("minute", Number(doctor.availableFromTime.split(":")[1]))
    .set("second", Number(doctor.availableFromTime.split(":")[2] || 0))
    .local();

  const toTime = dayjs()
    .utc()
    .set("hour", Number(doctor.availableToTime.split(":")[0]))
    .set("minute", Number(doctor.availableToTime.split(":")[1]))
    .set("second", Number(doctor.availableToTime.split(":")[2] || 0))
    .local();

  // Agora criamos as datas com os dias da semana usando os horários já convertidos
  const from = dayjs()
    .day(doctor.availableFromWeekDay)
    .set("hour", fromTime.hour())
    .set("minute", fromTime.minute())
    .set("second", fromTime.second());

  const to = dayjs()
    .day(doctor.availableToWeekDay)
    .set("hour", toTime.hour())
    .set("minute", toTime.minute())
    .set("second", toTime.second());

  return { from, to };
};
