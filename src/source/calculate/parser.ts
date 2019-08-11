import Decimal from 'decimal.js';

const spacePat = /[ \t]/
const symbolPat = /[()+\-*/%,]/
const unaryPat = /[+-]/
const numberPat = /[.0-9]/
const letterPat = /[.a-zA-Z0-9_]/
const methodPat = /^(abs|acos|acosh|add|asin|asinh|atan|atanh|atan2|cbrt|ceil|clone|cos|cosh|div|exp|floor|hypot|isDecimal|ln|log|log2|log10|max|min|mod|mul|noConflict|pow|random|round|set|sign|sin|sinh|sqrt|sub|tan|tanh|trunc)$/
const consPat = /^(E|LN2|LN10|LOG2E|LOG10E|PI|SQRT1_2|SQRT2)$/

enum symbols {
  '(' = 'parent',
  ')' = 'parent',
  '+' = 'plus',
  '-' = 'minus',
  '*' = 'mul',
  '/' = 'div',
  '%' = 'mod',
  '**' = 'pow',
  ',' = 'sep',
}

const TO_RIGHT = 1   // direction from left to right
const TO_LEFT = -1   // direction from right to left

enum directions {
  '+' = TO_RIGHT,
  '-' = TO_RIGHT,
  '*' = TO_RIGHT,
  '/' = TO_RIGHT,
  '%' = TO_RIGHT,
  '**' = TO_LEFT,
}

const priority = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
  '%': 2,
  '**': 3,
}

/*
 * Token
 *
 * - type:
 *    - parent: (|)
 *    - plus: +
 *    - minus: -
 *    - mul: *
 *    - div: /
 *    - mod: %
 *    - pow: **
 *    - sep: ,
 *    - method: abs|acos|acosh|add|asin|asinh|atan|atanh|atan2|cbrt|ceil|clone|cos|cosh|div|exp|floor|hypot|isDecimal|ln|log|log2|log10|max|min|mod|mul|noConflict|pow|random|round|set|sign|sin|sinh|sqrt|sub|tan|tanh|trunc
 *    - cons: E|LN2|LN10|LOG2E|LOG10E|PI|SQRT1_2|SQRT2
 *    - num: -/+[0-9.]
 */

type TokenType = symbols | 'num' | 'method' | 'cons'

export type Token = {
  type: TokenType
  value: string
  offset: {
    start: number
    end: number
  }
}

type CalcNodeType = 'plus' | 'minus' | 'mul' | 'div' | 'mod' | 'pow' | 'method'

export type CalcNode = {
  type?: CalcNodeType
  value?: string
  nodes: Array<CalcNode | ValueNode>
}

export type ValueNode = {
  type: 'num' | 'cons'
  value: string
}

const newToken = (type: TokenType, value: string, start: number, end: number): Token =>
  ({ type, value, offset: { start, end } })

export function tokenizer(content: string): Token[] {
  const tokens: Token[] = []
  let offset = 0
  while (offset < content.length) {
    let ch = content[offset]
    if (spacePat.test(ch)) {
      offset += 1
    } else if (symbolPat.test(ch)) {
      const start = offset
      if (ch === '*' && content[offset + 1] === '*') {
        ch = '**'
        offset += 1
      }
      tokens.push(newToken(symbols[ch], ch, start, offset + 1))
      offset += 1
    } else if (numberPat.test(ch)) {
      const preToken = tokens[tokens.length - 2]
      const token = tokens[tokens.length - 1]
      let tmp = token && unaryPat.test(token.value) && (!preToken || symbolPat.test(preToken.value))
        ? tokens.pop().value
        : ''
      const start = tmp !== '' ? token.offset.start : offset
      while(offset < content.length && numberPat.test(ch)) {
        tmp += ch
        offset += 1
        ch = content[offset]
      }
      tokens.push(newToken('num', tmp, start, offset))
    } else if (letterPat.test(ch)) {
      let tmp = ''
      const start = offset
      while(offset < content.length && letterPat.test(ch)) {
        tmp += ch
        offset += 1
        ch = content[offset]
      }
      if (methodPat.test(tmp)) {
        tokens.push(newToken('method', tmp, start, offset))
      } else if (consPat.test(tmp)) {
        tokens.push(newToken('cons', tmp, start, offset))
      } else {
        throw `[Tokenizer]: Unexpected characters: ${tmp} at ${start}`;
      }
    } else {
      throw `[Tokenizer]: Unexpected characters: ${ch} at ${offset}`;
    }
  }
  return tokens
}

const nodeDirection = (node: CalcNode, token: Token): directions => {
  if ( priority[node.value] === priority[token.value]) {
    return directions[token.value]
  } else if (priority[node.value] > priority[token.value]) {
    return TO_RIGHT
  }
  return TO_LEFT
}

