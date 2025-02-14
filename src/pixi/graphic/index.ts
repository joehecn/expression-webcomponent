
import { ConstantNode, FunctionNode, MathNode, OperatorNode, ParenthesisNode, parse, SymbolNode } from 'mathjs'

import { Container, Graphics, Text, TextStyle, FillInput, extensions } from 'pixi.js'

import { ExpressionContainer, ParentAndPath, ResultType } from '../define.js'

export const staticTint = 0xffffff
export const dragingTint = 0xdddddd
export const differTint = 0xf56c6c
export const hitTint = 0x67c23a

extensions.mixin(Container, {
  // expression: '',
  // parentAndPaths: [],
  isTemplate: false,
  isRoot: false,
  isLeaf: false,
  // leaf
  setCollisionDetectionGraphicsTint(tint: number, alpha: number) {
    const self = this as ExpressionContainer
    if (self.collisionDetectionGraphics) {
      self.collisionDetectionGraphics.tint = tint
      self.collisionDetectionGraphics.alpha = alpha
    }
  },
  getCheckAreaBounds() {
    const self = this as ExpressionContainer
    if (self.collisionDetectionGraphicsCheckArea) return self.collisionDetectionGraphicsCheckArea.getBounds()
    return null
  },
  // branch
  setDragBackgroundGraphicsTint(tint: number) {
    const self = this as ExpressionContainer
    if (self.dragBackgroundGraphics) self.dragBackgroundGraphics.tint = tint
    // throw new Error('dragBackgroundGraphics is not defined')
  },
  setDragCircleGraphicsTint(tint: number) {
    const self = this as ExpressionContainer
    if (self.dragCircleGraphics) self.dragCircleGraphics.tint = tint
    // throw new Error('dragCircleGraphics is not defined')
  }
})

const textHeight = 20
const opTextWidth = 26
const padding = 4
const lineWidth = 2
const minTextWidth = 26

const textStyle = new TextStyle({
  fill: 0x000000,
  fontSize: 14,
})

const opTextStyle = new TextStyle({
  fill: 0x000000,
  fontSize: 16,
  fontFamily: 'Simsun',
})

const eventGraphicsFillInput: FillInput = {
  alpha: 0,
  // color: 0xff0000,
  // alpha: 0.5,
}

const backgroundGraphicsFill = 0xdddddd

const collisionDetectionGraphicsCheckAreaFill = 0xffffff

function getTextWidth(width: number) {
  const textWidth = padding + width + padding
  return textWidth > minTextWidth ? textWidth : minTextWidth
}

function getRatio(height: number, resultType: ResultType) {
  if (resultType === 'number') return height / 2
  if (resultType === 'string') return height / 4
  return 0
}

function getResultTypeFromValue(valueType: string | null): ResultType {
  if (valueType === 'number') return 'number'
  if (valueType === 'string') return 'string'
  if (valueType === 'boolean') return 'boolean'
  throw new Error(`Unknown value type: ${valueType}`)
}

function getResultTypeFromParent(parent: MathNode | null): ResultType {
  if (parent === null) return 'number'

  if (parent instanceof OperatorNode) {
    // 算术运算
    if (['+', '-', '*', '/'].includes(parent.op)) return 'number'
    // 关系运算
    if (['>', '<', '>=', '<=', '==', '!='].includes(parent.op)) return 'number'
    // 一元逻辑运算
    if (['not'].includes(parent.op)) return 'boolean'
    // 二元逻辑运算
    if (['and', 'or', 'xor'].includes(parent.op)) return 'boolean'
  }

  if (parent instanceof FunctionNode) {
    if (['equalText'].includes(parent.fn.name)) return 'string'
  }

  throw new Error(`Unknown parent type: ${parent.type}`)
}

