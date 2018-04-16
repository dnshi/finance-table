require('colors')
const csv = require('fast-csv')
const Table = require('cli-table2')

const START_OF_MONTH = 0
const END_OF_MONTH = 11
const MODE = 1

const precision = 3
const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const table = new Table({
  head: ['', ...monthNames.map((name) => name.yellow)],
})

const row = []

function print(num, isRate) {
  return `${num.toFixed(precision)}${isRate ? '' : '%'}`[
    num < 0 ? 'red' : 'green'
  ]
}

function amount(close, open) {
  return Number(close) - Number(open)
}

function rate(close, open) {
  const value = amount(close, open)
  return value / Number(open) * 100
}

csv
  .fromPath('./^GSPC.csv', { headers: true })
  .on('data', ({ Date: date, Open, Close }) => {
    const monthIndex = new Date(date).getUTCMonth()
    const val = MODE === 0 ? amount(Close, Open) : rate(Close, Open)

    row[monthIndex + 1] = print(val, MODE === 0)

    if (monthIndex === START_OF_MONTH) {
      row[START_OF_MONTH] = new Date(date).getUTCFullYear()
    }

    if (monthIndex === END_OF_MONTH) {
      table.push(row.slice())
      row.length = 0
    }
  })
  .on('end', () => {
    if (row.length > 0) {
      table.push(row)
    }
    console.log(table.toString())
  })
