/**
 * Google Cloud (GCP) lessons for the Cloud track.
 *
 * Facts, defaults, and command syntax follow the official Google Cloud
 * documentation (docs.cloud.google.com). Every lesson's "Try it" and
 * challenge runs against the simulated `gcloud` in
 * `./shell/gcloud.ts`, so learners can practise the real commands
 * without a Google Cloud account.
 */

import type { Lesson, QuizQuestion } from './types';

/**
 * Build the `||`-separated list of accepted answers for a gcloud
 * command whose flags may come in any order and in either
 * `--flag=value` or `--flag value` form. A flag with a `null` value is
 * a boolean switch.
 */
function flagVariants(base: string, flags: [string, string | null][]): string {
  const permutations = <T,>(items: T[]): T[][] =>
    items.length <= 1
      ? [items]
      : items.flatMap((item, i) =>
          permutations([...items.slice(0, i), ...items.slice(i + 1)]).map((rest) => [item, ...rest]),
        );
  const out = new Set<string>();
  for (const order of permutations(flags)) {
    const valued = order.filter(([, v]) => v !== null).length;
    for (let mask = 0; mask < 1 << valued; mask += 1) {
      let bit = 0;
      const parts = order.map(([name, value]) => {
        if (value === null) return name;
        const useEquals = ((mask >> bit) & 1) === 0;
        bit += 1;
        return useEquals ? `${name}=${value}` : `${name} ${value}`;
      });
      out.add([base, ...parts].join(' '));
    }
  }
  return [...out].join(' || ');
}

