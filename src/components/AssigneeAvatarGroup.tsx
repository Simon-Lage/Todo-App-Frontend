import React, { useMemo } from 'react';
import type { UserListView, UserPreview } from '../types/api';
import UserAvatar from './UserAvatar';

type AssigneeAvatarGroupProps = {
  users?: UserPreview[];
  userIds?: string[];
  userMap?: Map<string, UserListView>;
  maxVisible?: number;
  size?: number;
};

const AssigneeAvatarGroup: React.FC<AssigneeAvatarGroupProps> = ({ users: directUsers, userIds, userMap, maxVisible = 3, size = 22 }) => {
  const users = useMemo(() => {
    if (directUsers && directUsers.length > 0) {
      return directUsers;
    }

    if (!userIds || !userMap) {
      return [];
    }

    return userIds.map((id) => userMap.get(id)).filter((user): user is UserListView => Boolean(user));
  }, [directUsers, userIds, userMap]);

  const visible = users.slice(0, maxVisible);
  const remaining = Math.max(0, users.length - visible.length);

  if (users.length === 0) return null;

  return (
    <div className="assignee-avatar-group" aria-label={`${users.length} zugewiesen`}>
      {visible.map((user) => (
        <div key={user.id} className="assignee-avatar">
          <UserAvatar name={user.name} imageId={user.profile_image_id} size={size} />
        </div>
      ))}
      {remaining > 0 ? <div className="assignee-avatar-overflow">+{remaining}</div> : null}
    </div>
  );
};

export default AssigneeAvatarGroup;
