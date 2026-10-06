/**
 * Simulated Google Cloud CLI (`gcloud`) for the in-browser sandbox.
 *
 * Nothing here talks to Google Cloud. Every resource lives in a JSON
 * state file inside the sandbox's virtual filesystem, the same way the
 * simulated `docker` keeps its "daemon state". The command shapes,
 * flags, defaults, and output formats follow the official gcloud
 * reference (docs.cloud.google.com/sdk/gcloud/reference) closely enough
 * that what learners type here works on a real project.
 *
 * Covered: init, version, auth, config, projects (incl. IAM bindings),
 * iam service-accounts, services, compute (regions, zones, instances,
 * ssh, networks, subnets, firewall-rules), storage (buckets, ls, cp,
 * cat, rm), run (deploy, services), and container clusters.
 */

/** File access the evaluator hands in, so this module stays pure. */
export interface GcloudIO {
  readState(): string | null;
  writeState(json: string): void;
  readFile(path: string): string | null;
  writeFile(path: string, content: string): boolean;
}

interface Instance {
  name: string;
  zone: string;
  machineType: string;
  image: string;
  status: 'RUNNING' | 'TERMINATED';
  internalIp: string;
  externalIp: string;
  tags: string[];
}
interface Bucket {
  name: string;
  location: string;
  storageClass: string;
  objects: Record<string, string>;
}
interface Network {
  name: string;
  mode: 'auto' | 'custom';
}
interface Subnet {
  name: string;
  network: string;
  region: string;
  range: string;
}
interface FirewallRule {
  name: string;
  network: string;
  direction: 'INGRESS' | 'EGRESS';
  priority: number;
  allow: string;
  sourceRanges: string;
  targetTags: string;
}
interface Binding {
  role: string;
  members: string[];
}
interface ServiceAccount {
  name: string;
  email: string;
  displayName: string;
}
interface RunService {
  name: string;
  region: string;
  image: string;
  revision: number;
  url: string;
  public: boolean;
}
interface Cluster {
  name: string;
  location: string;
  mode: 'Autopilot' | 'Standard';
  nodes: number;
}

interface GcloudState {
  account: string;
  project: string | null;
  props: Record<string, string>;
  services: string[];
  instances: Instance[];
  buckets: Bucket[];
  networks: Network[];
  subnets: Subnet[];
  firewalls: FirewallRule[];
  iam: Binding[];
  serviceAccounts: ServiceAccount[];
  runServices: RunService[];
  clusters: Cluster[];
}

const DEFAULT_PROJECT = 'learninx-demo';
const DEFAULT_ACCOUNT = 'learner@example.com';
const PROJECT_NUMBER = '481516234200';

const REGIONS: Record<string, string[]> = {
  'us-central1': ['a', 'b', 'c', 'f'],
  'us-east1': ['b', 'c', 'd'],
  'europe-west1': ['b', 'c', 'd'],
  'asia-south1': ['a', 'b', 'c'],
};

const MACHINE_TYPES = new Set([
  'e2-micro', 'e2-small', 'e2-medium', 'e2-standard-2', 'e2-standard-4',
  'n1-standard-1', 'n2-standard-2', 'n2-standard-4', 'c3-standard-4',
]);

/** Bucket names the simulation treats as already taken by someone else. */
const TAKEN_BUCKETS = new Set(['test', 'my-bucket', 'backup', 'data', 'images', 'logs', 'bucket']);

/** APIs `gcloud services enable` knows the display name of. */
const KNOWN_APIS: Record<string, string> = {
  'compute.googleapis.com': 'Compute Engine API',
  'storage.googleapis.com': 'Cloud Storage API',
  'run.googleapis.com': 'Cloud Run Admin API',
  'container.googleapis.com': 'Kubernetes Engine API',
  'iam.googleapis.com': 'Identity and Access Management (IAM) API',
  'artifactregistry.googleapis.com': 'Artifact Registry API',
  'cloudbuild.googleapis.com': 'Cloud Build API',
  'logging.googleapis.com': 'Cloud Logging API',
  'monitoring.googleapis.com': 'Cloud Monitoring API',
  'sqladmin.googleapis.com': 'Cloud SQL Admin API',
};

function freshState(): GcloudState {
  return {
    account: DEFAULT_ACCOUNT,
    project: DEFAULT_PROJECT,
    props: {},
    services: ['compute.googleapis.com', 'storage.googleapis.com', 'iam.googleapis.com', 'logging.googleapis.com'],
    instances: [],
    buckets: [],
    // Every new project gets an auto mode `default` network with four
    // pre-populated firewall rules.
    networks: [{ name: 'default', mode: 'auto' }],
    subnets: [],
    firewalls: [
      { name: 'default-allow-icmp', network: 'default', direction: 'INGRESS', priority: 65534, allow: 'icmp', sourceRanges: '0.0.0.0/0', targetTags: '' },
      { name: 'default-allow-internal', network: 'default', direction: 'INGRESS', priority: 65534, allow: 'tcp:0-65535,udp:0-65535,icmp', sourceRanges: '10.128.0.0/9', targetTags: '' },
      { name: 'default-allow-rdp', network: 'default', direction: 'INGRESS', priority: 65534, allow: 'tcp:3389', sourceRanges: '0.0.0.0/0', targetTags: '' },
      { name: 'default-allow-ssh', network: 'default', direction: 'INGRESS', priority: 65534, allow: 'tcp:22', sourceRanges: '0.0.0.0/0', targetTags: '' },
    ],
    iam: [{ role: 'roles/owner', members: [`user:${DEFAULT_ACCOUNT}`] }],
    serviceAccounts: [],
    runServices: [],
    clusters: [],
  };
}

function load(io: GcloudIO): GcloudState {
  const raw = io.readState();
  if (raw) {
    try {
      return { ...freshState(), ...(JSON.parse(raw) as Partial<GcloudState>) };
    } catch {
      /* fall through */
    }
  }
  return freshState();
}

// ─────────────────────────────────────────────── helpers ──

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shortId(seed: string, len = 3): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let n = hash(seed);
  let out = '';
  for (let i = 0; i < len; i += 1) {
    out += alphabet[n % 26];
    n = Math.floor(n / 26) + hash(out);
  }
  return out;
}

/** External IPs come from the 34.x range Google Cloud really uses. */
function externalIp(seed: string): string {
  const h = hash(seed);
  return `34.${(h >> 16) & 255}.${(h >> 8) & 255}.${(h & 253) + 2}`;
}

interface Parsed {
  pos: string[];
  flags: Record<string, string | true>;
}

const BOOLEAN_FLAGS = new Set([
  'allow-unauthenticated', 'no-allow-unauthenticated', 'quiet', 'q', 'help', 'enabled', 'available',
  'uniform-bucket-level-access', 'recursive', 'r', 'all', 'async', 'no-address', 'internal-ip',
]);

function parse(args: string[]): Parsed {
  const pos: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < args.length; i += 1) {
    const a = args[i]!;
    if (a.startsWith('--') && a.length > 2) {
      const eq = a.indexOf('=');
      if (eq > 0) {
        flags[a.slice(2, eq)] = a.slice(eq + 1);
      } else {
        const name = a.slice(2);
        const next = args[i + 1];
        if (!BOOLEAN_FLAGS.has(name) && next !== undefined && !next.startsWith('-')) {
          flags[name] = next;
          i += 1;
        } else {
          flags[name] = true;
        }
      }
    } else if (a === '-q') {
      flags.quiet = true;
    } else if (a === '-r' || a === '-R') {
      flags.recursive = true;
    } else {
      pos.push(a);
    }
  }
  return { pos, flags };
}

function str(flags: Parsed['flags'], ...names: string[]): string | undefined {
  for (const n of names) {
    const v = flags[n];
    if (typeof v === 'string') return v;
  }
  return undefined;
}

function err(cmd: string, msg: string): string {
  return `ERROR: (gcloud.${cmd}) ${msg}`;
}

