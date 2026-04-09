import { describe, expect, it } from 'vitest'
import { getStandzeitToneClass } from './standzeit-tone'

describe('getStandzeitToneClass', () => {
  it('normalizes whitespace in labels', () => {
    expect(getStandzeitToneClass('0 - 30')).toBe('bg-[#00d64f] text-black')
  })

  it('returns empty string for unknown label', () => {
    expect(getStandzeitToneClass('UNKNOWN')).toBe('')
  })
})

