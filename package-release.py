from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

root = Path(__file__).resolve().parent
dist = root / 'dist'
upload = root / 'Chess-Explorer-Upload-v1.2.zip'
source = root / 'Chess-Explorer-Source-v1.2.zip'

if not (dist / 'index.html').is_file():
    raise SystemExit('Run npm.cmd run build first.')

with ZipFile(upload, 'w', ZIP_DEFLATED) as archive:
    for item in sorted(dist.rglob('*')):
        if item.is_file():
            if item.stat().st_size > 25 * 1024 * 1024:
                raise SystemExit('Asset exceeds Cloudflare per-file limit: ' + item.name)
            archive.write(item, item.relative_to(dist).as_posix())

root_files = {
    'package.json', 'package-lock.json', 'index.html', 'vite.config.ts',
    'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', '.gitignore', '.oxlintrc.json',
    'Run-Chess-Explorer.cmd', 'README.md', 'prepare-engine.mjs', 'package-release.py',
    'verify-model.mjs', 'verify-data.mjs', 'verify-worker.mjs', 'verify-browser.mjs', 'verify-full-browser.mjs',
    'verify-live-api.mjs', 'verify-resilience.mjs', 'verify-production.mjs', 'test-fixtures.mjs'
}
with ZipFile(source, 'w', ZIP_DEFLATED) as archive:
    for folder in ['src', 'public']:
        for item in sorted((root / folder).rglob('*')):
            if item.is_file():
                archive.write(item, item.relative_to(root).as_posix())
    for name in sorted(root_files):
        item = root / name
        if item.is_file():
            archive.write(item, name)

with ZipFile(upload) as archive:
    assert archive.testzip() is None
    assert 'index.html' in archive.namelist()
    assert len(archive.namelist()) < 1000
    assert 'engine/stockfish-19-lite-single.wasm' in archive.namelist()
    assert 'engine/Copying.txt' in archive.namelist()
    print('Upload ZIP:', len(archive.namelist()), 'files;', upload.stat().st_size, 'bytes')
with ZipFile(source) as archive:
    assert archive.testzip() is None
    assert 'src/App.tsx' in archive.namelist()
    assert 'package-lock.json' in archive.namelist()
    assert not any(name.startswith('node_modules/') for name in archive.namelist())
    print('Source ZIP:', len(archive.namelist()), 'files;', source.stat().st_size, 'bytes')
print(upload)
print(source)
