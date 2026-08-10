import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

import { GoogleOAuthProvider } from '@react-oauth/google'



createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <GoogleOAuthProvider clientId="1096762946620-aqpm3dho3jcebv7mfa8fbrmop8slj9gp.apps.googleusercontent.com">
      <App />
      </GoogleOAuthProvider>
  </StrictMode>,
)
