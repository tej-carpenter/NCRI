import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Device, DeviceInfo, BatteryInfo } from '@capacitor/device';
import { Share } from '@capacitor/share';
import { Preferences } from '@capacitor/preferences';

export class NativeService {
  /**
   * Provide tactile haptic feedback for user actions
   */
  static async hapticFeedback(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
    try {
      await Haptics.impact({ style });
    } catch {
      // Graceful fallback on web or unsupported devices
    }
  }

  /**
   * Trigger success notification vibration
   */
  static async hapticSuccess(): Promise<void> {
    try {
      await Haptics.notification({ type: 'SUCCESS' as any });
    } catch {
      // Fallback
    }
  }

  /**
   * Get current network connectivity status
   */
  static async getNetworkStatus(): Promise<ConnectionStatus> {
    try {
      return await Network.getStatus();
    } catch {
      return { connected: navigator.onLine, connectionType: 'unknown' };
    }
  }

  /**
   * Listen to network connection changes (Online / Offline)
   */
  static addNetworkListener(callback: (status: ConnectionStatus) => void) {
    try {
      return Network.addListener('networkStatusChange', callback);
    } catch {
      const handleOnline = () => callback({ connected: true, connectionType: 'wifi' });
      const handleOffline = () => callback({ connected: false, connectionType: 'none' });
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return {
        remove: async () => {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        },
      };
    }
  }

  /**
   * Fetch device and OS metadata
   */
  static async getDeviceInfo(): Promise<{ info: Partial<DeviceInfo>; battery: Partial<BatteryInfo> }> {
    try {
      const info = await Device.getInfo();
      let battery: Partial<BatteryInfo> = {};
      try {
        battery = await Device.getBatteryInfo();
      } catch {
        // Battery not available on some web targets
      }
      return { info, battery };
    } catch {
      return {
        info: {
          platform: 'web',
          operatingSystem: 'unknown',
          model: navigator.userAgent,
          manufacturer: 'Unknown',
        },
        battery: {},
      };
    }
  }

  /**
   * Open the native OS share sheet
   */
  static async shareContent(options: { title: string; text: string; url?: string; dialogTitle?: string }): Promise<boolean> {
    try {
      if ((await Share.canShare()).value) {
        await Share.share(options);
        return true;
      }
    } catch {
      // Fallback to Web Share API or Clipboard
    }

    if (navigator.share) {
      try {
        await navigator.share(options);
        return true;
      } catch {
        // Ignored if cancelled
      }
    }

    try {
      await navigator.clipboard.writeText(`${options.title}\n\n${options.text}${options.url ? `\n${options.url}` : ''}`);
      alert('Report link copied to clipboard!');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Persistent key-value storage (Preferences plugin)
   */
  static async setStorage(key: string, value: any): Promise<void> {
    try {
      await Preferences.set({ key, value: JSON.stringify(value) });
    } catch {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  static async getStorage<T>(key: string, fallback: T): Promise<T> {
    try {
      const { value } = await Preferences.get({ key });
      if (value !== null && value !== undefined) {
        return JSON.parse(value);
      }
    } catch {
      const local = localStorage.getItem(key);
      if (local !== null) {
        try {
          return JSON.parse(local);
        } catch {
          return fallback;
        }
      }
    }
    return fallback;
  }
}
