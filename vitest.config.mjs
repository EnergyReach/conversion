import path from 'path'

export default {
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src')
    },
  },
  test: {
    coverage: {
        thresholds: {
            branches: 95,
            functions: 95,
            lines: 95,
            statements: 95,
        }
    },
  }
}
