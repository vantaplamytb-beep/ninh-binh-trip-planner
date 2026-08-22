$env:GIT_TERMINAL_PROMPT = "0"
$git = "$env:TEMP\MinGit\cmd\git.exe"
& $git push -u origin main --force