/** Render rows as a gcloud-style table, or honour --format=json|value(...). */
function table(
  rows: Record<string, string>[],
  columns: string[],
  format: string | undefined,
  empty = 'Listed 0 items.',
): string {
  if (format === 'json') {
    return JSON.stringify(rows.map((r) => Object.fromEntries(columns.map((c) => [c.toLowerCase(), r[c] ?? '']))), null, 2);
  }
  const value = format?.match(/^value\((.+)\)$/);
  if (value) {
    const fields = value[1]!.split(',').map((f) => f.trim().toUpperCase());
    return rows.map((r) => fields.map((f) => r[f] ?? '').join('\t')).join('\n');
  }
  if (rows.length === 0) return empty;
  const widths = columns.map((c) => Math.max(c.length, ...rows.map((r) => (r[c] ?? '').length)));
  const line = (cells: string[]) =>
    cells.map((c, i) => (i === cells.length - 1 ? c : c.padEnd(widths[i]! + 2))).join('').trimEnd();
  return [line(columns), ...rows.map((r) => line(columns.map((c) => r[c] ?? '')))].join('\n');
}

function regionOfZone(zone: string): string {
  return zone.replace(/-[a-z]$/, '');
}

function isZone(z: string): boolean {
  const region = regionOfZone(z);
  return !!REGIONS[region]?.includes(z.slice(-1)) && z !== region;
}

// ─────────────────────────────────────────────── usage ──

const USAGE = `Usage: gcloud GROUP | COMMAND [FLAGS ...]

Simulated Google Cloud CLI. Supported groups in this sandbox:

  auth        Manage the credentials gcloud uses (list, login).
  config      View and edit gcloud properties (list, get, set, unset).
  projects    List projects and manage their IAM policy.
  iam         Manage service accounts.
  services    Enable and list Google Cloud APIs.
  compute     Compute Engine: instances, ssh, networks, subnets, firewall-rules,
              regions, zones.
  storage     Cloud Storage: buckets, ls, cp, cat, rm.
  run         Cloud Run: deploy, services.
  container   Google Kubernetes Engine: clusters.

Other commands: init, version.
Global flags: --project=PROJECT_ID, --format=json|value(FIELD,...), --quiet.

Nothing here touches a real Google Cloud account.`;

// ─────────────────────────────────────────────── entry ──

export function runGcloud(args: string[], io: GcloudIO): string {
  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') return USAGE;
  if (args[0] === '--version' || args[0] === 'version') {
    return [
      'Google Cloud SDK 540.0.0 (simulated by Learninx)',
      'bq 2.1.22',
      'core 2025.09.26',
      'gcloud-crc32c 1.0.0',
      'gsutil 5.35',
    ].join('\n');
  }

  const state = load(io);
  const { pos, flags } = parse(args);
  const format = str(flags, 'format');
  const project = str(flags, 'project') ?? state.project;
  const save = () => io.writeState(JSON.stringify(state));
  const [group, ...rest] = pos;

  const needProject = (cmd: string): string | null =>
    project
      ? null
      : err(
          cmd,
          'The required property [project] is not currently set.\nIt can be set on a per-command basis by re-running your command with the [--project] flag.\n\nYou may set it for your current workspace by running:\n\n  $ gcloud config set project VALUE',
        );

  switch (group) {
    case 'init':
      return [
        'Welcome! This command will take you through the configuration of gcloud.',
        '',
        "Your current configuration has been set to: [default]",
        '',
        `You are logged in as: [${state.account}].`,
        '',
        `Your current project has been set to: [${project ?? DEFAULT_PROJECT}].`,
        '',
        'The Google Cloud CLI is configured and ready to use!',
        '(simulated: the real command opens a browser to sign in and lets you pick a project and default region/zone)',
      ].join('\n');

    case 'auth':
      return auth(rest, state);

    case 'config':
      return config(rest, flags, state, save, format);

    case 'projects':
      return projects(rest, flags, state, save, format, project);

    case 'iam': {
      const missing = needProject('iam');
      if (missing) return missing;
      return iam(rest, flags, state, save, format, project!);
    }

    case 'services': {
      const missing = needProject('services');
      if (missing) return missing;
      return services(rest, flags, state, save, format, project!);
    }

    case 'compute': {
      const missing = needProject(`compute.${rest.slice(0, 2).join('.')}`);
      if (missing) return missing;
      return compute(rest, flags, state, save, format, project!, io);
    }

    case 'storage': {
      const missing = needProject('storage');
      if (missing) return missing;
      return storage(rest, flags, state, save, format, project!, io);
    }

    case 'run': {
      const missing = needProject('run');
      if (missing) return missing;
      return run(rest, flags, state, save, format, project!);
    }

    case 'container': {
      const missing = needProject('container');
      if (missing) return missing;
      return container(rest, flags, state, save, format, project!, io);
    }

    case 'alpha':
    case 'beta':
      return `ERROR: (gcloud) The ${group} release track isn't simulated here. Try the GA command without "${group}".`;

    default:
      return `ERROR: (gcloud) Invalid choice: '${group}'.\nMaybe you meant:\n  gcloud compute\n  gcloud config\n  gcloud storage\n\nTo search the help text of gcloud commands, run:\n  gcloud help`;
  }
}

// ─────────────────────────────────────────────── auth / config ──

function auth(rest: string[], state: GcloudState): string {
  const [sub] = rest;
  if (sub === 'list') {
    return [
      '    Credentialed Accounts',
      'ACTIVE  ACCOUNT',
      `*       ${state.account}`,
      '',
      'To set the active account, run:',
      '    $ gcloud config set account `ACCOUNT`',
    ].join('\n');
  }
  if (sub === 'login') {
    return `(simulated) A browser window would open so you can sign in.\n\nYou are now logged in as [${state.account}].`;
  }
  if (sub === 'application-default' && rest[1] === 'login') {
    return '(simulated) Credentials saved to file: [/home/learner/.config/gcloud/application_default_credentials.json]\n\nThese credentials will be used by any library that requests Application Default Credentials (ADC).';
  }
  return err('auth', `Invalid choice: '${sub ?? ''}'. Try: gcloud auth list | login | application-default login`);
}

const PROPERTY_ALIASES: Record<string, string> = {
  project: 'core/project',
  account: 'core/account',
  region: 'compute/region',
  zone: 'compute/zone',
};

function canonical(prop: string): string {
  return PROPERTY_ALIASES[prop] ?? prop;
}

function getProp(state: GcloudState, prop: string): string | undefined {
  const key = canonical(prop);
  if (key === 'core/project') return state.project ?? undefined;
  if (key === 'core/account') return state.account;
  return state.props[key];
}

function config(
  rest: string[],
  _flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
): string {
  const [sub, prop, value] = rest;
  switch (sub) {
    case 'list': {
      if (format === 'json') {
        return JSON.stringify(
          { core: { account: state.account, project: state.project ?? undefined }, ...groupProps(state.props) },
          null,
          2,
        );
      }
      const sections: Record<string, Record<string, string>> = {
        core: { account: state.account, disable_usage_reporting: 'True' },
        ...groupProps(state.props),
      };
      if (state.project) sections.core!.project = state.project;
      const out: string[] = [];
      for (const section of Object.keys(sections).sort()) {
        out.push(`[${section}]`);
        for (const [k, v] of Object.entries(sections[section]!).sort()) out.push(`${k} = ${v}`);
      }
      out.push('', 'Your active configuration is: [default]');
      return out.join('\n');
    }
    case 'get':
    case 'get-value': {
      if (!prop) return err('config.get', 'argument SECTION/PROPERTY: Must be specified.');
      const v = getProp(state, prop);
      return v ?? `(unset)`;
    }
    case 'set': {
      if (!prop || value === undefined) return err('config.set', 'argument SECTION/PROPERTY VALUE: Must be specified.');
      const key = canonical(prop);
      if (!/^[a-z_]+\/[a-z_]+$/.test(key)) return err('config.set', `Section [${key.split('/')[0]}] has no property [${key}].`);
      if (key === 'core/project') {
        if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value)) {
          return err(
            'config.set',
            `Invalid project ID [${value}]. A project ID must be 6 to 30 lowercase letters, digits, or hyphens, start with a letter, and not end with a hyphen.`,
          );
        }
        state.project = value;
      } else if (key === 'core/account') {
        state.account = value;
      } else {
        if (key === 'compute/zone' && !isZone(value)) {
          state.props[key] = value;
          save();
          return `WARNING: [${value}] is not a zone this sandbox knows about. Known zones: ${allZones().join(', ')}\nUpdated property [${key}].`;
        }
        if ((key === 'compute/region' || key === 'run/region') && !REGIONS[value]) {
          state.props[key] = value;
          save();
          return `WARNING: [${value}] is not a region this sandbox knows about. Known regions: ${Object.keys(REGIONS).join(', ')}\nUpdated property [${key}].`;
        }
        state.props[key] = value;
      }
      save();
      return `Updated property [${key}].`;
    }
    case 'unset': {
      if (!prop) return err('config.unset', 'argument SECTION/PROPERTY: Must be specified.');
      const key = canonical(prop);
      if (key === 'core/project') state.project = null;
      else delete state.props[key];
      save();
      return `Unset property [${key}].`;
    }
    case 'configurations':
      if (rest[1] === 'list') {
        return table(
          [{ NAME: 'default', IS_ACTIVE: 'True', ACCOUNT: state.account, PROJECT: state.project ?? '', COMPUTE_DEFAULT_ZONE: state.props['compute/zone'] ?? '', COMPUTE_DEFAULT_REGION: state.props['compute/region'] ?? '' }],
          ['NAME', 'IS_ACTIVE', 'ACCOUNT', 'PROJECT', 'COMPUTE_DEFAULT_ZONE', 'COMPUTE_DEFAULT_REGION'],
          format,
        );
      }
      return '(simulated) Only the [default] configuration exists in this sandbox. On a real machine, `gcloud config configurations create NAME` adds another profile.';
    default:
      return err('config', `Invalid choice: '${sub ?? ''}'. Try: gcloud config list | get | set | unset`);
  }
}

