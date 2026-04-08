export function getStandzeitToneClass(label: string) {
  const normalized = label.replace(/\s/g, '')
  if (normalized === '0-30') return 'bg-[#00d64f] text-black'
  if (normalized === '31-60') return 'bg-[#c6ff00] text-black'
  if (normalized === '61-90') return 'bg-[#ffc928] text-black'
  if (normalized === '91-120') return 'bg-[#cfcfcf] text-black'
  if (normalized === '121-150') return 'bg-[#bebebe] text-black'
  if (normalized === '151-180') return 'bg-[#adadad] text-black'
  if (normalized === '181-360') return 'bg-[#9b9b9b] text-black'
  if (normalized === '>360') return 'bg-[#888888] text-white'
  return ''
}
