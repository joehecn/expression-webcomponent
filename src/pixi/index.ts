
import { Application, Bounds, Graphics, Point, PointData, Rectangle } from 'pixi.js'
import { ExpressionContainer, ParentAndPath } from './define.js'
import { Scrollbox } from './pixi-scrollbox/index.js'

import {
  staticTint,
  dragingTint,
  differTint,
  hitTint,
  generateContainer,
  transformExpression
} from './graphic/index.js'

import {
  DataTree,
  getDataTreeList,
  addDataTree,
  removeDataTree,
  OriginPoint,
} from './data-tree.js'

const slideWidth = 200
const slideHeight = 2000

const slideOperators = [
  // 算术运算
  { expression: 'NaN + NaN', originPoint: { x: 34, y: 12 } },
  { expression: 'NaN - NaN', originPoint: { x: 34, y: 60 } },
  { expression: 'NaN * NaN', originPoint: { x: 34, y: 108 } },
  { expression: 'NaN / NaN', originPoint: { x: 34, y: 156 } },
  // 关系运算
  { expression: 'NaN > NaN', originPoint: { x: 34, y: 204 } },
  { expression: 'NaN < NaN', originPoint: { x: 34, y: 252 } },
  { expression: 'NaN >= NaN', originPoint: { x: 34, y: 300 } },
  { expression: 'NaN <= NaN', originPoint: { x: 34, y: 348 } },
  { expression: 'NaN == NaN', originPoint: { x: 34, y: 396 } },
  { expression: 'NaN != NaN', originPoint: { x: 34, y: 444 } },
  // 二元逻辑运算
  { expression: 'true and true', originPoint: { x: 34, y: 492 } },
  { expression: 'true or true', originPoint: { x: 34, y: 568 } },
  { expression: 'true xor true', originPoint: { x: 34, y: 644 } },
  // 一元逻辑运算
  { expression: 'not true', originPoint: { x: 34, y: 720 } },
  // equalText
  { expression: 'equalText("", "")', originPoint: { x: 34, y: 768 } },
]

let leafDataTreeWeakMap = new WeakMap<ExpressionContainer, DataTree>()
let leafList: ExpressionContainer[] = []
let branchDataTreeWeakMap = new WeakMap<ExpressionContainer, DataTree>()
// let branchList: ExpressionContainer[] = []
let expressionContainerDataTreeWeakMap = new WeakMap<ExpressionContainer, DataTree>()

// 检查 point 是否在 rect 的范围内
function checkIsInRect(bounds: Bounds | null, point: Point) {
  if (!bounds) return false

  const rect = new Rectangle(
    bounds.x,
    bounds.y,
    bounds.width,
    bounds.height
  )

  if (rect.contains(point.x, point.y)) return true

  return false
}

function getDefultResult(resultType: string) {
  switch (resultType) {
    case 'number':
      return 'NaN'
    case 'boolean':
      return 'true'
    case 'string':
      return ''
    default:
      throw new Error(`Unknown resultType: ${resultType}`)
  }
}

async function initContainer(pixiContainer: HTMLDivElement) {
  function resize() {
    mainScrollbox.resize({
      boxWidth: app.screen.width - slideWidth,
      boxHeight: app.screen.height,
    })
  }

  // Create a new application
  const app = new Application()

  // const pixiContainer = document.getElementById('pixi-container')!

  // Initialize the application
  await app.init({
    antialias: true, // 抗锯齿
    background: 0xffffff,
    resizeTo: pixiContainer,
  })

  // 将应用程序画布添加到文档中
  pixiContainer.appendChild(app.canvas)

  // 左侧滑块
  const slideScrollbox = new Scrollbox({
    boxWidth: slideWidth - 4,
    boxHeight: app.screen.height,
    events: app.renderer.events,
  })
  slideScrollbox.position.set(0, 0)

  // 分割线
  const dividingLine = new Graphics()
  dividingLine
    .moveTo(0, 0)
    .lineTo(0, app.screen.height)
    .stroke({ width: 1, color: 0xCECDCE })
  dividingLine.position.set(slideWidth, 0)

  // 主滚动区域
  const mainScrollbox = new Scrollbox({
    boxWidth: app.screen.width - slideWidth,
    boxHeight: app.screen.height,
    // fade: true, // 不滚动时淡出滚动条
    events: app.renderer.events,
  })
  mainScrollbox.position.set(slideWidth, 0)

  app.stage.eventMode = 'static'
  app.stage.hitArea = app.screen
  app.stage.addChild(slideScrollbox, dividingLine, mainScrollbox)

  window.addEventListener('resize', resize)

  return { app, slideScrollbox, mainScrollbox }
}

