import datetime
import logging
from typing import Callable, NewType, TypedDict

import aiofiles
from fastapi import UploadFile
from sqlalchemy.orm import selectinload
from sqlmodel import Session, select  # pyright: ignore [reportUnknownVariableType]

from src import config, models, schema

logger = logging.getLogger()


async def post_comment(
    session: Callable[[], Session],
    comment_data: schema.CommentCreate,
    attachment: UploadFile | None,
    settings: config.Settings,
) -> int:
    with session() as s:
        # this is a reply
        if comment_data.post_id is None:
            res = s.execute(
                select(models.Comment).where(
                    models.Comment.id == comment_data.parent_id,
                ),
            ).one()
            parent_comment: models.Comment = res[0]
            comment_data.post_id = int(str(parent_comment.post_id))

        logger.info(s)
        new_comment = models.Comment(**comment_data.__dict__)
        s.add(new_comment)
        s.commit()
        new_comment.post.comment_count += 1
        s.commit()
        # TODO Putting all files in one folder is probably a bad idea long term
        # TODO: "comments" is a magic string
        if attachment:
            dest = (
                settings.UPLOAD_STORAGE / "comments" / attachment.filename
            ).with_stem(str(new_comment.id))
            logger.debug("Uploading content to %s", dest)
            async with aiofiles.open(dest, "wb") as f:
                await f.write(await attachment.read())
            new_comment.attachment_source = str(dest)
            s.add(new_comment)
            s.commit()
        return new_comment.post_id  # pyright: ignore


def get_comments_per_post(
    session: Callable[[], Session],
    post_id: int,
) -> list[schema.Comment]:
    with session() as s:
        results = s.exec(
            select(models.Comment)
            .where(models.Comment.post_id == post_id)
            .order_by(models.Comment.created_at.desc()),  # pyright: ignore
        ).all()
        return [schema.Comment.from_orm(comment) for comment in results]


ids_tree = NewType("ids_tree", dict[int, "ids_tree"])


def get_children_comment_tree(
    session: Callable[[], Session],
    parent_id: int,
    all_comments: list[schema.Comment],
) -> ids_tree:
    tree: ids_tree = {}  # pyright: ignore
    direct_children_ids = [
        comment.id for comment in all_comments if comment.parent_id == parent_id
    ]
    for child_id in direct_children_ids:
        tree[child_id] = get_children_comment_tree(  # pyright: ignore
            session=session,
            parent_id=child_id,
            all_comments=all_comments,
        )
    return tree


# TODO: move this to schema.py
class CommentsTreeResp(TypedDict):
    comments: dict[int, schema.Comment]
    tree: ids_tree


def get_comment_tree(
    session: Callable[[], Session],
    post_id: int,
) -> CommentsTreeResp:
    tree: ids_tree = {}  # pyright: ignore
    datetime.datetime.now(tz=datetime.timezone.utc)
    with session() as s:
        all_comments = s.exec(
            select(models.Comment)
            .options(selectinload(models.Comment.user))
            .where(models.Comment.post_id == post_id)
            .order_by(models.Comment.created_at.desc()),  # pyright: ignore
        ).all()
        root_comments_ids = [
            comment.id for comment in all_comments if comment.parent_id is None
        ]
        for comment_id in root_comments_ids:
            tree[comment_id] = get_children_comment_tree(  # pyright: ignore
                session=session,
                parent_id=comment_id,  # pyright: ignore
                all_comments=all_comments,  # pyright: ignore
            )
        comments_dict: dict[int, schema.Comment] = {  # pyright: ignore
            comment.id: comment for comment in all_comments
        }

        return {"comments": comments_dict, "tree": tree}
