import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

const useDateFormatter = () => {
  dayjs.extend(relativeTime)

  const toDefaultFormat = (date) => {
    return dayjs(date).format('ddd, DD MMM YYYY')
  }

  const fromNow = (date) => {
    return dayjs(date).fromNow(true)
  }

  const toReturnDateFormat = (date) => {
    return `Borrowed until ${toDefaultFormat(date)} (${fromNow(date)} from now)`
  }

  return {
    toReturnDateFormat
  }
}

export default useDateFormatter
