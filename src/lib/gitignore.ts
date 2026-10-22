/**
 * .gitignore templates.
 *
 * The point of a generated .gitignore is that it contains only what your
 * stack actually produces, rather than the hundred-language file that
 * everybody copies from the most popular repository on GitHub.
 */

export interface GitignoreTemplate {
  id: string;
  label: string;
  lines: string[];
}

export const gitignoreTemplates: GitignoreTemplate[] = [
  {
    id: 'node',
    label: 'Node.js',
    lines: [
      'node_modules/',
      '.pnp',
      '.pnp.js',
      'dist/',
      'build/',
      '.next/',
      '.nuxt/',
      '.output/',
      'coverage/',
      '*.tsbuildinfo',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.env',
      '.env.local',
      '.env.*.local',
    ],
  },
  {
    id: 'python',
    label: 'Python',
    lines: [
      '__pycache__/',
      '*.py[cod]',
      '*$py.class',
      '*.so',
      'venv/',
      '.venv/',
      'env/',
      'env.bak/',
      'pip-wheel-metadata/',
      '.pytest_cache/',
      '.mypy_cache/',
      '.ruff_cache/',
      '.coverage',
      'htmlcov/',
      '*.egg-info/',
      '.ipynb_checkpoints',
    ],
  },
  {
    id: 'go',
    label: 'Go',
    lines: [
      '*.exe',
      '*.exe~',
      '*.dll',
      '*.so',
      '*.dylib',
      'bin/',
      'vendor/',
      'coverage.out',
      '*.test',
      'go.work',
    ],
  },
  {
    id: 'rust',
    label: 'Rust',
    lines: ['target/', '**/*.rs.bk', '*.pdb', 'Cargo.lock.orig'],
  },
  {
    id: 'java',
    label: 'Java / Kotlin',
    lines: [
      '*.class',
      '*.jar',
      '*.war',
      '*.ear',
      'target/',
      'build/',
      '.gradle/',
      'hs_err_pid*',
      '.idea/',
    ],
  },
  {
    id: 'ruby',
    label: 'Ruby',
    lines: [
      '*.gem',
      '.bundle/',
      'vendor/bundle/',
      'Gemfile.lock',
      '.ruby-version',
      '.ruby-gemset',
      'coverage/',
    ],
  },
  {
    id: 'php',
    label: 'PHP / Laravel',
    lines: [
      '/vendor/',
      '/node_modules/',
      '/public/storage',
      '/storage/*.key',
      '.env',
      'composer.phar',
      '.phpunit.result.cache',
    ],
  },
  {
    id: 'dotnet',
    label: '.NET',
    lines: [
      'bin/',
      'obj/',
      '[Bb]in/',
      '[Oo]bj/',
      '*.user',
      '*.suo',
      '*.userprefs',
      '.vs/',
      'TestResults/',
    ],
  },
  {
    id: 'elixir',
    label: 'Elixir',
    lines: ['/_build/', '/cover/', '/deps/', '/doc/', '/.fetch', 'erl_crash.dump'],
  },
  {
    id: 'swift',
    label: 'Swift',
    lines: [
      '.build/',
      'DerivedData/',
      '*.xcuserstate',
      'xcuserdata/',
      '.swiftpm/',
    ],
  },
  {
    id: 'terraform',
    label: 'Terraform',
    lines: [
      '**/.terraform/*',
      '*.tfstate',
      '*.tfstate.*',
      '*.tfvars',
      '*.tfvars.json',
      'crash.log',
      'override.tf',
      'override.tf.json',
      '*_override.tf',
    ],
  },
  {
    id: 'docker',
    label: 'Docker',
    lines: [
      '.dockerignore',
      'docker-compose.override.yml',
      '*.tar',
      '*.tar.gz',
    ],
  },
  {
    id: 'laravel',
    label: 'Laravel',
    lines: ['/vendor/', '/node_modules/', '/public/hot', '/storage/*.key', '.env'],
  },
  {
    id: 'rails',
    label: 'Ruby on Rails',
    lines: [
      '/log/*',
      '/tmp/*',
      '/storage/*',
      '/public/assets',
      '/public/packs',
      '/public/packs-test',
      'node_modules/',
      'yarn-error.log',
      'config/master.key',
    ],
  },
  {
    id: 'svelte',
    label: 'Svelte / Vite',
    lines: ['node_modules/', 'dist/', '.svelte-kit/', 'build/', '.vite/', '.env.local'],
  },
  {
    id: 'unity',
    label: 'Unity',
    lines: [
      '[Ll]ibrary/',
      '[Tt]emp/',
      '[Oo]bj/',
      '[Bb]uild/',
      '[Bb]uilds/',
      '[Ll]ogs/',
      '[Uu]ser[Ss]ettings/',
      '*.csproj',
      '*.sln',
      '*.unityproj',
    ],
  },
];

export const gitignoreGroups: { id: string; label: string; lines: string[] }[] = [
  {
    id: 'os',
    label: 'Operating system',
    lines: [
      '.DS_Store',
      '.AppleDouble',
      '.LSOverride',
      'Thumbs.db',
      'ehthumbs.db',
      'Desktop.ini',
      '$RECYCLE.BIN/',
      '*.lnk',
    ],
  },
  {
    id: 'editors',
    label: 'Editors and IDEs',
    lines: [
      '.vscode/',
      '.idea/',
      '*.swp',
      '*.swo',
      '*~',
      '*.sublime-project',
      '*.sublime-workspace',
      '.history/',
    ],
  },
  {
    id: 'secrets',
    label: 'Secrets and credentials',
    lines: [
      '.env',
      '.env.*',
      '!.env.example',
      '*.pem',
      '*.key',
      '*.p12',
      '*.pfx',
      'secrets.yml',
      'credentials.json',
    ],
  },
  {
    id: 'logs',
    label: 'Logs and caches',
    lines: [
      '*.log',
      'logs/',
      '.cache/',
      '.pytest_cache/',
      '__pycache__/',
      '.sass-cache/',
      '.eslintcache',
    ],
  },
  {
    id: 'build',
    label: 'Build output',
    lines: ['dist/', 'build/', 'out/', 'target/', '*.min.js', '*.map'],
  },
];

export function buildGitignore(stacks: string[], groups: string[], extras: string[]): string {
  const sections: { title: string; lines: string[] }[] = [];

  for (const group of groups) {
    const template = gitignoreGroups.find((candidate) => candidate.id === group);
    if (template) sections.push({ title: template.label, lines: template.lines });
  }

  for (const stack of stacks) {
    const template = gitignoreTemplates.find((candidate) => candidate.id === stack);
    if (template) sections.push({ title: template.label, lines: template.lines });
  }

  const extra = extras.map((line) => line.trim()).filter(Boolean);
  if (extra.length > 0) sections.push({ title: 'Your patterns', lines: extra });

  return sections
    .map((section) => `# ${section.title}\n${section.lines.join('\n')}`)
    .join('\n\n')
    .concat('\n');
}
