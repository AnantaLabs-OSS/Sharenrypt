import { nanoid } from 'nanoid';

export class Encryption {
  public static async generateKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256,
      },
      true,
      ['encrypt', 'decrypt']
    );
  }

  public static async exportKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exported)));
  }

  public static async importKey(keyString: string): Promise<CryptoKey> {
    const keyData = Uint8Array.from(atob(keyString), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
      'raw',
      keyData,
      'AES-GCM',
      true,
      ['encrypt', 'decrypt']
    );
  }

  static async encryptFile(file: File): Promise<{
    encryptedData: ArrayBuffer;
    key: string;
    iv: string;
    transferId: string;
  }> {
    const key = await this.generateKey();
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const transferId = nanoid();

    const arrayBuffer = await file.arrayBuffer();
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      arrayBuffer
    );

    return {
      encryptedData,
      key: await this.exportKey(key),
      iv: btoa(String.fromCharCode(...iv)),
      transferId,
    };
  }

  static async decryptFile(
    encryptedData: ArrayBuffer,
    keyString: string,
    ivString: string
  ): Promise<ArrayBuffer> {
    const key = await this.importKey(keyString);
    const iv = Uint8Array.from(atob(ivString), c => c.charCodeAt(0));

    return await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      encryptedData
    );
  }
}