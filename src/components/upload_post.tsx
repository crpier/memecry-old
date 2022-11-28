import { useState, useEffect, ReactElement } from "react";
import ReactDOM from "react-dom";
import { PostContent } from "./post";

export default function UploadPost(props: { children: ReactElement }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [fileUploaded, setfileUploaded] = useState(null);
  const [createObjectURL, setCreateObjectURL] = useState("");

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
  if (fileUploaded) {
    contentSection = <PostContent url={createObjectURL} name={fileUploaded.name}/>;
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
        style={{ left: "30vw", top: "20vh", width: "40vw" }}
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
          <input className="w-full rounded border p-1" />
        </div>
        {contentSection}
        <div className="">
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
