import { trpc } from "@/utils/trpc";
import { BsSearch } from "react-icons/bs";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function NavBar({}) {
  const { data: sessionData } = useSession();

  const { data: secretMessage } = trpc.auth.getSecretMessage.useQuery(
    undefined,
    { enabled: sessionData?.user !== undefined }
  );
  return (
    <nav className="flex flex-wrap content-center items-center justify-center justify-items-center bg-gray-900 p-3">
      <div className="mr-6 flex flex-shrink-0 items-center text-white">
        <span className="text-xl font-semibold tracking-tight">Memecry</span>
      </div>
      <div className="block">
        <button className="mr-4 flex items-center rounded border border-gray-400 px-2 py-1 text-gray-200 hover:border-white hover:text-white">
          <svg
            className="h-4 w-4 fill-current"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Menu</title>
            <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
          </svg>
        </button>
      </div>
      <div className="block w-full flex-grow lg:flex lg:w-auto lg:items-center">
        <div className="text-sm lg:flex-grow">
          <Link
            href="#responsive-header"
            className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
          >
            Latest
          </Link>
          <Link
            href="."
            className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
          >
            Saved
          </Link>
          <Link
            href="#responsive-header"
            className="mt-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
          >
            Library
          </Link>
        </div>
        <button className="mx-4">
          <BsSearch size={"2em"} />
        </button>
        {sessionData && (
          <Link
            href="#responsive-header"
            className="inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500 mr-4"
          >
            {sessionData.user?.name}
          </Link>
        )}
        <button
          className="inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500"
          onClick={sessionData ? () => signOut() : () => signIn()}
        >
          {sessionData ? "Sign out" : "Sign in"}
        </button>
      </div>
    </nav>
  );
}
