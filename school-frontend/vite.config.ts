import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// The 'tailwindcss' variable itself is not directly used, only the function call.
// So, we can just import the plugin directly without assigning it to a variable.
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Directly call the tailwindcss plugin function here
    tailwindcss()
  ],
})
