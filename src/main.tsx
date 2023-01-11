import './index.css'

import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'

import App from './App'
import { store } from './stores'

const frontEndApp = (
  <Provider store={store}>
    <App />
  </Provider>
)

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root') as HTMLElement
  if (root) {
    ReactDOM.createRoot(root).render(frontEndApp)
  }
})
