' Silent launcher for credgauge widget (no console window)
Dim fso, sh, here
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
here = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = here
sh.Run "cmd /c node src\silent.js", 0, False
Set sh = Nothing
Set fso = Nothing
