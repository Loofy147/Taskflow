import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/api/notificationService';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const NotificationBell = () => {
  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.getNotifications,
  });

  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {notifications?.map((notification) => (
          <DropdownMenuItem key={notification.id}>
            {notification.title}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
