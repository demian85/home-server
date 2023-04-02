import { Parser } from '../types'
import { readdir } from 'fs/promises'
import { join } from 'path'

export async function loadParsers() {
  const baseDir = join(__dirname, 'devices')
  const files = await readdir(baseDir)
  const parserEntries: [string, Parser][] = []

  for (const file of files) {
    const parsers: Record<string, Parser> = (await import(join(baseDir, file)))
      .default
    parserEntries.push(...Object.entries(parsers))
  }

  return Object.fromEntries(parserEntries)
}
