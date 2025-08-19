import React from 'react';

export default function NotificationItem({ notification }) {
  return (
    <div 
      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        !notification.read ? 'bg-blue-50/30' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <img 
          src={notification.avatar}
          alt="Avatar" 
          className="w-8 h-8 rounded-full flex-shrink-0"
        />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{notification.user}</span>
                {notification.action && (
                  <span className="ml-1">{notification.action}</span>
                )}
              </p>
              
              {notification.content && (
                <p className="text-sm text-gray-600 mt-1">
                  {notification.content}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {notification.time}
              </span>
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
