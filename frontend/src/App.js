
import 'react-toastify/dist/ReactToastify.css';



// ** Router Import

import './style/style.css'
import './style/datatable.css'
import './style/darktable.css'

const App = () => {
    return (
        <Suspense fallback={null}>
            <AuthProvider >
                <RequestProvider>
                    <ToastContainer />
                    <CModal/>
                    <Router />
                </RequestProvider>
            </AuthProvider>
        </Suspense>
    )
}

export default App
