export default function IconUserAvatar({
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 60 60"
      {...rest}
    >
      <rect width="60" height="60" opacity=".32" rx="30" />
      <path d="M30 27.74a7.4 7.4 0 0 0 7.43-7.37A7.4 7.4 0 0 0 30 13a7.4 7.4 0 0 0-7.43 7.37A7.4 7.4 0 0 0 30 27.74M30 48c7.18 0 13-3.3 13-7.37s-5.82-7.37-13-7.37-13 3.3-13 7.37S22.82 48 30 48" />
    </svg>
  );
}
