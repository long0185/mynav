'use client'

import { cn } from '@heroui/react'
import { useSetState, useUpdateEffect } from 'ahooks'
import { PropsWithChildren } from 'react'
import ReTooltip from './re-export/ReTooltip'

interface Props {
  src?: string | null
  /** 图标尺寸，即宽、高大小 */
  size?: number
  /** 是否可以展示加载中动画 */
  showSpinner?: boolean
  /** 是否展示默认图片 */
  showDefaultIcon?: boolean
  /** 图标加载失败时，是否展示失败图标 */
  showErrorIconOnFailed?: boolean
  /** 禁用懒加载（在 Dropdown 中会用到，为了避免奇怪的 BUG） */
  disableLazyLoading?: boolean
  className?: string
}

enum LoadStatus {
  WAIT,
  LOADING,
  LOADED,
  ERROR,
}

const DEFAULT_FAVICON_WRAPPER_SIZE = 28

function Wrapper(props: PropsWithChildren<Pick<Props, 'size' | 'className'>>) {
  const size = props.size || DEFAULT_FAVICON_WRAPPER_SIZE
  return (
    <div
      className={cn('shrink-0 rounded-lg bg-white p-[3px] flex-center', props.className)}
      style={{ width: size, height: size }}
    >
      {props.children}
    </div>
  )
}

function renderDefault(props: Props) {
  return (
    <Wrapper {...props}>
      <span className="icon-[mdi--web] size-full text-zinc-700" />
    </Wrapper>
  )
}

function renderError(props: Props) {
  return (
    <Wrapper {...props}>
      <ReTooltip content="加载失败">
        <span className="icon-[mdi--image-remove-outline] size-full text-red-500" />
      </ReTooltip>
    </Wrapper>
  )
}

export default function Favicon(props: Props) {
  const [state, setState] = useSetState({ status: LoadStatus.WAIT })

  useUpdateEffect(() => {
    props.src && setState({ status: LoadStatus.LOADING })
  }, [props.src])

  // 处理没有图片地址的情况
  if (!props.src) {
    return props.showDefaultIcon ? renderDefault(props) : null
  }

  if (state.status === LoadStatus.ERROR) {
    return props.showErrorIconOnFailed ? renderError(props) : renderDefault(props)
  }

  const showSpinner = props.showSpinner && state.status === LoadStatus.LOADING

  return (
    <Wrapper size={props.size} className={props.className}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={cn('rounded', showSpinner ? 'size-0' : 'size-full')}
        alt="website-favicon"
        src={props.src}
        loading={props.disableLazyLoading ? 'eager' : 'lazy'}
        onError={() => setState({ status: LoadStatus.ERROR })}
        onLoad={() => setState({ status: LoadStatus.LOADED })}
      />
      {showSpinner && (
        <span className="icon-[tabler--loader] size-full animate-spin text-gray-700" />
      )}
    </Wrapper>
  )
}
