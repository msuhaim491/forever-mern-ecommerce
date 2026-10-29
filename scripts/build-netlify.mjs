import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const root = resolve(import.meta.dirname, '..');

function build(workspace, additionalEnv = {}) {
  const result = spawnSync(npm, ['run', 'build', '-w', workspace], {
    cwd: root,
    env: { ...process.env, VITE_API_URL: '', ...additionalEnv },
    stdio: 'inherit'
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

build('frontend');
build('admin', { VITE_ADMIN_BASE: '/admin/' });

const target = resolve(root, 'frontend/dist/admin');
const source = resolve(root, 'admin/dist');
if (!existsSync(source)) throw new Error('Admin build output is missing');
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true, force: true });
console.log('Netlify build complete: storefront /, admin /admin, API /.netlify/functions/api');