function groupProps(props: Record<string, string>): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const [key, v] of Object.entries(props)) {
    const [section, name] = key.split('/') as [string, string];
    out[section] = { ...(out[section] ?? {}), [name]: v };
  }
  return out;
}

function allZones(): string[] {
  return Object.entries(REGIONS).flatMap(([r, zs]) => zs.map((z) => `${r}-${z}`));
}

// ─────────────────────────────────────────────── projects / iam / services ──

const MEMBER_RE = /^(user|group|serviceAccount|domain):[^\s]+$|^(allUsers|allAuthenticatedUsers)$/;

function policyYaml(state: GcloudState): string {
  const lines = ['bindings:'];
  for (const b of [...state.iam].sort((a, c) => (a.role < c.role ? -1 : 1))) {
    lines.push('- members:');
    for (const m of b.members) lines.push(`  - ${m}`);
    lines.push(`  role: ${b.role}`);
  }
  lines.push(`etag: BwY${shortId(JSON.stringify(state.iam), 6)}=`, 'version: 1');
  return lines.join('\n');
}

function projects(
  rest: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  project: string | null,
): string {
  const [sub, id] = rest;
  const known = Array.from(new Set([DEFAULT_PROJECT, ...(state.project ? [state.project] : [])]));
  switch (sub) {
    case 'list':
      return table(
        known.map((p, i) => ({ PROJECT_ID: p, NAME: p === DEFAULT_PROJECT ? 'Learninx Demo' : p, PROJECT_NUMBER: String(Number(PROJECT_NUMBER) + i) })),
        ['PROJECT_ID', 'NAME', 'PROJECT_NUMBER'],
        format,
      );
    case 'describe': {
      const target = id ?? project;
      if (!target) return err('projects.describe', 'argument PROJECT_ID_OR_NUMBER: Must be specified.');
      return [
        `createTime: '2025-01-15T09:30:00.000Z'`,
        'lifecycleState: ACTIVE',
        `name: ${target === DEFAULT_PROJECT ? 'Learninx Demo' : target}`,
        'parent:',
        "  id: '123456789'",
        '  type: folder',
        `projectId: ${target}`,
        `projectNumber: '${PROJECT_NUMBER}'`,
      ].join('\n');
    }
    case 'get-iam-policy':
      return policyYaml(state);
    case 'add-iam-policy-binding':
    case 'remove-iam-policy-binding': {
      const cmd = `projects.${sub}`;
      const target = id;
      if (!target) return err(cmd, 'argument PROJECT_ID: Must be specified.');
      const member = str(flags, 'member');
      const role = str(flags, 'role');
      if (!member) return err(cmd, 'argument --member: Must be specified.');
      if (!role) return err(cmd, 'argument --role: Must be specified.');
      if (!MEMBER_RE.test(member)) {
        return err(cmd, `Invalid value for [--member]: [${member}]. Use a prefix such as user:, group:, serviceAccount:, or domain:, e.g. user:alice@example.com.`);
      }
      if (!/^(roles\/[A-Za-z0-9_.]+|projects\/[^/]+\/roles\/[A-Za-z0-9_.]+|organizations\/\d+\/roles\/[A-Za-z0-9_.]+)$/.test(role)) {
        return err(cmd, `Invalid value for [--role]: [${role}]. Roles look like roles/storage.objectViewer or projects/PROJECT_ID/roles/CUSTOM_ROLE.`);
      }
      if (member.startsWith('serviceAccount:')) {
        const email = member.slice('serviceAccount:'.length);
        const local = email.endsWith(`@${target}.iam.gserviceaccount.com`);
        if (local && !state.serviceAccounts.some((s) => s.email === email)) {
          return err(cmd, `INVALID_ARGUMENT: Service account ${email} does not exist.`);
        }
      }
      let binding = state.iam.find((b) => b.role === role);
      if (sub === 'add-iam-policy-binding') {
        if (!binding) {
          binding = { role, members: [] };
          state.iam.push(binding);
        }
        if (!binding.members.includes(member)) binding.members.push(member);
      } else {
        if (!binding || !binding.members.includes(member)) {
          return err(cmd, `Policy binding with the specified principal, role, and condition not found!`);
        }
        binding.members = binding.members.filter((m) => m !== member);
        if (binding.members.length === 0) state.iam = state.iam.filter((b) => b !== binding);
      }
      save();
      return `Updated IAM policy for project [${target}].\n${policyYaml(state)}`;
    }
    default:
      return err('projects', `Invalid choice: '${sub ?? ''}'. Try: list | describe | get-iam-policy | add-iam-policy-binding | remove-iam-policy-binding`);
  }
}

function iam(
  rest: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  project: string,
): string {
  const [sub, action, name] = rest;
  if (sub === 'service-accounts') {
    switch (action) {
      case 'create': {
        if (!name) return err('iam.service-accounts.create', 'argument NAME: Must be specified.');
        if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(name)) {
          return err('iam.service-accounts.create', `[${name}] is not a valid service account ID: use 6-30 lowercase letters, digits, or hyphens, starting with a letter.`);
        }
        const email = `${name}@${project}.iam.gserviceaccount.com`;
        if (state.serviceAccounts.some((s) => s.email === email)) {
          return err('iam.service-accounts.create', `Resource in projects [${project}] is the subject of a conflict: Service account ${name} already exists within project projects/${project}.`);
        }
        state.serviceAccounts.push({ name, email, displayName: str(flags, 'display-name') ?? '' });
        save();
        return `Created service account [${name}].`;
      }
      case 'list':
        return table(
          state.serviceAccounts.map((s) => ({ 'DISPLAY NAME': s.displayName, EMAIL: s.email, DISABLED: 'False' })),
          ['DISPLAY NAME', 'EMAIL', 'DISABLED'],
          format,
        );
      case 'delete': {
        const idx = state.serviceAccounts.findIndex((s) => s.email === name || s.name === name);
        if (idx < 0) return err('iam.service-accounts.delete', `NOT_FOUND: Unknown service account ${name ?? ''}`);
        const [removed] = state.serviceAccounts.splice(idx, 1);
        save();
        return `deleted service account [${removed!.email}]`;
      }
      case 'keys':
        return 'WARNING: Service account keys are long-lived credentials and a security risk if they leak.\nGoogle recommends attaching the service account to the resource, or Workload Identity Federation, instead of creating keys.\n(simulated: key creation is disabled in this sandbox on purpose)';
      default:
        return err('iam.service-accounts', `Invalid choice: '${action ?? ''}'. Try: create | list | delete`);
    }
  }
  if (sub === 'roles' && action === 'describe' && name) {
    const perms: Record<string, string[]> = {
      'roles/storage.objectViewer': ['resourcemanager.projects.get', 'storage.folders.get', 'storage.folders.list', 'storage.managedFolders.get', 'storage.managedFolders.list', 'storage.objects.get', 'storage.objects.list'],
      'roles/viewer': ['(thousands of read-only permissions across every service)'],
      'roles/run.invoker': ['run.routes.invoke'],
      'roles/logging.viewer': ['logging.logEntries.list', 'logging.logs.list', 'logging.sinks.get', 'logging.sinks.list'],
    };
    const p = perms[name];
    if (!p) return err('iam.roles.describe', `NOT_FOUND: The role named ${name} isn't in this sandbox's catalogue. Try roles/storage.objectViewer, roles/run.invoker, or roles/logging.viewer.`);
    return ['description: Predefined role', 'includedPermissions:', ...p.map((x) => `- ${x}`), `name: ${name}`, 'stage: GA'].join('\n');
  }
  return err('iam', `Invalid choice: '${sub ?? ''}'. Try: gcloud iam service-accounts create | list | delete, or gcloud iam roles describe ROLE`);
}