export const GCP_LESSONS: Lesson[] = [
  {
    id: 'gcp-fundamentals',
    slug: 'gcp-fundamentals',
    title: 'Google Cloud Fundamentals',
    description:
      'Organizations, folders, projects, and resources - plus regions and zones - the shape every Google Cloud deployment shares.',
    difficulty: 'beginner',
    track: 'cloud',
    order: 37,
    trackCommand: 'gcloud config set project learninx-demo',
    challenge:
      'Point the gcloud CLI at the project whose ID is `learninx-demo`, so every following command acts on it.',
    solution: 'gcloud config set project learninx-demo',
    content: `# Google Cloud Fundamentals

The earlier cloud lessons covered ideas every provider shares. This lesson and the seven after it make those ideas concrete on **Google Cloud** (often called GCP), using the official documentation's own terms and the real \`gcloud\` commands.

> The sandbox simulates \`gcloud\`. Nothing you type here touches a real Google Cloud account, but every command works the same way on a real project.

## The resource hierarchy

Everything in Google Cloud sits in a tree with four levels:

\`\`\`
Organization            example.com - the company itself
  └── Folders           optional: departments, teams, environments
        └── Projects    where you actually enable services and get billed
              └── Resources   VMs, buckets, Cloud Run services, clusters...
\`\`\`

- The **organization** is the root. It represents a company and is the parent of every folder and project.
- **Folders** are optional grouping. Teams commonly use them for departments or for \`prod\` versus \`dev\`.
- A **project** is the basic unit you work in. You enable APIs, create resources, and attach billing at the project level. Every resource belongs to exactly one project.
- **Resources** are the services themselves: Compute Engine VMs, Cloud Storage buckets, and so on.

### Policies flow downwards

Access-control (IAM) policies and organization policies set on a node are **inherited by everything below it**. Grant a team a role on their folder, and they have it on every project in that folder automatically. That is why the hierarchy matters for security, not just tidiness.

## Three ways to name a project

| Identifier | Who picks it | Can it change? | Unique? |
| ---------- | ------------ | -------------- | ------- |
| **Project name** | You | Yes, any time | No |
| **Project ID** | You, at creation | Never | Globally, across all of Google Cloud |
| **Project number** | Google, automatically | Never | Yes |

The **project ID** is what you type in commands and API calls: 6 to 30 lowercase letters, digits, or hyphens, starting with a letter. Pick it with care, because it is permanent.

## Regions and zones

A **region** is a geographic location such as \`us-central1\` (Iowa) or \`europe-west1\` (Belgium). Each region is divided into **zones**, such as \`us-central1-a\`. Most regions have three or more zones, and zones are isolated from one another so a failure in one rarely affects the others.

Resources have a scope that follows from this:

- **Zonal** - a Compute Engine VM and its disks live in one zone.
- **Regional** - a Cloud Run service or a regional GKE cluster spans the zones of one region.
- **Global** - a VPC network or a global load balancer is not tied to any region.

Spreading a workload across zones protects against a zone outage. Spreading it across regions protects against a regional one.

## Try it

\`\`\`bash
gcloud projects list
gcloud config set project learninx-demo
gcloud compute regions list
gcloud compute zones list
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.

## Further reading

- [Resource hierarchy](https://docs.cloud.google.com/resource-manager/docs/cloud-platform-resource-hierarchy) - official overview of organizations, folders, projects, and policy inheritance.
- [Geography and regions](https://docs.cloud.google.com/docs/geography-and-regions) - how regions and zones are laid out and how to design for them.
- **"Google Cloud Platform in Action"** by JJ Geewax (Manning) - a book-length tour of the core services, written by a Google engineer.
`,
  },
  {
    id: 'gcp-gcloud-cli',
    slug: 'gcp-gcloud-cli',
    title: 'The gcloud CLI',
    description:
      'Install-once, use-everywhere: gcloud init, properties, configurations, output formats, and release levels.',
    difficulty: 'beginner',
    track: 'cloud',
    order: 38,
    trackCommand: 'gcloud config set compute/zone us-central1-a',
    challenge:
      'Set the default Compute Engine zone to `us-central1-a`, so zonal commands stop asking for `--zone`.',
    solution: 'gcloud config set compute/zone us-central1-a',
    content: `# The gcloud CLI

The **Google Cloud CLI** is the command-line tool for creating and managing Google Cloud resources. Anything you can click in the console you can script with \`gcloud\`, which is what makes it the backbone of automation, CI pipelines, and runbooks.

## How commands are shaped

Commands are a tree of **groups** that mirror Google Cloud products, ending in a verb:

\`\`\`
gcloud  compute  instances  create  web-1  --zone=us-central1-a
        └ group  └ group    └ verb  └ arg  └ flag
\`\`\`

Once you know the pattern, you can guess most commands: \`gcloud storage buckets list\`, \`gcloud run services describe\`, \`gcloud container clusters delete\`. Add \`--help\` to anything to see its manual.

## First-time setup

\`\`\`bash
gcloud init
\`\`\`

\`gcloud init\` signs you in through a browser, picks a project, and optionally sets a default region and zone. To check who you are signed in as:

\`\`\`bash
gcloud auth list
\`\`\`

## Properties

gcloud remembers settings as **properties**, grouped into sections. The ones you will set most often:

| Property | What it does |
| -------- | ------------ |
| \`core/project\` | The project every command acts on |
| \`compute/region\` | Default region for regional resources |
| \`compute/zone\` | Default zone for zonal resources such as VMs |

\`\`\`bash
gcloud config set project learninx-demo
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
gcloud config list
gcloud config get project
\`\`\`

Any property can be overridden for one command with a flag, for example \`--project=other-project\` or \`--zone=europe-west1-b\`. Scripts usually pass flags explicitly so they never depend on whoever ran \`gcloud config set\` last.

## Configurations

A **configuration** is a named set of properties, like a profile. The \`default\` configuration is enough for most people. If you juggle several projects or accounts, \`gcloud config configurations create staging\` gives you a second profile, and \`gcloud config configurations activate staging\` switches to it.

## Output formats

Human-readable tables are the default. For scripts, ask for something machine-readable with \`--format\`:

\`\`\`bash
gcloud compute instances list --format=json
gcloud compute instances list --format="value(name,status)"
\`\`\`

\`value(...)\` prints bare values with no header. That is ideal for piping into \`while read\` loops or \`xargs\`.

## Release levels

Commands ship at different maturity levels. **GA** (general availability) commands are production-ready. **Beta** commands are functionally complete but may still change. **Alpha** commands are early and can change without notice. You reach them with \`gcloud beta ...\` and \`gcloud alpha ...\`.

## Try it

\`\`\`bash
gcloud --version
gcloud auth list
gcloud config set compute/zone us-central1-a
gcloud config list
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.

## Further reading

- [gcloud CLI overview](https://docs.cloud.google.com/sdk/gcloud) - command structure, configurations, properties, and output formatting.
- [gcloud CLI reference](https://docs.cloud.google.com/sdk/gcloud/reference) - every command and flag, generated from the tool itself.
`,
  },
  {
    id: 'gcp-iam',
    slug: 'gcp-iam',
    title: 'Google Cloud IAM & Service Accounts',
    description:
      'Principals, roles, and policy bindings - and why workloads should run as narrowly scoped service accounts, not with keys.',
    difficulty: 'intermediate',
    track: 'cloud',
    order: 39,
    trackCommand: 'gcloud iam service-accounts create app-runner',
    challenge:
      'Create a service account with the ID `app-runner` for an application to run as.',
    solution: flagVariants('gcloud iam service-accounts create app-runner', []),
    content: `# Google Cloud IAM & Service Accounts

Every request to Google Cloud is checked by **IAM** (Identity and Access Management): *who* is asking, and does a policy grant them a role that includes the permission they need?

## Principals

A **principal** is whoever receives access. In commands and policies, the type is written as a prefix:

| Prefix | Meaning |
| ------ | ------- |
| \`user:alice@example.com\` | A single Google account |
| \`group:sre@example.com\` | A Google group, the easiest way to manage teams |
| \`serviceAccount:app@PROJECT_ID.iam.gserviceaccount.com\` | A workload's identity |
| \`domain:example.com\` | Everyone in a Google Workspace or Cloud Identity domain |

## Roles

You never grant individual permissions directly. You grant **roles**, which are bundles of permissions. There are three kinds:

- **Basic roles** - Owner, Editor, and Viewer. They span every service and are far too broad. Google's guidance is blunt: in production, do not grant basic roles unless there is no alternative.
- **Predefined roles** - maintained by Google for one service and one job, for example \`roles/storage.objectViewer\` (read objects in Cloud Storage) or \`roles/run.invoker\` (call a Cloud Run service).
- **Custom roles** - your own bundle of permissions, for when no predefined role is narrow enough.

Predefined role names look like \`roles/SERVICE.IDENTIFIER\`.

## Policies and bindings

An **allow policy** is attached to a resource (an organization, folder, project, or individual resource) and contains **bindings**. Each binding is a role plus a list of principals. Remember from the fundamentals lesson that policies are inherited down the hierarchy.

\`\`\`bash
gcloud projects add-iam-policy-binding learninx-demo \\
  --member='user:alice@example.com' \\
  --role='roles/storage.objectViewer'

gcloud projects get-iam-policy learninx-demo
\`\`\`

## Service accounts

A **service account** is an identity for software rather than a person: a VM, a Cloud Run service, a CI job. Its email follows the pattern \`NAME@PROJECT_ID.iam.gserviceaccount.com\`.

\`\`\`bash
gcloud iam service-accounts create app-runner --display-name="App runner"
gcloud projects add-iam-policy-binding learninx-demo \\
  --member='serviceAccount:app-runner@learninx-demo.iam.gserviceaccount.com' \\
  --role='roles/storage.objectViewer'
\`\`\`

Give each workload its **own** service account with only the roles it needs. That way a compromised app cannot reach anything beyond its own job.

### Avoid service account keys

You *can* download a JSON key for a service account, but Google warns that keys are a security risk if not managed carefully. A leaked key keeps working until someone revokes it. Prefer the safer options:

- **Attach** the service account to the resource (a VM, a Cloud Run service). The workload then receives short-lived credentials automatically, and there is nothing to leak.
- Use **Workload Identity Federation** for workloads outside Google Cloud, such as GitHub Actions or another cloud.

### Watch the default service accounts

Compute Engine and App Engine create **default service accounts** that are granted the broad Editor role on the project by default. Google recommends turning off that automatic grant and using dedicated, narrowly scoped service accounts instead.

## Try it

\`\`\`bash
gcloud iam service-accounts create app-runner
gcloud iam service-accounts list
gcloud iam roles describe roles/storage.objectViewer
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.

## Further reading

- [Roles and permissions](https://docs.cloud.google.com/iam/docs/roles-overview) - basic, predefined, and custom roles, and when to use each.
- [Service accounts overview](https://docs.cloud.google.com/iam/docs/service-account-overview) - attaching service accounts, avoiding keys, and default service accounts.
- [gcloud projects add-iam-policy-binding](https://docs.cloud.google.com/sdk/gcloud/reference/projects/add-iam-policy-binding) - the command reference.
`,
  },
  {
    id: 'gcp-compute-engine',
    slug: 'gcp-compute-engine',
    title: 'Compute Engine VMs',
    description:
      'Create, inspect, stop, and SSH into virtual machines - machine types, public images, and what a stopped VM still costs.',
    difficulty: 'intermediate',
    track: 'cloud',
    order: 40,
    trackCommand: 'gcloud compute instances create web-1 --zone=us-central1-a --machine-type=e2-medium',
    challenge:
      'Create a VM named `web-1` in zone `us-central1-a` with the `e2-medium` machine type.',
    solution: flagVariants('gcloud compute instances create web-1', [
      ['--zone', 'us-central1-a'],
      ['--machine-type', 'e2-medium'],
    ]),
    content: `# Compute Engine VMs

**Compute Engine** is Google Cloud's infrastructure-as-a-service: virtual machines (called **instances**) running on Google's hardware. Underneath, each one is just a Linux or Windows machine. Everything from the Linux track applies once you are logged in.

## Machine types

A **machine type** fixes the vCPU and memory of a VM. Names follow a family-and-size pattern:

| Machine type | vCPUs | Memory | Typical use |
| ------------ | ----- | ------ | ----------- |
| \`e2-micro\` | 2 (shared) | 1 GB | Tiny services, experiments |
| \`e2-medium\` | 2 (shared) | 4 GB | Small web servers |
| \`e2-standard-4\` | 4 | 16 GB | General-purpose workloads |
| \`n2-standard-4\` | 4 | 16 GB | Steadier, higher performance |

The E2 family is the cost-optimised general-purpose choice. Start small and resize when monitoring shows you need more. Guessing high "to be safe" just costs money.

## Images

A VM boots from an **image**. Public images live in their own projects, so you name both the **image family** and the **image project**. Using a family always gives you the latest, non-deprecated image in it:

\`\`\`bash
gcloud compute instances create web-1 \\
  --zone=us-central1-a \\
  --machine-type=e2-medium \\
  --image-family=debian-12 \\
  --image-project=debian-cloud
\`\`\`

VMs are **zonal**: \`web-1\` and its boot disk live in \`us-central1-a\`. If you set a default zone with \`gcloud config set compute/zone\`, you can leave \`--zone\` off.

## Everyday operations

\`\`\`bash
gcloud compute instances list
gcloud compute instances describe web-1 --zone=us-central1-a
gcloud compute instances stop web-1 --zone=us-central1-a
gcloud compute instances start web-1 --zone=us-central1-a
gcloud compute instances delete web-1 --zone=us-central1-a
\`\`\`

A **stopped** VM no longer bills for vCPUs and memory, but its persistent disks and any reserved static IP addresses are still charged. Delete what you no longer need.

## SSH

\`\`\`bash
gcloud compute ssh web-1 --zone=us-central1-a
\`\`\`

\`gcloud compute ssh\` generates an SSH key pair if you do not have one, publishes the public key to the VM, and connects. You never copy keys around by hand. Connecting also needs a firewall rule that allows TCP port 22, which the networking lesson covers.

## Treat VMs as cattle

For anything that has to scale or self-heal, put identical VMs in a **managed instance group** built from an **instance template**. The group recreates unhealthy VMs and adds or removes VMs with load. Keep state that must survive (databases, uploads) off the VM's boot disk.

## Try it

\`\`\`bash
gcloud compute machine-types list
gcloud compute instances create web-1 --zone=us-central1-a --machine-type=e2-medium
gcloud compute instances list
gcloud compute ssh web-1 --zone=us-central1-a
\`\`\`

When you're ready, hit **Mark complete** and move to the next lesson.

## Further reading

- [Create and start a VM](https://docs.cloud.google.com/compute/docs/instances/create-start-instance) - the full set of creation options.
- [Create a VM from a public image](https://docs.cloud.google.com/compute/docs/instances/create-vm-from-public-image) - image families and image projects.
- [Machine families resource guide](https://docs.cloud.google.com/compute/docs/machine-resource) - choosing between E2, N2, C3, and the rest.
`,
  },
  {
    id: 'gcp-cloud-storage',
    slug: 'gcp-cloud-storage',
    title: 'Cloud Storage Buckets',
    description:
      'Globally named buckets, storage classes, and locations - and the gcloud storage commands to move files in and out.',
    difficulty: 'intermediate',
    track: 'cloud',
    order: 41,
    trackCommand: 'gcloud storage buckets create gs://learninx-demo-assets --location=us-central1',
    challenge:
      'Create a bucket called `gs://learninx-demo-assets` in the `us-central1` region.',
    solution: flagVariants('gcloud storage buckets create gs://learninx-demo-assets', [['--location', 'us-central1']]),
    content: `# Cloud Storage Buckets

**Cloud Storage** is Google Cloud's object storage. Files (**objects**) live in **buckets** and are addressed with \`gs://\` URLs:

\`\`\`
gs://learninx-demo-assets/images/logo.png
     └ bucket              └ object name
\`\`\`

There are no real directories. \`images/\` is just part of the object's name, which tools display as a folder.

## Bucket names are global

Bucket names share **one namespace across all of Google Cloud**. If anyone, anywhere, already owns \`gs://backup\`, you cannot have it. Prefix names with something unique to you, such as your project ID. Names use lowercase letters, digits, dashes, underscores, and dots.

## Locations

A bucket's location is fixed at creation:

- **Region** - one region, such as \`us-central1\`. Lowest latency to compute in the same region.
- **Dual-region** - two specific regions, for higher availability.
- **Multi-region** - a large area such as \`US\` or \`EU\`, for content served widely.

If you leave out \`--location\`, \`gcloud storage buckets create\` uses the \`US\` multi-region.

## Storage classes

All classes have the same eleven-nines (99.999999999%) annual durability and millisecond access. They differ in price, in how long you must keep data, and in retrieval fees:

| Class | Minimum storage duration | Designed for |
| ----- | ------------------------ | ------------ |
| **Standard** | None | Frequently accessed ("hot") data |
| **Nearline** | 30 days | Read about once a month or less |
| **Coldline** | 90 days | Read at most once a quarter |
| **Archive** | 365 days | Read less than once a year: backups, compliance |

Nearline, Coldline, and Archive charge a **retrieval fee** and bill the full minimum duration even if you delete early. Standard is the default class. **Lifecycle rules** can move objects to colder classes as they age, or delete them automatically.

## Working with objects

\`gcloud storage\` is the current tool for Cloud Storage (the older \`gsutil\` is legacy):

\`\`\`bash
gcloud storage buckets create gs://learninx-demo-assets --location=us-central1
gcloud storage cp report.csv gs://learninx-demo-assets/
gcloud storage ls gs://learninx-demo-assets
gcloud storage cp gs://learninx-demo-assets/report.csv ./restored.csv
gcloud storage rm gs://learninx-demo-assets/report.csv
\`\`\`

## Access control

Use **uniform bucket-level access**, so IAM roles on the bucket are the only access mechanism and per-object ACLs cannot quietly grant extra access. Grant the narrowest role that works, for example \`roles/storage.objectViewer\` for read-only. Keep **public access prevention** on unless a bucket must serve the public internet.

## Try it

\`\`\`bash
gcloud storage buckets create gs://backup
gcloud storage buckets create gs://learninx-demo-assets --location=us-central1
echo "hello, bucket" > hello.txt
gcloud storage cp hello.txt gs://learninx-demo-assets/
gcloud storage ls gs://learninx-demo-assets
gcloud storage cat gs://learninx-demo-assets/hello.txt
\`\`\`

The first command fails on purpose: someone else already owns that name.

When you're ready, hit **Mark complete** and move to the next lesson.

## Further reading

- [Storage classes](https://docs.cloud.google.com/storage/docs/storage-classes) - durations, availability, and retrieval fees for each class.
- [gcloud storage buckets create](https://docs.cloud.google.com/sdk/gcloud/reference/storage/buckets/create) - every bucket option, including defaults.
- [Bucket locations](https://docs.cloud.google.com/storage/docs/locations) - region, dual-region, and multi-region trade-offs.
`,
  },
  {
    id: 'gcp-vpc-networking',
    slug: 'gcp-vpc-networking',
    title: 'VPC Networks & Firewall Rules',
    description:
      'Global VPCs, regional subnets, auto versus custom mode, and the firewall rules that decide what reaches your VMs.',
    difficulty: 'advanced',
    track: 'cloud',
    order: 42,
    trackCommand:
      'gcloud compute firewall-rules create allow-ssh-iap --network=default --allow=tcp:22 --source-ranges=35.235.240.0/20',
    challenge:
      'On the `default` network, create a firewall rule named `allow-ssh-iap` that allows TCP port 22 only from the Identity-Aware Proxy range `35.235.240.0/20`.',
    solution: [
      flagVariants('gcloud compute firewall-rules create allow-ssh-iap', [
        ['--network', 'default'],
        ['--allow', 'tcp:22'],
        ['--source-ranges', '35.235.240.0/20'],
      ]),
      // --network defaults to `default`, so leaving it out is also right.
      flagVariants('gcloud compute firewall-rules create allow-ssh-iap', [
        ['--allow', 'tcp:22'],
        ['--source-ranges', '35.235.240.0/20'],
      ]),
    ].join(' || '),
    content: `# VPC Networks & Firewall Rules

A **VPC network** is the private, software-defined network your VMs, GKE nodes, and other resources live in. Google Cloud's design has one twist compared with the generic picture from the earlier networking lesson.

## Global networks, regional subnets

- A **VPC network is global**. It is not tied to any region.
- Each **subnet is regional**, with its own IP range in one region.

So a VM in \`us-central1\` and a VM in \`europe-west1\` can sit on the same VPC and talk over internal IP addresses, with no VPN or peering needed.

## Auto mode versus custom mode

| | Auto mode | Custom mode |
| - | --------- | ----------- |
| Subnets | One per region, created for you | None until you create them |
| IP ranges | Fixed, from \`10.128.0.0/9\` | Whatever you choose |
| Good for | Quick experiments | Production |

You can convert an auto mode network to custom mode, but never back. Production networks are almost always custom mode, so that IP ranges don't collide with on-premises networks or peered VPCs.

\`\`\`bash
gcloud compute networks create prod-vpc --subnet-mode=custom
gcloud compute networks subnets create prod-us \\
  --network=prod-vpc --region=us-central1 --range=10.10.0.0/24
\`\`\`

### The default network

New projects come with an auto mode network called \`default\`, unless an organization policy disables it. It ships with four pre-populated firewall rules: \`default-allow-internal\`, \`default-allow-ssh\`, \`default-allow-rdp\`, and \`default-allow-icmp\`. The SSH and RDP rules accept traffic from anywhere (\`0.0.0.0/0\`). That is convenient for learning but too open for production.

## Firewall rules

Every VPC has two **implied rules** at the lowest priority:

- **Deny all ingress** - nothing gets in unless a rule allows it.
- **Allow all egress** - VMs can reach out unless a rule blocks it.

You add rules on top. Each rule has a direction, a priority (0 to 65535, **lower wins**), an action, protocols and ports, sources (for ingress), and targets.

\`\`\`bash
gcloud compute firewall-rules create allow-ssh \\
  --network=prod-vpc \\
  --allow=tcp:22 \\
  --source-ranges=35.235.240.0/20 \\
  --target-tags=ssh
\`\`\`

Watch the defaults when you leave flags out. The network defaults to \`default\`, the direction to ingress, and the priority to \`1000\`. If you give **no source** for an ingress rule, it applies to \`0.0.0.0/0\`: the whole internet. Always set \`--source-ranges\` deliberately. The range above is the one Identity-Aware Proxy uses for TCP forwarding. Restricting SSH to it means you connect through IAP instead of exposing port 22 to everyone.

**Target tags** (\`--target-tags=ssh\`) or target service accounts limit a rule to specific VMs, instead of every VM on the network.

## Try it

\`\`\`bash
gcloud compute networks create prod-vpc --subnet-mode=custom
gcloud compute networks subnets create prod-us --network=prod-vpc --region=us-central1 --range=10.10.0.0/24
gcloud compute firewall-rules create allow-ssh --network=prod-vpc --allow=tcp:22
gcloud compute firewall-rules list
\`\`\`

Notice the note the third command prints about \`0.0.0.0/0\`.

When you're ready, hit **Mark complete** and move to the next lesson.

## Further reading

- [VPC networks](https://docs.cloud.google.com/vpc/docs/vpc) - global networks, regional subnets, auto and custom mode, and the default network.
- [Use VPC firewall rules](https://docs.cloud.google.com/firewall/docs/using-firewalls) - creating rules and the defaults that apply when flags are omitted.
`,
  },
  {
    id: 'gcp-cloud-run',
    slug: 'gcp-cloud-run',
    title: 'Serverless Containers with Cloud Run',
    description:
      'Deploy a container image to a fully managed, autoscaling HTTPS endpoint - services, revisions, scale to zero, and public access.',
    difficulty: 'advanced',
    track: 'cloud',
    order: 43,
    trackCommand:
      'gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=us-central1 --allow-unauthenticated',
    challenge:
      "Deploy Google's sample image `us-docker.pkg.dev/cloudrun/container/hello` as a public Cloud Run service named `hello` in `us-central1`.",
    solution: flagVariants('gcloud run deploy hello', [
      ['--image', 'us-docker.pkg.dev/cloudrun/container/hello'],
      ['--region', 'us-central1'],
      ['--allow-unauthenticated', null],
    ]),
    content: `# Serverless Containers with Cloud Run

**Cloud Run** runs your container image and handles everything else: servers, scaling, HTTPS, and load balancing. You hand it an image, and it hands you a URL.

## Services and revisions

- A **service** is the long-lived thing you deploy to. It has a stable URL. Service names can be up to 49 characters and must be unique per region and project.
- Every deployment creates a new **revision**: an immutable snapshot of the image and its settings. When you deploy from an image tag, Cloud Run resolves the tag to a digest, so the revision always serves exactly that build.

By default, traffic moves to the newest revision as soon as it is healthy. Because old revisions still exist, rolling back means sending traffic back to one. You can also split traffic between revisions for canary releases.

## Deploying

\`\`\`bash
gcloud services enable run.googleapis.com

gcloud run deploy hello \\
  --image=us-docker.pkg.dev/cloudrun/container/hello \\
  --region=us-central1 \\
  --allow-unauthenticated
\`\`\`

Leave out \`--image\` and pass \`--source=.\` instead, and Cloud Run builds the container from your source code for you.

## Who can call it

Cloud Run services are **private by default**. Callers need the **Cloud Run Invoker** role (\`roles/run.invoker\`). \`--allow-unauthenticated\` grants that role to the special principal \`allUsers\`, which makes the service a public website or API. Use it for public endpoints only. Service-to-service calls should stay private and use service account identity.

## Scaling, including to zero

Cloud Run adds container instances as requests arrive and removes them as traffic drops, **all the way to zero** when nothing is calling. With the default request-based billing, an idle service costs nothing for compute. The trade-off is a **cold start**: the first request after a quiet period waits for an instance to boot. Setting a minimum number of instances keeps some warm, for a cost.

## A container contract to remember

- Listen for HTTP on the port in the \`PORT\` environment variable (8080 by default).
- Be **stateless**. Instances come and go, so keep state in Cloud Storage, a database, or a cache, never on local disk.
- Run as a dedicated service account with only the roles the code needs, as the IAM lesson describes.

## Try it

\`\`\`bash
gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=us-central1 --allow-unauthenticated
gcloud run services list
gcloud run services describe hello --region=us-central1
gcloud run deploy hello --image=us-docker.pkg.dev/cloudrun/container/hello --region=us-central1
\`\`\`

The second deploy creates revision \`00002\` and moves all traffic to it.

When you're ready, hit **Mark complete** and move to the next lesson.

## Further reading

- [Deploying container images to Cloud Run](https://docs.cloud.google.com/run/docs/deploying) - services, revisions, and every deploy option.
- [Cloud Run container runtime contract](https://docs.cloud.google.com/run/docs/container-contract) - the rules your container must follow.
`,
  },
  {
    id: 'gcp-gke',
    slug: 'gcp-gke',
    title: 'Google Kubernetes Engine (GKE)',
    description:
      'Autopilot versus Standard clusters, how each is billed, and connecting kubectl with get-credentials.',
    difficulty: 'expert',
    track: 'cloud',
    order: 44,
    trackCommand: 'gcloud container clusters create-auto demo-cluster --location=us-central1',
    challenge:
      'Create an Autopilot cluster named `demo-cluster` in the `us-central1` region.',
    solution: [
      flagVariants('gcloud container clusters create-auto demo-cluster', [['--location', 'us-central1']]),
      flagVariants('gcloud container clusters create-auto demo-cluster', [['--region', 'us-central1']]),
    ].join(' || '),
    content: `# Google Kubernetes Engine (GKE)

**GKE** is Google Cloud's managed Kubernetes. Google runs the control plane (API server, scheduler, etcd) for you. How much of the rest you manage depends on the cluster's **mode**. If Kubernetes itself is new to you, the Containers & Kubernetes track covers Pods, Deployments, and Services first.

## Autopilot versus Standard

| | **Autopilot** | **Standard** |
| - | ------------- | ------------ |
| Nodes | Google provisions, scales, patches, and secures them | You create and manage node pools |
| Billing | For your Pods' CPU and memory **requests** | For the whole VMs, used or not |
| Location | Regional (spread across zones) | Zonal or regional |
| Best for | Most workloads | Special hardware or node-level tuning |

Google's documentation calls Autopilot **the recommended way to use GKE**. You describe workloads, and Google makes sure there is capacity for them. Because you pay for what Pods request rather than for idle nodes, right-sizing your requests directly lowers the bill.

## Creating a cluster

\`\`\`bash
gcloud services enable container.googleapis.com

gcloud container clusters create-auto demo-cluster --location=us-central1
\`\`\`

\`--location\` takes a region for a regional cluster (Autopilot always is) or a zone for a zonal Standard cluster. A Standard cluster is created with \`gcloud container clusters create\` instead, and you choose node counts and machine types yourself.

## Connecting kubectl

\`\`\`bash
gcloud container clusters get-credentials demo-cluster --location=us-central1
kubectl get nodes
\`\`\`

\`get-credentials\` writes an entry into your **kubeconfig** (\`~/.kube/config\`) and switches kubectl's current context to the new cluster. kubectl authenticates through the **gke-gcloud-auth-plugin**, which you install with \`gcloud components install gke-gcloud-auth-plugin\` if it is missing.

## Running workloads securely

- Give Pods Google Cloud access through **Workload Identity Federation for GKE**. It maps a Kubernetes service account to IAM, so you never mount service account keys into Pods. Autopilot clusters have it enabled by default.
- Always set CPU and memory **requests**. In Autopilot they decide both scheduling and price.
- Prefer regional clusters for production, so a single zone outage doesn't take the control plane or all your nodes with it.

## Try it

\`\`\`bash
gcloud container clusters create-auto demo-cluster --location=us-central1-a
gcloud container clusters create-auto demo-cluster --location=us-central1
gcloud container clusters list
gcloud container clusters get-credentials demo-cluster --location=us-central1
cat ~/.kube/config
\`\`\`

The first command fails on purpose: Autopilot clusters are regional, so a zone is rejected.

When you're ready, hit **Mark complete**. That completes the Google Cloud lessons.

## Further reading

- [Autopilot overview](https://docs.cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview) - how Autopilot differs from Standard, including billing.
- [gcloud container clusters create-auto](https://docs.cloud.google.com/sdk/gcloud/reference/container/clusters/create-auto) - the command reference and location flags.
- [Install kubectl and configure cluster access](https://docs.cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl) - get-credentials and the auth plugin.
`,
  },
];

