"""Event loop for local runs on Windows.

psycopg's async mode does not work with the default Windows event loop (ProactorEventLoop), so
local runs start uvicorn with this factory:
`uvicorn --loop tech_wise_academy.local_loop:selector_loop`.
Linux containers do not need it.
"""

import asyncio
import selectors


def selector_loop() -> asyncio.AbstractEventLoop:
    return asyncio.SelectorEventLoop(selectors.SelectSelector())