function services(
  rest: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  project: string,
): string {
  const [sub, ...names] = rest;
  if (sub === 'enable' || sub === 'disable') {
    if (names.length === 0) return err(`services.${sub}`, 'argument SERVICE: Must be specified.');
    for (const n of names) {
      if (!n.endsWith('.googleapis.com')) {
        return err(`services.${sub}`, `PERMISSION_DENIED: Not found or permission denied for service(s): ${n}. Service names look like run.googleapis.com.`);
      }
    }
    state.services =
      sub === 'enable'
        ? Array.from(new Set([...state.services, ...names]))
        : state.services.filter((s) => !names.includes(s));
    save();
    return `Operation "operations/acf.p2-${PROJECT_NUMBER}-${shortId(names.join(), 8)}" finished successfully.`;
  }
  if (sub === 'list') {
    const pool = flags.available ? Object.keys(KNOWN_APIS) : state.services;
    return table(
      pool.sort().map((n) => ({ NAME: n, TITLE: KNOWN_APIS[n] ?? n })),
      ['NAME', 'TITLE'],
      format,
    );
  }
  return err('services', `Invalid choice: '${sub ?? ''}'. Try: enable | disable | list --enabled (project ${project})`);
}

// ─────────────────────────────────────────────── compute ──

function compute(
  rest: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  project: string,
  _io: GcloudIO,
): string {
  const [resource, action, ...names] = rest;
  const base = `https://www.googleapis.com/compute/v1/projects/${project}`;

  if (resource === 'regions' && action === 'list') {
    return table(
      Object.keys(REGIONS).map((r) => ({ NAME: r, CPUS: '0/24', DISKS_GB: '0/4096', ADDRESSES: '0/8', RESERVED_ADDRESSES: '0/8', STATUS: 'UP' })),
      ['NAME', 'CPUS', 'DISKS_GB', 'ADDRESSES', 'RESERVED_ADDRESSES', 'STATUS'],
      format,
    );
  }
  if (resource === 'zones' && action === 'list') {
    return table(
      allZones().map((z) => ({ NAME: z, REGION: regionOfZone(z), STATUS: 'UP' })),
      ['NAME', 'REGION', 'STATUS'],
      format,
    );
  }
  if (resource === 'machine-types' && action === 'list') {
    const specs: Record<string, [string, string]> = {
      'e2-micro': ['2', '1.00'], 'e2-small': ['2', '2.00'], 'e2-medium': ['2', '4.00'],
      'e2-standard-2': ['2', '8.00'], 'e2-standard-4': ['4', '16.00'], 'n1-standard-1': ['1', '3.75'],
      'n2-standard-2': ['2', '8.00'], 'n2-standard-4': ['4', '16.00'], 'c3-standard-4': ['4', '16.00'],
    };
    const zone = str(flags, 'zones', 'zone') ?? state.props['compute/zone'] ?? 'us-central1-a';
    return table(
      [...MACHINE_TYPES].map((m) => ({ NAME: m, ZONE: zone, CPUS: specs[m]![0], MEMORY_GB: specs[m]![1], DEPRECATED: '' })),
      ['NAME', 'ZONE', 'CPUS', 'MEMORY_GB', 'DEPRECATED'],
      format,
    );
  }

  if (resource === 'instances') return instances(action, names, flags, state, save, format, base);

  if (resource === 'ssh') {
    const name = action;
    if (!name) return err('compute.ssh', 'argument [USER@]INSTANCE: Must be specified.');
    const inst = state.instances.find((i) => i.name === name.split('@').pop());
    if (!inst) return err('compute.ssh', `Could not fetch resource:\n - The resource '${base}/zones/${str(flags, 'zone') ?? state.props['compute/zone'] ?? 'ZONE'}/instances/${name}' was not found`);
    if (inst.status !== 'RUNNING') return err('compute.ssh', `Instance [${inst.name}] in zone [${inst.zone}] is not running. Start it with: gcloud compute instances start ${inst.name} --zone=${inst.zone}`);
    return [
      `Updating project ssh metadata...done.`,
      `Waiting for SSH key to propagate.`,
      `(simulated) You would now be logged in to ${inst.name} (${inst.externalIp}) as learner.`,
      `It's a normal ${inst.image.startsWith('debian') ? 'Debian' : 'Linux'} VM: every command from the Linux track works there.`,
    ].join('\n');
  }

  if (resource === 'networks') {
    if (action === 'subnets') return subnets(names, flags, state, save, format, base);
    if (action === 'create') {
      const name = names[0];
      if (!name) return err('compute.networks.create', 'argument NAME: Must be specified.');
      if (state.networks.some((n) => n.name === name)) return err('compute.networks.create', `Could not fetch resource:\n - The resource '${base}/global/networks/${name}' already exists`);
      const mode = (str(flags, 'subnet-mode') ?? 'auto').toLowerCase();
      if (mode !== 'auto' && mode !== 'custom') return err('compute.networks.create', `argument --subnet-mode: Invalid choice: '${mode}'. Valid choices are [auto, custom].`);
      state.networks.push({ name, mode });
      save();
      return [
        `Created [${base}/global/networks/${name}].`,
        table([{ NAME: name, SUBNET_MODE: mode.toUpperCase(), BGP_ROUTING_MODE: 'REGIONAL', IPV4_RANGE: '', GATEWAY_IPV4: '' }], ['NAME', 'SUBNET_MODE', 'BGP_ROUTING_MODE', 'IPV4_RANGE', 'GATEWAY_IPV4'], undefined),
        '',
        `Instances on this network will not be reachable until firewall rules`,
        `are created. As an example, you can allow all internal traffic between`,
        `instances as well as SSH, RDP, and ICMP by running:`,
        '',
        `$ gcloud compute firewall-rules create <FIREWALL_NAME> --network ${name} --allow tcp,udp,icmp --source-ranges <IP_RANGE>`,
        `$ gcloud compute firewall-rules create <FIREWALL_NAME> --network ${name} --allow tcp:22,tcp:3389,icmp`,
      ].join('\n');
    }
    if (action === 'list') {
      return table(
        state.networks.map((n) => ({ NAME: n.name, SUBNET_MODE: n.mode.toUpperCase(), BGP_ROUTING_MODE: 'REGIONAL', IPV4_RANGE: '', GATEWAY_IPV4: '' })),
        ['NAME', 'SUBNET_MODE', 'BGP_ROUTING_MODE', 'IPV4_RANGE', 'GATEWAY_IPV4'],
        format,
      );
    }
    if (action === 'delete') {
      const name = names[0];
      if (!name || !state.networks.some((n) => n.name === name)) return err('compute.networks.delete', `Could not fetch resource:\n - The network '${name ?? ''}' was not found`);
      if (state.instances.length > 0 && name === 'default') return err('compute.networks.delete', `The network resource '${base}/global/networks/${name}' is already being used by instances`);
      if (state.firewalls.some((f) => f.network === name) || state.subnets.some((s) => s.network === name)) {
        return err('compute.networks.delete', `The network resource '${base}/global/networks/${name}' is already being used by firewall rules or subnetworks. Delete those first.`);
      }
      state.networks = state.networks.filter((n) => n.name !== name);
      save();
      return `Deleted [${base}/global/networks/${name}].`;
    }
  }

  if (resource === 'firewall-rules') return firewalls(action, names, flags, state, save, format, base);

  return err('compute', `Invalid choice: '${[resource, action].filter(Boolean).join(' ')}'. Try: instances | ssh | networks | networks subnets | firewall-rules | regions list | zones list | machine-types list`);
}

