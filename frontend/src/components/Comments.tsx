import { A } from "solid-start";
import { Post } from "~/memecry-backend";
import { useStore } from "~/store";
import { ImArrowDown, ImArrowUp } from "solid-icons/im";
import { Accessor, createResource, Show } from "solid-js";
import moment from "moment";

export default function Comments(props: { post: Accessor<Post> }) {
  const [_, storeActions] = useStore();
  const postComment = (postId: number) => {
    storeActions.postComment(postId, "lolaw blanaow");
  };

  const [comments] = createResource(() => {
    return storeActions.getPostComments(props.post().id);
  });
  function parseTimeDelta(date: string) {
    // TODO: moment doesn't seem to be encouraged anymore
    return moment(date).fromNow();
  }

  return (
    <Show when={comments.state == "ready"}>
      <div class="flex flex-col justify-start items-stretch mt-4">
        <div class="flex flex-col mb-1">
          <div class="flex flex-row">
            <div class="mr-4">
              <img
                src={
                  "https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
                }
                alt={"funny meme"}
                style="width:50px;height:50px"
              ></img>
            </div>
            <textarea
              class="border px-2 pt-1 h-10 flex-grow text-black"
              placeholder="Write a comment"
            />
          </div>
          <div class="flex flex-row">
            <div class="flex-grow"></div>
            <button class="mr-2 bg-gray-600 px-2">Attach</button>
            <button
              class="bg-blue-500 px-2"
              onclick={() => postComment(props.post().id)}
            >
              Submit
            </button>
          </div>
        </div>
        <div class="flex flex-row">
          <div class="mr-4">
            <img
              src="https://misc-personal-projects.s3.eu-west-1.amazonaws.com/memecry/13.jpg"
              alt="funny meme"
              class="mt-1"
              style="width:62px;height:50px"
            ></img>
          </div>
          <div class="flex flex-col">
            <div class="flex flex-row">
              <A href="." class="text-blue-500 mr-2 font-bold">
                MrCommenter
              </A>
              <div class="text-sm text-gray-400 mr-1 mt-1">
                {comments().comments[1].likes} claps
              </div>
              <div class="text-sm text-gray-400 mr-1 mt-1">-</div>
              <div class="text-sm text-gray-400 mr-1 mt-1">
                {comments().comments[1].dislikes} boos
              </div>
              <div class="text-sm text-gray-400 mr-1 mt-1">-</div>
              <div class="text-sm text-gray-400 mr-1 mt-1">
                {parseTimeDelta(comments().comments[1].created_at)}
              </div>
            </div>
            <div class="text-left">{comments().comments[1].content}</div>
            <div class="flex flex-row mt-2">
              <button class="mr-2">
                <ImArrowUp size={"1.5rem"} />
              </button>
              <button class="mr-4">
                <ImArrowDown size={"1.5rem"} />
              </button>
              <button class="text-blue-500 font-bold text-lg">Reply</button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
