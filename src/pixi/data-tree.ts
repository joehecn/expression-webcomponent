export interface OriginPoint {
  x: number
  y: number
}

export interface DataTree {
  originPoint: OriginPoint
  expression: string
}

const _dataTreeList: DataTree[] = [
  // {
  //   originPoint: { x: 100, y: 80 },
  //   expression: 'a+(b+c)'
  // },
  // {
  //   originPoint: { x: 100, y: 150 },
  //   expression: 'a == b'
  // },
  // {
  //   originPoint: { x: 100, y: 200 },
  //   expression: 'a and b'
  // },
  // {
  //   originPoint: { x: 100, y: 280 },
  //   expression: 'not a'
  // },
  // {
  //   originPoint: { x: 100, y: 330 },
  //   expression: 'equalText(a,b)'
  // },
  // {
  //   originPoint: { x: 100, y: 400 },
  //   expression: '1'
  // },
  // {
  //   originPoint: { x: 100, y: 450 },
  //   expression: 'true'
  // },
  // {
  //   originPoint: { x: 100, y: 500 },
  //   expression: '"true"'
  // },
  // {
  //   originPoint: { x: 100, y: 550 },
  //   expression: 'a'
  // },
  // {
  //   originPoint: { x: 100, y: 100 },
  //   expression: '(NaN + NaN != NaN + NaN or NaN + NaN + NaN > NaN - NaN) and (NaN - NaN) / (NaN + NaN) != (NaN - NaN) / (NaN + NaN) + NaN * NaN and true'
  // },
  // {
  //   originPoint: { x: 100, y: 100 },
  //   expression: 'dof == false and (equalText(L3, "leak") or (equalText(D, "leak") and equalText(E, "leak") or (equalText(C, "leak") and equalText(E, "leak") or (equalText(C, "leak") and equalText(D, "leak") or (equalText(B, "leak") and equalText(E, "leak") or (equalText(B, "leak") and equalText(D, "leak") or (equalText(B, "leak") and equalText(C, "leak") or (equalText(A, "leak") and equalText(E, "leak") or (equalText(A, "leak") and equalText(D, "leak") or (equalText(A, "leak") and equalText(C, "leak") or equalText(A, "leak") and equalText(B, "leak")))))))))))'
  // },
]

export const setDataTreeList = (dataTreeList: DataTree[]) => {
  _dataTreeList.length = 0
  _dataTreeList.push(...dataTreeList)
}

export const getDataTreeList = () => {
  return _dataTreeList
}

export const addDataTree = (dataTree: DataTree) => {
  _dataTreeList.push(dataTree)
}

export const removeDataTree = (dataTree: DataTree) => {
  const index = _dataTreeList.findIndex(item => item === dataTree)
  if (index !== -1) {
    _dataTreeList.splice(index, 1)
  }
}
