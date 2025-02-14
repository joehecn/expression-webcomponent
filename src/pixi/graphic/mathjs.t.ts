// npx tsx src/graphic/mathjs.t.ts

import { ConstantNode, FunctionNode, MathNode, OperatorNode, ParenthesisNode, parse, replacer, SymbolNode } from 'mathjs'

// 去除括号
function removeParenthesesNode(node: MathNode): MathNode {
  if (node instanceof ParenthesisNode) {
    console.log('removeParenthesesNode:', node.toString())
    return removeParenthesesNode(node.content)
  }

  if (node instanceof OperatorNode || node instanceof FunctionNode) {
    node.args = node.args.map(arg => removeParenthesesNode(arg))
    return node
  }

  if (node instanceof SymbolNode || node instanceof ConstantNode) return node

  throw new Error(`Unknown node type: ${node.type}`)
}

// const node = parse('1+(2+3)')
const node = parse('a+(b+c)')
// console.log(node.toString())

// const serialization = JSON.stringify(node, replacer, 2)
// console.log(serialization)

const node2 = removeParenthesesNode(node)

const serialization2 = JSON.stringify(node2, replacer, 2)
console.log(serialization2)
console.log(node2.toString({ parenthesis: 'all' }))

// const deserialization = JSON.parse(serialization, reviver)
// console.log(deserialization)

// console.log(node.toString())

// node.traverse((node, path, parent) => {
//   console.log('---:', node.toString())
//   console.log(node)
//   console.log(path)
//   console.log(parent)
// })
