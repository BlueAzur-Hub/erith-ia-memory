from pathlib import Path

source = Path('.github/scripts/agent_crypto_40630_release.py')
code = source.read_text(encoding='utf-8')
old = "js = js[:markup_start] + new_markup + js[markup_end:]"
new = "js = js[:markup_start] + new_markup + js[markup_end+1:]"
assert old in code, '40.6.30 markup splice owner not found'
code = code.replace(old, new, 1)
exec(compile(code, str(source), 'exec'), {'__name__':'__main__'})
