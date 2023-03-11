import {
  createContext,
  createResource,
  createSignal,
  useContext,
} from "solid-js";
import { createStore } from "solid-js/store";

const StoreContext = createContext();

async function request_send(
  method: string,
  url: string,
  data?: any,
  resKey?: any,
  token?: string
) {
  const headers: any = {};
  const opts: any = { method, headers };
  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(data);
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`http://localhost:8000${url}`, opts);
    const json = await response.json();
    return resKey ? json[resKey] : json;
  } catch (err: any) {
    return err;
  }
}
export function createAgent([state, actions]: [...any]) {
  async function send(method: string, url: string, data?: any, resKey?: any) {
    const headers: any = {};
    const opts: any = { method, headers };
    if (data !== undefined) {
      headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(data);
    }

    if (state.token) {
      headers["Authorization"] = `Bearer ${state.token}`;
    }

    try {
      const response = await fetch(`http://localhost:8000${url}`, opts);
      const json = await response.json();
      return resKey ? json[resKey] : json;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        actions.logout();
      }
      return err;
    }
  }

  const Auth = {
    current: () => send("get", "/api/v1/me"),
    login: (username: string, password: string) =>
      send("post", "/api/v1/token", { username, password }),
  };

  return { Auth };
}
export function createAuth(
  agent: any,
  actions: any,
  setState: (arg0: any) => void
) {
  const [loggedIn, setLoggedIn] = createSignal(false);
  const [currentUser, { mutate, refetch }] = createResource(loggedIn, () => {
    request_send("get", "/api/v1/me");
  });
  return currentUser;
}

export function Provider(props: any) {
  const [currUser] = createResource(() => request_send("get", "/api/v1/me"));
  const [state, setState] = createStore({
    get posts() {
      return [];
    },
    get comments() {
      return [];
    },
    get currentUser() {
      return currUser;
    },
    page: 0,
    token: undefined,
  });
  const actions = {};
  const store = [state, actions];
  const agent = createAgent(store);
  return (
    <StoreContext.Provider value={store}>
      {props.children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  return useContext(StoreContext);
}
