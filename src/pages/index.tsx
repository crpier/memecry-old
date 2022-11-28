import { trpc } from "@/utils/trpc";
import {
  Shortcuts,
  BestComments,
  LatestComments,
  LeaderBoard,
} from "@/components/asides";
import CommentSection from "@/components/comments";
import PostView from "@/components/post";

export default function Posts() {
  const postsData = trpc.post.getAll.useQuery();
  let posts;
  if (!postsData.data) {
    posts = <div>Loading</div>;
  } else {
    posts = postsData.data.map((post) => (
      <PostView
        key={post.id}
        title={post.title}
        owner={post.owner}
        id={post.id}
        url={post.url}
        tags={post.tags}
      ></PostView>
    ));
  }

  return (
    <div>
      <div className="flex flex-grow-0 flex-row items-start justify-center justify-center">
        <div style={{ width: 300 }}></div>
        <main
          className="m-4 flex flex-col items-center justify-center justify-items-center"
          style={{ width: 552 }}
        >
          {posts}
        </main>
        <aside className="m-4 text-center" style={{ width: 300 }}>
          <Shortcuts></Shortcuts>
          <BestComments></BestComments>
          <LatestComments></LatestComments>
          <LeaderBoard></LeaderBoard>
        </aside>
      </div>
      <CommentSection></CommentSection>
    </div>
  );
}