function generateSymbolNodeContainer(node: SymbolNode, parent: MathNode | null): ExpressionContainer {
  const resultType = getResultTypeFromParent(parent)

  const { name } = node

  // 文本
  const text = new Text({
    text: name,
    style: textStyle,
  })
  text.anchor.set(0.5, 0.5)

  // 碰撞检测区域
  const collisionDetectionGraphicsCheckAreaWidth = getTextWidth(text.width)
  const collisionDetectionGraphicsCheckAreaHeight = textHeight
  const collisionDetectionGraphicsCheckAreaXY = padding + lineWidth
  // 背景
  const backgroundGraphicsWidth = lineWidth + collisionDetectionGraphicsCheckAreaWidth + lineWidth
  const backgroundGraphicsHeight = lineWidth + collisionDetectionGraphicsCheckAreaHeight + lineWidth
  const backgroundGraphicsXY = padding
  // 碰撞检测高亮指示环
  const collisionDetectionGraphicsWidth = padding + backgroundGraphicsWidth + padding
  const collisionDetectionGraphicsHeight = padding + backgroundGraphicsHeight + padding
  const collisionDetectionGraphicsXY = 0

  // 碰撞检测区域
  const collisionDetectionGraphicsCheckArea = new Graphics()
    .roundRect(0, 0, collisionDetectionGraphicsCheckAreaWidth, collisionDetectionGraphicsCheckAreaHeight, getRatio(collisionDetectionGraphicsCheckAreaHeight, resultType))
    .fill(collisionDetectionGraphicsCheckAreaFill)
  // 背景
  const backgroundGraphics = new Graphics()
    .roundRect(0, 0, backgroundGraphicsWidth, backgroundGraphicsHeight, getRatio(backgroundGraphicsHeight, resultType))
    .fill(backgroundGraphicsFill)
  // 碰撞检测高亮指示环
  const collisionDetectionGraphics = new Graphics()
    .roundRect(0, 0, collisionDetectionGraphicsWidth, collisionDetectionGraphicsHeight, getRatio(collisionDetectionGraphicsHeight, resultType))
    .fill(staticTint)

  const wrapper = new Container() as ExpressionContainer

  // position
  // 文本
  text.position.set(collisionDetectionGraphicsWidth / 2, collisionDetectionGraphicsHeight / 2)
  // 碰撞检测区域
  collisionDetectionGraphicsCheckArea.position.set(collisionDetectionGraphicsCheckAreaXY, collisionDetectionGraphicsCheckAreaXY)
  // 背景
  backgroundGraphics.position.set(backgroundGraphicsXY, backgroundGraphicsXY)
  // 碰撞检测高亮指示环
  collisionDetectionGraphics.position.set(collisionDetectionGraphicsXY, collisionDetectionGraphicsXY)

  // eventMode
  wrapper.eventMode = 'none'
  text.eventMode = 'none'
  collisionDetectionGraphicsCheckArea.eventMode = 'none'
  backgroundGraphics.eventMode = 'none'
  collisionDetectionGraphics.eventMode = 'none'

  // 可变属性:
  // collisionDetectionGraphics.tint = staticTint
  collisionDetectionGraphics.alpha = 0

  // 公开属性
  wrapper.expression = node.toString({ parenthesis: 'all' })
  wrapper.resultType = resultType
  wrapper.collisionDetectionGraphics = collisionDetectionGraphics
  wrapper.collisionDetectionGraphicsCheckArea = collisionDetectionGraphicsCheckArea

  wrapper.addChild(collisionDetectionGraphics, backgroundGraphics, collisionDetectionGraphicsCheckArea, text)
  return wrapper
}

