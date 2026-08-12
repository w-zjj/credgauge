' 双击静默启动 credgauge 挂件（无终端窗口）
Set sh = CreateObject("WScript.Shell")
sh.CurrentDirectory = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.Run "cmd /c node src\silent.js", 0, False
