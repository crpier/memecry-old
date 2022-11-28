import { Post } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";
import {
  BsArrowDownSquareFill,
  BsArrowUpSquareFill,
  BsFillChatLeftTextFill,
} from "react-icons/bs";

export function PostContent(props: { url: string; name?: string }) {
  const fileName = props.name ?? props.url;
  if (fileName.includes("mp4")) {
    return (
      <video
        style={{ width: 500, height: 500 }}
        src={props.url}
        controls={true}
      />
    );
  } else {
    return (
      <Image src={props.url} alt="funnymeme" height={500} width={500}></Image>
    );
  }
}
export default function PostView(props: Post) {
  return (
    <div
      className="mb-8 border-2 border-gray-600 px-6 pb-6 text-center"
      style={{ background: "#181B1D" }}
    >
      <p className="my-4 text-xl font-bold">{props.title}</p>
      <div className="">
        <PostContent url={props.url} />
      </div>
      <div className="flex flex-grow-0 flex-row items-center justify-start">
        <Link href="." className="my-2 mr-2 font-semibold">
          13 good boi points
        </Link>
        <div className="flex-grow"></div>
        <div className="font-semibold">
          25 min ago <span className="font-normal text-gray-300">by</span>{" "}
          <Link href="." className="font-bold text-green-300">
            {props.owner}
          </Link>
        </div>
      </div>
      <div className="flex flex-grow-0 flex-row items-center justify-start">
        <button className="mr-3 rounded-md border border-gray-600 p-2 hover:border-gray-500">
          <BsArrowUpSquareFill size={"1.5em"} />
        </button>
        <button className="rounded-md border border-gray-600 p-2 hover:border-gray-500">
          <BsArrowDownSquareFill size={"1.5em"} />
        </button>
        <div className="flex-grow"></div>
        <Link
          href="."
          className="flex flex-row rounded-md border border-gray-600 p-2 hover:border-gray-500"
        >
          <BsFillChatLeftTextFill size={"1.5em"} className="mr-2" />
          <div>420 comments</div>
        </Link>
      </div>
    </div>
  );
}
