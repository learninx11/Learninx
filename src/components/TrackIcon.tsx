import {
  ActivityIcon,
  BoltIcon,
  CloudIcon,
  GitBranchIcon,
  LayersIcon,
  ServerIcon,
  ShieldIcon,
  TargetIcon,
  TerminalIcon,
} from '@/components/ui/Icon';
import type { LessonTrack } from '@/lib/types';

/** The one icon that represents a lesson track everywhere it shows up. */
export function TrackIcon({ track, size = 14 }: { track: LessonTrack; size?: number }) {
  switch (track) {
    case 'linux':
      return <TerminalIcon size={size} />;
    case 'git':
      return <GitBranchIcon size={size} />;
    case 'cicd':
      return <BoltIcon size={size} />;
    case 'iac':
      return <ServerIcon size={size} />;
    case 'cloud':
      return <CloudIcon size={size} />;
    case 'security':
      return <ShieldIcon size={size} />;
    case 'observability':
      return <ActivityIcon size={size} />;
    case 'sre':
      return <TargetIcon size={size} />;
    case 'containers':
      return <LayersIcon size={size} />;
  }
}
