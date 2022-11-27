import { BsSearch } from "react-icons/bs";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

import React from "react";
import Image from "next/image";
import UploadPost from "./upload_post";

export default function NavBar({}) {
  const { data: sessionData } = useSession();

  return (
    <nav className="flex flex-row items-center bg-gray-900 p-3">
      <div className="mr-6 flex flex-shrink-0 items-center text-white">
        <span className="text-xl font-semibold tracking-tight">Memecry</span>
      </div>
      <Link
        href="#responsive-header"
        className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
      >
        Latest
      </Link>
      {sessionData && (
        <Link
          href="."
          className="mt-4 mr-4 block text-gray-200 hover:text-white lg:mt-0 lg:inline-block"
        >
          Library
        </Link>
      )}
      {sessionData && (
        <Link
          href="#responsive-header"
          className="flex flex-row items-center pr-2 text-gray-200 hover:bg-gray-800 hover:text-white"
        >
          <button>
            <Image
              className="mr-2"
              width={32}
              height={32}
              alt="profile-picture"
              src={
                sessionData.user?.image ||
                "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
              }
            ></Image>
          </button>
          <span>{sessionData.user?.name}</span>
        </Link>
      )}
      <div className="lg:flex-grow"></div>
      <button className="mx-4">
        <BsSearch size={"2em"} />
      </button>
      {!sessionData && (
        <button
          className="mr-4 inline-block rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500"
          onClick={() => signIn()}
        >
          Sign in
        </button>
      )}
      {sessionData && (
        <UploadPost>
          <button className="mr-4 inline-block rounded border-white bg-blue-500 px-4 py-2 text-sm font-semibold leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500">
            Upload
          </button>
        </UploadPost>
      )}
      {sessionData && (
        <button
          className="inline-block rounded rounded border border-white px-4 py-2 text-sm leading-none text-white hover:border-transparent hover:bg-white hover:text-teal-500"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      )}
    </nav>
  );
}