function createConstantContainer(node: ConstantNode<number | string | boolean>, resultType: ResultType): ExpressionContainer {
  // padding + lineWidth + collisionDetectionGraphicsCheckAreaWidth + lineWidth + padding
  // padding + lineWidth + collisionDetectionGraphicsCheckAreaHeight + lineWidth + padding

  const { value } = node

  // 文本
  const text = new Text({
    text: Number.isNaN(value) ? '' : value,
    style: textStyle,
  })
  text.anchor.set(0.5, 0.5)

  // 碰撞检测区域
  const collisionDetectionGraphicsCheckAreaWidth = getTextWidth(text.width)
  const collisionDetectionGraphicsCheckAreaHeight = textHeight
  const collisionDetectionGraphicsCheckAreaXY = padding + lineWidth
  // 背景
  const backgroundGraphicsWidth = lineWidth + collisionDetectionGraphicsCheckAreaWidth + lineWidth
  const backgroundGraphicsHeight = lineWidth + collisionDetectionGraphicsCheckAreaHeight + lineWidth
  const backgroundGraphicsXY = padding
  // 碰撞检测高亮指示环
  const collisionDetectionGraphicsWidth = padding + backgroundGraphicsWidth + padding
  const collisionDetectionGraphicsHeight = padding + backgroundGraphicsHeight + padding
  const collisionDetectionGraphicsXY = 0

  // 碰撞检测区域
  const collisionDetectionGraphicsCheckArea = new Graphics()
    .roundRect(0, 0, collisionDetectionGraphicsCheckAreaWidth, collisionDetectionGraphicsCheckAreaHeight, getRatio(collisionDetectionGraphicsCheckAreaHeight, resultType))
    .fill(collisionDetectionGraphicsCheckAreaFill)
  // 背景
  const backgroundGraphics = new Graphics()
    .roundRect(0, 0, backgroundGraphicsWidth, backgroundGraphicsHeight, getRatio(backgroundGraphicsHeight, resultType))
    .fill(backgroundGraphicsFill)
  // 碰撞检测高亮指示环
  const collisionDetectionGraphics = new Graphics()
    .roundRect(0, 0, collisionDetectionGraphicsWidth, collisionDetectionGraphicsHeight, getRatio(collisionDetectionGraphicsHeight, resultType))
    .fill(staticTint)

  const wrapper = new Container() as ExpressionContainer

  // position
  // 文本
  text.position.set(collisionDetectionGraphicsWidth / 2, collisionDetectionGraphicsHeight / 2)
  // 碰撞检测区域
  collisionDetectionGraphicsCheckArea.position.set(collisionDetectionGraphicsCheckAreaXY, collisionDetectionGraphicsCheckAreaXY)
  // 背景
  backgroundGraphics.position.set(backgroundGraphicsXY, backgroundGraphicsXY)
  // 碰撞检测高亮指示环
  collisionDetectionGraphics.position.set(collisionDetectionGraphicsXY, collisionDetectionGraphicsXY)

  // eventMode
  wrapper.eventMode = 'none'
  text.eventMode = 'none'
  collisionDetectionGraphicsCheckArea.eventMode = 'none'
  backgroundGraphics.eventMode = 'none'
  collisionDetectionGraphics.eventMode = 'none'

  // 可变属性:
  // collisionDetectionGraphics.tint = staticTint
  collisionDetectionGraphics.alpha = 0

  // 公开属性
  wrapper.expression = node.toString({ parenthesis: 'all' })
  wrapper.resultType = resultType
  wrapper.collisionDetectionGraphics = collisionDetectionGraphics
  wrapper.collisionDetectionGraphicsCheckArea = collisionDetectionGraphicsCheckArea

  wrapper.addChild(collisionDetectionGraphics, backgroundGraphics, collisionDetectionGraphicsCheckArea, text)
  return wrapper
}

function generateConstantNodeContainer(node: ConstantNode<number | string | boolean>): ExpressionContainer {
  const { value } = node
  const resultType = getResultTypeFromValue(typeof value)
  // const resultType2 = getResultTypeFromParent(parent)
  // console.log({ resultType1, resultType2 })

  return createConstantContainer(node as ConstantNode, resultType)
}

