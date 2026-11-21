export type ReportLayout = 'dossier' | 'mosaic' | 'table';

export interface ReportOptions {
    showLogo: boolean;
    showTitle: boolean;
    showSubtitle: boolean;
    showDate: boolean;
    showAuditor: boolean;
    showReference: boolean;
    showDocPhoto: boolean;
    showUserEmail: boolean;
    showUserPhone: boolean;
    showUserStatus: boolean;
    showUserDate: boolean;
    showUid: boolean;
    uidTextSize: string;
    idNumberTextSize: string;
    nameTextSize: string;
    docWidthPercent: number;
    reportLayout: ReportLayout;
}

export interface SelectedDocument {
    url: string;
    fullName: string;
    idNumber: string;
    idType?: boolean;
    uid: string;
}

export const DEFAULT_REPORT_OPTIONS: ReportOptions = {
    showLogo: true,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showAuditor: true,
    showReference: true,
    showDocPhoto: true,
    showUserEmail: true,
    showUserPhone: true,
    showUserStatus: true,
    showUserDate: true,
    showUid: true,
    uidTextSize: 'text-xs',
    idNumberTextSize: 'text-sm',
    nameTextSize: 'text-base',
    docWidthPercent: 35,
    reportLayout: 'dossier',
};

export const EXPORT_STATE_STORAGE_KEY = 'fajaext_export_report_state_v1';

export interface PersistedExportState {
    searchQuery: string;
    adminScope: 'all' | 'visible';
    reportOptions: ReportOptions;
}
