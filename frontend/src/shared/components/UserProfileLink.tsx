import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { getStoredUserId } from '@/shared/lib/authSession';
import { userCabinetPath } from '@/shared/lib/userCabinetPath';

interface UserProfileLinkProps {
  userId: number;
  children: ReactNode;
  className?: string;
}

export function UserProfileLink({ userId, children, className }: UserProfileLinkProps) {
  const to = userCabinetPath(userId, getStoredUserId());
  return (
    <Link to={to} className={className ?? 'wf-link'}>
      {children}
    </Link>
  );
}
