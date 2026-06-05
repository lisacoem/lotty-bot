import * as fs from "node:fs";

export type StoredData = {
  names: string[];
  history: string[];
}

const STORAGE_FILE = './data.json';

export const loadData = (): StoredData => {
    if (!fs.existsSync(STORAGE_FILE)) {
      return { names: [], history: [] };
    }
    const fileContent = fs.readFileSync(STORAGE_FILE, 'utf-8')
    return JSON.parse(fileContent) as StoredData;
}

export const saveData = (data: StoredData) => {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
}