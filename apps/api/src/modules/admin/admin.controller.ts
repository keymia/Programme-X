import { Body, Controller, Delete, Get, Param, Patch, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AdminService } from "./admin.service";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("dashboard")
  dashboard() {
    return this.adminService.getDashboard();
  }

  @Get("export")
  async export(@Res() res: any) {
    const buffer = await this.adminService.exportExcel();
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="admin-dashboard-export.xlsx"`);
    res.send(buffer);
  }

  @Get("registrations")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  registrations() {
    return this.adminService.listRegistrations();
  }

  @Patch("registrations/:category/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  updateRegistration(
    @Param("category") category: "mentor" | "mentee",
    @Param("id") id: string,
    @Body() body: Record<string, unknown>
  ) {
    return this.adminService.updateRegistration(category, id, body);
  }

  @Delete("registrations/:category/:id")
  @UseGuards(AuthGuard("jwt"), RolesGuard)
  @Roles("ADMIN", "SUPER_ADMIN")
  deleteRegistration(@Param("category") category: "mentor" | "mentee", @Param("id") id: string) {
    return this.adminService.deleteRegistration(category, id);
  }
}
