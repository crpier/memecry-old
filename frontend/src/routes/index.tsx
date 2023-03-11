import Posts from "~/components/Posts";

// const Posts = lazy(async () => {
//   return import("../components/Posts");
// });

export default function Home() {
  return (
    <>
      <div>pula pula</div>
      <Posts posts={[{ user: { username: "lolaw" } }]} />;
    </>
  );
}
