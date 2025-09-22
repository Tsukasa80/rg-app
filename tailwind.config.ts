import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        green: {
          50: '#f3faf5',
          100: '#d8f3e3',
          500: '#29a36a',
          600: '#218457'
        },
        red: {
          50: '#fff5f5',
          100: '#ffe0df',
          500: '#d64545',
          600: '#b93a3a'
        }
      }
    }
  },
  plugins: []
};

export default config;
