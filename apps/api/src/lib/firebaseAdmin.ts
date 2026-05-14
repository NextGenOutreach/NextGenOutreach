import * as admin from 'firebase-admin';

let _app: admin.app.App | undefined;

function getAdminApp(): admin.app.App {
  if (_app) return _app;

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
  }

  if (admin.apps.length > 0) {
    _app = admin.apps[0]!;
    return _app;
  }

  _app = admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(serviceAccount) as admin.ServiceAccount),
  });

  return _app;
}

export function getAdminAuth(): admin.auth.Auth {
  return getAdminApp().auth();
}
