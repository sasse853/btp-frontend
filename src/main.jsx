import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App.jsx';
import { store } from './store/store';
import { EchoProvider } from './context/EchoContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <EchoProvider>
          <App />
          <ToastContainer position="top-right" autoClose={4000} newestOnTop theme="colored" />
        </EchoProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>
);
