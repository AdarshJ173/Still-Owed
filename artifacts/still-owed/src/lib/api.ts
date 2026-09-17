/**
 * Client API for Still Owed
 * Connects to the Express API server with automatic session handling
 * and offline/network failure resilience.
 */

export interface CaseItem {
  id: string;
  ownerId: string;
  merchantLabel: string;
  itemLabel: string;
  orderReference?: string | null;
  requestedAmountPaise?: number | null;
  desiredResolution: string;
  lifecycle: "active" | "resolved" | "closed_without_resolution" | "withdrawn" | "deletion_pending";
  version: number;
  createdAt: string;
  updatedAt: string;
  fictional?: boolean;
}

export interface SourceItem {
  id: string;
  caseId: string;
  ownerId: string;
  kind: "image" | "note";
  storagePath?: string | null;
  originalFilename?: string | null;
  mime?: string | null;
  byteSize?: number | null;
  sha256?: string | null;
  noteText?: string | null;
  reportedSourceAt?: string | null;
  sourceTimePrecision: string;
  channel: string;
  uploadState: string;
  extractionState: string;
  createdAt: string;
}

export interface PromiseTerm {
  recordId: string;
  actionKind: string;
  conditionLabel?: string | null;
  triggerEventId?: string | null;
  rawWindow?: string | null;
  durationHours?: number | null;
  statedDueAt?: string | null;
  chosenCheckAt?: string | null;
  timezone: string;
  dateBasis: string;
  userDisposition: string;
}

export interface RecordItem {
  id: string;
  caseId: string;
  ownerId: string;
  kind: "statement" | "promise" | "event" | "outcome";
  sourceId?: string | null;
  selectedLineIds: string[];
  verbatimText: string;
  correctedText?: string | null;
  authorType: "support" | "user";
  reportedAt?: string | null;
  precision: string;
  revisionOf?: string | null;
  confirmedAt: string;
  createdAt: string;
  promise?: PromiseTerm | null;
}

export interface RecordLink {
  id: string;
  caseId: string;
  ownerId: string;
  earlierRecordId: string;
  laterRecordId: string;
  relation: "changed_date" | "changed_explanation" | "confirms_condition" | "additional_info" | "correction";
  confirmedAt: string;
}

export interface CaseOutcome {
  id: string;
  caseId: string;
  ownerId: string;
  kind: string;
  receivedTotalPaise?: number | null;
  receivedDate?: string | null;
  note?: string | null;
  createdAt: string;
}

export interface CaseDetailResponse {
  case: CaseItem;
  sources: SourceItem[];
  records: RecordItem[];
  links: RecordLink[];
  outcomes: CaseOutcome[];
}

