import { Parser } from '../types.js'
import { readdir } from 'fs/promises'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

export async function loadParsers() {
  const baseDir = join(dirname(fileURLToPath(import.meta.url)), 'devices')
  const files = await readdir(baseDir)
  const parserEntries: [string, Parser][] = []

  for (const file of files) {
    const parsers: Record<string, Parser> = (await import(join(baseDir, file)))
      .default
    parserEntries.push(...Object.entries(parsers))
  }

  return Object.fromEntries(parserEntries)
}
