import { FC, PropsWithChildren } from 'react'

import { BrowserRouter, Route, Routes } from 'react-router-dom'

import {
  useFirebaseNotifications,
  useNotificationModal,
  useReferralCodeModalTrigger,
} from '@banx/hooks'
import { AppLayout } from '@banx/layout'
import { routes } from '@banx/router/routes'

const InitialCalls: FC<PropsWithChildren> = ({ children }) => {
  useReferralCodeModalTrigger()
  useFirebaseNotifications()
  useNotificationModal()

  return <>{children}</>
}

export const Router = () => {
  return (
    <BrowserRouter>
      <InitialCalls>
        <Routes>
          {routes.map(({ path, component: Component }, index) => (
            <Route
              key={index}
              path={path}
              element={
                <AppLayout>
                  <Component />
                </AppLayout>
              }
            />
          ))}
        </Routes>
      </InitialCalls>
    </BrowserRouter>
  )
}