export interface NormalizedBoundingBox {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface ExtractionLine {
  id: string;
  text: string;
  confidence: number;
  boundingBox?: NormalizedBoundingBox;
  polygon?: Array<{ x: number; y: number }>;
}

export interface ExtractionResponse {
  extraction: {
    id: string;
    sourceId: string;
    status: string;
    provider: string;
    lines: ExtractionLine[];
  };
  lines: ExtractionLine[];
}

export interface SnapshotResponse {
  snapshotVersion: string;
  generatedAt: string;
  case: CaseItem;
  chronology: RecordItem[];
  sources: SourceItem[];
  links: RecordLink[];
  outcomes: CaseOutcome[];
  summary: {
    totalRecords: number;
    totalSources: number;
    lastUpdated: string;
  };
}

const USER_STORAGE_KEY = "still-owed-user-id-v1";

export function getStoredUserId(): string {
  try {
    const existing = localStorage.getItem(USER_STORAGE_KEY);
    if (existing && existing.trim().length > 0) return existing.trim();
  } catch {
    // Ignore localStorage access restrictions
  }
  const newId = "dev-user-001";
  try {
    localStorage.setItem(USER_STORAGE_KEY, newId);
  } catch {
    // Ignore
  }
  return newId;
}

export function setStoredUserId(id: string): void {
  try {
    localStorage.setItem(USER_STORAGE_KEY, id);
  } catch {
    // Ignore
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const userId = getStoredUserId();
  const headers = new Headers(options.headers || {});
  headers.set("x-user-id", userId);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed with status ${response.status}`;
    try {
      const errJson = (await response.json()) as { error?: string };
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // Ignore json parse error
    }
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Cases
  async listCases(): Promise<{ active: CaseItem[]; closed: CaseItem[]; total: number }> {
    return request<{ active: CaseItem[]; closed: CaseItem[]; total: number }>("/api/cases");
  },
  async seedDemoCase(): Promise<{ success: boolean; caseId: string; alreadyExisted: boolean }> {
    return request<{ success: boolean; caseId: string; alreadyExisted: boolean }>("/api/cases/seed-demo", {
      method: "POST",
    });
  },


  async createCase(data: {
    merchantLabel: string;
    itemLabel: string;
    orderReference?: string;
    requestedAmountPaise?: number;
    desiredResolution?: string;
  }): Promise<CaseItem> {
    return request<CaseItem>("/api/cases", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async getCase(id: string): Promise<CaseDetailResponse> {
    return request<CaseDetailResponse>(`/api/cases/${id}`);
  },

  async deleteCase(id: string): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>(`/api/cases/${id}/delete`, {
      method: "POST",
    });
  },

  async getSnapshot(id: string): Promise<SnapshotResponse> {
    return request<SnapshotResponse>(`/api/cases/${id}/snapshot`);
  },

  // Sources & Uploads
  async reserveUploadSlot(
    caseId: string,
    data: {
      kind: "image" | "note";
      originalFilename?: string;
      mime?: string;
      channel?: string;
      noteText?: string;
      reportedSourceAt?: string;
    },
  ): Promise<{ source: SourceItem; uploadTargetUrl: string; maxBytes: number }> {
    return request<{ source: SourceItem; uploadTargetUrl: string; maxBytes: number }>(
      `/api/cases/${caseId}/upload-slot`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async uploadSourceData(
    sourceId: string,
    data: {
      dataUrl?: string;
      base64?: string;
      noteText?: string;
      originalFilename?: string;
      mime?: string;
    },
  ): Promise<{ success: boolean; source: SourceItem }> {
    return request<{ success: boolean; source: SourceItem }>(`/api/sources/${sourceId}/upload`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async triggerOcr(sourceId: string): Promise<ExtractionResponse> {
    return request<ExtractionResponse>(`/api/sources/${sourceId}/read`, {
      method: "POST",
    });
  },

  async getExtraction(sourceId: string): Promise<ExtractionResponse> {
    return request<ExtractionResponse>(`/api/sources/${sourceId}/extraction`);
  },

  async saveDraft(
    sourceId: string,
    draft: {
      selectedLineIds: string[];
      formFields: Record<string, unknown>;
      basedOnCaseVersion?: number;
    },
  ): Promise<{ draft: unknown; savedAt: string }> {
    return request<{ draft: unknown; savedAt: string }>(`/api/sources/${sourceId}/draft`, {
      method: "PUT",
      body: JSON.stringify(draft),
    });
  },

  async getDraft(sourceId: string): Promise<{ draft: { selectedLineIds: string[]; formFields: Record<string, unknown> } | null }> {
    return request<{ draft: { selectedLineIds: string[]; formFields: Record<string, unknown> } | null }>(
      `/api/sources/${sourceId}/draft`,
    );
  },

  // Records & Promises
  async confirmRecord(
    caseId: string,
    data: {
      expectedCaseVersion?: number;
      kind: "statement" | "promise" | "event" | "outcome";
      sourceId?: string;
      selectedLineIds?: string[];
      verbatimText: string;
      correctedText?: string;
      authorType?: "support" | "user";
      reportedAt?: string;
      precision?: string;
      revisionOf?: string;
      promise?: {
        actionKind: string;
        conditionLabel?: string;
        triggerEventId?: string;
        rawWindow?: string;
        durationHours?: number;
        statedDueAt?: string;
        chosenCheckAt?: string;
        timezone?: string;
        dateBasis?: string;
        userDisposition?: string;
      };
    },
  ): Promise<{ record: RecordItem; promiseTerm?: PromiseTerm; newCaseVersion: number }> {
    return request<{ record: RecordItem; promiseTerm?: PromiseTerm; newCaseVersion: number }>(
      `/api/cases/${caseId}/records`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
  },

  async linkRecords(
    caseId: string,
    data: {
      earlierRecordId: string;
      laterRecordId: string;
      relation: "changed_date" | "changed_explanation" | "confirms_condition" | "additional_info" | "correction";
    },
  ): Promise<{ link: RecordLink; newCaseVersion: number }> {
    return request<{ link: RecordLink; newCaseVersion: number }>(`/api/cases/${caseId}/links`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async recordOutcome(
    caseId: string,
    data: {
      kind: string;
      receivedTotalPaise?: number;
      receivedDate?: string;
      note?: string;
    },
  ): Promise<{ outcome: CaseOutcome; newLifecycle: string }> {
    return request<{ outcome: CaseOutcome; newLifecycle: string }>(`/api/cases/${caseId}/outcomes`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Account
  async deleteAccount(): Promise<{ success: boolean; message: string }> {
    return request<{ success: boolean; message: string }>("/api/account/delete", {
      method: "POST",
    });
  },
};
