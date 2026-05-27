// pickelton-app/apps/mobile/src/components/icons.tsx
import type { ComponentType, ReactNode } from "react";
import { Circle, Line, Path, Polyline, Rect, Svg } from "react-native-svg";

type AppIconProps = { size?: number; color?: string; strokeWidth?: number };

export type AppIcon = ComponentType<AppIconProps>;

function Frame({ children, color = "#ffffff", size = 18, strokeWidth = 2 }: AppIconProps & { children: ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </Svg>
  );
}

export function Bell(props: AppIconProps) {
  return <Frame {...props}><Path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><Path d="M10 19a2 2 0 0 0 4 0" /></Frame>;
}
export function CalendarDays(props: AppIconProps) {
  return <Frame {...props}><Rect x="3" y="4" width="18" height="17" rx="2" /><Line x1="8" y1="2" x2="8" y2="6" /><Line x1="16" y1="2" x2="16" y2="6" /><Line x1="3" y1="10" x2="21" y2="10" /></Frame>;
}
export function ChevronLeft(props: AppIconProps) {
  return <Frame {...props}><Polyline points="15 18 9 12 15 6" /></Frame>;
}
export function ChevronRight(props: AppIconProps) {
  return <Frame {...props}><Polyline points="9 18 15 12 9 6" /></Frame>;
}
export function CircleHelp(props: AppIconProps) {
  return <Frame {...props}><Circle cx="12" cy="12" r="10" /><Path d="M9.5 9a2.7 2.7 0 0 1 5.1 1.3c0 2-2.6 2.2-2.6 3.8" /><Line x1="12" y1="17" x2="12" y2="17" /></Frame>;
}
export function CircleUserRound(props: AppIconProps) {
  return <Frame {...props}><Circle cx="12" cy="12" r="10" /><Circle cx="12" cy="9" r="3" /><Path d="M7 19c1-3 9-3 10 0" /></Frame>;
}
export function Dumbbell(props: AppIconProps) {
  return <Frame {...props}><Path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12" /></Frame>;
}
export function Eye(props: AppIconProps) {
  return <Frame {...props}><Path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7" /><Circle cx="12" cy="12" r="3" /></Frame>;
}
export function Home(props: AppIconProps) {
  return <Frame {...props}><Path d="M3 11 12 3l9 8" /><Path d="M5 10v10h14V10" /><Path d="M10 20v-6h4v6" /></Frame>;
}
export function LockKeyhole(props: AppIconProps) {
  return <Frame {...props}><Rect x="4" y="10" width="16" height="11" rx="2" /><Path d="M8 10V7a4 4 0 0 1 8 0v3" /><Line x1="12" y1="15" x2="12" y2="17" /></Frame>;
}
export function Mail(props: AppIconProps) {
  return <Frame {...props}><Rect x="3" y="5" width="18" height="14" rx="2" /><Path d="m4 7 8 6 8-6" /></Frame>;
}
export function MapPin(props: AppIconProps) {
  return <Frame {...props}><Path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0" /><Circle cx="12" cy="10" r="2.5" /></Frame>;
}
export function Menu(props: AppIconProps) {
  return <Frame {...props}><Line x1="4" y1="6" x2="20" y2="6" /><Line x1="4" y1="12" x2="20" y2="12" /><Line x1="4" y1="18" x2="20" y2="18" /></Frame>;
}
export function MessageCircle(props: AppIconProps) {
  return <Frame {...props}><Path d="M21 11a8 8 0 0 1-9 8 9 9 0 0 1-4-1l-5 2 2-5a8 8 0 0 1-1-4 8 8 0 0 1 9-8 8 8 0 0 1 8 8" /></Frame>;
}
export function Plus(props: AppIconProps) {
  return <Frame {...props}><Line x1="12" y1="5" x2="12" y2="19" /><Line x1="5" y1="12" x2="19" y2="12" /></Frame>;
}
export function Share2(props: AppIconProps) {
  return <Frame {...props}><Circle cx="18" cy="5" r="3" /><Circle cx="6" cy="12" r="3" /><Circle cx="18" cy="19" r="3" /><Line x1="8.5" y1="10.5" x2="15.5" y2="6.5" /><Line x1="8.5" y1="13.5" x2="15.5" y2="17.5" /></Frame>;
}
export function ShieldCheck(props: AppIconProps) {
  return <Frame {...props}><Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /><Polyline points="9 12 11 14 15 10" /></Frame>;
}
export function Swords(props: AppIconProps) {
  return <Frame {...props}><Path d="m4 4 16 16" /><Path d="M14 4h6v6" /><Path d="M20 4 4 20" /><Path d="M4 14v6h6" /></Frame>;
}
export function Trophy(props: AppIconProps) {
  return <Frame {...props}><Path d="M8 4h8v6a4 4 0 0 1-8 0V4Z" /><Path d="M8 6H4v2a4 4 0 0 0 4 4M16 6h4v2a4 4 0 0 1-4 4M12 14v4M8 21h8M9 18h6" /></Frame>;
}
export function User(props: AppIconProps) {
  return <Frame {...props}><Circle cx="12" cy="8" r="4" /><Path d="M4 21a8 8 0 0 1 16 0" /></Frame>;
}
export function Users(props: AppIconProps) {
  return <Frame {...props}><Circle cx="9" cy="8" r="3" /><Path d="M3 20a6 6 0 0 1 12 0" /><Path d="M16 5a3 3 0 0 1 0 6M18 20a5 5 0 0 0-3-5" /></Frame>;
}
export function Zap(props: AppIconProps) {
  return <Frame {...props}><Path d="M13 2 4 14h7l-1 8 10-13h-7V2Z" /></Frame>;
}
