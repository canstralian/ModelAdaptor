import { ReactNode } from 'react';
import { Link } from 'wouter';

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  linkText: string;
  linkHref: string;
  bgColor: string;
  iconColor: string;
}

const StatCard = ({ 
  title, 
  value, 
  icon, 
  linkText, 
  linkHref,
  bgColor,
  iconColor
}: StatCardProps) => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            <div className={iconColor}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-semibold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        <div className="text-sm">
          <Link href={linkHref} className="font-medium text-primary hover:text-primary/80">
            {linkText}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
