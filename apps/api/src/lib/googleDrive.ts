import { google, drive_v3 } from 'googleapis';
import { logger } from './logger';

let driveClient: drive_v3.Drive | null = null;

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const creds = JSON.parse(raw);
    return new google.auth.GoogleAuth({
      credentials: creds,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
  } catch {
    logger.error('[GoogleDrive] Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON');
    return null;
  }
}

export function getDriveClient(): drive_v3.Drive | null {
  if (driveClient) return driveClient;
  const auth = getAuth();
  if (!auth) return null;
  driveClient = google.drive({ version: 'v3', auth });
  return driveClient;
}

export function isDriveConfigured(): boolean {
  return !!process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
}

export async function createGoogleDoc(
  title: string,
  sections: string[] = []
): Promise<{ fileId: string; webViewLink: string } | null> {
  const drive = getDriveClient();
  if (!drive) {
    logger.warn('[GoogleDrive] Drive not configured — skipping doc creation');
    return null;
  }

  try {
    const body = sections.length
      ? sections.map((s) => `\n\n${s}\n${'─'.repeat(40)}`).join('')
      : '';

    const res = await drive.files.create({
      requestBody: {
        name: title,
        mimeType: 'application/vnd.google-apps.document',
      },
      fields: 'id,webViewLink',
    });

    const fileId = res.data.id!;
    const webViewLink = res.data.webViewLink!;

    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    logger.info(`[GoogleDrive] Created doc: ${title} (${fileId})`);
    return { fileId, webViewLink };
  } catch (err) {
    logger.error('[GoogleDrive] createGoogleDoc failed:', err);
    return null;
  }
}

export async function uploadFileToDrive(
  fileName: string,
  mimeType: string,
  buffer: Buffer,
  folderId?: string
): Promise<{ fileId: string; webViewLink: string } | null> {
  const drive = getDriveClient();
  if (!drive) return null;

  try {
    const { Readable } = await import('stream');
    const stream = Readable.from(buffer);

    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
        ...(folderId ? { parents: [folderId] } : {}),
      },
      media: { mimeType, body: stream },
      fields: 'id,webViewLink',
    });

    const fileId = res.data.id!;
    const webViewLink = res.data.webViewLink!;

    await drive.permissions.create({
      fileId,
      requestBody: { role: 'reader', type: 'anyone' },
    });

    return { fileId, webViewLink };
  } catch (err) {
    logger.error('[GoogleDrive] uploadFileToDrive failed:', err);
    return null;
  }
}

export async function deleteFromDrive(fileId: string): Promise<boolean> {
  const drive = getDriveClient();
  if (!drive) return false;
  try {
    await drive.files.delete({ fileId });
    return true;
  } catch (err) {
    logger.error(`[GoogleDrive] deleteFromDrive failed for ${fileId}:`, err);
    return false;
  }
}
