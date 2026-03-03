export default function IconXCircle({
  ...rest
}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 0 20 20"
      {...rest}
    >
      <path
        fillRule="evenodd"
        d="M18.33 10a8.33 8.33 0 1 1-16.66 0 8.33 8.33 0 0 1 16.66 0M7.48 7.47a.6.6 0 0 1 .88 0L10 9.12l1.64-1.65a.63.63 0 0 1 .89.89L10.88 10l1.65 1.64a.63.63 0 0 1-.89.88L10 10.89l-1.64 1.64a.62.62 0 0 1-.88-.88L9.12 10 7.48 8.36a.6.6 0 0 1 0-.89"
        clipRule="evenodd"
        opacity=".48"
      />
    </svg>
  );
}
