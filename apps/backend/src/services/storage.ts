import fs from 'node:fs/promises';
import path from 'node:path';
import { v4 as uuid } from 'uuid';

export interface StorageAdapter {
  save(file: Express.Multer.File): Promise<string>;
}

export class LocalStorageAdapter implements StorageAdapter {
  constructor(private base = 'uploads') {}

  async save(file: Express.Multer.File): Promise<string> {
    await fs.mkdir(this.base, { recursive: true });
    const filename = `${uuid()}-${file.originalname}`;
    const filePath = path.join(this.base, filename);
    await fs.writeFile(filePath, file.buffer);
    return filePath;
  }
}
