from enum import Enum
import logging
from typing import NotRequired, TypedDict

import fastapi
import fastapi.security
import fastapi.staticfiles
import fastapi.templating
from fastapi import APIRouter, Body, Depends, Form, HTTPException, Request, Response
from pydantic import EmailStr

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


class GenericResponse(TypedDict):
    status: Status
    message: NotRequired[str]


app = fastapi.FastAPI()
route = APIRouter()

logger = logging.getLogger()

# Initialize settings at the start,
# so that we don't have to wait for request to see errors (if any)
deps.get_session()

templates = fastapi.templating.Jinja2Templates(directory="src/templates")

### Misc ###
@route.get("/health")
def check_health():
    return {"message": "Everything OK"}


### Users ###
@route.get("/me")
def get_me(current_user: schema.User = Depends(deps.get_current_user)):
    return current_user


@route.get("/post/{post_id}")
def get_post(
    post_id: int,
    session=Depends(deps.get_session),
):
    return posting_service.get_post(
        post_id=post_id,
        session=session,
    )


@route.post("/signup")
async def create_new_user(
    password: str = Form(),
    username: str = Form(),
    # Maybe make email optional only for dev?
    email: EmailStr | None = Form(),
    session=Depends(deps.get_session),
    settings=Depends(deps.get_settings),
):
    user_service.add_user(
        username=username, password=password, email=email, session=session
    )
    access_token = security.create_access_token(
        data={"sub": username}, settings=settings
    )
    return {"access_token": access_token, "token_type": "bearer"}


@route.get("/users/{username}/posts")
def get_users_posts(
    username: str,
    session=Depends(deps.get_session),
):
    return posting_service.get_posts_by_user(username, session)


### Comments ###
@route.post("/post/{post_id}/comment")
async def comment_on_post(
    post_id: int,
    attachment: fastapi.UploadFile | None = None,
    content: str = Body(),
    current_user: schema.User = Depends(deps.get_current_user),
    session=Depends(deps.get_session),
    settings: config.Settings = Depends(deps.get_settings),
) -> int:
    comment_create = schema.CommentCreate(
        content=content, post_id=post_id, user_id=current_user.id
    )
    return await comment_service.post_comment(
        session=session,
        comment_data=comment_create,
        attachment=attachment,
        settings=settings,
    )


@route.post("/comment/{comment_id}/comment")
async def post_comment_reply(
    comment_id: int,
    attachment: fastapi.UploadFile | None = None,
    content: str = Body(),
    current_user: schema.User = Depends(deps.get_current_user),
    session=Depends(deps.get_session),
    settings: config.Settings = Depends(deps.get_settings),
) -> int:
    comment_create = schema.CommentCreate(
        content=content, parent_id=comment_id, user_id=current_user.id
    )
    return await comment_service.post_comment(
        session=session,
        comment_data=comment_create,
        attachment=attachment,
        settings=settings,
    )


@route.get("/post/{post_id}/comments")
async def get_comments_on_post(
    post_id: int,
    session=Depends(deps.get_session),
):
    comments_dict, ids_tree = comment_service.get_comment_tree(
        post_id=post_id, session=session
    )
    return {"comments": comments_dict, "tree": ids_tree}


#### REST endpoints for html ####
@route.put("/post/{id}/like")
async def like_post(
    id: int,
    current_user: schema.User = Depends(deps.get_current_user),
    session=Depends(deps.get_session),
) -> GenericResponse:
    posting_service.add_reaction(
        session,
        post_id=id,
        user_id=current_user.id,
        reaction_kind=models.ReactionKind.Like,
    )
    return {"status": Status.Success}


@route.put("/post/{id}/unlike")
async def unlike_post(
    id: int,
    current_user: schema.User = Depends(deps.get_current_user),
    session=Depends(deps.get_session),
):
    posting_service.remove_reaction(
        session,
        post_id=id,
        user_id=current_user.id,
        reaction_kind=models.ReactionKind.Like,
    )
    return {"status": Status.Success}


@route.put("/post/{id}/dislike")
async def dislike_post(
    id: int,
    current_user: schema.User = Depends(deps.get_current_user),
    session=Depends(deps.get_session),
):
    posting_service.add_reaction(
        session,
        post_id=id,
        user_id=current_user.id,
        reaction_kind=models.ReactionKind.Dislike,
    )
    return {"status": Status.Success}


@route.put("/post/{id}/undislike")
async def undislike_post(
    id: int,
    current_user: schema.User = Depends(deps.get_current_user),
    session=Depends(deps.get_session),
):
    posting_service.remove_reaction(
        session,
        post_id=id,
        user_id=current_user.id,
        reaction_kind=models.ReactionKind.Dislike,
    )
    return {"status": Status.Success}


@app.middleware("http")
async def create_auth_header(request: Request, call_next):
    """
    Check if there are cookies set for authorization. If so, construct the
    Authorization header and modify the request (unless the header already
    exists!)
    """
    if "Authorization" not in request.headers and "Authorization" in request.cookies:
        access_token = request.cookies["Authorization"]

        request.headers.__dict__["_list"].append(
            (
                "authorization".encode(),
                f"Bearer {access_token}".encode(),
            )
        )
    elif (
        "Authorization" not in request.headers
        and "Authorization" not in request.cookies
    ):
        request.headers.__dict__["_list"].append(
            (
                "authorization".encode(),
                f"Bearer 12345".encode(),
            )
        )

    response = await call_next(request)
    return response


@route.post("/token")
async def login(
    response: Response,
    form_data: fastapi.security.OAuth2PasswordRequestForm = Depends(),
    session=Depends(deps.get_session),
    settings: config.Settings = Depends(deps.get_settings),
):
    user = user_service.authenticate_user(
        session, form_data.username, form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=fastapi.status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = security.create_access_token(
        data={"sub": user.username}, settings=settings
    )
    response.set_cookie(key="Authorization", value=access_token, httponly=True)
    response.headers["HX-Refresh"] = "true"
    response.status_code = 303
    return {"access_token": access_token, "token_type": "bearer"}


@route.post("/upload")
async def upload_post(
    file: fastapi.UploadFile,
    title: str = Form(),
    settings: config.Settings = Depends(deps.get_settings),
    session=Depends(deps.get_session),
    current_user: schema.User = Depends(deps.get_current_user),
):
    new_post = schema.PostCreate(title=title, user_id=current_user.id)
    new_post_id = await posting_service.upload_post(
        post_data=new_post,
        session=session,
        uploaded_file=file,
        settings=settings,
    )
    return new_post_id


@route.get("/")
def get_index(
    limit: int = 5,
    offset: int = 0,
    session=Depends(deps.get_session),
):
    return posting_service.get_top_posts(session, offset=offset, limit=limit)


@route.get("/new")
def show_newest_posts(
    limit: int = 5,
    offset: int = 0,
    session=Depends(deps.get_session),
):
    return posting_service.get_newest_posts(session, offset=offset, limit=limit)


app.include_router(route)
