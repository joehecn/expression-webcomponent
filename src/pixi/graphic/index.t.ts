// npx tsx src/graphic/index.t.ts

import { transformExpression } from './index.js'

const expression = 'NaN + NaN'

const parentAndPaths = [
  { node: 'NaN + NaN', path: null, parent: null },
  { node: 'NaN', path: 'args[0]', parent: 'NaN + NaN' },
]

const replace = 'NaN + NaN'

const transformed = transformExpression(expression, parentAndPaths, replace)

console.log(transformed)