// ['+', '-', '*', '/']
// 算术运算: Arithmetic Operation (Four Basic Operations in Maths)
// ['>', '<', '>=', '<=', '==', '!=']
// 关系运算: Relational Operation (Comparison Operations in Maths)
function createBinaryBasicOperationContainer(node: OperatorNode<never, never, MathNode[]>, resultType: ResultType, leafSet: Set<ExpressionContainer>, branchSet: Set<ExpressionContainer>): ExpressionContainer {
  const [left, right]: ExpressionContainer[] = node.args.map((arg, index) => loopNode(arg, `args[${index}]`, node, leafSet, branchSet))

  let leftHoleWidth = left.width
  let leftHoleHeight = left.height
  if (left.isLeaf) {
    leftHoleWidth = leftHoleWidth - padding * 2
    leftHoleHeight = leftHoleHeight - padding * 2
  }

  let rightHoleWidth = right.width
  let rightHoleHeight = right.height
  if (right.isLeaf) {
    rightHoleWidth = rightHoleWidth - padding * 2
    rightHoleHeight = rightHoleHeight - padding * 2
  }

  const width = leftHoleWidth + opTextWidth + rightHoleWidth
  const height = Math.max(leftHoleHeight, rightHoleHeight)

  const eventGraphicsWidth = padding + width + padding
  const eventGraphicsHeight = padding + height + padding

  const backgroundGraphicsWidth = lineWidth + eventGraphicsWidth + lineWidth
  const backgroundGraphicsHeight = lineWidth + eventGraphicsHeight + lineWidth

  const leftHoleX = padding
  const leftHoleY = (eventGraphicsHeight - leftHoleHeight) / 2
  let leftX = lineWidth + leftHoleX
  let leftY = lineWidth + leftHoleY
  const opTextX = leftX + leftHoleWidth + opTextWidth / 2
  if (left.isLeaf) {
    leftX = lineWidth
    leftY = (lineWidth + height + lineWidth - leftHoleHeight) / 2
  }

  const rightHoleX = padding + leftHoleWidth + opTextWidth
  const rightHoleY = (eventGraphicsHeight - rightHoleHeight) / 2
  let rightX = lineWidth + rightHoleX
  let rightY = lineWidth + rightHoleY
  if (right.isLeaf) {
    rightX = lineWidth + leftHoleWidth + opTextWidth
    rightY = (lineWidth + height + lineWidth - rightHoleHeight) / 2
  }

  const backgroundGraphics = new Graphics()
    .roundRect(0, 0, backgroundGraphicsWidth, backgroundGraphicsHeight, getRatio(backgroundGraphicsHeight, resultType))
    .fill(backgroundGraphicsFill)

  const dragBackgroundGraphics = new Graphics()
    .roundRect(0, 0, eventGraphicsWidth, eventGraphicsHeight, getRatio(eventGraphicsHeight, resultType))
    .fill(staticTint)

  const leftSolt = new Container()
  leftSolt.addChild(left)

  const opText = new Text({
    text: node.op,
    style: opTextStyle
  })
  opText.anchor.set(0.5, 0.5)

  const rightSolt = new Container()
  rightSolt.addChild(right)

  // dragCircleGraphics 拖拽高亮指示点
  const dragCircleGraphics = new Graphics()
    .circle(0, 0, padding / 2)
    .fill(staticTint)

  const wrapper = new Container() as ExpressionContainer

  // 最上面一层事件层响应事件
  const eventGraphics = new Graphics()
    .roundRect(0, 0, eventGraphicsWidth, eventGraphicsHeight, getRatio(eventGraphicsHeight, resultType))
    .fill(eventGraphicsFillInput)
    .roundRect(leftHoleX, leftHoleY, leftHoleWidth, leftHoleHeight, getRatio(leftHoleHeight, left.resultType))
    .roundRect(rightHoleX, rightHoleY, rightHoleWidth, rightHoleHeight, getRatio(rightHoleHeight, right.resultType))
    .cut()
  eventGraphics.cursor = 'grab'

  eventGraphics.on('pointerdown', (event) => {
    wrapper.emit('[pointerdown]', event)
  })

  // position
  backgroundGraphics.position.set(0, 0)
  dragBackgroundGraphics.position.set(lineWidth, lineWidth)
  leftSolt.position.set(leftX, leftY)
  opText.position.set(opTextX, backgroundGraphicsHeight / 2)
  rightSolt.position.set(rightX, rightY)
  dragCircleGraphics.position.set(lineWidth + padding / 2, backgroundGraphicsHeight / 2)
  eventGraphics.position.set(lineWidth, lineWidth)

  // eventMode
  wrapper.eventMode = 'passive'
  backgroundGraphics.eventMode = 'none'
  dragBackgroundGraphics.eventMode = 'none'
  leftSolt.eventMode = 'passive'
  opText.eventMode = 'none'
  rightSolt.eventMode = 'passive'
  dragCircleGraphics.eventMode = 'none'
  eventGraphics.eventMode = 'static'

  // 可变属性:
  // dragBackgroundGraphics.tint = staticTint
  // dragCircleGraphics.tint = staticTint

  // 公开属性
  wrapper.expression = node.toString({ parenthesis: 'all' })
  wrapper.resultType = resultType
  wrapper.dragBackgroundGraphics = dragBackgroundGraphics
  wrapper.dragCircleGraphics = dragCircleGraphics

  wrapper.addChild(backgroundGraphics, dragBackgroundGraphics, leftSolt, opText, rightSolt, dragCircleGraphics, eventGraphics)
  return wrapper
}