const rollBack = (node: CalcNode, nodes: CalcNode[]): CalcNode => {
  while(nodes.length) {
    const preNode = nodes.pop()
    preNode.nodes.push(node)
    node = preNode
  }
  return node
}

const newValueNode = (type: 'num' | 'cons', value: string): ValueNode =>
  ({ type, value })

const newCalcNode = (type: CalcNodeType, value: string, nodes: Array<ValueNode | CalcNode>): CalcNode =>
  ({ type, value, nodes })

export function parseTree(tokens: Token[]): CalcNode | ValueNode {
  const list: CalcNode[][] = [[{ nodes: [] }]]
  for (let idx = 0; idx < tokens.length; idx++) {
    let nodes: CalcNode[] = list[list.length - 1]
    const token = tokens[idx];
    let node = nodes.pop()
    switch (token.type) {
      case 'num':
      case 'cons':
        node.nodes.push(newValueNode(token.type, token.value))
        nodes.push(node)
        break

      case 'plus':
      case 'minus':
      case 'mul':
      case 'div':
      case 'mod':
      case 'pow':
        if (node.type === undefined) {
          node.type = token.type
          node.value = token.value
          nodes.push(node)
        } else if (nodeDirection(node, token) === TO_RIGHT) {
          if (nodes.length) {
            while(nodes.length && nodeDirection(node, token)) {
              const preNode = nodes.pop()
              preNode.nodes.push(node)
              node = preNode
            }
            nodes.push(node)
            idx -= 1
          } else {
            nodes.push(newCalcNode(token.type, token.value, [node]))
          }
        } else {
          const newNode = newCalcNode(token.type, token.value, [])
          if (node.nodes.length < 2) {
            throw `[ParseTree]: Unexpected characters: ${token.value}, at: ${token.offset.start}`
          }
          newNode.nodes.push(node.nodes.pop())
          nodes.push(node)
          nodes.push(newNode)
        }
        break

      case 'parent':
        if (token.value === '(') {
          nodes.push(node)
          list.push([{ nodes: [] }])
        } else {
          node = rollBack(node, nodes)
          list.pop()
          nodes = list[list.length - 1]
          if (nodes) {
            if (node.type !== undefined) {
              nodes[nodes.length - 1].nodes.push(node)
            } else {
              nodes[nodes.length - 1].nodes = nodes[nodes.length - 1].nodes.concat(node.nodes)
            }
            if (nodes[nodes.length - 1].type === 'method') {
              idx -= 1
            }
          } else {
            list.push([node])
          }
        }
        break

      case 'sep':
        node = rollBack(node, nodes)
        list.pop()
        nodes = list[list.length - 1]
        if (nodes) {
          if (node.type !== undefined) {
            nodes[nodes.length - 1].nodes.push(node)
          } else {
            nodes[nodes.length - 1].nodes = nodes[nodes.length - 1].nodes.concat(node.nodes)
          }
        } else {
          list.push([node])
        }
        list.push([{ nodes: [] }])
        break

      case 'method':
        nodes.push(node)
        list.push([newCalcNode(token.type, token.value, [])])
        break

      default:
        throw `[ParseTree]: Unexpected characters: ${token.value}, at: ${token.offset.start}`
    }
  }
  while(list.length) {
    let nodes = list.pop()
    let node = nodes.pop()
    node = rollBack(node, nodes)
    nodes = list[list.length - 1]
    if (nodes) {
      nodes[nodes.length - 1].nodes.push(node)
    } else {
      if (node.type !== undefined) {
        return node
      }
      return node.nodes.pop()
    }
  }
}

const reduce = (type: 'plus' | 'minus' | 'mul' | 'div' | 'mod' | 'pow') =>
  (node: CalcNode): Decimal =>
    node.nodes.reduce((acc, cur, idx) => acc[idx === 0 ? 'plus' : type](getValue(cur)), new Decimal(0))

const reduceMethod = (node: CalcNode): Decimal =>
  Decimal[node.value](...node.nodes.map(getValue))

const getValue = (node: CalcNode | ValueNode): Decimal =>
  (calcNodes[node.type] || valueNodes[node.type])(node)

const calcNodes = {
  plus: reduce('plus'),
  minus: reduce('minus'),
  mul: reduce('mul'),
  div: reduce('div'),
  mod: reduce('mod'),
  pow: reduce('pow'),
  method: reduceMethod
}

const valueNodes = {
  num: (node: ValueNode): Decimal => new Decimal(node.value),
  cons: (node: ValueNode): Decimal => new Decimal(Math[node.value]),
}

export function calc(exp: string): string {
  return getValue(parseTree(tokenizer(exp))).toString()
}
