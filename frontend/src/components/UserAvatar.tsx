import { Link } from "react-router-dom";

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  onClick?: () => void;
}

export default function UserAvatar({ name, avatarUrl, onClick }: UserAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      to="/profile"
      onClick={onClick}
      className="flex items-center gap-2 group rounded-full pl-1 pr-3 py-1 hover:bg-gray-100 transition-colors"
      title="My Profile"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shrink-0 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          initial
        )}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
        {name}
      </span>
    </Link>
  );
}
