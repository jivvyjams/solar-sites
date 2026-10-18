# Python for JavaScript developers

A syntax map for this project, written for someone with solid JavaScript and TypeScript and no Python.
It covers only what the backend will use. Read sections 1 to 8 before phase 1 (about an hour) and the rest
as the phases need them. Claude adds a "syntax" note the first time each construct appears in a snippet and
points back here. Official tutorial for depth: https://docs.python.org/3/tutorial/

Three habits to install first:
1. Indentation is syntax. A block is everything indented under a line that ends in `:`. Four spaces, never tabs. No braces, no semicolons, no parentheses around `if` conditions.
2. `self` is explicit `this`, and it is the first parameter of every method.
3. There is no `===`. `==` compares values; `is` is only for `None`.

## 1. Running code and modules

| JavaScript / Node                        | Python                                                                           |
| ---------------------------------------- | -------------------------------------------------------------------------------- |
| `node app.js`                            | `python app.py`                                                                  |
| `node -e "..."`, REPL `node`             | `python -c "..."`, REPL `python`                                                 |
| `npx vitest`                             | `python -m pytest` (`-m` runs an installed module as a script)                   |
| one ES module per file; `export`         | one module per `.py` file; everything top-level is importable, no `export` keyword |
| `import { a } from "./db.js"`            | `from .db import a` (leading dot: relative import inside the same package)       |
| `import * as pv from "./pvgis.js"`       | `from . import pvgis` then `pvgis.fetch_pvcalc(...)`                              |
| `import fs from "node:fs"`               | `import json`, `import secrets` (standard library, no install)                   |
| a folder with `index.js`                 | a folder with `__init__.py` (may be empty) makes the folder a package            |
| `require.main === module`                | `if __name__ == "__main__":`                                                     |

`uvicorn app.main:app` means: import the module `app/main.py`, take the variable named `app` from it.

## 2. Variables, values, strings

```python
name = "solar"                 # no let/const; assignment creates the variable
count = 0                      # int, unbounded size
ratio = 0.9                    # float
ok = True                      # True / False, capitalised
nothing = None                 # null and undefined are one thing: None
message = f"{name} has {count} sites"      # f-string is the template literal: f"...{expr}..."
hour = "20230101:0011"[9:11]   # slicing: start inclusive, end exclusive -> "00"
MAX_KWP = 1000                 # constants are a naming convention, not enforced
```

- `"a" + 1` is an error; Python never coerces numbers into strings. Use `f"{x}"` or `str(x)`.
- Names are `snake_case`; classes are `PascalCase`; files are `snake_case.py`.
- No block scope: a name assigned inside an `if` is visible after it. Functions create scope.
- Strings: `s.strip()` (trim), `s.lower()`, `s.startswith("api/")`, `s.split(":")`, `", ".join(parts)` (join lives on the separator), `len(s)`, `"x" in s` (includes).

## 3. Type hints (TypeScript types, mostly unenforced)

```python
def monthly_kwh(values: list[float], scale: float = 1.0) -> list[float]:
    ...

roof: float | None = None            # TS: roof: number | null = null
sites: dict[str, int] = {}           # TS: Record<string, number>
pair: tuple[int, float] = (1, 2.5)   # fixed-length, immutable
```

- Hints are documentation plus tooling, like TS; Python itself ignores them at runtime. In this project they do real work: FastAPI and Pydantic read them to validate requests. Treat them as mandatory.
- Primitives: `int`, `float`, `str`, `bool`, `None`. Containers: `list[...]`, `dict[K, V]`, `tuple[...]`, `set[...]`.
- `X | None` is "optional". There is no `?` suffix on names.
- `...` (Ellipsis) is a placeholder body, like `// TODO`.

## 4. Collections

```python
months = [1, 2, 3]                       # list = array
months.append(4)                         # push
months[0], months[-1]                    # first, last (negative index counts from the end)
months[1:3]                              # slice -> [2, 3]
len(months)                              # .length
3 in months                              # .includes(3)
doubled = [m * 2 for m in months]        # .map
big = [m for m in months if m > 2]       # .filter
total = sum(months); top = max(months)   # reduce for the common cases
for i, m in enumerate(months): ...       # forEach((m, i) => ...)
for p, u in zip(prod, use): ...          # walk two lists in lockstep
for h in range(24): ...                  # for (let h = 0; h < 24; h++)

site = {"id": 1, "name": "Roof A"}       # dict = object / Map; keys are usually strings
site["name"]                             # bracket access only; site.name does not work on a dict
site.get("roof")                         # safe access, None if missing (site.roof ?? null)
site["kwp"] = 5.0                        # add or overwrite a key
"name" in site                           # "name" in site
for key, value in site.items(): ...      # Object.entries

lat, lon = (52.08, 4.31)                 # tuple destructuring
seen = {1, 2, 3}                         # set = Set
```

