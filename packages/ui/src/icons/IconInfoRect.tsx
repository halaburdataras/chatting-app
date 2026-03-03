export default function IconInfoRect({
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...rest}>
      <rect width="24" height="24" fill="currentColor" rx="6" />
      <path
        fill="#fff"
        d="M13.5 16.5a.75.75 0 0 1-.75.75 1.5 1.5 0 0 1-1.5-1.5V12a.75.75 0 1 1 0-1.5 1.5 1.5 0 0 1 1.5 1.5v3.75a.75.75 0 0 1 .75.75m-3-8.62a1.13 1.13 0 1 1 2.25 0 1.13 1.13 0 0 1-2.25 0"
      />
    </svg>
  );
}
