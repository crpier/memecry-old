import { createResource, lazy, onMount, Suspense } from "solid-js";
import BackendService from "~/services";
import { useService } from "solid-services";
import Posts from "../components/Posts";
import getBackendService from "~/services";

// const Posts = lazy(async () => {
//   return import("../components/Posts");
// });

export default function Home() {
  const backendService = useService(getBackendService);
  const [postGetter, {mutate, refetch}] = createResource(() => {
    return backendService().getTopPosts();
  });
  onMount(async () => {
    await backendService().getUserData()
    refetch()
  });
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Posts posts={postGetter()} />
    </Suspense>
  );
}