function instanceRow(i: Instance): Record<string, string> {
  return {
    NAME: i.name,
    ZONE: i.zone,
    MACHINE_TYPE: i.machineType,
    PREEMPTIBLE: '',
    INTERNAL_IP: i.internalIp,
    EXTERNAL_IP: i.status === 'RUNNING' ? i.externalIp : '',
    STATUS: i.status,
  };
}
const INSTANCE_COLS = ['NAME', 'ZONE', 'MACHINE_TYPE', 'PREEMPTIBLE', 'INTERNAL_IP', 'EXTERNAL_IP', 'STATUS'];

function instances(
  action: string | undefined,
  names: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  base: string,
): string {
  const cmd = `compute.instances.${action ?? ''}`;
  const zoneFlag = str(flags, 'zone') ?? state.props['compute/zone'];

  if (action === 'list') {
    return table(state.instances.map(instanceRow), INSTANCE_COLS, format);
  }
  if (!action || !['create', 'describe', 'stop', 'start', 'delete', 'reset'].includes(action)) {
    return err('compute.instances', `Invalid choice: '${action ?? ''}'. Try: create | list | describe | stop | start | reset | delete`);
  }
  if (names.length === 0) return err(cmd, 'argument INSTANCE_NAMES: Must be specified.');

  if (action === 'create') {
    if (!zoneFlag) {
      return err(cmd, `Underspecified resource [${names.join(', ')}]. Specify the [--zone] flag, or set a default with:\n  $ gcloud config set compute/zone us-central1-a`);
    }
    if (!isZone(zoneFlag)) return err(cmd, `Could not fetch resource:\n - Invalid value for field 'zone': '${zoneFlag}'. Unknown zone. Run \`gcloud compute zones list\` to see valid zones.`);
    // The documented default machine type when --machine-type is omitted.
    const machineType = str(flags, 'machine-type') ?? 'n1-standard-1';
    if (!MACHINE_TYPES.has(machineType)) {
      return err(cmd, `Could not fetch resource:\n - Invalid value for field 'resource.machineType': '${machineType}'. Machine type with name '${machineType}' does not exist in zone '${zoneFlag}'.`);
    }
    const imageFamily = str(flags, 'image-family') ?? 'debian-12';
    const imageProject = str(flags, 'image-project') ?? 'debian-cloud';
    if (str(flags, 'image-family') && !str(flags, 'image-project')) {
      return err(cmd, `Could not fetch resource:\n - The resource 'projects/${state.project}/global/images/family/${imageFamily}' was not found. Public images live in their own project: add --image-project (for example --image-project=debian-cloud).`);
    }
    const created: Instance[] = [];
    for (const name of names) {
      if (!/^[a-z]([-a-z0-9]{0,61}[a-z0-9])?$/.test(name)) {
        return err(cmd, `Could not fetch resource:\n - Invalid value for field 'resource.name': '${name}'. Must be a match of regex '(?:[a-z](?:[-a-z0-9]{0,61}[a-z0-9])?)'`);
      }
      if (state.instances.some((i) => i.name === name && i.zone === zoneFlag)) {
        return err(cmd, `Could not fetch resource:\n - The resource '${base}/zones/${zoneFlag}/instances/${name}' already exists`);
      }
      const inst: Instance = {
        name,
        zone: zoneFlag,
        machineType,
        image: `${imageFamily} (${imageProject})`,
        status: 'RUNNING',
        internalIp: `10.128.0.${state.instances.length + 2}`,
        externalIp: externalIp(name + zoneFlag),
        tags: (str(flags, 'tags') ?? '').split(',').filter(Boolean),
      };
      state.instances.push(inst);
      created.push(inst);
    }
    save();
    return [
      ...created.map((i) => `Created [${base}/zones/${i.zone}/instances/${i.name}].`),
      table(created.map(instanceRow), INSTANCE_COLS, format),
    ].join('\n');
  }

  const out: string[] = [];
  for (const name of names) {
    const inst = state.instances.find((i) => i.name === name && (!zoneFlag || i.zone === zoneFlag));
    if (!inst) {
      return err(cmd, `Could not fetch resource:\n - The resource '${base}/zones/${zoneFlag ?? 'ZONE'}/instances/${name}' was not found`);
    }
    const url = `${base}/zones/${inst.zone}/instances/${inst.name}`;
    if (action === 'describe') {
      out.push(
        [
          `creationTimestamp: '2026-10-06T09:00:00.000-07:00'`,
          `machineType: ${base}/zones/${inst.zone}/machineTypes/${inst.machineType}`,
          `name: ${inst.name}`,
          'networkInterfaces:',
          '- accessConfigs:',
          '  - name: External NAT',
          `    natIP: ${inst.externalIp}`,
          '    type: ONE_TO_ONE_NAT',
          `  network: ${base}/global/networks/default`,
          `  networkIP: ${inst.internalIp}`,
          `sourceImage: ${inst.image}`,
          `status: ${inst.status}`,
          ...(inst.tags.length ? ['tags:', '  items:', ...inst.tags.map((t) => `  - ${t}`)] : []),
          `zone: ${base}/zones/${inst.zone}`,
        ].join('\n'),
      );
    } else if (action === 'stop') {
      inst.status = 'TERMINATED';
      out.push(`Stopping instance(s) ${inst.name}...done.`, `Updated [${url}].`);
    } else if (action === 'start') {
      inst.status = 'RUNNING';
      out.push(`Starting instance(s) ${inst.name}...done.`, `Updated [${url}].`, `Instance internal IP is ${inst.internalIp}`, `Instance external IP is ${inst.externalIp}`);
    } else if (action === 'reset') {
      out.push(`Updated [${url}].`);
    } else if (action === 'delete') {
      state.instances = state.instances.filter((i) => i !== inst);
      out.push(`Deleted [${url}].`);
    }
  }
  if (action !== 'describe') save();
  if (action === 'delete' && !flags.quiet) {
    out.unshift(`The following instances will be deleted. Any attached disks configured to be auto-deleted will be deleted unless they are attached to any other instances or the \`--keep-disks\` flag is given and specifies them for keeping.\n(simulated: answered "Y" to the confirmation prompt; pass --quiet to skip it in scripts)`);
  }
  return out.join('\n');
}

function subnets(
  args: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  base: string,
): string {
  const [action, name] = args;
  const cols = ['NAME', 'REGION', 'NETWORK', 'RANGE', 'STACK_TYPE'];
  const autoRows = state.networks
    .filter((n) => n.mode === 'auto')
    .flatMap((n) =>
      Object.keys(REGIONS).map((r, i) => ({ NAME: n.name, REGION: r, NETWORK: n.name, RANGE: `10.${128 + i * 4}.0.0/20`, STACK_TYPE: 'IPV4_ONLY' })),
    );
  if (action === 'list') {
    const net = str(flags, 'network');
    const rows = [
      ...autoRows,
      ...state.subnets.map((s) => ({ NAME: s.name, REGION: s.region, NETWORK: s.network, RANGE: s.range, STACK_TYPE: 'IPV4_ONLY' })),
    ].filter((r) => !net || r.NETWORK === net);
    return table(rows, cols, format);
  }
  if (action === 'create') {
    const cmd = 'compute.networks.subnets.create';
    if (!name) return err(cmd, 'argument NAME: Must be specified.');
    const network = str(flags, 'network');
    const region = str(flags, 'region') ?? state.props['compute/region'];
    const range = str(flags, 'range');
    if (!network) return err(cmd, 'argument --network: Must be specified.');
    if (!range) return err(cmd, 'argument --range: Must be specified.');
    if (!region) return err(cmd, `Underspecified resource [${name}]. Specify the [--region] flag.`);
    const net = state.networks.find((n) => n.name === network);
    if (!net) return err(cmd, `Could not fetch resource:\n - The resource '${base}/global/networks/${network}' was not found`);
    if (net.mode === 'auto') return err(cmd, `Could not fetch resource:\n - Invalid resource usage: 'Cannot add subnetworks to an auto mode network. Convert ${network} to custom mode first.'`);
    if (!/^\d{1,3}(\.\d{1,3}){3}\/\d{1,2}$/.test(range)) return err(cmd, `argument --range: Invalid CIDR range [${range}], e.g. 10.0.1.0/24.`);
    if (state.subnets.some((s) => s.network === network && s.range === range)) {
      return err(cmd, `Could not fetch resource:\n - Invalid IPCidrRange: ${range} conflicts with existing subnetwork in network ${network}.`);
    }
    state.subnets.push({ name, network, region, range });
    save();
    return [
      `Created [${base}/regions/${region}/subnetworks/${name}].`,
      table([{ NAME: name, REGION: region, NETWORK: network, RANGE: range, STACK_TYPE: 'IPV4_ONLY' }], cols, undefined),
    ].join('\n');
  }
  return err('compute.networks.subnets', `Invalid choice: '${action ?? ''}'. Try: create | list`);
}

