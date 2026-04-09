export function getStandzeitToneClass(label: string) {
  const normalized = label.replace(/\s/g, '')
  switch (normalized) {
    case '0-30': {
      return 'bg-[#00d64f] text-black'
    }
    case '31-60': {
      return 'bg-[#c6ff00] text-black'
    }
    case '61-90': {
      return 'bg-[#ffc928] text-black'
    }
    case '91-120': {
      return 'bg-[#cfcfcf] text-black'
    }
    case '121-150': {
      return 'bg-[#bebebe] text-black'
    }
    case '151-180': {
      return 'bg-[#adadad] text-black'
    }
    case '181-360': {
      return 'bg-[#9b9b9b] text-black'
    }
    case '>360': {
      return 'bg-[#888888] text-white'
    }
    default: {
      return ''
    }
  }
}