function calculateSize(childContainers: ExpressionContainer[], opTextWidth: number) {
  const holeWidths = []
  const holeHeights = []
  const holeX = opTextWidth
  const holeYs = []
  const childXs = []
  const childYs = []

  let lastHoleEnd = 0
  for (let i = 0, len = childContainers.length; i < len; i++) {
    const child = childContainers[i]

    let holeWidth = child.width
    let holeHeight = child.height

    let childX = lineWidth + holeX

    if (child.isLeaf) {
      holeWidth = holeWidth - padding * 2
      holeHeight = holeHeight - padding * 2

      childX = opTextWidth + lineWidth - padding
    }

    const holeY = padding + lastHoleEnd
    lastHoleEnd += holeHeight + padding
    let childY = lineWidth + holeY
    if (child.isLeaf) {
      childY = lineWidth + holeY - padding
    }

    holeWidths.push(holeWidth)
    holeHeights.push(holeHeight)
    holeYs.push(holeY)

    childXs.push(childX)
    childYs.push(childY)
  }

  const width = opTextWidth + Math.max(...holeWidths)
  // const height = holeHeights.reduce((sum, h) => sum + h, padding * (holeHeights.length - 1))
  const height = lastHoleEnd - padding

  const eventGraphicsWidth = width + padding
  const eventGraphicsHeight = padding + height + padding

  const backgroundGraphicsWidth = lineWidth + eventGraphicsWidth + lineWidth
  const backgroundGraphicsHeight = lineWidth + eventGraphicsHeight + lineWidth

  const opTextX = opTextWidth / 2

  return {
    backgroundGraphicsWidth,
    backgroundGraphicsHeight,
    eventGraphicsWidth,
    eventGraphicsHeight,
    childXs,
    childYs,
    holeX,
    holeYs,
    holeWidths,
    holeHeights,
    opTextX,
  }
}

