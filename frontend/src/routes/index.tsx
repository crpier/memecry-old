import { createResource, lazy, onMount, Suspense } from "solid-js";
import { useService } from "solid-services";
import Posts from "../components/Posts";

// const Posts = lazy(async () => {
//   return import("../components/Posts");
// });

export default function Home() {
  return <Posts posts={[]} />;
}
