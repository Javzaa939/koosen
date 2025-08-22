import { lazy } from 'react';

// ** React Imports
import { createRoot } from 'react-dom/client';

// ** Redux Imports
import { store } from './redux/store';

// ** ThemeColors Context



// ** i18n
import './configs/i18n';

// ** Toast

// ** Ripple Button
import './@core/components/ripple-button';

// ** React Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

// ** React Hot Toast Styles
import '@styles/react/libs/tables/react-dataTable-component.scss';

// ** Core styles
import './@core/assets/fonts/feather/iconfont.css';
import './@core/scss/core.scss';
import './assets/scss/style.scss';
import '@styles/react/libs/flatpickr/flatpickr.scss';

// ** Service Worker
import * as serviceWorker from './serviceWorker';

// ** Lazy load app
const LazyApp = lazy(() => import('./App'));

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
    <BrowserRouter>
        <Provider store={store}>
            <ThemeContext>
                <SchoolContextProvider>
                    <ActiveYearContextProvider>
                        <ModalContextProvider>
                            <LazyApp />
                        </ModalContextProvider>
                    </ActiveYearContextProvider>
                </SchoolContextProvider>
            </ThemeContext>
        </Provider>
    </BrowserRouter>,
);

serviceWorker.unregister();
