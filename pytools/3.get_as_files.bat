@echo off
cls
call python as2ts_util.py extract "D:\home\LayaAirAS3_1.7.12_beta\as\libs\src" temp\

:END
@echo Ending ...
ping 128.0.0.1 -n 1 -t 5000 > nul
goto:EOF

