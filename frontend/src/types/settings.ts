export interface UserSettings {
  default_page_size: number;
  default_sort_field: string;
  default_sort_order: string;
  currency: string;
  email_notifications: boolean;
  weekly_summary_email: boolean;
  low_stock_alerts: boolean;
}

export type UserSettingsUpdate = Partial<UserSettings>;
