import dayjs from "dayjs";
import { desc, eq, lte, sql } from "drizzle-orm";
import { gte } from "drizzle-orm";
import { count } from "drizzle-orm";
import { sum } from "drizzle-orm";
import { and } from "drizzle-orm";

import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";

interface Params {
  from: string;
  to: string;
  session: {
    user: {
      clinic: {
        id: string;
      };
    };
  };
}

export const getDashboard = async ({ from, to, session }: Params) => {
  const chartStartDate = dayjs().subtract(10, "days").startOf("day").toDate();
  const chartEndDate = dayjs().add(10, "days").endOf("day").toDate();
  const [
    [totalRevenue],
    [totalAppointments],
    [totalPatients],
    [totalDoctors],
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  ] = await Promise.all([
    db
      .select({
        total: sum(appointmentsTable.appointmentPriceInCents),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') >= DATE(${from})`,
          sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') <= DATE(${to})`,
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') >= DATE(${from})`,
          sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') <= DATE(${to})`,
        ),
      ),
    db
      .select({
        total: count(),
      })
      .from(patientsTable)
      .where(eq(patientsTable.clinicId, session.user.clinic.id)),
    db
      .select({
        total: count(),
      })
      .from(doctorsTable)
      .where(eq(doctorsTable.clinicId, session.user.clinic.id)),
    db
      .select({
        id: doctorsTable.id,
        name: doctorsTable.name,
        avatarImageUrl: doctorsTable.avatarImageUrl,
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(doctorsTable)
      .leftJoin(
        appointmentsTable,
        and(
          eq(appointmentsTable.doctorId, doctorsTable.id),
          sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') >= DATE(${from})`,
          sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') <= DATE(${to})`,
        ),
      )
      .where(eq(doctorsTable.clinicId, session.user.clinic.id))
      .groupBy(doctorsTable.id)
      .orderBy(desc(count(appointmentsTable.id)))
      .limit(10),
    db
      .select({
        specialty: doctorsTable.specialty,
        appointments: count(appointmentsTable.id),
      })
      .from(appointmentsTable)
      .innerJoin(doctorsTable, eq(appointmentsTable.doctorId, doctorsTable.id))
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') >= DATE(${from})`,
          sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo') <= DATE(${to})`,
        ),
      )
      .groupBy(doctorsTable.specialty)
      .orderBy(desc(count(appointmentsTable.id))),
    db.query.appointmentsTable.findMany({
      where: and(
        eq(appointmentsTable.clinicId, session.user.clinic.id),
        gte(
          appointmentsTable.date,
          new Date(dayjs().startOf("day").utc().format("YYYY-MM-DD HH:mm:ss")),
        ),
        lte(
          appointmentsTable.date,
          new Date(dayjs().endOf("day").utc().format("YYYY-MM-DD HH:mm:ss")),
        ),
      ),
      with: {
        patient: true,
        doctor: true,
      },
    }),
    db
      .select({
        date: sql<string>`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')`.as(
          "date",
        ),
        appointments: count(appointmentsTable.id),
        revenue:
          sql<number>`COALESCE(SUM(${appointmentsTable.appointmentPriceInCents}), 0)`.as(
            "revenue",
          ),
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.clinicId, session.user.clinic.id),
          gte(appointmentsTable.date, chartStartDate),
          lte(appointmentsTable.date, chartEndDate),
        ),
      )
      .groupBy(
        sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')`,
      )
      .orderBy(
        sql`DATE(${appointmentsTable.date} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo')`,
      ),
  ]);

  return {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    topDoctors,
    topSpecialties,
    todayAppointments,
    dailyAppointmentsData,
  };
};
