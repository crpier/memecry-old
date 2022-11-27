import { useState, useEffect } from "react";
import ReactDOM from "react-dom";

export default function UploadPost(props) {
  const [isBrowser, setIsBrowser] = useState(false);

  const closeModal = () => setIsBrowser(false);
  const openModal = () => setIsBrowser(true);

  let modal;
  if (isBrowser) {
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
        <div className="h-64 rounded border border-dashed bg-gray-900 p-6 text-center">
          Upload something or whatev
        </div>
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
              For Event
            </label>
          </div>
        </div>
      </div>,
      document.getElementById("modal-root")
    );
  } else {
    modal = null;
  }

  return (
    <div id="modal-root" onClick={isBrowser ? () => null : openModal}>
      {modal}
      {props.children}
    </div>
  );
}
