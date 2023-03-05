import datetime
from typing import NotRequired, TypedDict

import jose
import jose.jwt
import passlib.context

from src import config

pwd_context = passlib.context.CryptContext(schemes=["bcrypt"], deprecated="auto")


class TokenCreateData(TypedDict):
    sub: str
    exp: NotRequired[datetime.datetime]


def create_access_token(data: TokenCreateData, settings: config.Settings) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(
        minutes=100,
    )
    to_encode["exp"] = expire
    return jose.jwt.encode(
        to_encode,  # pyright: ignore
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


# TODO: create type for hashed/unhashed pass
def verify_password(password: str, hashed_pass: str) -> bool:
    return pwd_context.verify(password, hashed_pass)
