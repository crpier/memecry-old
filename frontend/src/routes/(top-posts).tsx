import { createResource, createSignal } from "solid-js";
import Posts from "~/components/Posts";
import { useStore } from "~/store";

// const Posts = lazy(async () => {
//   return import("../components/Posts");
// });

export default function TopPosts() {
  const [_, store] = useStore();
  const [posts, setPosts] = createResource(store.getTopPosts);

  return <Posts posts={posts()} />;
}
