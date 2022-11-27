import Image from "next/image";
import Link from "next/link";
import {
  BsArrowDownSquareFill,
  BsArrowUpSquareFill,
  BsFillChatLeftTextFill,
} from "react-icons/bs";

export default function Post(props: {
  title: string;
  owner: string;
  url: string;
  id: number;
  tags: string;
}) {
  return (
    <div
      className="border-2 border-gray-600 px-6 pb-6 text-center mb-8"
      style={{ background: "#181B1D" }}
    >
      <p className="text-xl font-bold my-4">{props.title}</p>
      <div className="">
        <Image src={props.url} alt="funnymeme" height={500} width={500}></Image>
      </div>
      <div className="flex flex-row justify-start items-center flex-grow-0">
        <Link href="." className="my-2 mr-2 font-semibold">
          13 good boi points
        </Link>
        <div className="flex-grow"></div>
        <div className="font-semibold">
          25 min ago <span className="text-gray-300 font-normal">by</span>{" "}
          <Link href="." className="text-green-300 font-bold">
            {props.owner}
          </Link>
        </div>
      </div>
      <div className="flex flex-row justify-start items-center flex-grow-0">
        <button className="mr-3 p-2 border rounded-md border-gray-600 hover:border-gray-500">
          <BsArrowUpSquareFill size={"1.5em"} />
        </button>
        <button className="p-2 border rounded-md border-gray-600 hover:border-gray-500">
          <BsArrowDownSquareFill size={"1.5em"} />
        </button>
        <div className="flex-grow"></div>
        <Link
          href="."
          className="p-2 border rounded-md border-gray-600 hover:border-gray-500 flex flex-row"
        >
          <BsFillChatLeftTextFill size={"1.5em"} className="mr-2" />
          <div>420 comments</div>
        </Link>
      </div>
    </div>
  );
}