- No `++` or `--`; write `x += 1`.
- Lists and dicts are references, like arrays and objects. `list(x)` or `dict(x)` makes a shallow copy.
- A comprehension `[expr for item in iterable if cond]` is `iterable.filter(cond).map(expr)` in one expression. Dict version: `{k: v for k, v in pairs}`.
- `any(cond for item in items)` is `True` as soon as one item passes; `all(...)` needs every item to pass. The part inside the parentheses is a generator expression: a comprehension without the brackets, which hands over one item at a time instead of building a list. `schemas.py` uses it to check a password: `any(c.isupper() for c in value)`.

## 5. Control flow and truthiness

```python
if x > 0 and y is not None:
    ...
elif x == 0:
    ...
else:
    ...

label = "with" if capacity > 0 else "without"    # ternary: value_if_true if cond else value_if_false

while soc < capacity:
    ...
```

- `and`, `or`, `not` replace `&&`, `||`, `!`.
- `==` compares values, deeply for lists and dicts. `is` compares identity; use it only as `is None` / `is not None`.
- Falsy: `None`, `0`, `0.0`, `""`, `[]`, `{}`, `False`. Everything else is truthy, including `"0"`.
- No `switch` in this project (`match` exists; `if/elif` chains are normal).
- No C-style `for`; iterate with `for x in ...` or use `while`.

## 6. Functions

```python
def simulate(production: list[float], capacity_kwh: float = 0.0, *, efficiency: float = 0.9) -> dict:
    """What the function does. A docstring is the JSDoc comment, inside the body."""
    return {"self_used": 0.0}

simulate(prod)                               # defaults apply
simulate(prod, 5.0, efficiency=0.95)         # keyword argument by name; the `*` makes efficiency keyword-only
square = lambda x: x * x                     # arrow function limited to one expression; prefer def
```

- No `return` means the function returns `None`.
- `*args` collects extra positional arguments into a tuple; `**kwargs` collects extra keyword arguments into a dict (rest parameters). `f(*items)` and `f(**options)` spread them back out.
- Defined before use at module level; no hoisting. Closures work like JS.
- Gotcha: never use a mutable default such as `def f(items=[])`; the same list is shared by every call. Use `items: list | None = None` and create the list inside.

## 7. Classes and `self`

```python
class Battery:
    def __init__(self, capacity_kwh: float) -> None:    # constructor
        self.capacity_kwh = capacity_kwh                 # this.capacityKwh = ...
        self.soc = 0.0

    def charge(self, kwh: float) -> float:               # method; self is the explicit `this`
        room = self.capacity_kwh - self.soc
        taken = min(kwh, room)
        self.soc += taken
        return taken

b = Battery(5.0)        # no `new`
b.charge(2.0)
```

- `self` is the first parameter of every method; Python passes it, you never do. Forgetting it is the most common beginner error.
- Names with double underscores on both sides (`__init__`, `__str__`) are hooks the language calls ("dunder" methods).
- Inheritance: `class A(B):` is `class A extends B`. `super().__init__(...)` calls the parent constructor.
- Declarative classes (Pydantic) put fields in the class body as annotations, not in `__init__`:

```python
class Note(BaseModel):                                    # "extends BaseModel"
    id: int
    title: str = Field(min_length=1)
    body: str = ""
```

  Read it as a TS interface with defaults; the library generates the constructor and the validation from the annotations. `Note(id=1, title="x")` constructs with keyword arguments and raises a validation error if a field is wrong.

## 8. Errors

```python
class PvgisError(Exception):                      # class PvgisError extends Error
    def __init__(self, kind: str, message: str) -> None:
        super().__init__(message)
        self.kind = kind

try:
    value = int(text)
except ValueError as e:                            # catch, but you name the type
    print("bad number:", e)
except (TimeoutError, OSError):
    ...
else:                                              # runs only when nothing was raised
    ...
finally:
    ...

raise PvgisError("no_data", "Location over the sea")       # throw
```

- Catch a specific class; a bare `except:` swallows everything including Ctrl-C.
- In FastAPI, `raise HTTPException(status_code=404, detail="Site not found")` ends the request with that response.

## 9. Decorators

```python
@app.get("/health")              # equivalent to: health = app.get("/health")(health)
def health() -> dict:
    return {"status": "ok"}
```

A decorator is a function that receives the function written below it and returns a function, usually the same one after registering or wrapping it. `app.get("/health")` returns a decorator that registers `health` as the handler for that route. It is Express's `router.get("/health", health)` written upside down. `@pytest.fixture`, `@app.exception_handler(...)` and `@asynccontextmanager` have the same shape.

Decorators stack and apply from the bottom up. In `schemas.py`, `@field_validator("password")` sits above `@classmethod`: `classmethod` first turns the function into one that receives the class as `cls` instead of an instance as `self` (Pydantic runs validators before any instance exists), then `field_validator` registers it for the `password` field. The function gets the value after the `Field(...)` constraints have passed, raises `ValueError` to reject it and returns it to accept it. Pydantic turns the `ValueError` into one entry of the 422 list, with `msg` prefixed by `Value error, `.

## 10. `with` and `yield`

```python
with open("data.json") as f:          # context manager: setup, body, guaranteed cleanup
    text = f.read()

def get_db():
    db = sqlite3.connect("books.db")  # open a database connection
    try:
        yield db                      # hand it out; execution resumes here afterwards for cleanup
    finally:
        db.close()                    # runs even if the request failed
```

