import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="text-2xl font-bold">ProyekUji</h2>
          <p className="max-w-md mx-auto mt-2 text-gray-500">
            Sebuah platform untuk mengetes dan mengembangkan fitur-fitur modern dengan Next.js dan Tailwind CSS.
          </p>
        </div>

        <hr className="my-8 border-gray-200" />

        <div className="flex flex-col items-center sm:flex-row sm:justify-between">
          <p className="text-sm text-gray-500">
            © Copyright 2025. All Rights Reserved.
          </p>
          <div className="flex mt-4 -mx-2 sm:mt-0">
            <Link href="#" className="mx-2 text-sm text-gray-500 hover:text-gray-600">
              Tim
            </Link>
            <Link href="#" className="mx-2 text-sm text-gray-500 hover:text-gray-600">
              Privasi
            </Link>
            <Link href="#" className="mx-2 text-sm text-gray-500 hover:text-gray-600">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}