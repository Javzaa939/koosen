import { lazy } from 'react'

// ** React Imports
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

// ** Redux Imports
import { store } from "./redux/store"
import { Provider } from "react-redux"

// ** ThemeColors Context

import { ThemeContext } from "./utility/context/ThemeColors"

import ModalContextProvider from "@context/ModalContext"
import { SchoolContextProvider } from "@context/SchoolContext"
import { ActiveYearContextProvider } from "@context/ActiveYearContext";

// ** ThemeConfig
import themeConfig from "./configs/themeConfig"

// ** i18n
import './configs/i18n'

// ** Toast
import { Toaster } from "react-hot-toast"

// ** Ripple Button
import "./@core/components/ripple-button"

// ** React Perfect Scrollbar
import "react-perfect-scrollbar/dist/css/styles.css"

// ** React Hot Toast Styles
import '@styles/react/libs/tables/react-dataTable-component.scss'
import "@styles/react/libs/react-hot-toasts/react-hot-toasts.scss"

// ** Core styles
import "./@core/assets/fonts/feather/iconfont.css"
import "./@core/scss/core.scss"
import "./assets/scss/style.scss"
import '@styles/react/libs/flatpickr/flatpickr.scss'

// ** Service Worker
import * as serviceWorker from "./serviceWorker"

// ** Lazy load app
const LazyApp = lazy(() => import("./App"))

const container = document.getElementById("root")
const root = createRoot(container)

root.render(
  <BrowserRouter>
    <Provider store={store}>
        <ThemeContext>
          <SchoolContextProvider>
            <ActiveYearContextProvider>
              <ModalContextProvider>
                <LazyApp />
                <Toaster
                  position={themeConfig.layout.toastPosition}
                  toastOptions={{ className: "react-hot-toast" }}
                />
              </ModalContextProvider>
            </ActiveYearContextProvider>
          </SchoolContextProvider>
        </ThemeContext>
    </Provider>
  </BrowserRouter>
)

serviceWorker.unregister()