// ['not']
// 一元逻辑运算: Unary Logical Operation (Unary Logical Operations in Maths)
// ['and', 'or', 'xor']
// 二元逻辑运算: Binary Logical Operation (Binary Logical Operations in Maths)
// ['equalText']
// 文本相等: Text Equal Function
function createDynamicContainer(text: string, node: OperatorNode<never, never, MathNode[]> | FunctionNode, resultType: ResultType, leafSet: Set<ExpressionContainer>, branchSet: Set<ExpressionContainer>): ExpressionContainer {
  const childContainers: ExpressionContainer[] = node.args.map((arg, index) => loopNode(arg, `args[${index}]`, node, leafSet, branchSet))

  const opText = new Text({
    text,
    style: opTextStyle
  })
  opText.anchor.set(0.5, 0.5)

  const opTextWidth = getTextWidth(opText.width)

  const {
    backgroundGraphicsWidth,
    backgroundGraphicsHeight,
    eventGraphicsWidth,
    eventGraphicsHeight,
    childXs,
    childYs,
    holeX,
    holeYs,
    holeWidths,
    holeHeights,
    opTextX,
  } = calculateSize(childContainers, padding + opTextWidth)

  const backgroundGraphics = new Graphics()
    .roundRect(0, 0, backgroundGraphicsWidth, backgroundGraphicsHeight, getRatio(backgroundGraphicsHeight, resultType))
    .fill(backgroundGraphicsFill)
  const dragBackgroundGraphics = new Graphics()
    .roundRect(0, 0, eventGraphicsWidth, eventGraphicsHeight, getRatio(eventGraphicsHeight, resultType))
    .fill(staticTint)

  // 最上面一层事件层响应事件
  const eventGraphics = new Graphics()
    .roundRect(0, 0, eventGraphicsWidth, eventGraphicsHeight, getRatio(eventGraphicsHeight, resultType))
    .fill(eventGraphicsFillInput)

  const childSolts: Container[] = []
  for (let i = 0, len = childContainers.length; i < len; i++) {
    const child = childContainers[i]

    const childX = childXs[i]
    const childY = childYs[i]
    const childSolt = new Container()
    childSolt.addChild(child)
    childSolt.position.set(childX, childY)
    childSolt.eventMode = 'passive'
    childSolts.push(childSolt)

    const holeY = holeYs[i]
    const holeWidth = holeWidths[i]
    const holeHeight = holeHeights[i]
    eventGraphics.roundRect(holeX, holeY, holeWidth, holeHeight, getRatio(holeHeight, child.resultType))
  }

  eventGraphics.cut()
  eventGraphics.cursor = 'grab'

  eventGraphics.on('pointerdown', (event) => {
    wrapper.emit('[pointerdown]', event)
  })

  // dragCircleGraphics 拖拽高亮指示点
  const dragCircleGraphics = new Graphics()
    .circle(0, 0, padding / 2)
    .fill(staticTint)

  const wrapper = new Container() as ExpressionContainer

  // position
  backgroundGraphics.position.set(0, 0)
  dragBackgroundGraphics.position.set(lineWidth, lineWidth)
  opText.position.set(opTextX, backgroundGraphicsHeight / 2)
  // dragCircleGraphics.position.set(lineWidth + padding / 2, backgroundGraphicsHeight / 2)
  dragCircleGraphics.position.set(lineWidth + padding, lineWidth + padding)
  eventGraphics.position.set(lineWidth, lineWidth)

  // eventMode
  wrapper.eventMode = 'passive'
  backgroundGraphics.eventMode = 'none'
  dragBackgroundGraphics.eventMode = 'none'
  opText.eventMode = 'none'
  dragCircleGraphics.eventMode = 'none'
  eventGraphics.eventMode = 'static'

  // 可变属性:
  // dragBackgroundGraphics.tint = staticTint
  // dragCircleGraphics.tint = staticTint

  // 公开属性
  wrapper.expression = node.toString({ parenthesis: 'all' })
  wrapper.resultType = 'boolean'
  wrapper.dragBackgroundGraphics = dragBackgroundGraphics
  wrapper.dragCircleGraphics = dragCircleGraphics

  wrapper.addChild(backgroundGraphics, dragBackgroundGraphics, opText, ...childSolts, dragCircleGraphics, eventGraphics)
  return wrapper
}

function generateOperatorNodeContainer(node: OperatorNode<never, never, MathNode[]>, leafSet: Set<ExpressionContainer>, branchSet: Set<ExpressionContainer>): ExpressionContainer {
  const text = node.op

  // 算术运算
  if (['+', '-', '*', '/'].includes(text)) {
    return createBinaryBasicOperationContainer(node, 'number', leafSet, branchSet)
  }

  // 关系运算
  if (['>', '<', '>=', '<=', '==', '!='].includes(text)) {
    return createBinaryBasicOperationContainer(node, 'boolean', leafSet, branchSet)
  }

  // 二元逻辑运算
  if (['and', 'or', 'xor', 'not'].includes(text)) {
    return createDynamicContainer(text, node, 'boolean', leafSet, branchSet)
  }
  // 一元逻辑运算
  if (['not'].includes(text)) {
    return createDynamicContainer(text, node, 'boolean', leafSet, branchSet)
  }

  throw new Error(`Unknown operator: ${text}`)
}

function generateFunctionNodeContainer(node: FunctionNode, leafSet: Set<ExpressionContainer>, branchSet: Set<ExpressionContainer>): ExpressionContainer {
  const text = node.fn.name

  if (['equalText'].includes(text)) {
    return createDynamicContainer(text, node, 'boolean', leafSet, branchSet)
  }

  throw new Error(`Unknown function: ${text}`)
}

