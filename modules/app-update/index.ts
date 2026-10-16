import { requireOptionalNativeModule } from 'expo';

export type UpdateAvailability = 'available' | 'not_available' | 'in_progress' | 'unknown';

export type InstallStatus =
  | 'pending'
  | 'downloading'
  | 'downloaded'
  | 'installing'
  | 'installed'
  | 'failed'
  | 'canceled'
  | 'unknown';

export type PlayUpdateInfo = {
  updateAvailability: UpdateAvailability;
  installStatus: InstallStatus;
  flexibleAllowed: boolean;
  immediateAllowed: boolean;
  availableVersionCode: number;
};

export type StartUpdateResult = 'accepted' | 'declined' | 'failed' | 'not_allowed';

type AppUpdateEvents = {
  onInstallStatusChange: (event: { status: InstallStatus }) => void;
};

type AppUpdateNativeModule = {
  // Android
  getUpdateInfo?: () => Promise<PlayUpdateInfo>;
  startUpdate?: (type: 'flexible' | 'immediate') => Promise<StartUpdateResult>;
  completeUpdate?: () => Promise<void>;
  addListener?: <K extends keyof AppUpdateEvents>(
    eventName: K,
    listener: AppUpdateEvents[K],
  ) => { remove: () => void };
  // iOS
  presentStorePage?: (appStoreId: string) => Promise<void>;
};

// Optional so the app (and Jest) keep working in builds without the native module.
const AppUpdate = requireOptionalNativeModule<AppUpdateNativeModule>('AppUpdate');

export const getPlayUpdateInfo = async (): Promise<PlayUpdateInfo | null> =>
  AppUpdate?.getUpdateInfo ? AppUpdate.getUpdateInfo() : null;

export const startPlayUpdate = async (
  type: 'flexible' | 'immediate',
): Promise<StartUpdateResult> =>
  AppUpdate?.startUpdate ? AppUpdate.startUpdate(type) : 'not_allowed';

export const completePlayUpdate = async (): Promise<void> => {
  await AppUpdate?.completeUpdate?.();
};

export const addInstallStatusListener = (
  listener: (status: InstallStatus) => void,
): (() => void) => {
  const subscription = AppUpdate?.addListener?.('onInstallStatusChange', event =>
    listener(event.status),
  );
  return () => subscription?.remove();
};

export const presentAppStorePage = async (appStoreId: string): Promise<void> => {
  if (!AppUpdate?.presentStorePage) {
    throw new Error('App Store page is not available');
  }
  await AppUpdate.presentStorePage(appStoreId);
};
