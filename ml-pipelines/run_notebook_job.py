from __future__ import annotations

import argparse
import os
import shutil
import sys
from pathlib import Path


def ensure_data_link(data_dir: Path) -> None:
    link = Path("data")
    if link.exists():
        return

    try:
        link.symlink_to(data_dir, target_is_directory=True)
        return
    except OSError:
        # Azure ML jobs normally run on Linux compute, but keep a copy-based fallback
        # so the runner still works if symlink creation is restricted.
        pass

    if data_dir.is_dir():
        shutil.copytree(data_dir, link, dirs_exist_ok=True)
        return

    raise FileNotFoundError(f"Could not create a data link for {data_dir}")


def resolve_notebook_path(raw_path: str) -> Path:
    candidates = [
        Path(raw_path),
        Path(Path(raw_path).name),
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate

    raise FileNotFoundError(f"Notebook not found: {raw_path}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Execute a Project Haven Azure ML notebook job.")
    parser.add_argument("--notebook", required=True, help="Notebook path relative to the code asset root.")
    parser.add_argument("--data-dir", required=True, help="Mounted Azure ML data directory for inputs.")
    parser.add_argument("--output-dir", required=True, help="Mounted Azure ML output directory for CSV artifacts.")
    parser.add_argument(
        "--executed-notebook",
        default=None,
        help="Optional path for the executed notebook artifact.",
    )
    args = parser.parse_args()

    data_dir = Path(args.data_dir)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    os.environ["AZUREML_OUTPUT_DIR"] = str(output_dir)

    ensure_data_link(data_dir)

    notebook_path = resolve_notebook_path(args.notebook)
    executed_notebook = Path(args.executed_notebook) if args.executed_notebook else output_dir / f"executed_{notebook_path.stem}.ipynb"

    try:
        import papermill as pm
    except ImportError as exc:
        raise SystemExit(
            "papermill is required to execute notebooks. Install it in the Azure ML environment with: "
            "pip install papermill"
        ) from exc

    pm.execute_notebook(
        input_path=str(notebook_path),
        output_path=str(executed_notebook),
        cwd=str(Path.cwd()),
        log_output=True,
        progress_bar=False,
    )

    print(f"Executed notebook: {notebook_path.resolve()}")
    print(f"Executed notebook artifact: {executed_notebook.resolve()}")
    print(f"Output directory: {output_dir.resolve()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
