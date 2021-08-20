import { readFileSync } from 'fs'
import AnsiRegex from 'ansi-regex'
import { glob } from 'glob'

const ansiRegex = AnsiRegex()
const noChanges = 'Your infrastructure matches the configuration'
const summaryPrefix = 'Plan: '

export function parsePlan(content: string): string {
  if (content.includes(noChanges)) {
    return ''
  }

  return content
    .replace(ansiRegex, '')
    .split('\n')
    .find((line) => line.startsWith(summaryPrefix))
    ?.slice(summaryPrefix.length) as string
}

function trimPrefix(path: string, prefix: string) {
  const escaped = prefix.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  const re = new RegExp(`^${escaped}/?`)
  return path.replace(re, '')
}

function trimExt(path: string) {
  return path.replace(/\.\w*$/, '')
}

export type Fields = { title: string; value: string }[]

export function parsePlanDir(path: string, prefix?: string): Fields {
  const paths = glob.sync(path, { nodir: true })
  return paths.reduce<Fields>((acc, file) => {
    const value = parsePlan(readFileSync(file, 'utf8'))
    if (value) {
      const title = trimExt(prefix ? trimPrefix(file, prefix) : file)
      acc.push({ title, value })
    }
    return acc
  }, [])
}
