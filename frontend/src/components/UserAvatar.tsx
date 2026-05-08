import { Link } from "react-router-dom";

interface UserAvatarProps {
  name: string;
  onClick?: () => void;
}

export default function UserAvatar({ name, onClick }: UserAvatarProps) {
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link
      to="/profile"
      onClick={onClick}
      className="flex items-center gap-2 group rounded-full pl-1 pr-3 py-1 hover:bg-gray-100 transition-colors"
      title="My Profile"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-sm font-bold shrink-0">
        {initial}
      </div>
      <span className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
        {name}
      </span>
    </Link>
  );
}
