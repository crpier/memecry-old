import { useState, ReactElement, FormEvent } from "react";
import ReactDOM from "react-dom";
import { PostContent } from "./post";
import { trpc } from "@/utils/trpc";
import { useSession } from "next-auth/react";

export default function UploadPost(props: { children: ReactElement }) {
  const postMutation = trpc.post.createPost.useMutation();
  const [modalOpen, setModalOpen] = useState(false);
  const [fileUploaded, setfileUploaded] = useState<any>(null);
  const [createObjectURL, setCreateObjectURL] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const { data: sessionData } = useSession();

  const closeModal = () => {
    setModalOpen(false);
    setfileUploaded(null);
    setCreateObjectURL("");
  };
  const openModal = () => setModalOpen(true);

  let contentSection;

  // Handling file upload
  const uploadToClient = (event) => {
    if (event.target?.files[0]) {
      const f = event.target.files[0];
      setfileUploaded(f);
      console.log(f.name);
      const url = URL.createObjectURL(f);
      setCreateObjectURL(url);
    }
  };

  const uploadToServer = async (event) => {
    let fileType: string = fileUploaded.type;
    if (fileType.includes("/")) {
      const typeParts = fileType.split("/");
      fileType = typeParts[typeParts.length - 1] as string;
    }
    const userName = sessionData?.user?.name;
    if (!userName) {
      return;
    }
    postMutation.mutate(
      {
        owner: userName,
        fileType: fileType,
        tags: tags,
        postTitle: title,
      },
      {
        onSuccess: async (data, variables, context) => {
          let resp = await fetch(data, {
            body: fileUploaded,
            headers: {
              "Content-type": fileType,
              "Access-Control-Allow-Origin": "*",
            },
            method: "PUT",
          });
          setModalOpen(false);
          setfileUploaded(null);
          setCreateObjectURL("");
          setTitle("");
          setTags("");
        },
      }
    );
  };

  const updateTags = (e: FormEvent<HTMLFormElement>) => {
    const target = e.target as HTMLInputElement;
    const label = target.labels?.item(0);
    if (!label) {
      console.log("Not right");
      return;
    }
    const changedTag = label.innerText;
    const newTagValue = target.checked;
    let oldTags = new Set(tags.split(","));
    if (newTagValue) {
      oldTags.add(changedTag);
    } else {
      oldTags.delete(changedTag);
    }
    oldTags.delete("");
    setTags(Array.from(oldTags).join(","));
  };
  const changeTitle = (title: string) => {
    setTitle(title);
  };
  if (fileUploaded) {
    contentSection = (
      <PostContent url={createObjectURL} name={fileUploaded.name} />
    );
  } else {
    contentSection = (
      <div className="flex h-64 flex-col items-center rounded border border-dashed bg-gray-900 p-6 text-center">
        <label className="mb-4" htmlFor="ff">
          Upload file up to 10mb
        </label>
        <input
          className="w-max"
          type="file"
          placeholder="lolaw"
          id="ff"
          onChange={uploadToClient}
        />
      </div>
    );
  }
  let modal;
  if (modalOpen) {
    modal = ReactDOM.createPortal(
      <div
        className="absolute flex flex-col rounded border bg-gray-700 px-4 pb-4"
        style={{ left: "30vw", top: "5vh", width: "40vw" }}
      >
        <div className="mt-2 flex justify-end">
          <button
            className="w-max rounded border border bg-gray-900 px-2 text-right hover:bg-gray-700"
            onClick={closeModal}
          >
            X
          </button>
        </div>
        <p className="mb-1 text-center text-3xl">Upload post</p>
        <div className="mb-4">
          <label className="">Title</label>
          <input
            className="w-full rounded border p-1"
            value={title}
            onChange={(e) => changeTitle(e.target.value)}
          />
        </div>
        {contentSection}
        <form className="" onChange={updateTags}>
          <div>Tags</div>
          <div>
            <input className="mr-2" type="checkbox" id="a" />
            <label className="mr-8" htmlFor="a">
              NSFW
            </label>
            <input className="mr-2" type="checkbox" id="b" />
            <label className="mr-8" htmlFor="b">
              Philosophy
            </label>
            <input className="mr-2" type="checkbox" id="c" />
            <label className="mr-8" htmlFor="c">
              History
            </label>
            <input className="mr-2" type="checkbox" id="d" />
            <label className="mr-8" htmlFor="d">
              Event
            </label>
          </div>
        </form>
        <div className="flex flex-row justify-start">
          <button className="mt-4 rounded border border-white px-4 py-1 text-sm font-semibold hover:border-transparent hover:bg-white hover:text-teal-500">
            Cancel
          </button>
          <button
            onClick={uploadToServer}
            className="mt-4 ml-4 rounded border-white bg-blue-500 px-4 py-1 text-sm font-semibold hover:border-transparent hover:bg-white hover:text-teal-500"
          >
            Submit
          </button>
        </div>
      </div>,
      document.getElementById("modal-root") as HTMLElement
    );
  } else {
    modal = null;
  }

  return (
    <div id="modal-root" onClick={modalOpen ? () => null : openModal}>
      {modal}
      {props.children}
    </div>
  );
}
