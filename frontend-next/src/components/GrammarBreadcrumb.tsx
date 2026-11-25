import Link from "next/link";
// 'use client';

interface GrammarBreadcrumbProps {
  decodedTitle: string;
}

const GrammarBreadcrumb: React.FC<GrammarBreadcrumbProps> = ({ decodedTitle }) => {
  return (
    <nav className="mb-6 text-gray-700" aria-label="breadcrumb">
      <ol className="list-reset flex">
        <li>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
            Home
          </Link>
        </li>
        <li>
          <span className="mx-2">›</span>
        </li>
        <li>
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-semibold">
            Grammar
          </Link>
        </li>
        <li>
          <span className="mx-2">›</span>
        </li>
        <li className="text-gray-500">{decodedTitle}</li>
      </ol>
    </nav>
  );
};

export default GrammarBreadcrumb;
