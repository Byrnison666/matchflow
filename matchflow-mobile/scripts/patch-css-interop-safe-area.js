const fs = require('fs')
const path = require('path')

const packageRoot = path.join(__dirname, '..', 'node_modules', 'react-native-css-interop')
const targets = [
  path.join(packageRoot, 'dist', 'runtime', 'third-party-libs', 'react-native-safe-area-context.native.js'),
  path.join(packageRoot, 'src', 'runtime', 'third-party-libs', 'react-native-safe-area-context.native.tsx'),
]

for (const file of targets) {
  if (!fs.existsSync(file)) continue

  const source = fs.readFileSync(file, 'utf8')
  if (source.includes('if (!type) return type;')) continue

  const patched = source.replace(
    /function maybeHijackSafeAreaProvider\(type(?:: ComponentType<any>)?\) \{\r?\n\s*const name = type\.displayName \|\| type\.name;/,
    (match) => match.replace('const name = type.displayName || type.name;', 'if (!type) return type;\n  const name = type.displayName || type.name;'),
  )

  if (patched !== source) {
    fs.writeFileSync(file, patched)
  }
}
