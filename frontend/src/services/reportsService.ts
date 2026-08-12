import { apiClient } from "./apiClient";
import type { ReportSummary } from "../types/report";

export const reportsService = {
  async getReportSummary(): Promise<ReportSummary> {
    const { data } = await apiClient.get<ReportSummary>("/api/reports/summary");
    return data;
  },
};
