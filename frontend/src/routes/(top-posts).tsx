import moment from "moment";
import { BsChatLeft } from "solid-icons/bs";
import { ImArrowDown, ImArrowUp } from "solid-icons/im";
import { Index, Signal } from "solid-js";
import { A } from "solid-start";
import { Post } from "~/memecry-backend";

import { createResource } from "solid-js";
import { useStore } from "~/store";
import { createStore, reconcile, unwrap } from "solid-js/store";

function createPostsStore(value: Post[]): Signal<Post[]> {
  const [store, setStore] = createStore({
    value,
  });
  return [
    () => store.value,
    (
      v:
        | ((val: Post[]) => Post[])
        | { idx: number; key: keyof Post; val: any }
        | Post[]
    ) => {
      const unwrapped = unwrap(store.value);
      typeof v === "function" && (v = v(unwrapped));
      if (!Array.isArray(v)) {
        v = v as {
          idx: number;
          key: keyof Post;
          val: any;
        };
        if (v.val !== undefined) {
          setStore("value", [v.idx], v.key, v.val);
        } else {
          setStore("value", [v.idx], v.key);
        }
        return store.value;
      }
      setStore("value", reconcile(v));
      return store.value;
    },
  ] as Signal<Post[]>;
}

export default function TopPosts() {
  const [_, storeActions] = useStore();
  const resourceResult = createResource<Post[]>(
    async (_, info) => {
      if (info.refetching) {
        const { post_id, store_id } = info.refetching as {
          post_id: number;
          store_id: number;
        };
        const newPost = await storeActions.getPost(post_id);
        return {
          idx: store_id,
          key: (post: Post) => newPost,
          value: undefined,
        };
      }
      return storeActions.getTopPosts();
    },
    // @ts-ignore
    { storage: createPostsStore }
  );
  const posts = resourceResult[0];
  const mutate: (
    arg0:
      | Post[]
      | {
          idx: number;
          key: keyof Post;
          val: any;
        }
  ) => void = resourceResult[1].mutate;
  const refetch = resourceResult[1].refetch;
  function parseTimeDelta(date: string) {
    // TODO: moment doesn't seem to be encouraged anymore
    return moment(date).fromNow();
  }

  return (
    <Index fallback={<p class="text-white">Loading post...</p>} each={posts()}>
      {(post, i) => (
        <main
          class="text-center mx-auto flex flex-col items-center justify-center text-white"
          style="width:600px"
        >
          <div class="mt-8 border-2 border-gray-600 px-6 pb-6 text-center bg-[#101010]">
            <p class="my-4 text-xl font-bold">{post().title}</p>
            <A href=".">
              <img
                src={`http://localhost:8000${post().source}`}
                style="width:584px"
              ></img>
            </A>
            <div class="flex flex-grow-0 flex-row items-center justify-start">
              <div class="my-2 mr-2 font-semibold">
                {post().score} good boi points
              </div>
              <div class="flex-grow"></div>
              <div class="font-semibold">
                {parseTimeDelta(post().created_at)}{" "}
                <span class="font-normal text-gray-300">by</span>{" "}
                <A href="." class="font-bold text-green-300">
                  {post().user.username}
                </A>
              </div>
            </div>
            <div class="flex flex-grow-0 flex-row items-center justify-start">
              <button
                class="mr-2 rounded-md border border-gray-600 p-2 hover:border-gray-500"
                classList={{ "bg-orange-800": post().liked }}
                onClick={async () => {
                  mutate({
                    idx: i,
                    key: "liked",
                    val: (liked: boolean) => !liked,
                  });
                  mutate({ idx: i, key: "disliked", val: false });
                  await storeActions.likePost(post().id);
                  refetch({ post_id: post().id, store_id: i });
                }}
              >
                <ImArrowUp size={"1rem"} />
                {post().liked}
              </button>
              <button
                class="rounded-md border border-gray-600 p-2 hover:border-gray-500"
                classList={{ "bg-blue-800": post().disliked }}
                onClick={async () => {
                  mutate({ idx: i, key: "liked", val: false });
                  mutate({
                    idx: i,
                    key: "disliked",
                    val: (liked: boolean) => !liked,
                  });
                  await storeActions.dislikePost(post().id);
                  refetch({ post_id: post().id, store_id: i });
                }}
              >
                <ImArrowDown size={"1rem"} />
              </button>
              <div class="flex-grow"></div>
              <A
                href="."
                class="flex flex-row rounded-md border border-gray-600 p-2 hover:border-gray-500"
              >
                <BsChatLeft size={"1rem"} class="mt-1.5 mr-2" />
                <div>{post().comment_count} comments</div>
              </A>
            </div>

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
                  <button class="bg-blue-500 px-2">Submit</button>
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
                    <div class="text-sm text-gray-400 mr-1 mt-1">10 claps</div>
                    <div class="text-sm text-gray-400 mr-1 mt-1">-</div>
                    <div class="text-sm text-gray-400 mr-1 mt-1">15 boos</div>
                    <div class="text-sm text-gray-400 mr-1 mt-1">-</div>
                    <div class="text-sm text-gray-400 mr-1 mt-1">
                      6 hours ago
                    </div>
                  </div>
                  <div class="text-left">
                    Hello this is a pretty big comment on my side. I like to
                    post big comments all the time.
                    <br /> LMAO
                  </div>
                  <div class="flex flex-row mt-2">
                    <button class="mr-2">
                      <ImArrowUp size={"1.5rem"} />
                    </button>
                    <button class="mr-4">
                      <ImArrowDown size={"1.5rem"} />
                    </button>
                    <button class="text-blue-500 font-bold text-lg">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}
    </Index>
  );
}