function firewalls(
  action: string | undefined,
  names: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  base: string,
): string {
  const cols = ['NAME', 'NETWORK', 'DIRECTION', 'PRIORITY', 'ALLOW', 'DENY', 'SOURCE_RANGES', 'TARGET_TAGS'];
  const row = (f: FirewallRule) => ({
    NAME: f.name, NETWORK: f.network, DIRECTION: f.direction, PRIORITY: String(f.priority),
    ALLOW: f.allow, DENY: '', SOURCE_RANGES: f.sourceRanges, TARGET_TAGS: f.targetTags,
  });
  if (action === 'list') {
    const filter = str(flags, 'filter')?.match(/network[=:]\s*(\S+)/)?.[1];
    return table(
      state.firewalls.filter((f) => !filter || f.network === filter).sort((a, b) => a.priority - b.priority || (a.name < b.name ? -1 : 1)).map(row),
      cols,
      format,
    );
  }
  const cmd = `compute.firewall-rules.${action ?? ''}`;
  const name = names[0];
  if (action === 'create') {
    if (!name) return err(cmd, 'argument NAME: Must be specified.');
    const allow = str(flags, 'allow') ?? (str(flags, 'action')?.toLowerCase() === 'allow' ? str(flags, 'rules') : undefined);
    if (!allow) return err(cmd, 'Exactly one of (--action | --allow) must be specified.');
    // Defaults documented for firewall-rules create.
    const network = str(flags, 'network') ?? 'default';
    if (!state.networks.some((n) => n.name === network)) return err(cmd, `Could not fetch resource:\n - The resource '${base}/global/networks/${network}' was not found`);
    if (state.firewalls.some((f) => f.name === name)) return err(cmd, `Could not fetch resource:\n - The resource '${base}/global/firewalls/${name}' already exists`);
    const dir = (str(flags, 'direction') ?? 'INGRESS').toUpperCase();
    const direction = dir === 'EGRESS' || dir === 'OUT' ? 'EGRESS' : 'INGRESS';
    const priority = Number(str(flags, 'priority') ?? '1000');
    if (!Number.isInteger(priority) || priority < 0 || priority > 65535) return err(cmd, 'argument --priority: Value must be between 0 and 65535.');
    const sourceRanges = str(flags, 'source-ranges') ?? (direction === 'INGRESS' && !str(flags, 'source-tags') ? '0.0.0.0/0' : '');
    const rule: FirewallRule = { name, network, direction, priority, allow, sourceRanges, targetTags: str(flags, 'target-tags') ?? '' };
    state.firewalls.push(rule);
    save();
    const warn =
      direction === 'INGRESS' && !str(flags, 'source-ranges') && !str(flags, 'source-tags')
        ? '\nNote: no --source-ranges given, so the rule allows traffic from 0.0.0.0/0 (any IPv4 address).'
        : '';
    return [`Creating firewall...Created [${base}/global/firewalls/${name}].`, 'Creating firewall...done.', table([row(rule)], cols, undefined)].join('\n') + warn;
  }
  if (action === 'describe' || action === 'delete') {
    const rule = state.firewalls.find((f) => f.name === name);
    if (!rule) return err(cmd, `Could not fetch resource:\n - The resource '${base}/global/firewalls/${name ?? ''}' was not found`);
    if (action === 'describe') {
      return [`allowed:`, ...rule.allow.split(',').map((a) => `- IPProtocol: ${a.split(':')[0]}${a.includes(':') ? `\n  ports:\n  - '${a.split(':')[1]}'` : ''}`), `direction: ${rule.direction}`, `name: ${rule.name}`, `network: ${base}/global/networks/${rule.network}`, `priority: ${rule.priority}`, ...(rule.sourceRanges ? ['sourceRanges:', `- ${rule.sourceRanges}`] : [])].join('\n');
    }
    state.firewalls = state.firewalls.filter((f) => f !== rule);
    save();
    return `Deleted [${base}/global/firewalls/${name}].`;
  }
  return err('compute.firewall-rules', `Invalid choice: '${action ?? ''}'. Try: create | list | describe | delete`);
}

// ─────────────────────────────────────────────── storage ──

function splitGs(url: string): { bucket: string; object: string } | null {
  const m = url.match(/^gs:\/\/([^/]+)\/?(.*)$/);
  return m ? { bucket: m[1]!, object: m[2] ?? '' } : null;
}

