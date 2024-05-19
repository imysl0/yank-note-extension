/* eslint-disable quote-props */
import { ctx } from '@yank-note/runtime-api'
import { Components } from '@yank-note/runtime-api/types/types/renderer/types'
import type { CancellationTokenSource } from '@yank-note/runtime-api/types/types/third-party/monaco-editor'
import { h, reactive, ref, shallowRef, watch } from 'vue'
import { registerAdapter, removeAdapter, type AdapterType } from './adapter'
import { CustomCompletionAdapter, CustomEditAdapter } from './custom-adapter'

export const COMPLETION_ACTION_NAME = __EXTENSION_ID__ + '.inlineSuggest.trigger'
export const EDIT_ACTION_NAME = __EXTENSION_ID__ + '.edit.trigger'

export const CURSOR_PLACEHOLDER = '{CURSOR}'

export interface CustomAdapter {
  name: string,
  type: AdapterType,
}

export const i18n = ctx.i18n.createI18n({
  en: {
    'ai-complete': 'Complete using AI Copilot',
    'ai-edit': 'Modify using AI Copilot',
    'ai-generate': 'Generate using AI Copilot',
    'ai-edit-or-gen': 'Edit or Generate using AI Copilot',
    'enable-ai-copilot': 'Enable AI Copilot',
    'cancel': 'Cancel',
    'accept': 'Accept',
    'rewrite': 'Rewrite',
    'generate': 'Generate',
    'discard': 'Discard',
    'context': 'Context',
    'instruction': 'Instruction',
    'selected-text': 'Selected Text',
    'completion': 'Completion',
    'rewrite-or-generate': 'Rewrite / Generate',
    'proxy': 'Proxy',
    'no-context-available': 'No context available',
    'with-context': 'With context',
    'ask-ai-edit-or-gen': 'Ask Copilot to edit or generate text...',
    'create-custom-adapter': 'Create Custom adapter',
    'adapter-name': 'adapter Name',
    'adapter-name-exists': 'adapter name already exists',
    'remove': 'Remove',
    'remove-adapter': 'Remove adapter',
    'remove-adapter-confirm': 'Are you sure you want to remove the [%s] adapter?',
  },
  'zh-CN': {
    'ai-complete': '使用 AI Copilot 自动补全',
    'ai-edit': '使用 AI Copilot 修改',
    'ai-generate': '使用 AI Copilot 生成',
    'ai-edit-or-gen': '使用 AI Copilot 修改或生成',
    'enable-ai-copilot': '启用 AI Copilot',
    'cancel': '取消',
    'accept': '接受',
    'rewrite': '重写',
    'generate': '生成',
    'discard': '放弃',
    'context': '上下文',
    'instruction': '指令',
    'selected-text': '选中文本',
    'completion': '补全文本',
    'rewrite-or-generate': '重写 / 生成',
    'proxy': '代理',
    'no-context-available': '无上下文可用',
    'with-context': '包含上下文',
    'ask-ai-edit-or-gen': '让 Copilot 修改或生成文本...',
    'create-custom-adapter': '创建自定义适配器',
    'adapter-name': '适配器名称',
    'adapter-name-exists': '适配器名称已存在',
    'remove': '移除',
    'remove-adapter': '移除适配器',
    'remove-adapter-confirm': '确定要移除 [%s] 适配器吗？',
  }
})

const defaultState = {
  enable: true,
  type: 'completion' as 'completion' | 'chat' | 'edit',
  proxy: '',
  adapter: {
    completion: 'openai-completion',
    chat: '',
    edit: 'openai-edit',
  },
  instructionHistory: [] as string[],
  adapterState: {} as Record<string, any>,
  customAdapters: [] as CustomAdapter[],
}

const storageStateKey = __EXTENSION_ID__ + '.state'
export const state = reactive({
  ...defaultState,
  ...ctx.utils.storage.get(storageStateKey, defaultState)
})

const saveState = ctx.lib.lodash.debounce(() => {
  ctx.utils.storage.set(storageStateKey, state)
}, 1000, { leading: true })

watch(state, saveState)

try {
  // register custom adapters
  for (const adapter of state.customAdapters) {
    if (adapter.type === 'completion') {
      registerAdapter(new CustomCompletionAdapter(adapter))
    } else if (adapter.type === 'edit') {
      registerAdapter(new CustomEditAdapter(adapter))
    }
  }
} catch (error) {
  console.error(error)
}

export const loading = ref(false)
export const globalCancelTokenSource = shallowRef<CancellationTokenSource>()

export function proxyFetch (url: string, reqOptions?: Record<string, any> | undefined, abortSignal?: AbortSignal) {
  if (ctx.api.proxyFetch) {
    return ctx.api.proxyFetch(url, {
      ...reqOptions,
      headers: {
        ...reqOptions?.headers,
        'x-proxy-url': state.proxy
      },
      signal: abortSignal
    })
  }

  reqOptions = {
    ...reqOptions,
    proxyUrl: state.proxy
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return ctx.api.proxyRequest(url, reqOptions, true, abortSignal)
}

export async function readReader (
  reader: ReadableStreamDefaultReader,
  onLineReceived: (line: string) => void
): Promise<string> {
  let result = ''
  let currentValue = ''

  // read stream
  while (true) {
    const { done, value } = await reader.read()
    if (done) {
      return result
    }

    const val = new TextDecoder().decode(value)

    currentValue += val
    result += val

    const idx = currentValue.lastIndexOf('\n')
    if (idx === -1) {
      continue
    }

    const lines = currentValue.slice(0, idx)
    currentValue = currentValue.slice(idx + 1)

    for (const line of lines.split('\n')) {
      try {
        onLineReceived(line)
      } catch (e) {
        console.error(e)
      }
    }
  }
}

export function showInstructionHistoryMenu (setFn: (val: string, clear?: boolean) => void) {
  const list = state.instructionHistory
  const items: Components.ContextMenu.Item[] = list.map(x => ({
    id: x,
    label: h('span', { class: 'ai-copilot-history-instruction-item', title: x }, [
      h('span', x),
      h(ctx.components.SvgIcon, {
        title: 'Remove',
        name: 'times',
        width: '13px',
        height: '13px',
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
          state.instructionHistory = list.filter(y => y !== x)
          setFn(x, true)
          ;(ctx.ui.useContextMenu() as any).hide()
        }
      })
    ]),
    onClick: () => {
      setFn(x)
    }
  }))

  items.push(
    { type: 'separator' },
    {
      id: 'clear',
      label: 'Clear',
      onClick: () => {
        state.instructionHistory = []
      }
    }
  )

  ctx.ui.useContextMenu().show(items)
}

export function addCustomAdapters (adapter: CustomAdapter) {
  if (adapter.type === 'completion') {
    registerAdapter(new CustomCompletionAdapter(adapter))
  } else if (adapter.type === 'edit') {
    registerAdapter(new CustomEditAdapter(adapter))
  }

  state.customAdapters = ctx.lib.lodash.unionBy([adapter, ...state.customAdapters], 'name')
}

export function removeCustomAdapter (adapter: CustomAdapter) {
  removeAdapter(adapter.type, adapter.name)
  state.customAdapters = state.customAdapters.filter(x => x.name !== adapter.name)
}
