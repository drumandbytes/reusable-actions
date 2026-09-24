// Fails unless node-ci resolved Node from ../mise.toml (one directory up).
const expected = 'v22.';
if (!process.version.startsWith(expected)) {
  console.error(`expected Node ${expected}x from tests/fixtures/mise.toml, got ${process.version}`);
  process.exit(1);
}
console.log(`Node ${process.version}, as pinned in tests/fixtures/mise.toml`);
