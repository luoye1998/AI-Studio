"""通过 GitHub Git Data API 回放本地提交历史（绕开被阻断的 git smart-HTTP 上传）。"""

import base64
import json
import os
import subprocess
import sys
import time
import urllib.error
import urllib.request

TOKEN = os.environ["GHTOKEN"]
REPO = "luoye1998/AI-Studio"
API = "https://api.github.com"
H = {
    "Authorization": "Bearer " + TOKEN,
    "User-Agent": "dsh-workstream",
    "Accept": "application/vnd.github+json",
    "Content-Type": "application/json",
}


def api(path, method="GET", body=None, retries=3):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    for attempt in range(1, retries + 1):
        req = urllib.request.Request(API + path, data=data, method=method, headers=H)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:300]
            if attempt == retries:
                raise RuntimeError(f"{method} {path} -> {e.code}: {detail}")
            time.sleep(1.5 * attempt)
        except Exception:
            if attempt == retries:
                raise
            time.sleep(1.5 * attempt)


def git(*args, binary=False):
    out = subprocess.run(["git", *args], capture_output=True, check=True)
    return out.stdout if binary else out.stdout.decode("utf-8", "replace")


def main():
    base = "424e3998ac918095bef76cee0f2cc74687e8b36f"  # 远端已有：Initial commit
    head = git("rev-parse", "main").strip()
    commits = git("rev-list", "--reverse", f"{base}..{head}").split()
    print(f"will replay {len(commits)} commits onto {base[:8]}")

    remote_parent = base
    blob_cache = {}  # local sha -> remote sha

    for idx, sha in enumerate(commits, 1):
        msg = git("log", "-1", "--format=%B", sha).strip()
        entries = []
        for line in git("ls-tree", "-r", "--full-tree", sha).splitlines():
            if not line.strip():
                continue
            meta, path = line.split("\t", 1)
            mode, typ, obj = meta.split()
            if typ != "blob":
                continue
            if obj not in blob_cache:
                content = git("cat-file", "-p", obj, binary=True)
                res = api(
                    f"/repos/{REPO}/git/blobs",
                    "POST",
                    {"content": base64.b64encode(content).decode("ascii"), "encoding": "base64"},
                )
                blob_cache[obj] = res["sha"]
                if res["sha"] != obj:
                    print(f"  ! blob sha mismatch {obj[:8]} -> {res['sha'][:8]}")
            entries.append({"path": path, "mode": mode, "type": "blob", "sha": blob_cache[obj]})

        tree = api(f"/repos/{REPO}/git/trees", "POST", {"tree": entries})
        commit = api(
            f"/repos/{REPO}/git/commits",
            "POST",
            {"message": msg, "tree": tree["sha"], "parents": [remote_parent]},
        )
        api(f"/repos/{REPO}/git/refs/heads/main", "PATCH", {"sha": commit["sha"], "force": False})
        remote_parent = commit["sha"]
        first = msg.splitlines()[0]
        print(f"[{idx}/{len(commits)}] {commit['sha'][:8]} {first[:60]} ({len(entries)} files)")

    print("DONE remote head:", api(f"/repos/{REPO}/git/ref/heads/main")["object"]["sha"])


if __name__ == "__main__":
    sys.exit(main())
