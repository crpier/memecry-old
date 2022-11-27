import Image from "next/image";
import Link from "next/link";
import {
  BsArrowDownSquareFill,
  BsArrowUpSquareFill,
} from "react-icons/bs";



export default function CommentSection() {
  return (
    <div
      className="flex flex-col justify-start items-start m-4 border-2 border-gray-600 p-8 items-stretch"
      style={{ width: 640, background: "#181B1D" }}
    >
      <div className="flex flex-col mb-4">
        <div className="flex flex-row">
          <div className="mr-4">
            <Image
              src={
                "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
              }
              alt={"funny meme"}
              width={64}
              height={64}
            ></Image>
          </div>
          <textarea
            className="border px-2 pt-1 h-10 flex-grow"
            placeholder="Write a comment"
          />
        </div>
        <div className="flex flex-row mt-1">
          <div className="flex-grow"></div>
          <button className="mr-2 bg-gray-600 px-2">Attach</button>
          <button className="bg-blue-500 px-2">Submit</button>
        </div>
      </div>
      <div className="flex flex-col mb-4 border-b pb-4">
        <div className="flex flex-row">
          <div className="mr-4">
            <Image
              src={
                "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/122.jpg"
              }
              alt={"funny meme"}
              width={64}
              height={64}
            ></Image>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <Link href="." className="text-blue-500 mr-2 font-bold">
                MrCommenter
              </Link>
              <div className="text-sm text-gray-400 mr-1">10 claps</div>
              <div className="text-sm text-gray-400 mr-1">-</div>
              <div className="text-sm text-gray-400 mr-1">15 boos</div>
              <div className="text-sm text-gray-400 mr-1">-</div>
              <div className="text-sm text-gray-400 mr-1">6 hours ago</div>
            </div>
            <div>
              Hello this is a pretty big comment on my side. I like to post big
              comments all the time.
              <br /> LMAO
            </div>
            <div className="flex flex-row">
              <button className="mr-2">
                <BsArrowUpSquareFill size={"1.5rem"} />
              </button>
              <button className="mr-4">
                <BsArrowDownSquareFill size={"1.5rem"} />
              </button>
              <button className="text-blue-500 font-bold text-lg">Reply</button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col mb-2 pl-16 border-b pb-4">
        <div className="flex flex-row">
          <div className="mr-4">
            <Image
              src={"https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/122.jpg"}
              alt={"funny meme"}
              width={64}
              height={64}
            ></Image>
          </div>
          <div className="flex flex-col">
            <div className="flex flex-row">
              <Link href="." className="text-blue-500 mr-2 font-bold">
                MrCommenter
              </Link>
              <div className="text-sm text-gray-400 mr-1">10 claps</div>
              <div className="text-sm text-gray-400 mr-1">-</div>
              <div className="text-sm text-gray-400 mr-1">15 boos</div>
              <div className="text-sm text-gray-400 mr-1">-</div>
              <div className="text-sm text-gray-400 mr-1">6 hours ago</div>
            </div>
            <div>Yes this is a good comment.</div>
            <div className="flex flex-row">
              <button className="mr-2">
                <BsArrowUpSquareFill size={"1.5rem"} />
              </button>
              <button className="mr-4">
                <BsArrowDownSquareFill size={"1.5rem"} />
              </button>
              <button className="text-blue-500 font-bold text-lg">Reply</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

