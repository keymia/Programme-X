import { Injectable, Logger } from "@nestjs/common";
import { MatchStatus } from "../../generated/prisma/client";
import * as XLSX from "xlsx";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboard() {
    try {
      const [totalMentors, totalMentees, activeMatches, recentMentors, recentMentees, monthlyMentors, monthlyMentees] =
        await Promise.all([
          this.prisma.mentorApplication.count(),
          this.prisma.menteeApplication.count(),
          this.prisma.matching.count({ where: { status: MatchStatus.APPROVED } }),
          this.prisma.mentorApplication.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
          this.prisma.menteeApplication.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
          this.prisma.mentorApplication.findMany({ select: { createdAt: true } }),
          this.prisma.menteeApplication.findMany({ select: { createdAt: true } })
        ]);

      const map = new Map<string, { month: string; mentors: number; mentees: number }>();
      const months = 6;
      for (let i = months - 1; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        map.set(key, { month: key, mentors: 0, mentees: 0 });
      }
      for (const m of monthlyMentors) {
        const key = `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, "0")}`;
        if (map.has(key)) map.get(key)!.mentors++;
      }
      for (const m of monthlyMentees) {
        const key = `${m.createdAt.getFullYear()}-${String(m.createdAt.getMonth() + 1).padStart(2, "0")}`;
        if (map.has(key)) map.get(key)!.mentees++;
      }

      return {
        totals: { totalMentors, totalMentees, activeMatches },
        recentRegistrations: {
          mentors: recentMentors.map((x) => ({ name: x.fullName, email: x.email, createdAt: x.createdAt })),
          mentees: recentMentees.map((x) => ({ name: x.fullName, email: x.email, createdAt: x.createdAt }))
        },
        monthlyActivity: Array.from(map.values())
      };
    } catch (error) {
      this.logger.warn("Dashboard fallback: database unavailable.");
      this.logger.debug(error);
      return {
        totals: { totalMentors: 0, totalMentees: 0, activeMatches: 0 },
        recentRegistrations: {
          mentors: [],
          mentees: []
        },
        monthlyActivity: []
      };
    }
  }

  async exportExcel() {
    const data = await this.getDashboard();
    const wb = XLSX.utils.book_new();
    const summary = XLSX.utils.json_to_sheet([
      { metric: "Total mentors", value: data.totals.totalMentors },
      { metric: "Total mentees", value: data.totals.totalMentees },
      { metric: "Jumelages actifs", value: data.totals.activeMatches }
    ]);
    const monthly = XLSX.utils.json_to_sheet(data.monthlyActivity);
    const recent = XLSX.utils.json_to_sheet([
      ...data.recentRegistrations.mentors.map((r) => ({ type: "mentor", ...r })),
      ...data.recentRegistrations.mentees.map((r) => ({ type: "mentee", ...r }))
    ]);
    XLSX.utils.book_append_sheet(wb, summary, "Summary");
    XLSX.utils.book_append_sheet(wb, monthly, "Monthly");
    XLSX.utils.book_append_sheet(wb, recent, "Recent");
    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  }
}
