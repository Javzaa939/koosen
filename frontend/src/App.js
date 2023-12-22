import React, { Suspense } from "react"

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import CModal from "@lms_components/Modal";

import { AuthProvider } from "@context/AuthContext";
import { RequestProvider } from "@context/RequestContext";
import {SchoolContextProvider} from "@context/SchoolContext"

// ** Router Import
import Router from "./router/Router"

import './style/style.css'

const App = () => {
    return (
        <Suspense fallback={null}>
            <AuthProvider >
                <SchoolContextProvider>
                    <RequestProvider>
                        <ToastContainer />
                        <CModal/>
                        <Router />
                    </RequestProvider>
                </SchoolContextProvider>
            </AuthProvider>
        </Suspense>
    )
}

export default App