function storage(
  rest: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  project: string,
  io: GcloudIO,
): string {
  const [sub, ...args] = rest;

  if (sub === 'buckets') {
    const [action, ...urls] = args;
    const cmd = `storage.buckets.${action ?? ''}`;
    if (action === 'list') {
      if (format === 'json' || format?.startsWith('value')) {
        return table(state.buckets.map((b) => ({ NAME: b.name, LOCATION: b.location.toUpperCase(), STORAGE_CLASS: b.storageClass })), ['NAME', 'LOCATION', 'STORAGE_CLASS'], format);
      }
      if (state.buckets.length === 0) return 'Listed 0 items.';
      return state.buckets
        .map((b) => [`---`, `creation_time: 2026-10-06T09:00:00+0000`, `default_storage_class: ${b.storageClass}`, `location: ${b.location.toUpperCase()}`, `name: ${b.name}`, `storage_url: gs://${b.name}/`].join('\n'))
        .join('\n');
    }
    if (action === 'create') {
      if (urls.length === 0) return err(cmd, 'argument URL: Must be specified.');
      const out: string[] = [];
      for (const url of urls) {
        const parsed = splitGs(url);
        if (!parsed || parsed.object) return err(cmd, `Expected a bucket URL like gs://my-unique-bucket, got [${url}].`);
        const name = parsed.bucket;
        if (!/^[a-z0-9][a-z0-9._-]{1,61}[a-z0-9]$/.test(name) || name.startsWith('goog')) {
          return err(cmd, `HTTPError 400: Invalid bucket name: '${name}'. Use 3-63 lowercase letters, digits, dashes, underscores, and dots, starting and ending with a letter or digit.`);
        }
        if (TAKEN_BUCKETS.has(name)) {
          return err(cmd, `HTTPError 409: The requested bucket name is not available. The bucket namespace is shared by all users of the system. Please select a different name and try again.`);
        }
        if (state.buckets.some((b) => b.name === name)) {
          return err(cmd, `HTTPError 409: Your previous request to create the named bucket succeeded and you already own it.`);
        }
        // Documented defaults: location `us`, storage class Standard.
        const location = (str(flags, 'location', 'l') ?? 'us').toLowerCase();
        const cls = (str(flags, 'default-storage-class', 'c', 's') ?? 'standard').toUpperCase();
        if (!['STANDARD', 'NEARLINE', 'COLDLINE', 'ARCHIVE'].includes(cls)) {
          return err(cmd, `HTTPError 400: Invalid argument: storage class '${cls}'. Use standard, nearline, coldline, or archive.`);
        }
        state.buckets.push({ name, location, storageClass: cls, objects: {} });
        out.push(`Creating gs://${name}/...`);
      }
      save();
      return out.join('\n');
    }
    if (action === 'describe') {
      const b = state.buckets.find((x) => x.name === splitGs(urls[0] ?? '')?.bucket);
      if (!b) return err(cmd, `HTTPError 404: gs://${splitGs(urls[0] ?? '')?.bucket ?? ''} bucket does not exist.`);
      return [`default_storage_class: ${b.storageClass}`, `location: ${b.location.toUpperCase()}`, `location_type: ${b.location.includes('-') ? 'region' : 'multi-region'}`, `name: ${b.name}`, `storage_url: gs://${b.name}/`, `uniform_bucket_level_access: true`, `public_access_prevention: inherited`].join('\n');
    }
    if (action === 'delete') {
      const b = state.buckets.find((x) => x.name === splitGs(urls[0] ?? '')?.bucket);
      if (!b) return err(cmd, `HTTPError 404: gs://${splitGs(urls[0] ?? '')?.bucket ?? ''} bucket does not exist.`);
      if (Object.keys(b.objects).length > 0) return err(cmd, `HTTPError 409: The bucket you tried to delete is not empty. Remove its objects first, e.g. gcloud storage rm --recursive gs://${b.name}/**`);
      state.buckets = state.buckets.filter((x) => x !== b);
      save();
      return `Removing gs://${b.name}/...`;
    }
    return err('storage.buckets', `Invalid choice: '${action ?? ''}'. Try: create | list | describe | delete`);
  }

  if (sub === 'ls') {
    const url = args.find((a) => !a.startsWith('-'));
    if (!url) {
      return state.buckets.length ? state.buckets.map((b) => `gs://${b.name}/`).join('\n') : '';
    }
    const p = splitGs(url);
    const b = p && state.buckets.find((x) => x.name === p.bucket);
    if (!p || !b) return err('storage.ls', `One or more URLs matched no objects.`);
    const prefix = p.object.replace(/\*+$/, '');
    const keys = Object.keys(b.objects).filter((k) => k.startsWith(prefix)).sort();
    if (keys.length === 0 && prefix) return err('storage.ls', 'One or more URLs matched no objects.');
    const long = !!flags.l || args.includes('-l') || flags.long;
    return keys
      .map((k) => (long ? `${String(b.objects[k]!.length).padStart(10)}  2026-10-06T09:00:00Z  gs://${b.name}/${k}` : `gs://${b.name}/${k}`))
      .join('\n');
  }

  if (sub === 'cp') {
    const [src, dst] = args.filter((a) => !a.startsWith('-'));
    if (!src || !dst) return err('storage.cp', 'argument SOURCE DESTINATION: Must be specified.');
    const s = splitGs(src);
    const d = splitGs(dst);
    if (!s && d) {
      const content = io.readFile(src);
      if (content === null) return err('storage.cp', `The following URLs matched no objects or files:\n-${src}`);
      const b = state.buckets.find((x) => x.name === d.bucket);
      if (!b) return err('storage.cp', `HTTPError 404: The destination bucket gs://${d.bucket} does not exist or the write to the destination must be restarted`);
      const base = src.split('/').pop()!;
      const key = !d.object || d.object.endsWith('/') ? `${d.object}${base}` : d.object;
      b.objects[key] = content;
      save();
      return `Copying file://${src} to gs://${b.name}/${key}\n  Completed files 1/1 | ${content.length}B`;
    }
    if (s && !d) {
      const b = state.buckets.find((x) => x.name === s.bucket);
      const content = b?.objects[s.object];
      if (!b || content === undefined) return err('storage.cp', `The following URLs matched no objects or files:\n-${src}`);
      const target = dst === '.' || dst.endsWith('/') ? `${dst === '.' ? '' : dst}${s.object.split('/').pop()}` : dst;
      if (!io.writeFile(target, content)) return err('storage.cp', `Could not write to ${dst}: no such directory.`);
      return `Copying gs://${b.name}/${s.object} to file://${target}\n  Completed files 1/1 | ${content.length}B`;
    }
    if (s && d) {
      const from = state.buckets.find((x) => x.name === s.bucket);
      const to = state.buckets.find((x) => x.name === d.bucket);
      const content = from?.objects[s.object];
      if (!from || content === undefined) return err('storage.cp', `The following URLs matched no objects or files:\n-${src}`);
      if (!to) return err('storage.cp', `HTTPError 404: The destination bucket gs://${d.bucket} does not exist`);
      const key = !d.object || d.object.endsWith('/') ? `${d.object}${s.object.split('/').pop()}` : d.object;
      to.objects[key] = content;
      save();
      return `Copying gs://${from.name}/${s.object} to gs://${to.name}/${key}\n  Completed files 1/1 | ${content.length}B`;
    }
    return err('storage.cp', 'At least one of SOURCE or DESTINATION must be a gs:// URL. Use cp for local-to-local copies.');
  }

  if (sub === 'cat') {
    const p = splitGs(args[0] ?? '');
    const content = p && state.buckets.find((x) => x.name === p.bucket)?.objects[p.object];
    if (content === undefined || content === null || !p) return err('storage.cat', `The following URLs matched no objects or files:\n-${args[0] ?? ''}`);
    return content;
  }

  if (sub === 'rm') {
    const url = args.find((a) => a.startsWith('gs://'));
    const p = url ? splitGs(url) : null;
    const b = p && state.buckets.find((x) => x.name === p.bucket);
    if (!p || !b) return err('storage.rm', `The following URLs matched no objects or files:\n-${url ?? ''}`);
    let keys: string[];
    if (p.object.endsWith('**') || (flags.recursive && !p.object)) {
      keys = Object.keys(b.objects).filter((k) => k.startsWith(p.object.replace(/\*+$/, '')));
    } else {
      keys = p.object in b.objects ? [p.object] : [];
    }
    if (keys.length === 0 && !(flags.recursive && !p.object)) return err('storage.rm', `The following URLs matched no objects or files:\n-${url}`);
    for (const k of keys) delete b.objects[k];
    const out = keys.map((k) => `Removing objects:\nRemoving gs://${b.name}/${k}...`);
    if (flags.recursive && !p.object) {
      state.buckets = state.buckets.filter((x) => x !== b);
      out.push(`Removing buckets:\nRemoving gs://${b.name}/...`);
    }
    save();
    return out.join('\n');
  }

  return err('storage', `Invalid choice: '${sub ?? ''}'. Try: buckets create | buckets list | ls | cp | cat | rm (project ${project})`);
}

// ─────────────────────────────────────────────── run ──

