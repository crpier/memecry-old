import { createResource, lazy, Suspense } from "solid-js";
import BackendService from "~/services";
import { useService } from "solid-services";
import Posts from "../components/Posts";
import getBackendService from "~/services";

// const Posts = lazy(async () => {
//   return import("../components/Posts");
// });

export default function Home() {
  const [postGetter, smth] = createResource(() => {
    const backendService = useService(getBackendService);
    return backendService().getTopPosts();
  });
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <Posts posts={postGetter()} />
    </Suspense>
  );
}