export async function init(pixiContainer: HTMLDivElement) {
  const { app, slideScrollbox, mainScrollbox } = await initContainer(pixiContainer)

  app.stage.on('pointerup', onDragEnd)
  app.stage.on('pointerupoutside', onDragEnd)
  app.stage.on('pointercancel', onDragEnd)

  // 初始化侧边栏
  initSlide()

  refreshMainContent()

  let dragTarget: ExpressionContainer | null = null
  let dragOffset: PointData | null = null

  function initSlide() {
    const slideWrapper = new Graphics()
      .rect(0, 0, slideWidth - 4, slideHeight)
      .fill(0xffffff)
    slideScrollbox.content.addChild(slideWrapper)

    for (let i = 0; i < slideOperators.length; i++) {
      const { expression, originPoint } = slideOperators[i]
      const { rootContainer } = createContainer(expression, originPoint)
      rootContainer.isTemplate = true
      slideScrollbox.content.addChild(rootContainer)
    }

    slideScrollbox.update()
  }

  function refreshMainContent(select: { parentAndPaths: ParentAndPath[] | null } | null = null, mainContentSize = 2000) {
    mainScrollbox.content.removeChildren()

    const mainWrapper = new Graphics()
      .rect(0, 0, mainContentSize, mainContentSize)
      .fill(0xffffff)
    mainScrollbox.content.addChild(mainWrapper)

    const dataTreeList = getDataTreeList()

    const _leafDataTreeWeakMap = new WeakMap<ExpressionContainer, DataTree>()
    const _leafList: ExpressionContainer[] = []
    const _branchDataTreeWeakMap = new WeakMap<ExpressionContainer, DataTree>()
    // const _branchList: ExpressionContainer[] = []
    const _expressionContainerDataTreeWeakMap = new WeakMap<ExpressionContainer, DataTree>()

    for (let i = 0; i < dataTreeList.length; i++) {
      const dataTree = dataTreeList[i]
      const { originPoint, expression } = dataTree

      const { rootContainer, leafSet, branchSet } = createContainer(expression, originPoint)

      mainScrollbox.content.addChild(rootContainer)

      leafSet.forEach(leaf => {
        _leafDataTreeWeakMap.set(leaf, dataTree)
        _leafList.push(leaf)
      })

      branchSet.forEach(branch => {
        _branchDataTreeWeakMap.set(branch, dataTree)
        // _branchList.push(branch)
      })

      _expressionContainerDataTreeWeakMap.set(rootContainer, dataTree)
    }

    leafDataTreeWeakMap = _leafDataTreeWeakMap
    leafList = _leafList
    branchDataTreeWeakMap = _branchDataTreeWeakMap
    // branchList = _branchList
    expressionContainerDataTreeWeakMap = _expressionContainerDataTreeWeakMap

    const len = mainScrollbox.content.children.length
    if (len > 0 && select !== null) {
      const lastChild = mainScrollbox.content.children[len - 1]
      const parentAndPaths = select.parentAndPaths

      if (parentAndPaths !== null) {
        console.log(parentAndPaths)
        console.log(lastChild.children)
      } else {
        (lastChild as ExpressionContainer).setDragBackgroundGraphicsTint(dragingTint)
      }
    }

    mainScrollbox.update()
  }

  function createContainer(expression: string, originPoint: OriginPoint) {
    const { rootContainer, leafSet, branchSet } = generateContainer(expression)

    branchSet.forEach(branch => {
      branch.on('[pointerdown]', onDragStart, branch)
    })

    rootContainer.position.set(originPoint.x, originPoint.y)

    return { rootContainer, leafSet, branchSet }
  }

  function onDragStart(this: ExpressionContainer, event: { global: PointData; }) {
    const { isTemplate, isRoot } = this

    let _dragTarget = this

    const _dragTargetGlobalPosition = _dragTarget.getGlobalPosition()

    if (isTemplate) {
      const { rootContainer } = createContainer(_dragTarget.expression, { x: _dragTarget.x, y: _dragTarget.y })
      _dragTarget = rootContainer

      _dragTarget.position.set(_dragTargetGlobalPosition.x, _dragTargetGlobalPosition.y)

      // 将拖动目标添加到舞台顶部
      app.stage.addChild(_dragTarget)
    } else {
      if (!isRoot) {
        const sourceDataTree = branchDataTreeWeakMap.get(_dragTarget)

        // TODO: 这个地方需要优化，正常都应该会有 sourceDataTree
        if (!sourceDataTree) return

        const defultResult = getDefultResult(_dragTarget.resultType)
        const transformed = transformExpression(sourceDataTree.expression, _dragTarget.parentAndPaths, defultResult)

        addDataTree({
          originPoint: {
            x: sourceDataTree.originPoint.x,
            y: sourceDataTree.originPoint.y,
          },
          expression: transformed,
        })

        removeDataTree(sourceDataTree)

        refreshMainContent()
      }
      // else {
      //   // mainScrollbox.update()
      // }

      _dragTarget.position.set(_dragTargetGlobalPosition.x, _dragTargetGlobalPosition.y)

      // 将拖动目标添加到舞台顶部
      app.stage.addChild(_dragTarget)
    }

    _dragTarget.setDragBackgroundGraphicsTint(dragingTint)

    dragTarget = _dragTarget
    dragOffset = new Point(event.global.x - _dragTargetGlobalPosition.x, event.global.y - _dragTargetGlobalPosition.y)

    app.stage.on('pointermove', onDragMove)
  }

  function findLeaf(leafList: ExpressionContainer[], dragTarget: ExpressionContainer, dragCircleCenter: Point) {
    for (let i = 0, len = leafList.length; i < len; i++) {
      const leaf = leafList[i]

      const { isInBox, isSameType } = checkCollisionDetection(leaf, dragTarget, dragCircleCenter)

      // 找到了碰撞目标
      if (isInBox) {
        if (isSameType) return leaf

        return null
      }
    }

    return null
  }

  function checkCollisionDetection(leaf: ExpressionContainer, dragTarget: ExpressionContainer, dragCircleCenter: Point) {
    const bounds = leaf.getCheckAreaBounds()
    const isInBox = checkIsInRect(bounds, dragCircleCenter)

    let isSameType = false

    if (isInBox) {
      isSameType = leaf.resultType === dragTarget.resultType
      if (isSameType) {
        leaf.setCollisionDetectionGraphicsTint(hitTint, 1)
        dragTarget.setDragCircleGraphicsTint(hitTint)
      } else {
        leaf.setCollisionDetectionGraphicsTint(differTint, 1)
        dragTarget.setDragCircleGraphicsTint(differTint)
      }
    } else {
      leaf.setCollisionDetectionGraphicsTint(staticTint, 0)
      dragTarget.setDragCircleGraphicsTint(staticTint)
    }

    return { isInBox, isSameType }
  }

  // 节流处理: 确保 onDragMove 函数在每一帧中最多只执行一次
  let isDragging = false
  function onDragMove(event: { global: PointData; }) {
    if (dragTarget && dragOffset && !isDragging) {
      isDragging = true
      requestAnimationFrame(() => {
        try {
          // 更新拖动目标的位置
          // 直接使用全局坐标减去偏移量
          dragTarget!.position.set(event.global.x - dragOffset!.x, event.global.y - dragOffset!.y)
          isDragging = false

          // 碰撞检测
          if (dragTarget!.x < slideWidth) return

          const dragCircleGraphics = dragTarget!.dragCircleGraphics
          // sragCircle 的圆心全局坐标
          const dragCircleCenter = dragCircleGraphics!.getGlobalPosition()

          findLeaf(leafList, dragTarget!, dragCircleCenter)
        } catch (error) {
          console.error(error)
          isDragging = false
        }
      })
    }
  }

  function onDragEnd() {
    if (dragTarget) {
      app.stage.off('pointermove', onDragMove)
      dragTarget.setDragBackgroundGraphicsTint(staticTint)

      // 删除 dragTarget
      if (dragTarget.x < slideWidth) {
        const dataTree = expressionContainerDataTreeWeakMap.get(dragTarget)
        if (dataTree) removeDataTree(dataTree)

        app.stage.removeChild(dragTarget)

        dragTarget = null
        dragOffset = null

        refreshMainContent()

        return
      }

      const globalPosition = dragTarget.getGlobalPosition()

      const dragCircleGraphics = dragTarget!.dragCircleGraphics
      // sragCircle 的圆心全局坐标
      const dragCircleCenter = dragCircleGraphics!.getGlobalPosition()

      const leaf = findLeaf(leafList, dragTarget, dragCircleCenter)

      if (leaf === null) {
        const y = globalPosition.y + mainScrollbox.scrollTop
        addDataTree({
          originPoint: {
            x: globalPosition.x + mainScrollbox.scrollLeft - slideWidth,
            y: y < 10 ? 10 : y,
          },
          expression: dragTarget.expression,
        })
      } else {
        const sourceDataTree = leafDataTreeWeakMap.get(leaf)!
        const transformed = transformExpression(sourceDataTree.expression, leaf.parentAndPaths, dragTarget.expression)

        addDataTree({
          originPoint: {
            x: sourceDataTree.originPoint.x,
            y: sourceDataTree.originPoint.y,
          },
          expression: transformed,
        })

        removeDataTree(sourceDataTree)
      }

      const dataTree = expressionContainerDataTreeWeakMap.get(dragTarget)
      if (dataTree) removeDataTree(dataTree)

      app.stage.removeChild(dragTarget)

      dragTarget = null
      dragOffset = null

      refreshMainContent()
    }
  }
}
