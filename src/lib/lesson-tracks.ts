/**
 * Display metadata for lesson tracks — shared between the tracks menu,
 * the per-track listing pages, and the lesson detail page, so the
 * labels/descriptions/order live in exactly one place.
 */

import type { LessonTrack } from './types';

export const TRACK_ORDER: LessonTrack[] = [
  'linux',
  'git',
  'cicd',
  'iac',
  'cloud',
  'observability',
  'containers',
];

export const TRACK_LABEL: Record<LessonTrack, string> = {
  linux: 'Linux Fundamentals',
  git: 'Git & Version Control',
  cicd: 'CI/CD & Jenkins',
  iac: 'Infrastructure as Code',
  cloud: 'Cloud',
  observability: 'Observability',
  containers: 'Containers & Kubernetes',
};

export const TRACK_SHORT_LABEL: Record<LessonTrack, string> = {
  linux: 'Linux',
  git: 'Git',
  cicd: 'CI/CD',
  iac: 'IaC',
  cloud: 'Cloud',
  observability: 'Observability',
  containers: 'Containers',
};

export const TRACK_DESCRIPTION: Record<LessonTrack, string> = {
  linux:
    'The shell, the filesystem, processes, and permissions — everything a terminal-first engineer leans on every day.',
  git: 'Version control with git — commits, branches, merges, and the workflows teams build around them.',
  cicd: 'Continuous integration and delivery with Jenkins — pipelines, triggers, and shipping a build out to production.',
  iac: 'Provisioning infrastructure from version-controlled code with Terraform and Ansible, instead of clicking through a console.',
  cloud: 'Core cloud concepts: compute, storage, IAM, and networking, the way every major provider shapes them.',
  observability: 'Logs, metrics, traces, and alerting — how you find out what a system is actually doing.',
  containers: "Docker and Kubernetes, from a single container to a cluster that heals and scales itself.",
};