export const GCP_QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'q-gcp-f-1', lessonId: 'gcp-fundamentals', order: 0, prompt: 'What is the root node of the Google Cloud resource hierarchy?', answer: 'organization' },
  { id: 'q-gcp-f-2', lessonId: 'gcp-fundamentals', order: 1, prompt: 'Which project identifier can you change after creation: the ID, the number, or the name?', answer: 'name' },
  { id: 'q-gcp-f-3', lessonId: 'gcp-fundamentals', order: 2, prompt: 'Which project identifier does Google assign automatically: the ID or the number?', answer: 'number' },

  { id: 'q-gcp-cli-1', lessonId: 'gcp-gcloud-cli', order: 0, prompt: 'Which gcloud command walks you through signing in and picking a project the first time? (two words)', answer: 'gcloud init' },
  { id: 'q-gcp-cli-2', lessonId: 'gcp-gcloud-cli', order: 1, prompt: 'Which gcloud property sets the default zone? (section/property)', answer: 'compute/zone' },
  { id: 'q-gcp-cli-3', lessonId: 'gcp-gcloud-cli', order: 2, prompt: 'What is a named set of gcloud properties, like a profile, called?', answer: 'configuration' },

  { id: 'q-gcp-iam-1', lessonId: 'gcp-iam', order: 0, prompt: 'Which member prefix marks a service account in an IAM binding? (include the colon)', answer: 'serviceaccount:' },
  { id: 'q-gcp-iam-2', lessonId: 'gcp-iam', order: 1, prompt: 'A role granted on a folder is inherited by the projects inside it. True or false?', answer: 'true' },
  { id: 'q-gcp-iam-3', lessonId: 'gcp-iam', order: 2, prompt: 'Which kind of role (basic, predefined, or custom) does Google say not to grant in production unless there is no alternative?', answer: 'basic' },

  { id: 'q-gcp-ce-1', lessonId: 'gcp-compute-engine', order: 0, prompt: 'In the zone name us-central1-a, what is the region?', answer: 'us-central1' },
  { id: 'q-gcp-ce-2', lessonId: 'gcp-compute-engine', order: 1, prompt: 'Which flag names the project that hosts a public image, such as debian-cloud?', answer: '--image-project' },
  { id: 'q-gcp-ce-3', lessonId: 'gcp-compute-engine', order: 2, prompt: 'Which gcloud command opens an SSH session to a VM? (three words)', answer: 'gcloud compute ssh' },

  { id: 'q-gcp-gcs-1', lessonId: 'gcp-cloud-storage', order: 0, prompt: 'What is the minimum storage duration of the Coldline class, in days?', answer: '90' },
  { id: 'q-gcp-gcs-2', lessonId: 'gcp-cloud-storage', order: 1, prompt: 'Which storage class is designed for data read less than once a year?', answer: 'archive' },
  { id: 'q-gcp-gcs-3', lessonId: 'gcp-cloud-storage', order: 2, prompt: 'Bucket names must be unique within what: the project, or globally?', answer: 'globally' },

  { id: 'q-gcp-vpc-1', lessonId: 'gcp-vpc-networking', order: 0, prompt: 'Is a Google Cloud VPC network a global or a regional resource?', answer: 'global' },
  { id: 'q-gcp-vpc-2', lessonId: 'gcp-vpc-networking', order: 1, prompt: 'Which subnet mode should production networks use: auto or custom?', answer: 'custom' },
  { id: 'q-gcp-vpc-3', lessonId: 'gcp-vpc-networking', order: 2, prompt: 'If an ingress firewall rule has no source set, which range does it apply to?', answer: '0.0.0.0/0' },

  { id: 'q-gcp-run-1', lessonId: 'gcp-cloud-run', order: 0, prompt: 'What is the immutable snapshot of a Cloud Run service created by every deployment called?', answer: 'revision' },
  { id: 'q-gcp-run-2', lessonId: 'gcp-cloud-run', order: 1, prompt: 'Which special principal does --allow-unauthenticated grant the invoker role to?', answer: 'allusers' },
  { id: 'q-gcp-run-3', lessonId: 'gcp-cloud-run', order: 2, prompt: 'How many instances does Cloud Run run for a service with no traffic, by default?', answer: '0' },

  { id: 'q-gcp-gke-1', lessonId: 'gcp-gke', order: 0, prompt: 'Which GKE mode does Google recommend, where Google manages the nodes?', answer: 'autopilot' },
  { id: 'q-gcp-gke-2', lessonId: 'gcp-gke', order: 1, prompt: "Which subcommand of 'gcloud container clusters' creates an Autopilot cluster?", answer: 'create-auto' },
  { id: 'q-gcp-gke-3', lessonId: 'gcp-gke', order: 2, prompt: "Which subcommand of 'gcloud container clusters' writes cluster access into your kubeconfig?", answer: 'get-credentials' },
];
