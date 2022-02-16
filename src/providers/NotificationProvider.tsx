import { createContext, useState } from 'react'
import { uniqueId } from 'lodash'

export interface Notification {
  id?: string
  title: string
  message: string
  type: NotificationType
}

export enum NotificationType {
  Success = 'success',
  Error = 'error',
  Info = 'info',
}

export const NotificationContext = createContext({
  messages: [] as Notification[],
  push: (message: Notification) => {},
  remove: (id: string) => {},
})

export default function NotificationProvider(props: any) {
  const [messages, setMessages] = useState<Notification[]>([])

  const push = (message: any) => {
    setMessages((prev) => [
      ...prev,
      {
        ...message,
        id: uniqueId(),
      },
    ])
  }

  const remove = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id))
  }

  const value = {
    messages,
    push,
    remove,
  }
  return <NotificationContext.Provider value={value} {...props} />
}
