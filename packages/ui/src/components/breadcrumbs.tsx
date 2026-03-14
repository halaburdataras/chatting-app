import { cn } from "@repo/shared/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";

type BreadcrumbsProps = {
  breadcrumbs: {
    label: string;
    href: string;
  }[];
  className?: string;
};

export default function Breadcrumbs({
  breadcrumbs,
  className,
}: BreadcrumbsProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Breadcrumbs" className={className}>
      <ul className="m-0 flex list-none items-center gap-4 p-0">
        {breadcrumbs.map((breadcrumb, index) => (
          <Fragment key={breadcrumb.label}>
            {index > 0 && <span className="text-slate-400">•</span>}
            <li>
              <Link
                href={breadcrumb.href}
                className={cn(
                  "block text-sm leading-6 text-slate-900 transition-colors duration-200 hover:text-slate-700",
                  pathname === breadcrumb.href &&
                    "pointer-events-none text-slate-400"
                )}
              >
                {breadcrumb.label}
              </Link>
            </li>
          </Fragment>
        ))}
      </ul>
    </nav>
  );
}