function run(
  rest: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  project: string,
): string {
  const [sub, ...args] = rest;
  const region = str(flags, 'region') ?? state.props['run/region'];
  const serviceCols = ['   ', 'SERVICE', 'REGION', 'URL', 'LAST DEPLOYED BY', 'LAST DEPLOYED AT'];
  const serviceRow = (s: RunService) => ({ '   ': '✔', SERVICE: s.name, REGION: s.region, URL: s.url, 'LAST DEPLOYED BY': state.account, 'LAST DEPLOYED AT': '2026-10-06T09:00:00Z' });

  if (sub === 'deploy') {
    const name = args[0];
    if (!name) return err('run.deploy', 'argument SERVICE: Must be specified.');
    if (!/^[a-z]([-a-z0-9]{0,47}[a-z0-9])?$/.test(name)) {
      return err('run.deploy', `Invalid service name [${name}]. Use up to 49 lowercase letters, digits, and hyphens, starting with a letter.`);
    }
    if (!region) {
      return err('run.deploy', 'Missing required argument [--region]: (simulated) the real CLI prompts for a region here. Pass --region=us-central1, or run:\n  $ gcloud config set run/region us-central1');
    }
    const image = str(flags, 'image');
    const source = str(flags, 'source');
    if (!image && !source) {
      return err('run.deploy', 'Specify --image=IMAGE_URL to deploy a container, or --source=. to build from source (simulated).');
    }
    if (image && !/^[a-z0-9.-]+(\/[a-zA-Z0-9._-]+)+(:[\w.-]+|@sha256:[a-f0-9]+)?$/.test(image)) {
      return err('run.deploy', `Invalid image reference [${image}]. Example: us-docker.pkg.dev/cloudrun/container/hello`);
    }
    let svc = state.runServices.find((s) => s.name === name && s.region === region);
    const isNew = !svc;
    if (!svc) {
      svc = {
        name,
        region,
        image: image ?? `${region}-docker.pkg.dev/${project}/cloud-run-source-deploy/${name}`,
        revision: 0,
        url: `https://${name}-${hash(project + name + region).toString(36).slice(0, 10)}-${region === 'us-central1' ? 'uc' : region.slice(0, 2)}.a.run.app`,
        public: false,
      };
      state.runServices.push(svc);
    }
    svc.revision += 1;
    if (image) svc.image = image;
    if (flags['allow-unauthenticated'] === true) svc.public = true;
    if (flags['no-allow-unauthenticated'] === true) svc.public = false;
    if (svc.public) {
      let binding = state.iam.find((b) => b.role === 'roles/run.invoker');
      if (!binding) {
        binding = { role: 'roles/run.invoker', members: [] };
        state.iam.push(binding);
      }
      if (!binding.members.includes('allUsers')) binding.members.push('allUsers');
    }
    save();
    const rev = `${name}-${String(svc.revision).padStart(5, '0')}-${shortId(name + svc.revision)}`;
    return [
      ...(source ? ['Building using Dockerfile and deploying container to Cloud Run service', `(simulated) Uploading sources... Building Container... Done.`] : []),
      `Deploying container to Cloud Run service [${name}] in project [${project}] region [${region}]`,
      `✓ Deploying${isNew ? ' new service' : ''}... Done.`,
      '  ✓ Creating Revision...',
      '  ✓ Routing traffic...',
      ...(flags['allow-unauthenticated'] === true ? ['  ✓ Setting IAM Policy...'] : []),
      'Done.',
      `Service [${name}] revision [${rev}] has been deployed and is serving 100 percent of traffic.`,
      `Service URL: ${svc.url}`,
      ...(svc.public ? [] : ['', 'Note: the service is private. Callers need roles/run.invoker, or redeploy with --allow-unauthenticated for a public endpoint.']),
    ].join('\n');
  }

  if (sub === 'services') {
    const [action, name] = args;
    if (action === 'list') return table(state.runServices.map(serviceRow), serviceCols, format);
    const svc = state.runServices.find((s) => s.name === name && (!region || s.region === region));
    if (action === 'describe') {
      if (!svc) return err('run.services.describe', `Cannot find service [${name ?? ''}]`);
      return [
        `✔ Service ${svc.name} in region ${svc.region}`,
        '',
        `URL:     ${svc.url}`,
        `Ingress: all`,
        'Traffic:',
        `  100% LATEST (currently ${svc.name}-${String(svc.revision).padStart(5, '0')}-${shortId(svc.name + svc.revision)})`,
        '',
        `Image:   ${svc.image}`,
        `Auth:    ${svc.public ? 'Allow unauthenticated (allUsers has roles/run.invoker)' : 'Require authentication'}`,
        'Scaling: Auto (Min: 0)',
      ].join('\n');
    }
    if (action === 'delete') {
      if (!svc) return err('run.services.delete', `Cannot find service [${name ?? ''}]`);
      state.runServices = state.runServices.filter((s) => s !== svc);
      save();
      return `Deleted service [${svc.name}].`;
    }
    return err('run.services', `Invalid choice: '${action ?? ''}'. Try: list | describe | delete`);
  }

  return err('run', `Invalid choice: '${sub ?? ''}'. Try: deploy | services list | services describe | services delete`);
}

// ─────────────────────────────────────────────── container (GKE) ──

function container(
  rest: string[],
  flags: Parsed['flags'],
  state: GcloudState,
  save: () => void,
  format: string | undefined,
  project: string,
  io: GcloudIO,
): string {
  const [sub, action, name] = rest;
  if (sub !== 'clusters') return err('container', `Invalid choice: '${sub ?? ''}'. Try: gcloud container clusters ...`);
  const cmd = `container.clusters.${action ?? ''}`;
  const location =
    str(flags, 'location', 'region', 'zone') ?? state.props['compute/region'] ?? state.props['compute/zone'];
  const cols = ['NAME', 'LOCATION', 'MASTER_VERSION', 'MASTER_IP', 'MACHINE_TYPE', 'NODE_VERSION', 'NUM_NODES', 'STATUS', 'STACK_TYPE'];
  const row = (c: Cluster) => ({
    NAME: c.name,
    LOCATION: c.location,
    MASTER_VERSION: '1.33.4-gke.1172000',
    MASTER_IP: externalIp(c.name),
    MACHINE_TYPE: c.mode === 'Autopilot' ? 'ek-standard-8' : 'e2-medium',
    NODE_VERSION: '1.33.4-gke.1172000',
    NUM_NODES: String(c.nodes),
    STATUS: 'RUNNING',
    STACK_TYPE: 'IPV4',
  });

  if (action === 'list') return table(state.clusters.map(row), cols, format);

  if (action === 'create-auto' || action === 'create') {
    if (!name) return err(cmd, 'argument NAME: Must be specified.');
    if (!location) {
      return err(cmd, 'One of [--location, --region, --zone] must be supplied, or set a default with:\n  $ gcloud config set compute/region us-central1');
    }
    if (state.clusters.some((c) => c.name === name && c.location === location)) {
      return err(cmd, `ResponseError: code=409, message=Already exists: projects/${project}/locations/${location}/clusters/${name}.`);
    }
    const autopilot = action === 'create-auto';
    if (autopilot && isZone(location)) {
      return err(cmd, `ResponseError: code=400, message=Autopilot clusters are regional. Use a region such as ${regionOfZone(location)} instead of the zone ${location}.`);
    }
    const nodesPerZone = Number(str(flags, 'num-nodes') ?? '3');
    const zones = isZone(location) ? 1 : (REGIONS[location]?.length ?? 3);
    const cluster: Cluster = {
      name,
      location,
      mode: autopilot ? 'Autopilot' : 'Standard',
      nodes: autopilot ? 0 : nodesPerZone * zones,
    };
    state.clusters.push(cluster);
    save();
    return [
      `Creating cluster ${name} in ${location}...`,
      autopilot ? '(simulated) Cluster is being health-checked (Autopilot provisions nodes as Pods are scheduled)...done.' : '(simulated) Cluster is being health-checked...done.',
      `Created [https://container.googleapis.com/v1/projects/${project}/${isZone(location) ? 'zones' : 'locations'}/${location}/clusters/${name}].`,
      `To inspect the contents of your cluster, go to: https://console.cloud.google.com/kubernetes/workload_/gcloud/${location}/${name}?project=${project}`,
      `kubeconfig entry generated for ${name}.`,
      table([row(cluster)], cols, undefined),
    ].join('\n');
  }

  const cluster = state.clusters.find((c) => c.name === name && (!location || c.location === location));
  if (action === 'get-credentials') {
    if (!name) return err(cmd, 'argument NAME: Must be specified.');
    if (!cluster) {
      return err(cmd, `ResponseError: code=404, message=Not found: projects/${project}/locations/${location ?? 'LOCATION'}/clusters/${name}.\nCheck the name and pass the cluster's --location (a region for Autopilot clusters).`);
    }
    const ctxName = `gke_${project}_${cluster.location}_${cluster.name}`;
    io.writeFile(
      '/home/learner/.kube/config',
      [
        'apiVersion: v1',
        'kind: Config',
        'clusters:',
        `- name: ${ctxName}`,
        '  cluster:',
        `    server: https://${externalIp(cluster.name)}`,
        'contexts:',
        `- name: ${ctxName}`,
        '  context:',
        `    cluster: ${ctxName}`,
        `    user: ${ctxName}`,
        `current-context: ${ctxName}`,
        'users:',
        `- name: ${ctxName}`,
        '  user:',
        '    exec:',
        '      apiVersion: client.authentication.k8s.io/v1beta1',
        '      command: gke-gcloud-auth-plugin',
        '',
      ].join('\n'),
    );
    return `Fetching cluster endpoint and auth data.\nkubeconfig entry generated for ${cluster.name}.`;
  }
  if (action === 'describe') {
    if (!cluster) return err(cmd, `ResponseError: code=404, message=Not found: cluster ${name ?? ''}.`);
    return [`autopilot:`, `  enabled: ${cluster.mode === 'Autopilot'}`, `currentNodeCount: ${cluster.nodes}`, `location: ${cluster.location}`, `name: ${cluster.name}`, 'status: RUNNING'].join('\n');
  }
  if (action === 'delete') {
    if (!cluster) return err(cmd, `ResponseError: code=404, message=Not found: cluster ${name ?? ''}.`);
    state.clusters = state.clusters.filter((c) => c !== cluster);
    save();
    return `Deleting cluster ${cluster.name}...done.\nDeleted [https://container.googleapis.com/v1/projects/${project}/locations/${cluster.location}/clusters/${cluster.name}].`;
  }
  return err('container.clusters', `Invalid choice: '${action ?? ''}'. Try: create-auto | create | list | describe | get-credentials | delete`);
}
