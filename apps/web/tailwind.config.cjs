/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,ts,js,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111111',
        fog: '#f4f1ea',
        sand: '#e8dfd1',
        clay: '#c87f56',
        pine: '#2f5d50',
      },
      boxShadow: {
        soft: '0 18px 55px rgba(17, 17, 17, 0.08)',
      },
      backgroundImage: {
        grid: 'linear-gradient(rgba(17,17,17,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.05) 1px, transparent 1px)',
      },
      fontFamily: {
        display: [
          '"Fraunces"',
          '"Noto Serif SC"',
          '"Source Han Serif SC"',
          '"Songti SC"',
          '"STSong"',
          'serif',
        ],
        body: [
          '"Manrope"',
          '"Noto Sans SC"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
