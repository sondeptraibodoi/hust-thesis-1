import localForage from "localforage";

const ONEDAYMS = 1 * 24 * 60 * 60 * 1000;

interface StorageOption {
  expires?: number;
  key?: string;
  type?: "session" | "";
  version?: string;
}

const DEFAULT_OPTION: StorageOption = {
  expires: 1,
  key: "default",
  type: "",
  version: "0.0.1"
};

const CustomSessionStorage = {
  getItem: (key: string): any => {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  },
  setItem: (key: string, value: any): void => {
    sessionStorage.setItem(key, JSON.stringify(value));
  },
  removeItem: (key: string): void => {
    sessionStorage.removeItem(key);
  },
  clear: (): void => {
    sessionStorage.clear();
  },
  keys: (): string[] => {
    return Object.keys(sessionStorage);
  }
};

function getStorage(type?: string) {
  return type === "session" ? CustomSessionStorage : localForage;
}

export class Storage {
  private _lastKeyStorage: Record<string, string[]> = {};

  async getItem<T>(key: string, option: StorageOption = {}): Promise<T | null> {
    key = `storage_${key}`;
    const item = await getStorage(option.type).getItem(key);
    if (!item) {
      return null;
    }
    const now = Date.now();
    if (now > item.expiry) {
      await this.removeItem(key, option);
      return null;
    }
    if (option.version && item.version != option.version) {
      await this.removeItem(key, option);
      return null;
    }
    return item.value as T;
  }

  async setItem<T>(key: string, value: T, option: StorageOption = DEFAULT_OPTION): Promise<void> {
    key = `storage_${key}`;
    if (option.key) {
      this._lastKeyStorage[option.key] = this._lastKeyStorage[option.key] || [];
      if (this._lastKeyStorage[option.key].length > 2) {
        await this.removeItem(this._lastKeyStorage[option.key][0], option);
        this._lastKeyStorage[option.key].shift();
      }
      this._lastKeyStorage[option.key].push(key);
    }

    option = { ...DEFAULT_OPTION, ...option };
    const now = Date.now();
    const item = { value, expiry: now + (option.expires ?? 1) * ONEDAYMS, version: option.version || "0.0.1" };
    await getStorage(option.type).setItem(key, item);
  }

  async removeItem(key: string, option?: StorageOption): Promise<void> {
    key = `storage_${key}`;
    await getStorage(option?.type).removeItem(key);
  }

  async removeAll(keyRemove = "", option?: StorageOption): Promise<void> {
    const keys = await getStorage(option?.type).keys();
    for (const key of keys) {
      if (key.startsWith("storage_") && key.includes(keyRemove)) {
        await getStorage(option?.type).removeItem(key);
      }
    }
  }

  async handleGetDataStorage<T>(key: string, cb: () => Promise<T>, option?: StorageOption): Promise<T> {
    const items = await this.getItem<T>(key, option);
    if (items) {
      return items;
    }
    const data = await cb();
    await this.setItem(key, data, option);
    return data;
  }
}

export default new Storage();