function loopNode(node: MathNode, path: string | null, parent: MathNode | null, leafSet: Set<ExpressionContainer>, branchSet: Set<ExpressionContainer>) {
  if (node instanceof ParenthesisNode) {
    return loopNode(node.content, path, parent, leafSet, branchSet)
  }

  // TODO: 优化使用 weakMap
  // parent 的 comment 用于存储 parent parentAndPaths
  const parentAndPaths = parent ? JSON.parse(parent.comment) : []

  if (node instanceof SymbolNode) {
    // 加入当前节点的 parentAndPath
    parentAndPaths.push({ node: node.toString({ parenthesis: 'all' }), path, parent: parent ? parent.toString({ parenthesis: 'all' }) : parent })
    // 自己的 comment 用于存储自己的 parentAndPaths
    node.comment = JSON.stringify(parentAndPaths)

    const leafContainer = generateSymbolNodeContainer(node, parent)
    leafContainer.isLeaf = true
    leafContainer.parentAndPaths = parentAndPaths
    leafSet.add(leafContainer)
    return leafContainer
  }

  if (node instanceof ConstantNode) {
    // 加入当前节点的 parentAndPath
    parentAndPaths.push({ node: node.toString({ parenthesis: 'all' }), path, parent: parent ? parent.toString({ parenthesis: 'all' }) : parent })
    // 自己的 comment 用于存储自己的 parentAndPaths
    node.comment = JSON.stringify(parentAndPaths)

    const leafContainer = generateConstantNodeContainer(node)
    leafContainer.isLeaf = true
    leafContainer.parentAndPaths = parentAndPaths
    leafSet.add(leafContainer)
    return leafContainer
  }

  if (node instanceof OperatorNode) {
    // 加入当前节点的 parentAndPath
    parentAndPaths.push({ node: node.toString({ parenthesis: 'all' }), path, parent: parent ? parent.toString({ parenthesis: 'all' }) : parent })
    // 自己的 comment 用于存储自己的 parentAndPaths
    node.comment = JSON.stringify(parentAndPaths)

    const branchContainer = generateOperatorNodeContainer(node as OperatorNode<never, never, MathNode[]>, leafSet, branchSet)
    branchContainer.parentAndPaths = parentAndPaths
    branchSet.add(branchContainer)
    return branchContainer
  }

  if (node instanceof FunctionNode) {
    // 加入当前节点的 parentAndPath
    parentAndPaths.push({ node: node.toString({ parenthesis: 'all' }), path, parent: parent ? parent.toString({ parenthesis: 'all' }) : parent })
    // 自己的 comment 用于存储自己的 parentAndPaths
    node.comment = JSON.stringify(parentAndPaths)

    const branchContainer = generateFunctionNodeContainer(node as FunctionNode, leafSet, branchSet)
    branchContainer.parentAndPaths = parentAndPaths
    branchSet.add(branchContainer)
    return branchContainer
  }

  throw new Error(`Unknown node type: ${node.type}`)
}

export function generateContainer(expression: string) {
  // const node = removeParenthesesNode(parse(expression))
  const node = parse(expression)
  // console.log(JSON.stringify(node, replacer, 2))
  const leafSet = new Set<ExpressionContainer>()
  const branchSet = new Set<ExpressionContainer>()
  const rootContainer = loopNode(node, null, null, leafSet, branchSet)
  rootContainer.isRoot = true
  return { rootContainer, leafSet, branchSet }
}

export function transformExpression(expression: string, parentAndPaths: ParentAndPath[], replace: string) {
  // debugger
  const node = parse(expression)

  let i = 0
  const transformNode = (node: MathNode, path: string, parent: MathNode): MathNode => {
    if (parentAndPaths.length === i) return node

    const parentAndPath = parentAndPaths[i]

    if (node instanceof ParenthesisNode) {
      // 递归去除括号
      return transformNode(node.content, path, parent)
    }

    // 递归处理子节点
    if (node instanceof OperatorNode) {
      node.args = node.args.map((arg, index) => transformNode(arg, `args[${index}]`, node))
    }

    const ppnode = node.toString({ parenthesis: 'all' })
    const ppath = path
    const pparent = parent ? parent.toString({ parenthesis: 'all' }) : parent

    // console.log({ parentAndPathNode: parentAndPath.node, ppnode })
    if (parentAndPath.node === ppnode && parentAndPath.path === ppath && parentAndPath.parent === pparent) {
      i++
      // 替换
      if (parentAndPaths.length === i) return parse(replace)
    }

    return node
  }

  const transformed = node.transform(transformNode)

  return transformed.toString({ parenthesis: 'all' })
}
