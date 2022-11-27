import Image from "next/image";
import Link from "next/link";

export function Shortcuts() {
  return (
    <div className="border border-gray-700 bg-gray-800 mb-8 p-2">
      <p className="text-xl font-bold">Shortcuts</p>
      <ul className="text-sm">
        <li className="">
          <span className="font-semibold">H</span> - Unike this post
        </li>
        <li className="">
          <span className="font-semibold">J</span> - Down one post
        </li>
        <li className="">
          <span className="font-semibold">K</span> - Up one post
        </li>
        <li className="">
          <span className="font-semibold">L</span> - Like this post
        </li>
        <li className="">
          <span className="font-semibold">S</span> - save this post
        </li>
      </ul>
    </div>
  );
}

export function BestComments() {
  return (
    <div className="border border-gray-700 bg-gray-800 mb-8">
      <p className="text-xl font-bold">Today&apos;s best comments</p>
      <ul className="text-sm">
        <li className="flex flex-row border-t border-b">
          <Image
            src={
              "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/131.jpg"
            }
            alt={"funny meme"}
            width={50}
            height={50}
          ></Image>
          <div className="flex flex-col p-2">
            <Link href="." className="text-blue-500">
              BigChungus420
            </Link>
            <p>Yes this is indeed funny</p>
          </div>
        </li>
        <li className="flex flex-row border-t border-b">
          <Image
            src={
              "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.png"
            }
            alt={"funny meme"}
            width={50}
            height={50}
          ></Image>
          <div className="flex flex-col p-2">
            <Link href="." className="text-blue-500">
              BigCommenter
            </Link>
            <p>Well I&apos;ll be damned</p>
          </div>
        </li>
      </ul>
      <button className="bg-blue-500 px-2 border rounded-md m-4">
        Load more
      </button>
    </div>
  );
}

export function LatestComments() {
  return (
    <div className="border border-gray-700 bg-gray-800 mb-8">
      <p className="text-xl font-bold">Today&apos;s latest comments</p>
      <ul className="text-sm">
        <li className="flex flex-row border-t border-b">
          <Image
            src={
              "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
            }
            alt={"funny meme"}
            width={50}
            height={50}
          ></Image>
          <div className="flex flex-col p-2">
            <Link href="." className="text-blue-500">
              BigChungus420
            </Link>
            <p>Yes this is indeed funny</p>
          </div>
        </li>
        <li className="flex flex-row border-t border-b">
          <Image
            src={
              "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
            }
            alt={"funny meme"}
            width={50}
            height={50}
          ></Image>
          <div className="flex flex-col p-2">
            <Link href="." className="text-blue-500">
              BigCommenter
            </Link>
            <p>Well I&apos;ll be damned</p>
          </div>
        </li>
      </ul>
      <button className="bg-blue-500 px-2 border rounded-md m-4">
        Load more
      </button>
    </div>
  );
}

export function LeaderBoard() {
  return (
    <div className="border border-gray-700 bg-gray-800 mb-8">
      <p className="text-xl font-bold">This week&apos;s Top 10</p>
      <ol className="text-sm">
        <li className="border-t border-b">
          <div className="flex flex-row justify-center align-center my-2">
            <span
              className="mr-4 text-center"
              style={{ height: 26, lineHeight: 2 }}
            >
              #1
            </span>
            <Image
              src={
                "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
              }
              alt={"funny meme"}
              width={26}
              height={26}
            ></Image>
            <div
              className="flex flex-col p-2 text-center"
              style={{ height: 26, lineHeight: 0.5 }}
            >
              <Link href="." className="text-center text-blue-500">
                BigChungus420
              </Link>
            </div>
            <div className="flex-grow"></div>
            <div
              className="mx-1 px-1 border rounded-sm flex flex-row"
              style={{ lineHeight: 2 }}
            >
              1024 points
            </div>
          </div>
        </li>
        <li className="border-t border-b">
          <div className="flex flex-row justify-center align-center my-2">
            <span
              className="mr-4 text-center"
              style={{ height: 26, lineHeight: 2 }}
            >
              #2
            </span>
            <Image
              src={
                "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
              }
              alt={"funny meme"}
              width={26}
              height={26}
            ></Image>
            <div
              className="flex flex-col p-2 text-center"
              style={{ height: 26, lineHeight: 0.5 }}
            >
              <Link href="." className="text-center text-blue-500">
                BigPosterOfMemes
              </Link>
            </div>
            <div className="flex-grow"></div>
            <div
              className="mx-1 px-1 border rounded-sm flex flex-row"
              style={{ lineHeight: 2 }}
            >
              1024 points
            </div>
          </div>
        </li>
        <li className="border-t border-b">
          <div className="flex flex-row justify-center align-center my-2">
            <span
              className="mr-4 text-center"
              style={{ height: 26, lineHeight: 2 }}
            >
              #3
            </span>
            <Image
              src={
                "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
              }
              alt={"funny meme"}
              width={26}
              height={26}
            ></Image>
            <div
              className="flex flex-col p-2 text-center"
              style={{ height: 26, lineHeight: 0.5 }}
            >
              <Link href="." className="text-center text-blue-500">
                MrSandman
              </Link>
            </div>
            <div className="flex-grow"></div>
            <div
              className="mx-1 px-1 border rounded-sm flex flex-row"
              style={{ lineHeight: 2 }}
            >
              1024 points
            </div>
          </div>
        </li>
      </ol>
      <button className="bg-blue-500 px-2 border rounded-md m-4">
        Load more
      </button>
    </div>
  );
}
