import json
import logging
import pathlib
from enum import Enum
from typing import Callable, NotRequired, TypedDict

import fastapi
import fastapi.security
import fastapi.staticfiles
import fastapi.templating
from fastapi import APIRouter, Body, Depends, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import EmailStr
from sqlmodel import Session

from src import (
    comment_service,
    config,
    deps,
    models,
    posting_service,
    schema,
    security,
    user_service,
)


class Status(str, Enum):
    Success = "success"
    Failure = "failure"
    Error = "error"


class AuthResponse(TypedDict):
    access_token: str
    token_type: str


class GenericResponse(TypedDict):
    status: Status
    message: NotRequired[str]


app = fastapi.FastAPI(title="Memecry", description="Backend for memes")

app.mount("/media", fastapi.staticfiles.StaticFiles(directory="media"))

origins = [
    "http://localhost",
    "http://localhost:8000",
    "http://localhost:3000",
    "http://127.0.0.1",
    "http://127.0.0.1:8000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

v1_router = APIRouter(prefix="/api/v1")

logger = logging.getLogger()

# Initialize settings at the start,
# so that we don't have to wait for request to see errors (if any)
deps.get_session()

### Misc ###
@app.get("/health")
def check_health() -> GenericResponse:
    return {"status": Status.Success, "message": "Everything OK"}


@v1_router.get("/me")
def get_me(current_user: schema.User = Depends(deps.get_current_user)) -> schema.User:
    return current_user


@v1_router.get("/users/{username}/posts")
def get_users_posts(
    username: str,
    session: Callable[[], Session] = Depends(deps.get_session),
) -> list[schema.Post]:
    return posting_service.get_posts_by_user(username, session)


@v1_router.post("/signup")
async def create_new_user(
    password: str = Form(),
    username: str = Form(),
    # Maybe make email optional only for dev?
    email: EmailStr | None = Form(),
    session: Callable[[], Session] = Depends(deps.get_session),
    settings: config.Settings = Depends(deps.get_settings),
) -> AuthResponse:
    user_service.add_user(
        username=username,
        password=password,
        email=email,
        session=session,
    )
    access_token = security.create_access_token(
        data={"sub": username},
        settings=settings,
    )
    return {"access_token": access_token, "token_type": "bearer"}


# TODO: update the backend to only use the /token endpoint
@app.post("/token")
@v1_router.post("/token")
async def login(
    form_data: fastapi.security.OAuth2PasswordRequestForm = Depends(),
    session: Callable[[], Session] = Depends(deps.get_session),
    settings: config.Settings = Depends(deps.get_settings),
) -> AuthResponse:
    user = user_service.authenticate_user(
        session,
        form_data.username,
        form_data.password,
    )
    if not user:
        raise HTTPException(
            status_code=fastapi.status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(
        data={"sub": user.username},
        settings=settings,
    )
    return {"access_token": access_token, "token_type": "bearer"}


### Comments ###
@v1_router.post("/post/{post_id}/comment")
async def comment_on_post(  # noqa: PLR0913
    post_id: int,
    attachment: fastapi.UploadFile | None = None,
    content: str = Body(),
    current_user: schema.User = Depends(deps.get_current_user),
    session: Callable[[], Session] = Depends(deps.get_session),
    settings: config.Settings = Depends(deps.get_settings),
) -> int:
    comment_create = schema.CommentCreate(
        content=content,
        post_id=post_id,
        user_id=current_user.id,
    )
    return await comment_service.post_comment(
        session=session,
        comment_data=comment_create,
        attachment=attachment,
        settings=settings,
    )


@v1_router.post("/comment/{comment_id}/comment")
async def post_comment_reply(  # noqa: PLR0913
    comment_id: int,
    attachment: fastapi.UploadFile | None = None,
    content: str = Body(),
    current_user: schema.User = Depends(deps.get_current_user),
    session: Callable[[], Session] = Depends(deps.get_session),
    settings: config.Settings = Depends(deps.get_settings),
) -> int:
    comment_create = schema.CommentCreate(
        content=content,
        parent_id=comment_id,
        user_id=current_user.id,
    )
    return await comment_service.post_comment(
        session=session,
        comment_data=comment_create,
        attachment=attachment,
        settings=settings,
    )


# TODO: fix response model for this
@v1_router.get("/post/{post_id}/comments", response_model=None)
async def get_comments_on_post(
    post_id: int,
    session: Callable[[], Session] = Depends(deps.get_session),
) -> comment_service.CommentsTreeResp:
    return comment_service.get_comment_tree(
        post_id=post_id,
        session=session,
    )


#### REST endpoints for html ####
@v1_router.put("/post/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: schema.User = Depends(deps.get_current_user),
    session: Callable[[], Session] = Depends(deps.get_session),
) -> GenericResponse:
    match posting_service.find_reaction(
        session,
        post_id=post_id,
        user_id=current_user.id,
    ):
        case models.Reaction(kind=models.ReactionKind.Like):
            posting_service.remove_reaction(
                session,
                post_id=post_id,
                user_id=current_user.id,
                reaction_kind=models.ReactionKind.Like,
            )
        case models.Reaction(kind=models.ReactionKind.Dislike):
            posting_service.remove_reaction(
                session,
                post_id=post_id,
                user_id=current_user.id,
                reaction_kind=models.ReactionKind.Dislike,
            )
            posting_service.add_reaction(
                session,
                post_id=post_id,
                user_id=current_user.id,
                reaction_kind=models.ReactionKind.Like,
            )
        case None:
            posting_service.add_reaction(
                session,
                post_id=post_id,
                user_id=current_user.id,
                reaction_kind=models.ReactionKind.Like,
            )
        case _:
            logger.error("Unexpected path reached: all reactions should have a kind")

    return {"status": Status.Success}


@v1_router.put("/post/{post_id}/dislike")
async def dislike_post(
    post_id: int,
    current_user: schema.User = Depends(deps.get_current_user),
    session: Callable[[], Session] = Depends(deps.get_session),
) -> GenericResponse:
    match posting_service.find_reaction(
        session,
        post_id=post_id,
        user_id=current_user.id,
    ):
        case models.Reaction(kind=models.ReactionKind.Dislike):
            posting_service.remove_reaction(
                session,
                post_id=post_id,
                user_id=current_user.id,
                reaction_kind=models.ReactionKind.Dislike,
            )
        case models.Reaction(kind=models.ReactionKind.Like):
            posting_service.remove_reaction(
                session,
                post_id=post_id,
                user_id=current_user.id,
                reaction_kind=models.ReactionKind.Like,
            )
            posting_service.add_reaction(
                session,
                post_id=post_id,
                user_id=current_user.id,
                reaction_kind=models.ReactionKind.Dislike,
            )
        case None:
            posting_service.add_reaction(
                session,
                post_id=post_id,
                user_id=current_user.id,
                reaction_kind=models.ReactionKind.Dislike,
            )
        case _:
            logger.error("Unexpected path reached: all reactions should have a kind")

    return {"status": Status.Success}


@v1_router.put("/post/{post_id}/undislike")
async def undislike_post(
    post_id: int,
    current_user: schema.User = Depends(deps.get_current_user),
    session: Callable[[], Session] = Depends(deps.get_session),
) -> GenericResponse:
    posting_service.remove_reaction(
        session,
        post_id=post_id,
        user_id=current_user.id,
        reaction_kind=models.ReactionKind.Dislike,
    )
    return {"status": Status.Success}


@v1_router.post("/upload")
async def upload_post(
    file: fastapi.UploadFile,
    title: str = Form(),
    settings: config.Settings = Depends(deps.get_settings),
    session: Callable[[], Session] = Depends(deps.get_session),
    current_user: schema.User = Depends(deps.get_current_user),
) -> int:
    new_post = schema.PostCreate(title=title, user_id=current_user.id)
    return await posting_service.upload_post(
        post_data=new_post,
        session=session,
        uploaded_file=file,
        settings=settings,
    )


@v1_router.get("/post/{post_id}")
def get_post(
    post_id: int,
    session: Callable[[], Session] = Depends(deps.get_session),
    user: schema.User | None = Depends(deps.get_current_user_optional),
) -> schema.Post:
    post = posting_service.get_post(
        post_id=post_id,
        session=session,
    )
    if user:
        reaction = posting_service.get_user_reaction_on_post(
            user_id=user.id,
            post_id=post.id,
            session=session,
        )
        match reaction:
            case models.ReactionKind.Like:
                post.liked = True
            case models.ReactionKind.Dislike:
                post.disliked = True
            case _:
                ...
    return post


@v1_router.get("/")
def get_top_posts(
    limit: int = 5,
    offset: int = 0,
    session: Callable[[], Session] = Depends(deps.get_session),
    user: schema.User | None = Depends(deps.get_current_user_optional),
) -> list[schema.Post]:
    posts = posting_service.get_top_posts(session, offset=offset, limit=limit)
    logger.info(limit)
    if user:
        for post in posts:
            reaction = posting_service.get_user_reaction_on_post(
                user_id=user.id,
                post_id=post.id,
                session=session,
            )
            match reaction:
                case models.ReactionKind.Like:
                    post.liked = True
                case models.ReactionKind.Dislike:
                    post.disliked = True
                case _:
                    ...
    return posts


@v1_router.get("/new")
def show_newest_posts(
    limit: int = 5,
    offset: int = 0,
    session: Callable[[], Session] = Depends(deps.get_session),
) -> list[schema.Post]:
    return posting_service.get_newest_posts(session, offset=offset, limit=limit)


app.include_router(v1_router)


if __name__ == "__main__":
    from fastapi.openapi.utils import get_openapi

    with pathlib.Path("openapi.json").open("w") as f:
        json.dump(
            get_openapi(
                title=app.title,
                version=app.version,
                openapi_version=app.openapi_version,
                description=app.description,
                routes=app.routes,
            ),
            f,
        )