- `with` is `try { ... } finally { resource.close() }` where the resource owns the open and close logic. `async with` is the same for async resources.
- `yield` turns a function into a generator (a lazy iterator), like `function*`. FastAPI uses a single-`yield` function as "set up, give the value to the route, clean up after the response". You never call `next()` yourself.

## 11. async

Not used in this project (decision 34): every route is a plain `def`. Read this section only so that FastAPI docs showing `async def` make sense.

```python
async def fetch_pvcalc(lat: float, lon: float, kwp: float) -> dict:
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.get(url, params={"lat": lat, "lon": lon, "peakpower": kwp})
    return response.json()
```

- Same model as JS: `async def` returns a coroutine (promise-like), `await` suspends until it resolves.
- Difference: there is no event loop running by default. uvicorn runs one for the app; FastAPI's `TestClient` handles it in tests.
- Rule: inside `async def`, never call blocking functions (`time.sleep`, `requests.get`). Use the async versions (`asyncio.sleep`, httpx). A plain `def` route is fine for database work; FastAPI runs it in a thread.

## 12. Numbers

`/` is always float division (`7 / 2` is `3.5`); `//` floors (`7 // 2` is `3`); `**` is power; `round(x, 1)` rounds to one decimal; `abs`, `min`, `max`, `sum` are built in; `int("5")`, `float("2.5")`, `str(5)` convert. Float imprecision is the same as JS (`0.1 + 0.2`), so round only when presenting, and compare floats in tests with `pytest.approx`.

## 13. Gotchas

- `IndentationError`: mixed tabs and spaces, or a block not indented. Set the editor to 4 spaces for Python.
- Writing `this`, or forgetting `self` in a method signature.
- `== None` works but the idiom is `is None`.
- Mutable default arguments (section 6).
- Modifying a list while iterating over it.
- `/` versus `//`.
- `print()` is `console.log`. Use f-strings: `print(f"{soc=}")` prints `soc=2.0`.
- Circular imports: `main.py` imports the routers, the routers import `db.py`; `db.py` must never import `main.py`.
- Every file is a module, so a file named `json.py` or `test.py` shadows a library. Never name a file after something you import.
- `with sqlite3.connect(...) as db:` commits or rolls back the transaction but does not close the connection. Close it yourself, as in the `get_db` example.

## 14. Quick reference

| JS / TS                                  | Python                                              |
| ---------------------------------------- | --------------------------------------------------- |
| `const x = 1;`                           | `x = 1`                                             |
| `` `${a}-${b}` ``                        | `f"{a}-{b}"`                                        |
| `null`, `undefined`                      | `None`                                              |
| `true`, `false`                          | `True`, `False`                                     |
| `===`, `!==`                             | `==`, `!=` (`is` only for `None`)                   |
| `&&`, `\|\|`, `!`                        | `and`, `or`, `not`                                  |
| `arr.length`                             | `len(arr)`                                          |
| `arr.push(x)`                            | `arr.append(x)`                                     |
| `arr.map(f)`                             | `[f(x) for x in arr]`                               |
| `arr.filter(p)`                          | `[x for x in arr if p(x)]`                          |
| `arr.some(p)`, `arr.every(p)`            | `any(p(x) for x in arr)`, `all(p(x) for x in arr)`  |
| `arr.reduce((a, b) => a + b, 0)`         | `sum(arr)`                                          |
| `obj.key`, `obj["key"]`                  | `d["key"]`, `d.get("key")`                          |
| `Object.entries(o)`                      | `d.items()`                                         |
| `const [a, b] = pair`                    | `a, b = pair`                                       |
| `{ ...a, ...b }`                         | `{**a, **b}`                                        |
| `x ?? y`                                 | `x if x is not None else y`                         |
| `cond ? a : b`                           | `a if cond else b`                                  |
| `function f(x: number): string {}`       | `def f(x: int) -> str:`                             |
| `(x) => x * 2`                           | `lambda x: x * 2`                                   |
| `class A extends B`                      | `class A(B):`                                       |
| `constructor()`, `this`                  | `def __init__(self, ...)`, `self`                   |
| `new A()`                                | `A()`                                               |
| `try / catch / finally`, `throw`         | `try / except / finally`, `raise`                   |
| `async`, `await`                         | `async def`, `await`                                |
| `import { x } from "./m"`                | `from .m import x`                                  |
| `export`                                 | nothing; everything top-level is importable         |
| `// comment`                             | `# comment`                                         |
| `typeof x === "number"`                  | `isinstance(x, int)`                                |
| `JSON.parse`, `JSON.stringify`           | `json.loads`, `json.dumps`                          |
| `console.log`                            | `print`                                             |
| `npm run x`                              | no equivalent; run the tool directly with the venv active |

## 15. Reading order in the official tutorial

Chapters 3 (informal introduction), 4 (control flow), 5 (data structures), 6 (modules), 8 (errors and
exceptions), 9 (classes). Skip the rest for now; FastAPI, `sqlite3` and httpx have their own docs linked
in [backend-stack.md](backend-stack.md).
